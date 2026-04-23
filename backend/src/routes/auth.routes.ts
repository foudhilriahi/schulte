import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../middleware/schemas';

const router = Router();

// Public
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', rateLimiter(100, 1 * 60 * 1000), validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', rateLimiter(100, 1 * 60 * 1000), AuthController.forgotPassword);
router.post('/reset-password', rateLimiter(100, 1 * 60 * 1000), AuthController.resetPassword);
router.post('/verify-email', rateLimiter(100, 1 * 60 * 1000), AuthController.verifyEmail);
router.post('/resend-verification', rateLimiter(10, 1 * 60 * 1000), AuthController.resendVerification);

// Protected
router.get('/me', authenticate, AuthController.me);

export default router;
