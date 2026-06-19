import { useState, useMemo, useReducer, type ChangeEvent } from 'react';
import { isAxiosError } from 'axios';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import type { Game, TournamentStatus, TournamentWithStats } from '../types';

// ─── Constantes de dominio ────────────────────────────────────────────────────

const TOURNAMENT_STATUSES: TournamentStatus[] = ['open', 'in_progress', 'finished'];

const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  finished: 'Finalizado',
};

// ─── Tipos del formulario (todos string para simplificar el binding) ──────────

interface TournamentForm {
  name: string;
  game_id: string;
  description: string;
  start_date: string;
  max_participants: string;
  prize: string;
  status: TournamentStatus;
}

const EMPTY_FORM: TournamentForm = {
  name: '',
  game_id: '',
  description: '',
  start_date: '',
  max_participants: '16',
  prize: '',
  status: 'open',
};

function toDatetimeLocal(dateStr: string): string {
  return dateStr.replace(' ', 'T').slice(0, 16);
}

// ─── useReducer: State, Action, reducer ──────────────────────────────────────
//
// Agrupa el estado coordinado de la UI del panel (apertura de modales, modo
// crear/editar, torneo seleccionado, feedback de éxito/error, loading de submit).
// El form controlado queda como useState independiente porque cambia en cada
// tecla y no necesita coordinación con el resto del estado.

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit';   tournament: TournamentWithStats }
  | { type: 'delete'; tournament: TournamentWithStats };

type Feedback =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error';   message: string };

type AdminState = {
  modal:      ModalState;
  feedback:   Feedback;
  submitting: boolean;        // unifica saving + deleting (un solo modal abierto a la vez)
};

type AdminAction =
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT';   tournament: TournamentWithStats }
  | { type: 'OPEN_DELETE'; tournament: TournamentWithStats }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; message: string }
  | { type: 'SUBMIT_ERROR';   message: string };

