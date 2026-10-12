import { Router } from 'express';
import {
  getPastQuestions,
  uploadPastQuestion,
  deletePastQuestion,
} from '../controllers/past-questions.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadPdf } from '../middleware/upload.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getPastQuestions);
router.post('/', requireRole('course_rep', 'executive', 'admin'), uploadPdf.single('file'), uploadPastQuestion);
router.delete('/:id', deletePastQuestion);

export default router;
