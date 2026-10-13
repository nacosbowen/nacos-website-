import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('executive', 'admin'), getStats);

export default router;