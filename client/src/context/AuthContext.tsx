import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

// Placeholder del contexto de autenticación.
export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user] = useState<User | null>(null);
  const [token] = useState<string | null>(null);

  // TODO: implementar login/register/logout contra la API.
  const login = async (_email: string, _password: string): Promise<void> => {};
  const register = async (
    _username: string,
    _email: string,
    _password: string
  ): Promise<void> => {};
  const logout = (): void => {};

  const value: AuthContextValue = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
