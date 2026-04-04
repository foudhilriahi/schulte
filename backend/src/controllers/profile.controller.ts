import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

export class ProfileController {
  // GET /api/profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site: user.site,
      });
    } catch (err: any) {
      logger.error('Get profile error:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // PATCH /api/profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name } = req.body;

      const user = await UserRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const updated = await UserRepository.update(userId, { name });
      logger.info(`Profile updated for user: ${userId}`);

      res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        site: updated.site,
      });
    } catch (err: any) {
      logger.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // PATCH /api/profile/password
  static async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      if (currentPassword === newPassword) {
        res.status(400).json({ error: 'New password must be different from current password' });
        return;
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isValid = await AuthService.comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        return;
      }

      // Update to new password
      const newHash = await AuthService.hashPassword(newPassword);
      await UserRepository.update(userId, { passwordHash: newHash });
      await UserRepository.deleteAllRefreshTokens(userId);

      logger.info(`Password updated for user: ${userId}`);
      res.json({ message: 'Password updated successfully' });
    } catch (err: any) {
      logger.error('Update password error:', err);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
}
