import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
  userId: string;
  role: 'ADMIN' | 'HR' | 'CANDIDATE';
  site?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

import { UserRepository } from '../repositories/user.repository';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Jeton d\'acces requis' });
    return;
  }

  jwt.verify(token, env.JWT_ACCESS_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      res.status(401).json({ error: 'Jeton d\'acces invalide ou expire' });
      return;
    }

    const payload = decoded as AuthPayload;

    // Immediate Revocation Check for HR and ADMIN
    if (payload.role === 'HR' || payload.role === 'ADMIN') {
      try {
        const user = await UserRepository.findById(payload.userId);
        if (!user || !user.isActive) {
          res.status(403).json({ error: 'Compte desactive. Acces refuse.' });
          return;
        }
      } catch (dbErr) {
        res.status(500).json({ error: 'Erreur lors de la verification du compte' });
        return;
      }
    }

    req.user = payload;
    next();
  });
}
