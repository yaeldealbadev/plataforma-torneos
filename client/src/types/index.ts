export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
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

// Shape de lectura: Tournament + campos calculados que añade la API (JOIN + COUNT).
export type TournamentWithStats = Tournament & {
  game_title: string;
  inscritos: number;
};

// Shape de lectura: Registration + datos del torneo que añade la API (JOIN tournaments).
export type RegistrationWithTournament = Registration & {
  tournament_name: string;
  start_date: string;
  tournament_status: TournamentStatus;
};
