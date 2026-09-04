import { Router } from 'express';
import { getDinnerInfo, updateDinnerInfo, uploadDinnerImage } from '../controllers/dinner.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadImage } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getDinnerInfo);
router.patch('/', requireRole('admin', 'executive'), updateDinnerInfo);
router.post('/image', requireRole('admin', 'executive'), uploadImage.single('file'), uploadDinnerImage);

export default router;