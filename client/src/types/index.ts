// Tipos compartidos del dominio (placeholders).

export type Role = 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Game {
  id: number;
  title: string;
  genre?: string;
  platform?: string;
  description?: string;
  image_url?: string;
}

export type TournamentStatus = 'upcoming' | 'open' | 'ongoing' | 'finished';

export interface Tournament {
  id: number;
  gameId: number;
  name: string;
  description?: string;
  status: TournamentStatus;
  maxPlayers: number;
  startsAt?: string;
  createdAt?: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected';

export interface Registration {
  id: number;
  userId: number;
  tournamentId: number;
  status: RegistrationStatus;
  createdAt?: string;
}
