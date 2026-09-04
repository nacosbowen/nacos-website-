import { Router } from 'express';
import {
  getArchiveItems,
  createArchiveItem,
  deleteArchiveItem,
  addArchiveImages,
  deleteArchiveImage,
} from '../controllers/archive.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadArchiveImages } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getArchiveItems);
router.post('/', requireRole('executive', 'admin'), createArchiveItem);
router.delete('/:id', requireRole('executive', 'admin'), deleteArchiveItem);
router.post('/:id/images', requireRole('executive', 'admin'), uploadArchiveImages.array('files', 10), addArchiveImages);
router.delete('/:itemId/images/:imageId', requireRole('executive', 'admin'), deleteArchiveImage);

export default router;