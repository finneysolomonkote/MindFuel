import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rate-limit';
import { loginSchema, registerSchema } from '@mindfuel/validation';
import { login, register, refreshToken, logout, forgotPassword, resetPassword } from '../modules/auth/auth.handlers';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
