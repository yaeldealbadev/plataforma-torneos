import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api/axios';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook genérico de fetching tipado <T>.
 *
 * Hace un GET con la instancia compartida de axios y expone { data, loading, error }.
 * El efecto demuestra el ciclo de vida completo:
 *  - Montaje: dispara la petición al renderizar.
 *  - Actualización: se re-ejecuta cuando cambia `url` (o al llamar a refetch).
 *  - Limpieza: aborta la petición en curso al desmontar o antes de re-ejecutar,
 *    evitando actualizar el estado de un componente desmontado.
 *
 * Asume el envoltorio de respuesta del backend: { data: T }.
 */
export function useFetch<T = unknown>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este valor fuerza una re-ejecución del efecto (refetch manual).
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    api
      .get<{ data: T }>(url, { signal: controller.signal })
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        // Si abortamos la petición durante la limpieza, no es un error real.
        if (axios.isCancel(err) || controller.signal.aborted) return;

        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'No se pudieron cargar los datos. Inténtalo de nuevo.';
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Limpieza: aborta la petición pendiente al desmontar o al cambiar la url.
    return () => controller.abort();
  }, [url, reloadKey]);

  return { data, loading, error, refetch };
}
