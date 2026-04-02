import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

export class ProfileController {
  // PATCH /api/profile/password
  static async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

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

      logger.info(`Password updated for user: ${userId}`);
      res.json({ message: 'Password updated successfully' });
    } catch (err: any) {
      logger.error('Update password error:', err);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
}
