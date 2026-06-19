import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest, Role } from '../types/index.js';

export function roleMiddleware(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: 'Acceso denegado' });
      return;
    }

    next();
  };
}
