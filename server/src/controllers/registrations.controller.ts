import { pool } from '../config/db.js';
import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest, Registration } from '../types/index.js';

type RegistrationRow = RowDataPacket & Registration;

interface TournamentCheck extends RowDataPacket {
  id: number;
  status: string;
  max_participants: number;
}

interface RegistrationCheck extends RowDataPacket {
  id: number;
  status: string;
  user_id: number;
}

export async function getMyRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, t.name AS tournament_name, t.start_date, t.status AS tournament_status
       FROM registrations r
       JOIN tournaments t ON t.id = r.tournament_id
       WHERE r.user_id = ?
       ORDER BY r.registered_at DESC`,
      [userId]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function createRegistration(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const { tournament_id } = req.body;

    // 1. ¿Existe el torneo?
    const [tournaments] = await pool.query<TournamentCheck[]>(
      'SELECT id, status, max_participants FROM tournaments WHERE id = ?',
      [tournament_id]
    );
    if (tournaments.length === 0) {
      res.status(404).json({ message: 'Torneo no encontrado' });
      return;
    }
    const tournament = tournaments[0];

    // 2. ¿El torneo está abierto?
    if (tournament.status !== 'open') {
      res.status(409).json({ message: 'El torneo no está abierto a inscripciones' });
      return;
    }

    // 3. ¿Hay cupo disponible?
    const [countRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM registrations WHERE tournament_id = ? AND status = 'registered'",
      [tournament_id]
    );
    if ((countRows[0].total as number) >= tournament.max_participants) {
      res.status(409).json({ message: 'Cupo lleno' });
      return;
    }

    // 4. ¿Ya existe una inscripción de este usuario?
    const [existing] = await pool.query<RegistrationCheck[]>(
      'SELECT id, status, user_id FROM registrations WHERE user_id = ? AND tournament_id = ?',
      [userId, tournament_id]
    );

    let registrationId: number;

    if (existing.length === 0) {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO registrations (user_id, tournament_id, status) VALUES (?, ?, 'registered')",
        [userId, tournament_id]
      );
      registrationId = result.insertId;
    } else if (existing[0].status === 'registered') {
      res.status(409).json({ message: 'Ya estás inscrito' });
      return;
    } else {
      // status === 'cancelled' → reactivar sin violar el UNIQUE
      await pool.query<ResultSetHeader>(
        "UPDATE registrations SET status = 'registered' WHERE id = ?",
        [existing[0].id]
      );
      registrationId = existing[0].id;
    }

    const [rows] = await pool.query<RegistrationRow[]>(
      'SELECT * FROM registrations WHERE id = ?',
      [registrationId]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateRegistrationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM registrations WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ message: 'Inscripción no encontrada' });
      return;
    }

    await pool.query<ResultSetHeader>(
      'UPDATE registrations SET status = ? WHERE id = ?',
      [status, id]
    );

    const [rows] = await pool.query<RegistrationRow[]>(
      'SELECT * FROM registrations WHERE id = ?',
      [id]
    );
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteRegistration(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const id = Number(req.params.id);

    const [existing] = await pool.query<RegistrationCheck[]>(
      'SELECT id, user_id, status FROM registrations WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ message: 'Inscripción no encontrada' });
      return;
    }

    const registration = existing[0];
    if (userRole !== 'admin' && userId !== registration.user_id) {
      res.status(403).json({ message: 'No tienes permiso para cancelar esta inscripción' });
      return;
    }

    await pool.query<ResultSetHeader>(
      "UPDATE registrations SET status = 'cancelled' WHERE id = ?",
      [id]
    );
    res.json({ message: 'Inscripción cancelada' });
  } catch (err) {
    next(err);
  }
}
