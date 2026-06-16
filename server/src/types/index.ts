import type { Request } from 'express';

// Tipos compartidos del backend (placeholders).

export type Role = 'user' | 'admin';

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
  name: string;
  slug: string;
  description?: string;
  cover_url?: string;
}

export type TournamentStatus = 'upcoming' | 'open' | 'ongoing' | 'finished';

export interface Tournament {
  id: number;
  game_id: number;
  name: string;
  description?: string;
  status: TournamentStatus;
  max_players: number;
  starts_at?: Date;
  created_at?: Date;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected';

export interface Registration {
  id: number;
  user_id: number;
  tournament_id: number;
  status: RegistrationStatus;
  created_at?: Date;
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
