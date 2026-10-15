import { Router } from 'express';
import { getStats, getCourseRepStats } from '../controllers/stats.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('executive', 'admin'), getStats);
router.get('/course-rep', requireRole('course_rep'), getCourseRepStats);

export default router;