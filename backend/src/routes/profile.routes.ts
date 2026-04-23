import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { profileUpdateSchema, profilePasswordSchema } from '../middleware/schemas';

const router = Router();

router.get('/', authenticate, requireRole('CANDIDATE', 'HR', 'ADMIN'), ProfileController.getProfile);
router.patch('/', authenticate, requireRole('CANDIDATE', 'HR', 'ADMIN'), validate(profileUpdateSchema), ProfileController.updateProfile);
router.patch('/password', authenticate, requireRole('CANDIDATE', 'HR', 'ADMIN'), validate(profilePasswordSchema), ProfileController.updatePassword);
router.delete('/', authenticate, requireRole('CANDIDATE'), ProfileController.deleteProfile);

export default router;
