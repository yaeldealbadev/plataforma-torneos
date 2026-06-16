import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';

// Placeholder: verifica el JWT del header Authorization e inyecta req.user.
export function authMiddleware(_req: AuthRequest, _res: Response, next: NextFunction) {
  // TODO: leer "Authorization: Bearer <token>", verificar con jwt, asignar req.user.
  next();
}
