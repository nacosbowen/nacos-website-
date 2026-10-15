import { Router } from 'express';
import {
  createDevApplication,
  getDevApplications,
  updateDevApplicationStatus,
  deleteDevApplication,
} from '../controllers/dev-applications.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', createDevApplication);
router.get('/', requireRole('executive', 'admin'), getDevApplications);
router.patch('/:id/status', requireRole('executive', 'admin'), updateDevApplicationStatus);
router.delete('/:id', requireRole('executive', 'admin'), deleteDevApplication);

export default router;