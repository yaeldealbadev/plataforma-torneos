import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Card from '../components/ui/Card';
import type { TournamentStatus, TournamentWithStats } from '../types';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

export default function Tournaments() {
  const { data: tournaments, loading, error } = useFetch<TournamentWithStats[]>('/tournaments');

  if (loading) return <p>Cargando torneos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!tournaments || tournaments.length === 0) return <p>No hay torneos disponibles.</p>;

  return (
    <section className="tournaments">
      <h1>Torneos</h1>
      {tournaments.map((t) => (
        <Link key={t.id} to={`/tournaments/${t.id}`} className="card-link">
          <Card>
            <h2>{t.name}</h2>
            <p>{t.game_title}</p>
            <p>Estado: {STATUS_LABELS[t.status]}</p>
            <p>Inicio: {new Date(t.start_date).toLocaleDateString('es-MX')}</p>
            <p>{t.inscritos} / {t.max_participants} inscritos</p>
          </Card>
        </Link>
      ))}
    </section>
  );
}
