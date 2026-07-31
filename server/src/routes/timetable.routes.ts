import { Router } from 'express';
import {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from '../controllers/timetable.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getTimetable);
router.post('/', requireRole('course_rep', 'admin'), createTimetableEntry);
router.patch('/:id', requireRole('course_rep', 'admin'), updateTimetableEntry);
router.delete('/:id', requireRole('course_rep', 'admin'), deleteTimetableEntry);

export default router;
