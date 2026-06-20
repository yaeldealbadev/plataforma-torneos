import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import type { TournamentStatus, TournamentWithStats } from '../types';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

const STATUS_BADGE: Record<TournamentStatus, string> = {
  open: 'badge-open',
  in_progress: 'badge-progress',
  finished: 'badge-finished',
};

// DISEÑO: filtrado al SUBMIT — el valor se lee del ref en el momento del submit,
// no de un state sincronizado en cada tecla (formulario no controlado).
export default function Tournaments() {
  const { data: tournaments, loading, error } = useFetch<TournamentWithStats[]>('/tournaments');

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  if (loading) return <p className="state-info">Cargando torneos...</p>;
  if (error) return <p className="state-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>{error}</p>;
  if (!tournaments || tournaments.length === 0) return <p className="state-info">No hay torneos disponibles.</p>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = inputRef.current?.value.trim() ?? '';
    if (term.length === 0) { setSearchTerm(''); setValidationMsg(''); return; }
    if (term.length < 2) { setValidationMsg('Escribe al menos 2 caracteres para buscar.'); return; }
    setValidationMsg('');
    setSearchTerm(term);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    setSearchTerm('');
    setValidationMsg('');
  };

  const lower = searchTerm.toLowerCase();
  const visible = searchTerm
    ? tournaments.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.game_title.toLowerCase().includes(lower)
      )
    : tournaments;

  return (
    <section className="page-container">
      <div className="page-header">
        <h1 className="page-title">Torneos</h1>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar torneo por nombre o juego..."
        />
        <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
        <button type="button" onClick={handleClear} className="btn btn-ghost btn-sm">Limpiar</button>
      </form>
      {validationMsg && <p className="validation-msg">{validationMsg}</p>}

      {visible.length === 0 ? (
        <p className="state-info">No se encontraron torneos para &quot;{searchTerm}&quot;.</p>
      ) : (
        <div className="card-grid">
          {visible.map((t) => (
            <Link key={t.id} to={`/tournaments/${t.id}`} className="tournament-card__link">
              <article className="tournament-card">
                <div className="tournament-card__header">
                  <h2 className="tournament-card__title">{t.name}</h2>
                  <span className={`badge ${STATUS_BADGE[t.status]}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                </div>

                <p className="tournament-card__game">{t.game_title}</p>

                <div className="tournament-card__meta">
                  <div className="tournament-card__meta-item">
                    <span className="tournament-card__meta-label">Inicio:</span>
                    <span>{new Date(t.start_date).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="tournament-card__meta-item">
                    <span className="tournament-card__meta-label">Jugadores:</span>
                    <span>{t.inscritos} / {t.max_participants}</span>
                  </div>
                  {t.prize && (
                    <div className="tournament-card__meta-item">
                      <span className="tournament-card__meta-label">Premio:</span>
                      <span>{t.prize}</span>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
