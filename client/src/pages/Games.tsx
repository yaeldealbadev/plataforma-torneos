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
    <section className="games-page">
      <header className="games-header">
        <h1 className="page-title">Catálogo de juegos</h1>
        <label className="games-filter">
          <span className="games-filter__label">Género:</span>
          <select value={genre} onChange={handleGenreChange}>
            <option value="">Todos</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading && <p className="state-info">Cargando juegos…</p>}
      {error && !loading && <p className="state-error">{error}</p>}
      {!loading && !error && !hasGames && (
        <p className="state-info">
          {genre ? `No hay juegos del género "${genre}".` : 'Todavía no hay juegos.'}
        </p>
      )}
      {!loading && !error && hasGames && (
        <div className="games-grid">
          {games!.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
