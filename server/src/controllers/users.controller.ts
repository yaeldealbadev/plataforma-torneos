import type { RowDataPacket } from 'mysql2';
import type { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { AuthRequest, Role } from '../types/index.js';

export async function getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id',
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.params.id],
    );

    const user = rows[0];
    if (!user) throw new AppError('Usuario no encontrado', 404);

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requester = (req as AuthRequest).user!;
    const targetId = Number(req.params.id);
    const { username, email, role } = req.body as {
      username?: string;
      email?: string;
      role?: Role;
    };

    if (requester.role !== 'admin') {
      if (requester.id !== targetId) {
        throw new AppError('Acceso denegado', 403);
      }
      if (role !== undefined) {
        throw new AppError('No puedes cambiar el rol', 403);
      }
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [targetId],
    );
    if (existing.length === 0) throw new AppError('Usuario no encontrado', 404);

    await pool.query(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?',
      [username ?? null, email ?? null, role ?? null, targetId],
    );

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [targetId],
    );
    res.json({ user: updated[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id],
    );
    if (existing.length === 0) throw new AppError('Usuario no encontrado', 404);

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
