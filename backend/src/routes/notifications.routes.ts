import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/', authenticate, NotificationsController.getMyNotifications);
router.get('/unread-count', authenticate, NotificationsController.getUnreadCount);
router.patch('/mark-all-read', authenticate, NotificationsController.markAllRead);
router.patch('/:id/read', authenticate, NotificationsController.markOneRead);
router.delete('/:id', authenticate, NotificationsController.deleteOne);

export default router;
