import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import logger from '../utils/logger';

export function rateLimiter(maxAttempts: number = 100, windowMs: number = 1 * 60 * 1000): RequestHandler {
  return rateLimit({
    windowMs,
    limit: maxAttempts,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip ?? 'unknown'}`);
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    },
  });
}
