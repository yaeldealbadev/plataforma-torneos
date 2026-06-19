import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Card from '../components/ui/Card';
import type { TournamentStatus, TournamentWithStats } from '../types';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, loading, error } = useFetch<TournamentWithStats>(
    `/tournaments/${id ?? ''}`
  );

  if (loading) return <p>Cargando torneo...</p>;
  if (error) return <p>{error}</p>;
  if (!tournament) return <p>Torneo no encontrado.</p>;

  return (
    <section className="tournament-detail">
      <h1>{tournament.name}</h1>
      <Card>
        <p><strong>Juego:</strong> {tournament.game_title}</p>
        <p><strong>Estado:</strong> {STATUS_LABELS[tournament.status]}</p>
        <p><strong>Inicio:</strong> {new Date(tournament.start_date).toLocaleDateString('es-MX')}</p>
        <p><strong>Inscritos:</strong> {tournament.inscritos} / {tournament.max_participants}</p>
        {tournament.prize && <p><strong>Premio:</strong> {tournament.prize}</p>}
        {tournament.description && <p><strong>Descripción:</strong> {tournament.description}</p>}
      </Card>
      {/* 3C: botón de inscripción aquí */}
    </section>
  );
}
