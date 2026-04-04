import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { profileUpdateSchema, profilePasswordSchema } from '../middleware/schemas';

const router = Router();

router.use(authenticate);
router.get('/', ProfileController.getProfile);
router.patch('/', validate(profileUpdateSchema), ProfileController.updateProfile);
router.patch('/password', validate(profilePasswordSchema), ProfileController.updatePassword);

export default router;
