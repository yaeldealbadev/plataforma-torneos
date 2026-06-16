import type { Request, Response, NextFunction } from 'express';

// Placeholder: recoge los resultados de express-validator y devuelve 400 si hay errores.
export function validate(_req: Request, _res: Response, next: NextFunction) {
  // TODO: const errors = validationResult(_req); if (!errors.isEmpty()) ...
  next();
}
