import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that ensures HR users have a site assigned.
 * ADMIN users and non-HR roles pass through unconditionally.
 *
 * Usage: router.use(requireSiteOwnership) or per-route.
 */
export function requireSiteOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.user?.role === 'HR' && !req.user.site) {
    res.status(403).json({ error: 'HR account has no site assigned' });
    return;
  }

  next();
}
