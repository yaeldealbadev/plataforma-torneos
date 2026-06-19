import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import type { TournamentStatus, TournamentWithStats } from '../types';

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: tournament, loading, error } = useFetch<TournamentWithStats>(
    `/tournaments/${id ?? ''}`
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleInscripcion = async () => {
    if (!id) return;
    setSending(true);
    try {
      await api.post('/registrations', { tournament_id: Number(id) });
      setModalMessage('¡Inscripción exitosa! Te has unido al torneo.');
      setIsModalOpen(true);
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al inscribirse'
        : 'Error al inscribirse';
      setModalMessage(message);
      setIsModalOpen(true);
    } finally {
      setSending(false);
    }
  };

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

      {user ? (
        <button onClick={handleInscripcion} disabled={sending}>
          {sending ? 'Procesando...' : 'Inscribirme'}
        </button>
      ) : (
        <p>
          <Link to="/login">Inicia sesión</Link> para inscribirte.
        </p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>{modalMessage}</p>
        <button onClick={() => setIsModalOpen(false)}>Cerrar</button>
      </Modal>
    </section>
  );
}
