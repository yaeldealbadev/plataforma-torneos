import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db.js';
import type { Game } from '../types/index.js';

// Fila de la tabla `games` tal como la devuelve mysql2.
type GameRow = Game & RowDataPacket;

// GET /api/games  -> listado público con filtros opcionales ?genre= &platform=
export async function listGames(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { genre, platform } = req.query;

    const conditions: string[] = [];
    const params: string[] = [];

    if (typeof genre === 'string' && genre.trim()) {
      conditions.push('genre = ?');
      params.push(genre.trim());
    }
    if (typeof platform === 'string' && platform.trim()) {
      conditions.push('platform = ?');
      params.push(platform.trim());
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query<GameRow[]>(
      `SELECT id, title, genre, platform, description, image_url FROM games${where} ORDER BY title ASC`,
      params
    );

    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/games/:id  -> detalle público (404 si no existe)
export async function getGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Id inválido.' });
      return;
    }

    const [rows] = await pool.query<GameRow[]>(
      'SELECT id, title, genre, platform, description, image_url FROM games WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Juego no encontrado.' });
      return;
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/games  -> crear (solo admin, body ya validado por express-validator)
export async function createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, genre, platform, description, image_url } = req.body as Partial<Game>;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO games (title, genre, platform, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, genre ?? null, platform ?? null, description ?? null, image_url ?? null]
    );

    const [rows] = await pool.query<GameRow[]>(
      'SELECT id, title, genre, platform, description, image_url FROM games WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/games/:id  -> actualizar (solo admin, body ya validado)
export async function updateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Id inválido.' });
      return;
    }

    const { title, genre, platform, description, image_url } = req.body as Partial<Game>;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE games SET title = ?, genre = ?, platform = ?, description = ?, image_url = ? WHERE id = ?',
      [title, genre ?? null, platform ?? null, description ?? null, image_url ?? null, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Juego no encontrado.' });
      return;
    }

    const [rows] = await pool.query<GameRow[]>(
      'SELECT id, title, genre, platform, description, image_url FROM games WHERE id = ?',
      [id]
    );

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/games/:id  -> eliminar (solo admin)
export async function deleteGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Id inválido.' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM games WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Juego no encontrado.' });
      return;
    }

    res.status(200).json({ message: 'Juego eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
}
