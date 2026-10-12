import { Router, Request } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe, adminLogin } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { signup, verifyEmail, resendCode, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

// Identify the real visitor: the first address in X-Forwarded-For.
// req.ip is only a shared internal Render proxy address behind Vercel.
const clientKey = (req: Request): string => {
  const xff = req.headers['x-forwarded-for'];
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim();
  return first || req.ip || 'unknown';
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: clientKey,
  message: { message: 'Too many attempts, try again later' },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: clientKey,
  message: { message: 'Too many requests, try again later' },
});

router.post('/signup', authLimiter, signup);
router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-code', authLimiter, resendCode);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;