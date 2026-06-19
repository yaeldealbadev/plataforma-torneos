import { useState, useMemo, type ChangeEvent } from 'react';
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

// Convierte la fecha ISO del API al formato que acepta <input type="datetime-local">
function toDatetimeLocal(dateStr: string): string {
  return dateStr.replace(' ', 'T').slice(0, 16);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const {
    data: tournaments,
    loading: loadingTournaments,
    error: tournamentsError,
    refetch,
  } = useFetch<TournamentWithStats[]>('/tournaments');

  // OPCIÓN C — Selector resiliente con fallback en 3 rutas:
  //   Ruta 1: GET /games devuelve datos → se usa directamente (cuando getGames esté implementado).
  //   Ruta 2: /games falla o está vacío → se derivan juegos únicos de TournamentWithStats
  //           (cada torneo trae game_id + game_title del JOIN de Fase 2).
  //   Ruta 3: Ni /games ni torneos tienen datos → <input type="number"> manual con aviso.
  // Sin cambios adicionales de código cuando el módulo de juegos esté disponible.
  const { data: gamesFromApi } = useFetch<Game[]>('/games');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentWithStats | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState<TournamentForm>(EMPTY_FORM);

  // Construye la lista de juegos para el selector aplicando las 3 rutas del fallback.
  const selectorGames = useMemo((): { id: number; title: string }[] => {
    if (gamesFromApi && gamesFromApi.length > 0) {
      return gamesFromApi.map(({ id, title }) => ({ id, title }));
    }
    if (!tournaments || tournaments.length === 0) return [];
    const seen = new Map<number, string>();
    tournaments.forEach((t) => seen.set(t.game_id, t.game_title));
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [gamesFromApi, tournaments]);

  // ─── Handlers de apertura de modales ───────────────────────────────────────

  const openCreate = () => {
    setEditingTournament(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setSuccessMsg('');
    setIsFormModalOpen(true);
  };

  const openEdit = (tournament: TournamentWithStats) => {
    setEditingTournament(tournament);
    setForm({
      name: tournament.name,
      game_id: String(tournament.game_id),
      description: tournament.description ?? '',
      start_date: toDatetimeLocal(tournament.start_date),
      max_participants: String(tournament.max_participants),
      prize: tournament.prize ?? '',
      status: tournament.status,
    });
    setFormError('');
    setSuccessMsg('');
    setIsFormModalOpen(true);
  };

  const openDelete = (id: number) => {
    setDeletingId(id);
    setDeleteError('');
    setSuccessMsg('');
    setIsDeleteModalOpen(true);
  };

  // ─── Handler de cambio del formulario CONTROLADO ────────────────────────────
  // El formulario es CONTROLADO: cada campo tiene value={form.x} y onChange que
  // actualiza el estado. (Contraste con el buscador useRef de Tournaments.tsx.)

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as unknown as TournamentForm));
    setFormError('');
  };

  // ─── Validación client-side ────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'El nombre es requerido.';
    if (!form.game_id) return 'Selecciona un juego.';
    if (!form.start_date) return 'La fecha de inicio es requerida.';
    if (!form.max_participants || Number(form.max_participants) < 1)
      return 'Máx. participantes debe ser al menos 1.';
    return null;
  };

  // ─── Mutaciones ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validErr = validateForm();
    if (validErr) { setFormError(validErr); return; }

    setSaving(true);
    setFormError('');

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
        setSuccessMsg('Torneo actualizado correctamente.');
      } else {
        await api.post('/tournaments', body);
        setSuccessMsg('Torneo creado correctamente.');
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al guardar.'
        : 'Error al guardar.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/tournaments/${deletingId}`);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      refetch();
      setSuccessMsg('Torneo eliminado correctamente.');
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Error al eliminar.'
        : 'Error al eliminar.';
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="admin-panel">
      <h1>Panel Admin — Torneos</h1>

      {successMsg && <p className="success-msg">{successMsg}</p>}

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
                  <button onClick={() => openDelete(t.id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <h2>{editingTournament ? 'Editar torneo' : 'Nuevo torneo'}</h2>

        {formError && <p className="error-msg">{formError}</p>}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleFormChange} />
          </div>

          <div>
            <label>Juego *</label>
            {/* OPCIÓN C — Ruta 1/2: selector con juegos reales o derivados.
                Ruta 3: input numérico cuando no hay ninguna fuente de juegos. */}
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
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {' '}
          <button type="button" onClick={() => setIsFormModalOpen(false)}>
            Cancelar
          </button>
        </form>
      </Modal>

      {/* ── Modal confirmación de borrado ────────────────────────────────── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2>Confirmar eliminación</h2>
        <p>¿Eliminar este torneo? Las inscripciones asociadas se borrarán también (CASCADE).</p>
        {deleteError && <p className="error-msg">{deleteError}</p>}
        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        {' '}
        <button onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
      </Modal>
    </div>
  );
}
