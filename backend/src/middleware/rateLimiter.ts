import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitStore {
  [ip: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

export function rateLimiter(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetAt) {
      store[ip] = { count: 1, resetAt: now + windowMs };
      next();
      return;
    }

    store[ip].count++;

    if (store[ip].count > maxAttempts) {
      const retryAfter = Math.ceil((store[ip].resetAt - now) / 1000);
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      res.status(429).json({
        error: 'Too many attempts. Please try again later.',
        retryAfter,
      });
      return;
    }

    next();
  };
}
