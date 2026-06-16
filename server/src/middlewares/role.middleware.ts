import type { Response, NextFunction } from 'express';
import type { AuthRequest, Role } from '../types/index.js';

// Placeholder: restringe el acceso a uno o varios roles.
export function roleMiddleware(..._roles: Role[]) {
  return (_req: AuthRequest, _res: Response, next: NextFunction) => {
    // TODO: comprobar que req.user.role esté incluido en _roles.
    next();
  };
}
