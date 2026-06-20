import { pool } from '../config/db.js';
import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest, Tournament } from '../types/index.js';

type TournamentWithStats = Tournament & { game_title: string; inscritos: number };
type TournamentRow = RowDataPacket & TournamentWithStats;

const TOURNAMENT_BASE_SQL = `
  SELECT t.*, g.title AS game_title,
         COUNT(CASE WHEN r.status='registered' THEN 1 END) AS inscritos
  FROM tournaments t
  JOIN games g ON g.id = t.game_id
  LEFT JOIN registrations r ON r.tournament_id = t.id
`;

async function fetchTournamentRow(id: number): Promise<TournamentRow | null> {
  const [rows] = await pool.query<TournamentRow[]>(
    `${TOURNAMENT_BASE_SQL} WHERE t.id = ? GROUP BY t.id`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getTournaments(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const params: unknown[] = [];
    let where = '';
    if (status) {
      where = 'WHERE t.status = ?';
      params.push(status);
    }
    const [rows] = await pool.query<TournamentRow[]>(
      `${TOURNAMENT_BASE_SQL} ${where} GROUP BY t.id ORDER BY t.start_date`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getTournamentById(req: Request, res: Response, next: NextFunction) {
  try {
    const tournament = await fetchTournamentRow(Number(req.params.id));
    if (!tournament) {
      res.status(404).json({ message: 'Torneo no encontrado' });
      return;
    }
    res.json({ data: tournament });
  } catch (err) {
    next(err);
  }
}

export async function createTournament(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const { name, game_id, description, start_date, max_participants, prize, status } = req.body;
    const [games] = await pool.query<RowDataPacket[]>('SELECT id FROM games WHERE id = ?', [game_id]);
    if (games.length === 0) {
      res.status(404).json({ message: 'El juego no existe' });
      return;
    }
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tournaments (name, game_id, description, start_date, max_participants, prize, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, game_id, description ?? null, start_date, max_participants ?? 16, prize ?? null, status ?? 'open', userId]
    );
    const created = await fetchTournamentRow(result.insertId);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateTournament(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existing = await fetchTournamentRow(id);
    if (!existing) {
      res.status(404).json({ message: 'Torneo no encontrado' });
      return;
    }
    const { name, game_id, description, start_date, max_participants, prize, status } = req.body;
    await pool.query<ResultSetHeader>(
      `UPDATE tournaments
       SET name=?, game_id=?, description=?, start_date=?, max_participants=?, prize=?, status=?
       WHERE id=?`,
      [name, game_id, description ?? null, start_date, max_participants, prize ?? null, status, id]
    );
    const updated = await fetchTournamentRow(id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTournament(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM tournaments WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Torneo no encontrado' });
      return;
    }
    await pool.query<ResultSetHeader>('DELETE FROM tournaments WHERE id = ?', [id]);
    res.json({ message: 'Torneo eliminado' });
  } catch (err) {
    next(err);
  }
}
