import type { Response, NextFunction } from 'express';
import type { AuthRequest, Role } from '../types/index.js';

export function roleMiddleware(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acceso prohibido' });
      return;
    }
    next();
  };
}
