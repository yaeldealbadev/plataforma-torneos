import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import type { RegistrationStatus, RegistrationWithTournament, TournamentStatus } from '../types';

const REG_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: 'Inscrito',
  cancelled: 'Cancelado',
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
    return <p>Inicia sesión para ver tus inscripciones.</p>;
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
    <section className="my-registrations">
      <h1>Mis inscripciones</h1>

      {loading && <p>Cargando inscripciones...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (!registrations || registrations.length === 0) && (
        <p>Aún no tienes inscripciones.</p>
      )}

      {registrations && registrations.map((reg) => (
        <Card key={reg.id}>
          <h3>{reg.tournament_name}</h3>
          <p>Inicio: {new Date(reg.start_date).toLocaleDateString('es-MX')}</p>
          <p>Torneo: {TOURNAMENT_STATUS_LABELS[reg.tournament_status]}</p>
          <p>Inscripción: {REG_STATUS_LABELS[reg.status]}</p>
          {reg.status === 'registered' && (
            <button
              onClick={() => handleCancel(reg.id)}
              disabled={cancelling === reg.id}
            >
              {cancelling === reg.id ? 'Cancelando...' : 'Cancelar inscripción'}
            </button>
          )}
        </Card>
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>{modalMessage}</p>
        <button onClick={() => setIsModalOpen(false)}>Cerrar</button>
      </Modal>
    </section>
  );
}
