import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (res.headersSent) {
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
}
