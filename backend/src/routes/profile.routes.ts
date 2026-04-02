import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.patch('/password', authenticate, ProfileController.updatePassword);

export default router;
