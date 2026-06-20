import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import type { RegistrationStatus, RegistrationWithTournament, TournamentStatus } from '../types';

const REG_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: 'Inscrito',
  cancelled: 'Cancelado',
};

const REG_STATUS_BADGE: Record<RegistrationStatus, string> = {
  registered: 'badge-registered',
  cancelled: 'badge-cancelled',
};

const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

export default function MyRegistrations() {
  const { user } = useAuth();
  const { data: registrations, loading, error, refetch } = useFetch<RegistrationWithTournament[]>(
    '/registrations/me'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);

  if (!user) {
    return <p className="state-info">Inicia sesión para ver tus inscripciones.</p>;
  }

  const handleCancel = async (registrationId: number) => {
    setCancelling(registrationId);
    try {
      await api.delete(`/registrations/${registrationId}`);
      refetch();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al cancelar'
        : 'Error al cancelar';
      setModalMessage(message);
      setIsModalOpen(true);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mis inscripciones</h1>
      </div>

      {loading && <p className="state-info">Cargando inscripciones...</p>}
      {error && <p className="state-error">{error}</p>}
      {!loading && !error && (!registrations || registrations.length === 0) && (
        <p className="state-info">Aún no tienes inscripciones.</p>
      )}

      <div className="registration-list">
        {registrations && registrations.map((reg) => (
          <div key={reg.id} className="registration-card">
            <div className="registration-card__info">
              <h3 className="registration-card__name">{reg.tournament_name}</h3>
              <p className="registration-card__meta">
                Inicio: {new Date(reg.start_date).toLocaleDateString('es-MX')}
                {' · '}
                Torneo: {TOURNAMENT_STATUS_LABELS[reg.tournament_status]}
              </p>
            </div>
            <div className="registration-card__actions">
              <span className={`badge ${REG_STATUS_BADGE[reg.status]}`}>
                {REG_STATUS_LABELS[reg.status]}
              </span>
              {reg.status === 'registered' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleCancel(reg.id)}
                  disabled={cancelling === reg.id}
                >
                  {cancelling === reg.id ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          </div>
        ))}
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
