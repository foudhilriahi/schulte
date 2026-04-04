import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import {
	adminCreateHRSchema,
	adminUpdateHRSchema,
	adminCreateTemplateSchema,
	adminUpdateTemplateSchema,
	adminBroadcastSchema,
} from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.use('/hr-accounts', requireRole('ADMIN'));
router.get('/hr-accounts', AdminController.getHRAccounts);
router.post('/hr-accounts', validate(adminCreateHRSchema), AdminController.createHRAccount);
router.patch('/hr-accounts/:id', validate(adminUpdateHRSchema), AdminController.updateHRAccount);
router.delete('/hr-accounts/:id', AdminController.deleteHRAccount);

router.use('/templates', requireRole('ADMIN'));
router.get('/templates', AdminController.getTemplates);
router.post('/templates', validate(adminCreateTemplateSchema), AdminController.createTemplate);
router.patch('/templates/:id', validate(adminUpdateTemplateSchema), AdminController.updateTemplate);
router.delete('/templates/:id', AdminController.deleteTemplate);
router.post('/broadcast-hr', validate(adminBroadcastSchema), AdminController.broadcastToHR);

// Overview endpoints (both ADMIN and HR can access their respective overviews)
router.get('/overview', requireRole('ADMIN'), AdminController.overview);
router.get('/hr-overview', requireRole('HR'), AdminController.hrOverview);

export default router;
