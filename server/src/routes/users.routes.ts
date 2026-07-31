import { Router } from 'express';
import { listUsers, getUser, assignRole, getDepartments } from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/departments', getDepartments);
router.get('/', requireRole('admin'), listUsers);
router.get('/:id', getUser);
router.patch('/:id/roles', requireRole('admin'), assignRole);

export default router;
