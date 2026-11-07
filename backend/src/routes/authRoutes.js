import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resendVerification,
  resetPassword,
  selectPlan,
  verifyEmail,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo.', code: 'RATE_LIMITED' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/select-plan', authenticate, selectPlan);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
