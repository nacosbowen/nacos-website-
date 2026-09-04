import { Router } from 'express';
import { getExams, createExam, deleteExam } from '../controllers/exam.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getExams);
router.post('/', requireRole('admin', 'executive'), createExam);
router.delete('/:id', requireRole('admin', 'executive'), deleteExam);

export default router;