import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email.service';
import logger from '../utils/logger';
import crypto from 'crypto';

export class AuthController {
  // POST /api/auth/register (candidates only)
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, city } = req.body;

      const existing = await UserRepository.findByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'E-mail deja enregistre' });
        return;
      }

      const existingPhone = await UserRepository.findByPhone(phone);
      if (existingPhone) {
        res.status(409).json({ error: 'Numero de telephone deja enregistre' });
        return;
      }

      const passwordHash = await AuthService.hashPassword(password);

      // Generate 6-digit verification code securely
      const verifyCode = crypto.randomInt(100000, 1000000).toString();
      const verifyTokenHash = crypto.createHash('sha256').update(verifyCode).digest('hex');
      const verifyTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const user = await UserRepository.create({
        email,
        passwordHash,
        role: 'CANDIDATE',
        name,
        phone,
        city,
      });

      // Store verification token
      await UserRepository.update(user.id, {
        verifyToken: verifyTokenHash,
        verifyTokenExpiry,
        emailVerified: false,
      });

      // Send verification email (don't block on failure)
      try {
        await sendVerificationEmail(email, name, verifyCode);
        logger.info(`Verification email sent to: ${email}`);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
      }

      logger.info(`New candidate registered (pending verification): ${user.email}`);

      // Do NOT issue tokens — user must verify email first
      res.status(201).json({
        message: 'Compte cree. Veuillez verifier votre adresse email.',
        userId: user.id,
        email: user.email,
      });
    } catch (err: any) {
      logger.error('Register error:', err);

      if (err?.code === 'P2002') {
        const fields: string[] = err?.meta?.target || [];
        if (fields.includes('email')) {
          res.status(409).json({ error: 'E-mail deja enregistre' });
          return;
        }
        if (fields.includes('phone')) {
          res.status(409).json({ error: 'Numero de telephone deja enregistre' });
          return;
        }
        res.status(409).json({ error: 'Donnees de compte en doublon' });
        return;
      }

      res.status(500).json({ error: 'Echec de l\'inscription' });
    }
  }

  // POST /api/auth/login (all roles)
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'E-mail ou mot de passe invalide' });
        return;
      }

      if (user.isActive === false || user.deletedAt) {
        res.status(403).json({ error: 'Le compte est inactif. Veuillez contacter l\'administrateur.' });
        return;
      }

      const valid = await AuthService.comparePassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'E-mail ou mot de passe invalide' });
        return;
      }

      // Block unverified candidates
      if (user.role === 'CANDIDATE' && !user.emailVerified) {
        res.status(403).json({
          error: 'Veuillez verifier votre adresse email avant de vous connecter.',
          code: 'EMAIL_NOT_VERIFIED',
          userId: user.id,
          email: user.email,
        });
        return;
      }

      const accessToken = AuthService.generateAccessToken({
        userId: user.id,
        role: user.role,
        site: user.site || undefined,
      });

      const refreshToken = AuthService.generateRefreshToken();
      const tokenHash = AuthService.hashToken(refreshToken);
      await UserRepository.saveRefreshToken(user.id, tokenHash, AuthService.getRefreshTokenExpiry());

      AuthService.setRefreshCookie(res, refreshToken);

      logger.info(`User logged in: ${user.email} (${user.role})`);

      res.json({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          site: user.site,
        },
      });
    } catch (err: any) {
      logger.error('Login error:', err);
      res.status(500).json({ error: 'Echec de la connexion' });
    }
  }

  // POST /api/auth/refresh
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({ error: 'Aucun jeton de rafraichissement' });
        return;
      }

      const tokenHash = AuthService.hashToken(token);
      const stored = await UserRepository.findRefreshToken(tokenHash);

      if (!stored || stored.expiresAt < new Date()) {
        res.status(401).json({ error: 'Jeton de rafraichissement invalide ou expire' });
        return;
      }

      // Rotate: delete old, create new
      await UserRepository.deleteRefreshToken(tokenHash);

      const newRefreshToken = AuthService.generateRefreshToken();
      const newHash = AuthService.hashToken(newRefreshToken);
      await UserRepository.saveRefreshToken(stored.userId, newHash, AuthService.getRefreshTokenExpiry());

      const accessToken = AuthService.generateAccessToken({
        userId: stored.user.id,
        role: stored.user.role,
        site: stored.user.site || undefined,
      });

      AuthService.setRefreshCookie(res, newRefreshToken);

      res.json({ accessToken });
    } catch (err: any) {
      logger.error('Refresh error:', err);
      res.status(500).json({ error: 'Echec du rafraichissement du jeton' });
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies?.refreshToken;
      if (token) {
        const tokenHash = AuthService.hashToken(token);
        await UserRepository.deleteRefreshToken(tokenHash);
      }

      AuthService.clearRefreshCookie(res);

      res.json({ message: 'Deconnexion reussie' });
    } catch (err: any) {
      logger.error('Logout error:', err);
      res.status(500).json({ error: 'Echec de la deconnexion' });
    }
  }

  // GET /api/auth/me
  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifie' });
        return;
      }

      const user = await UserRepository.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'Utilisateur introuvable' });
        return;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        site: user.site,
        city: user.city,
        skills: user.skills,
        experience: user.experience,
        cvUrl: user.cvUrl,
      });
    } catch (err: any) {
      logger.error('Me error:', err);
      res.status(500).json({ error: 'Echec de la recuperation du profil' });
    }
  }

  // POST /api/auth/forgot-password
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        res.json({ message: 'Si l\'e-mail existe, un lien de reinitialisation a ete envoye.' });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save reset token to user
      await UserRepository.update(user.id, {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      });

      // Send email
      const resetUrl = `${process.env.CANDIDATE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      try {
        await sendPasswordResetEmail(user.email || '', user.name, resetUrl);
        logger.info(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        logger.error('Failed to send reset email:', emailError);
        // Continue anyway - don't reveal email sending issues
      }

      res.json({ message: 'Si l\'e-mail existe, un lien de reinitialisation a ete envoye.' });
    } catch (err: any) {
      logger.error('Forgot password error:', err);
      res.status(500).json({ error: 'Echec du traitement de la demande de reinitialisation du mot de passe' });
    }
  }

  // POST /api/auth/reset-password
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ error: 'Le jeton et le mot de passe sont requis' });
        return;
      }

      // Hash the token to compare with stored hash
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await UserRepository.findByResetToken(resetTokenHash);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        res.status(400).json({ error: 'Jeton de reinitialisation invalide ou expire' });
        return;
      }

      // Update password and clear reset token
      const passwordHash = await AuthService.hashPassword(password);
      await UserRepository.update(user.id, {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      });

      // Clear all refresh tokens to force re-login
      await UserRepository.deleteAllRefreshTokens(user.id);

      logger.info(`Password reset successful for: ${user.email}`);

      res.json({ message: 'Mot de passe reinitialise avec succes. Veuillez vous connecter avec votre nouveau mot de passe.' });
    } catch (err: any) {
      logger.error('Reset password error:', err);
      res.status(500).json({ error: 'Echec de la reinitialisation du mot de passe' });
    }
  }

  // POST /api/auth/verify-email
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        res.status(400).json({ error: 'userId et code sont requis' });
        return;
      }

      const codeHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
      const user = await UserRepository.findByVerifyToken(userId, codeHash);

      if (!user) {
        res.status(400).json({ error: 'Code de verification invalide ou expire' });
        return;
      }

      // Mark as verified and clear token
      await UserRepository.update(user.id, {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      });

      // Verify user is active before auto-login
      if (user.isActive === false || user.deletedAt) {
        res.status(403).json({ error: 'Compte inactif ou supprime' });
        return;
      }

      // Auto-login: issue tokens
      const accessToken = AuthService.generateAccessToken({
        userId: user.id,
        role: user.role,
        site: user.site,
      });

      const refreshToken = AuthService.generateRefreshToken();
      const tokenHash = AuthService.hashToken(refreshToken);
      await UserRepository.saveRefreshToken(user.id, tokenHash, AuthService.getRefreshTokenExpiry());

      AuthService.setRefreshCookie(res, refreshToken);

      logger.info(`Email verified for: ${user.email}`);

      res.json({
        message: 'Email verifie avec succes',
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          city: user.city,
        },
      });
    } catch (err: any) {
      logger.error('Verify email error:', err);
      res.status(500).json({ error: 'Echec de la verification de l\'email' });
    }
  }

  // POST /api/auth/resend-verification
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email requis' });
        return;
      }

      const user = await UserRepository.findByEmail(email);
      if (!user || user.emailVerified) {
        // Don't reveal if email exists or is already verified
        res.json({ message: 'Si l\'adresse existe et n\'est pas encore verifiee, un nouveau code a ete envoye.' });
        return;
      }

      // Cooldown check: if token was sent less than 60s ago, silently succeed to prevent timing/status leaks
      if (user.verifyTokenExpiry) {
        const tokenAge = Date.now() - (user.verifyTokenExpiry.getTime() - 15 * 60 * 1000);
        if (tokenAge < 60 * 1000) {
          res.json({ message: 'Si l\'adresse existe et n\'est pas encore verifiee, un nouveau code a ete envoye.' });
          return;
        }
      }

      // Generate new secure code
      const verifyCode = crypto.randomInt(100000, 1000000).toString();
      const verifyTokenHash = crypto.createHash('sha256').update(verifyCode).digest('hex');
      const verifyTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await UserRepository.update(user.id, {
        verifyToken: verifyTokenHash,
        verifyTokenExpiry,
      });

      try {
        await sendVerificationEmail(user.email || '', user.name, verifyCode);
        logger.info(`Verification code resent to: ${user.email}`);
      } catch (emailError) {
        logger.error('Failed to resend verification email:', emailError);
      }

      res.json({ message: 'Si l\'adresse existe et n\'est pas encore verifiee, un nouveau code a ete envoye.' });
    } catch (err: any) {
      logger.error('Resend verification error:', err);
      res.status(500).json({ error: 'Echec du renvoi du code de verification' });
    }
  }
}
