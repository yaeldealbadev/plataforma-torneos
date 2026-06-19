import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type React from 'react';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import type { Game } from '../types';

// Catálogo público de juegos.
export default function Games() {
  // Filtro por género reflejado en la URL (query params): /games?genre=RPG
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') ?? '';

  // La url cambia con el filtro -> useFetch se re-ejecuta (y aborta la anterior).
  const url = genre ? `/games?genre=${encodeURIComponent(genre)}` : '/games';
  const { data: games, loading, error } = useFetch<Game[]>(url);

  // Opciones del desplegable: se construyen con el catálogo completo (sin filtro)
  // para que no se reduzcan al aplicar un género.
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  useEffect(() => {
    if (!genre && games) {
      const unique = Array.from(
        new Set(games.map((g) => g.genre).filter((g): g is string => Boolean(g)))
      ).sort();
      setGenreOptions(unique);
    }
  }, [genre, games]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ genre: value });
    } else {
      setSearchParams({});
    }
  };

  const hasGames = useMemo(() => Boolean(games && games.length > 0), [games]);

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Catálogo de juegos</h1>
        <label style={styles.filter}>
          <span style={styles.filterLabel}>Género:</span>
          <select value={genre} onChange={handleGenreChange} style={styles.select}>
            <option value="">Todos</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading && <p style={styles.info}>Cargando juegos…</p>}

      {error && !loading && <p style={styles.error}>{error}</p>}

      {!loading && !error && !hasGames && (
        <p style={styles.info}>
          {genre ? `No hay juegos del género "${genre}".` : 'Todavía no hay juegos.'}
        </p>
      )}

      {!loading && !error && hasGames && (
        <div style={styles.grid}>
          {games!.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
  },
  filter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.9rem',
    color: '#374151',
  },
  select: {
    padding: '0.4rem 0.6rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  info: {
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  error: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
    fontSize: '0.9rem',
  },
};
