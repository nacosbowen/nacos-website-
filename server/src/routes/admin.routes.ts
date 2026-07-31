import { Router } from 'express';
import {
  getRegistry,
  addToRegistry,
  bulkAddToRegistry,
  removeFromRegistry,
  getStats,
} from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getStats);
router.get('/registry', getRegistry);
router.post('/registry', addToRegistry);
router.post('/registry/bulk', bulkAddToRegistry);
router.delete('/registry/:id', removeFromRegistry);

export default router;
