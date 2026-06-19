import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Card from '../components/ui/Card';
import type { TournamentStatus, TournamentWithStats } from '../types';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

// DISEÑO: el filtrado ocurre al hacer submit, no en vivo.
// Esto deja explícito que el valor del input se lee del ref en el momento del
// submit (formulario no controlado), sin estado sincronizado en cada tecla.
export default function Tournaments() {
  const { data: tournaments, loading, error } = useFetch<TournamentWithStats[]>('/tournaments');

  // Formulario no controlado: el input NO tiene value/onChange ligado a estado.
  // Su valor se lee con inputRef.current.value únicamente al hacer submit.
  const inputRef = useRef<HTMLInputElement>(null);

  // searchTerm es el término YA confirmado (al submit). El input en sí es no controlado.
  const [searchTerm, setSearchTerm] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  // Todos los hooks están declarados — ahora sí los early returns.
  if (loading) return <p>Cargando torneos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!tournaments || tournaments.length === 0) return <p>No hay torneos disponibles.</p>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = inputRef.current?.value.trim() ?? '';

    if (term.length === 0) {
      setValidationMsg('');
      setSearchTerm('');
      return;
    }
    if (term.length < 2) {
      setValidationMsg('Escribe al menos 2 caracteres para buscar.');
      return;
    }
    setValidationMsg('');
    setSearchTerm(term);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    setSearchTerm('');
    setValidationMsg('');
  };

  // Filtrado en cliente sobre la lista original (sin mutar data).
  const lower = searchTerm.toLowerCase();
  const visible = searchTerm
    ? tournaments.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.game_title.toLowerCase().includes(lower)
      )
    : tournaments;

  return (
    <section className="tournaments">
      <h1>Torneos</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar torneo por nombre o juego..."
        />
        <button type="submit">Buscar</button>
        <button type="button" onClick={handleClear}>Limpiar</button>
      </form>
      {validationMsg && <p className="validation-msg">{validationMsg}</p>}

      {visible.length === 0 ? (
        <p>No se encontraron torneos para &quot;{searchTerm}&quot;.</p>
      ) : (
        visible.map((t) => (
          <Link key={t.id} to={`/tournaments/${t.id}`} className="card-link">
            <Card>
              <h2>{t.name}</h2>
              <p>{t.game_title}</p>
              <p>Estado: {STATUS_LABELS[t.status]}</p>
              <p>Inicio: {new Date(t.start_date).toLocaleDateString('es-MX')}</p>
              <p>{t.inscritos} / {t.max_participants} inscritos</p>
            </Card>
          </Link>
        ))
      )}
    </section>
  );
}
