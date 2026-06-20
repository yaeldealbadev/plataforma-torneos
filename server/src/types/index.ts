import type { Request } from 'express';

export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // hash; nunca se expone al cliente
  role: Role;
  created_at?: Date;
}

export interface Game {
  id: number;
  title: string;
  genre?: string;
  platform?: string;
  description?: string;
  image_url?: string;
  created_at?: Date;
}

export type TournamentStatus = 'open' | 'in_progress' | 'finished';

export interface Tournament {
  id: number;
  name: string;
  game_id: number;
  description?: string;
  start_date: Date;
  max_participants: number;
  prize?: string;
  status: TournamentStatus;
  created_by?: number;
  created_at?: Date;
}

export type RegistrationStatus = 'registered' | 'cancelled';

export interface Registration {
  id: number;
  user_id: number;
  tournament_id: number;
  status: RegistrationStatus;
  registered_at?: Date;
}

// Payload del JWT.
export interface JwtPayload {
  id: number;
  role: Role;
}

// Request extendido con el usuario autenticado (lo inyecta auth.middleware).
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
