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
router.post('/', requireRole('course_rep', 'executive', 'admin'), createTimetableEntry);
router.patch('/:id', requireRole('course_rep', 'executive', 'admin'), updateTimetableEntry);
router.delete('/:id', requireRole('course_rep', 'executive', 'admin'), deleteTimetableEntry);
export default router;
