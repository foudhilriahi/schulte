import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/authenticate';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(rateLimiter(180, 1 * 60 * 1000));

router.get('/', authenticate, NotificationsController.getMyNotifications);
router.get('/unread-count', authenticate, NotificationsController.getUnreadCount);
router.patch('/mark-all-read', authenticate, NotificationsController.markAllRead);
router.delete('/clear-all', authenticate, NotificationsController.clearAll);
router.patch('/:id/read', authenticate, NotificationsController.markOneRead);
router.delete('/:id', authenticate, NotificationsController.deleteOne);

export default router;
