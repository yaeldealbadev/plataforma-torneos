import type { Request, Response, NextFunction } from 'express';

// Placeholder: manejador central de errores de Express.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
}
