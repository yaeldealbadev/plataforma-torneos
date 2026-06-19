import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '../api/axios';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = unknown>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .get<T>(url)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (isAxiosError(err)) {
            const errBody = err.response?.data as { message?: string } | undefined;
            setError(errBody?.message ?? err.message ?? 'Error al cargar datos');
          } else {
            setError('Error al cargar datos');
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, trigger]);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { data, loading, error, refetch };
}
