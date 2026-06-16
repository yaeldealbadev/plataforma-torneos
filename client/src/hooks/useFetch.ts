import { useState } from 'react';

// Placeholder de un hook genérico de fetching.
export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = unknown>(_url: string): UseFetchResult<T> {
  const [data] = useState<T | null>(null);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  // TODO: implementar la lógica de fetching con la instancia de axios.
  const refetch = (): void => {};

  return { data, loading, error, refetch };
}
