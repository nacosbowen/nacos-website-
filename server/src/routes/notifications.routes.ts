import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  getActivePopup,
  getActivePopups,
  getSentNotifications,
  createNotification,
  createCourseRepNotification,
  deleteNotification,
  updateNotification,
  markRead,
  markAllRead,
  getMyCourseRepClasses,
  getMyCourseRepSent,
  deleteMyCourseRepNotification,
  
} from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/popup', getActivePopup);
router.get('/popups', getActivePopups);
router.get('/sent', requireRole('executive', 'admin'), getSentNotifications);
router.post('/', requireRole('executive', 'admin'), createNotification);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.patch('/:id', requireRole('executive', 'admin'), updateNotification);
router.delete('/:id', requireRole('executive', 'admin'), deleteNotification);
router.post('/course-rep', requireRole('course_rep'), createCourseRepNotification);
router.get('/course-rep/classes', requireRole('course_rep'), getMyCourseRepClasses);
router.get('/course-rep/sent', requireRole('course_rep'), getMyCourseRepSent);
router.delete('/course-rep/:id', requireRole('course_rep'), deleteMyCourseRepNotification);

export default router;