const initialState: AdminState = {
  modal:      { type: 'closed' },
  feedback:   { kind: 'idle' },
  submitting: false,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'OPEN_CREATE':
      return { modal: { type: 'create' }, feedback: { kind: 'idle' }, submitting: false };
    case 'OPEN_EDIT':
      return { modal: { type: 'edit', tournament: action.tournament }, feedback: { kind: 'idle' }, submitting: false };
    case 'OPEN_DELETE':
      return { modal: { type: 'delete', tournament: action.tournament }, feedback: { kind: 'idle' }, submitting: false };
    case 'CLOSE_MODAL':
      return { ...state, modal: { type: 'closed' } };
    case 'SUBMIT_START':
      return { ...state, submitting: true, feedback: { kind: 'idle' } };
    case 'SUBMIT_SUCCESS':
      return { modal: { type: 'closed' }, feedback: { kind: 'success', message: action.message }, submitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, feedback: { kind: 'error', message: action.message } };
    default:
      return state;
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const {
    data: tournaments,
    loading: loadingTournaments,
    error: tournamentsError,
    refetch,
  } = useFetch<TournamentWithStats[]>('/tournaments');

  // OPCIÓN C — Selector resiliente con fallback en 3 rutas (sin cambios respecto a Fase 3E).
  const { data: gamesFromApi } = useFetch<Game[]>('/games');

  // Estado coordinado de la UI gestionado por el reducer.
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Form controlado: se resetea/prelena explícitamente en openCreate/openEdit.
  const [form, setForm] = useState<TournamentForm>(EMPTY_FORM);

  // Derivaciones del estado del reducer — sin estado adicional.
  const isFormModalOpen   = state.modal.type === 'create' || state.modal.type === 'edit';
  const isDeleteModalOpen = state.modal.type === 'delete';
  const editingTournament = state.modal.type === 'edit' ? state.modal.tournament : null;

  // Construye la lista de juegos para el selector (Opción C).
  const selectorGames = useMemo((): { id: number; title: string }[] => {
    if (gamesFromApi && gamesFromApi.length > 0) {
      return gamesFromApi.map(({ id, title }) => ({ id, title }));
    }
    if (!tournaments || tournaments.length === 0) return [];
    const seen = new Map<number, string>();
    tournaments.forEach((t) => seen.set(t.game_id, t.game_title));
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [gamesFromApi, tournaments]);

  // ─── Apertura de modales ────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    dispatch({ type: 'OPEN_CREATE' });
  };

  const openEdit = (tournament: TournamentWithStats) => {
    setForm({
      name: tournament.name,
      game_id: String(tournament.game_id),
      description: tournament.description ?? '',
      start_date: toDatetimeLocal(tournament.start_date),
      max_participants: String(tournament.max_participants),
      prize: tournament.prize ?? '',
      status: tournament.status,
    });
    dispatch({ type: 'OPEN_EDIT', tournament });
  };

  // openDelete recibe el torneo completo (antes recibía solo el id) para mostrar
  // el nombre en la confirmación. Cambio mínimo en el JSX: openDelete(t) en vez de openDelete(t.id).
  const openDelete = (tournament: TournamentWithStats) => {
    dispatch({ type: 'OPEN_DELETE', tournament });
  };

  // ─── Form controlado ───────────────────────────────────────────────────────

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as unknown as TournamentForm));
    // El error se limpia en SUBMIT_START, no en cada tecla (más semántico).
  };

  // ─── Validación ────────────────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'El nombre es requerido.';
    if (!form.game_id) return 'Selecciona un juego.';
    if (!form.start_date) return 'La fecha de inicio es requerida.';
    if (!form.max_participants || Number(form.max_participants) < 1)
      return 'Máx. participantes debe ser al menos 1.';
    return null;
  };

  // ─── Mutaciones (axios + dispatch; el reducer NO tiene efectos secundarios) ─

  const handleSave = async () => {
    const validErr = validateForm();
    if (validErr) {
      dispatch({ type: 'SUBMIT_ERROR', message: validErr });
      return;
    }
    dispatch({ type: 'SUBMIT_START' });

    const body = {
      name: form.name.trim(),
      game_id: Number(form.game_id),
      ...(form.description && { description: form.description }),
      start_date: form.start_date,
      max_participants: Number(form.max_participants),
      ...(form.prize && { prize: form.prize }),
      status: form.status,
    };

    try {
      if (editingTournament) {
        await api.put(`/tournaments/${editingTournament.id}`, body);
        dispatch({ type: 'SUBMIT_SUCCESS', message: 'Torneo actualizado correctamente.' });
      } else {
        await api.post('/tournaments', body);
        dispatch({ type: 'SUBMIT_SUCCESS', message: 'Torneo creado correctamente.' });
      }
      refetch();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al guardar.'
        : 'Error al guardar.';
      dispatch({ type: 'SUBMIT_ERROR', message });
    }
  };

  const handleDelete = async () => {
    if (state.modal.type !== 'delete') return;
    const { tournament } = state.modal;   // TypeScript estrecha el tipo aquí
    dispatch({ type: 'SUBMIT_START' });

    try {
      await api.delete(`/tournaments/${tournament.id}`);
      dispatch({ type: 'SUBMIT_SUCCESS', message: 'Torneo eliminado correctamente.' });
      refetch();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al eliminar.'
        : 'Error al eliminar.';
      dispatch({ type: 'SUBMIT_ERROR', message });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="admin-panel">
      <h1>Panel Admin — Torneos</h1>

      {state.feedback.kind === 'success' && (
        <p className="success-msg">{state.feedback.message}</p>
      )}

      <button onClick={openCreate}>+ Nuevo torneo</button>

      {loadingTournaments && <p>Cargando torneos...</p>}
      {tournamentsError && <p>Error: {tournamentsError}</p>}
      {!loadingTournaments && !tournamentsError && tournaments?.length === 0 && (
        <p>No hay torneos. Crea el primero.</p>
      )}

      {tournaments && tournaments.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Juego</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Inscritos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.game_title}</td>
                <td>{STATUS_LABELS[t.status]}</td>
                <td>{new Date(t.start_date).toLocaleDateString('es-MX')}</td>
                <td>{t.inscritos} / {t.max_participants}</td>
                <td>
                  <button onClick={() => openEdit(t)}>Editar</button>{' '}
                  <button onClick={() => openDelete(t)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      <Modal isOpen={isFormModalOpen} onClose={() => dispatch({ type: 'CLOSE_MODAL' })}>
        <h2>{editingTournament ? 'Editar torneo' : 'Nuevo torneo'}</h2>

        {state.feedback.kind === 'error' && (
          <p className="error-msg">{state.feedback.message}</p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleFormChange} />
          </div>

          <div>
            <label>Juego *</label>
            {selectorGames.length > 0 ? (
              <select name="game_id" value={form.game_id} onChange={handleFormChange}>
                <option value="">-- Selecciona un juego --</option>
                {selectorGames.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.title}</option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="number"
                  name="game_id"
                  value={form.game_id}
                  onChange={handleFormChange}
                  placeholder="ID del juego"
                  min={1}
                />
                <small> Selector cargará cuando el módulo de juegos esté disponible.</small>
              </>
            )}
          </div>

          <div>
            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
            />
          </div>

          <div>
            <label>Fecha de inicio *</label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <label>Máx. participantes</label>
            <input
              type="number"
              name="max_participants"
              value={form.max_participants}
              onChange={handleFormChange}
              min={1}
            />
          </div>

          <div>
            <label>Premio</label>
            <input name="prize" value={form.prize} onChange={handleFormChange} />
          </div>

          <div>
            <label>Estado</label>
            <select name="status" value={form.status} onChange={handleFormChange}>
              {TOURNAMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <br />
          <button type="submit" disabled={state.submitting}>
            {state.submitting ? 'Guardando...' : 'Guardar'}
          </button>
          {' '}
          <button type="button" onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
            Cancelar
          </button>
        </form>
      </Modal>

      {/* ── Modal confirmación de borrado ────────────────────────────────── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => dispatch({ type: 'CLOSE_MODAL' })}>
        <h2>Confirmar eliminación</h2>
        <p>
          {state.modal.type === 'delete'
            ? `¿Eliminar "${state.modal.tournament.name}"? Las inscripciones asociadas se borrarán también (CASCADE).`
            : '¿Eliminar este torneo?'}
        </p>
        {state.feedback.kind === 'error' && (
          <p className="error-msg">{state.feedback.message}</p>
        )}
        <button onClick={handleDelete} disabled={state.submitting}>
          {state.submitting ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        {' '}
        <button onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>Cancelar</button>
      </Modal>
    </div>
  );
}
