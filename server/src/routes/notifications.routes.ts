import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  getActivePopup,
  createNotification,
  markRead,
  markAllRead,
} from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/popup', getActivePopup);
router.post('/', requireRole('executive', 'admin'), createNotification);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;