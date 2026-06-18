import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { AuthRequest, Role } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret';
// JWT_EXPIRES_IN env var is expressed in seconds (e.g. 604800 = 7 days)
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN ?? 604800);

function signToken(id: number, role: Role): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existing.length > 0) {
      throw new AppError('El email ya está registrado', 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, 'user'],
    );

    const token = signToken(result.insertId, 'user');
    res.status(201).json({
      token,
      user: { id: result.insertId, username, email, role: 'user' },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, password, role, created_at FROM users WHERE email = ?',
      [email],
    );

    const user = rows[0];
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = signToken(user.id as number, user.role as Role);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user: requester } = req as AuthRequest;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [requester!.id],
    );

    const user = rows[0];
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}
