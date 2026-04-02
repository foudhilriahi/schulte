import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.use('/hr-accounts', requireRole('ADMIN'));
router.get('/hr-accounts', AdminController.getHRAccounts);
router.post('/hr-accounts', AdminController.createHRAccount);
router.patch('/hr-accounts/:id', AdminController.updateHRAccount);
router.delete('/hr-accounts/:id', AdminController.deleteHRAccount);

router.use('/templates', requireRole('ADMIN'));
router.get('/templates', AdminController.getTemplates);
router.post('/templates', AdminController.createTemplate);
router.patch('/templates/:id', AdminController.updateTemplate);
router.delete('/templates/:id', AdminController.deleteTemplate);

// Overview endpoints (both ADMIN and HR can access their respective overviews)
router.get('/overview', requireRole('ADMIN'), AdminController.overview);
router.get('/hr-overview', requireRole('HR'), AdminController.hrOverview);

export default router;
