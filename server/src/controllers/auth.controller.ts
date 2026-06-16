import type { Request, Response, NextFunction } from 'express';

// Placeholders del controlador de autenticación.
export async function register(_req: Request, _res: Response, _next: NextFunction) {
  // TODO: crear usuario, hashear password, devolver token.
}

export async function login(_req: Request, _res: Response, _next: NextFunction) {
  // TODO: validar credenciales, devolver token JWT.
}

export async function me(_req: Request, _res: Response, _next: NextFunction) {
  // TODO: devolver el usuario autenticado.
}
