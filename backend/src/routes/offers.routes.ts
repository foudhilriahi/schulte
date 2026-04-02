import { Router } from 'express';
import { OffersController } from '../controllers/offers.controller';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public routes
router.get('/', OffersController.getAll);
router.get('/:id', OffersController.getById);

// HR-only routes
router.get('/hr/my-offers', authenticate, requireRole('HR', 'ADMIN'), OffersController.getMyOffers);
router.get('/hr/templates', authenticate, requireRole('HR', 'ADMIN'), AdminController.getTemplates);
router.post('/', authenticate, requireRole('HR', 'ADMIN'), OffersController.create);
router.patch('/:id', authenticate, requireRole('HR', 'ADMIN'), OffersController.update);
router.delete('/:id', authenticate, requireRole('HR', 'ADMIN'), OffersController.remove);

export default router;
