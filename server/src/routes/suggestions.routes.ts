import { Router } from 'express';
import {
  createSuggestion,
  getSuggestions,
  updateSuggestionStatus,
} from '../controllers/suggestions.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', createSuggestion);
router.get('/', getSuggestions);
router.patch('/:id/status', requireRole('executive', 'admin'), updateSuggestionStatus);

export default router;
