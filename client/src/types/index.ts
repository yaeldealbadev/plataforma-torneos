export type Role = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  // password omitido: el frontend nunca recibe el hash
  role: Role;
  created_at?: string;
}

export interface Game {
  id: number;
  title: string;
  genre?: string;
  platform?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export type TournamentStatus = 'open' | 'in_progress' | 'finished';

export interface Tournament {
  id: number;
  name: string;
  game_id: number;
  description?: string;
  start_date: string;
  max_participants: number;
  prize?: string;
  status: TournamentStatus;
  created_by?: number;
  created_at?: string;
}

export type RegistrationStatus = 'registered' | 'cancelled';

export interface Registration {
  id: number;
  user_id: number;
  tournament_id: number;
  status: RegistrationStatus;
  registered_at?: string;
}
