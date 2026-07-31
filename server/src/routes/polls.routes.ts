import { Router } from 'express';
import {
  getPolls,
  getPoll,
  createPoll,
  castVote,
  updatePoll,
  deletePoll,
} from '../controllers/polls.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getPolls);
router.get('/:id', getPoll);
router.post('/', requireRole('executive', 'admin'), createPoll);
router.post('/:id/vote', castVote);
router.patch('/:id', requireRole('executive', 'admin'), updatePoll);
router.delete('/:id', requireRole('admin'), deletePoll);

export default router;
