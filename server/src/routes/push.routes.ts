import { Router } from 'express';
import { getPublicKey, subscribe, unsubscribe } from '../controllers/push.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/public-key', getPublicKey);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

export default router;