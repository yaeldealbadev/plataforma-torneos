import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
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

  if (loading) return <p className="state-info">Cargando torneo...</p>;
  if (error) return <p className="state-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>{error}</p>;
  if (!tournament) return <p className="state-info">Torneo no encontrado.</p>;

  return (
    <section className="page-container page-container--detail">
      <Link to="/tournaments" className="tournament-detail__back">
        ← Volver a torneos
      </Link>

      <h1 className="tournament-detail__title">{tournament.name}</h1>

      <div className="card">
        <div className="tournament-detail__info">
          <div className="tournament-detail__row">
            <span className="tournament-detail__label">Juego</span>
            <span className="tournament-detail__value">{tournament.game_title}</span>
          </div>
          <div className="tournament-detail__row">
            <span className="tournament-detail__label">Estado</span>
            <span className={`badge ${STATUS_BADGE[tournament.status]}`}>
              {STATUS_LABELS[tournament.status]}
            </span>
          </div>
          <div className="tournament-detail__row">
            <span className="tournament-detail__label">Inicio</span>
            <span className="tournament-detail__value">
              {new Date(tournament.start_date).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>
          <div className="tournament-detail__row">
            <span className="tournament-detail__label">Inscritos</span>
            <span className="tournament-detail__value">
              {tournament.inscritos} / {tournament.max_participants}
            </span>
          </div>
          {tournament.prize && (
            <div className="tournament-detail__row">
              <span className="tournament-detail__label">Premio</span>
              <span className="tournament-detail__value">{tournament.prize}</span>
            </div>
          )}
          {tournament.description && (
            <div className="tournament-detail__row">
              <span className="tournament-detail__label">Descripción</span>
              <span className="tournament-detail__value">{tournament.description}</span>
            </div>
          )}
        </div>
      </div>

      <div className="tournament-detail__actions">
        {user ? (
          <button className="btn btn-primary" onClick={handleInscripcion} disabled={sending}>
            {sending ? 'Procesando...' : 'Inscribirme'}
          </button>
        ) : (
          <p className="tournament-detail__no-session">
            <Link to="/login">Inicia sesión</Link> para inscribirte.
          </p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p className="modal-text">{modalMessage}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>
            Cerrar
          </button>
        </div>
      </Modal>
    </section>
  );
}
