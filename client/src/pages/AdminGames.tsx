import { useState, type FormEvent, type ChangeEvent } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import Modal from '../components/ui/Modal';
import type { Game } from '../types';

interface GameForm {
  title: string;
  genre: string;
  platform: string;
  description: string;
  image_url: string;
}

interface FormErrors {
  title?: string;
  image_url?: string;
}

const EMPTY_FORM: GameForm = {
  title: '',
  genre: '',
  platform: '',
  description: '',
  image_url: '',
};

function validateForm(form: GameForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) {
    errors.title = 'El título es obligatorio.';
  }
  if (form.image_url.trim()) {
    try {
      new URL(form.image_url.trim());
    } catch {
      errors.image_url = 'La imagen debe ser una URL válida.';
    }
  }
  return errors;
}

export default function AdminGames() {
  const { data: games, loading, error, refetch } = useFetch<Game[]>('/games');
  const { notify } = useNotification();

  const [form, setForm] = useState<GameForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
  };

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setForm({
      title: game.title ?? '',
      genre: game.genre ?? '',
      platform: game.platform ?? '',
      description: game.description ?? '',
      image_url: game.image_url ?? '',
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      genre: form.genre.trim() || null,
      platform: form.platform.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editingId === null) {
        await api.post('/games', payload);
        notify('Juego creado correctamente.', 'success');
      } else {
        await api.put(`/games/${editingId}`, payload);
        notify('Juego actualizado correctamente.', 'success');
      }
      resetForm();
      refetch();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'No se pudo guardar el juego.';
      notify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/games/${toDelete.id}`);
      notify('Juego eliminado correctamente.', 'success');
      if (editingId === toDelete.id) resetForm();
      setToDelete(null);
      refetch();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'No se pudo eliminar el juego.';
      notify(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Administración de juegos</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="form">
        <h2 className="form-title">
          {editingId === null ? 'Nuevo juego' : 'Editar juego'}
        </h2>

        <div className="form-field">
          <label htmlFor="title" className="form-label">Título *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={formErrors.title ? 'input--error' : undefined}
          />
          {formErrors.title && <span className="form-error-msg">{formErrors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="genre" className="form-label">Género</label>
            <input id="genre" name="genre" value={form.genre} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="platform" className="form-label">Plataforma</label>
            <input id="platform" name="platform" value={form.platform} onChange={handleChange} />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="image_url" className="form-label">URL de imagen</label>
          <input
            id="image_url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className={formErrors.image_url ? 'input--error' : undefined}
            placeholder="https://…"
          />
          {formErrors.image_url && <span className="form-error-msg">{formErrors.image_url}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="description" className="form-label">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Guardando…' : editingId === null ? 'Crear juego' : 'Guardar cambios'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p className="state-info">Cargando juegos…</p>}
      {error && !loading && <p className="state-error">{error}</p>}

      {!loading && !error && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Género</th>
                <th>Plataforma</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {games && games.length > 0 ? (
                games.map((game) => (
                  <tr key={game.id}>
                    <td>{game.title}</td>
                    <td>{game.genre || '—'}</td>
                    <td>{game.platform || '—'}</td>
                    <td>
                      <button onClick={() => startEdit(game)} className="btn btn-edit btn-sm">
                        Editar
                      </button>{' '}
                      <button onClick={() => setToDelete(game)} className="btn btn-danger btn-sm">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="data-table__empty">
                    No hay juegos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={toDelete !== null} onClose={() => setToDelete(null)} title="Confirmar eliminación">
        <p className="modal-text">
          ¿Seguro que quieres eliminar <strong>{toDelete?.title}</strong>? Esta acción no se puede
          deshacer.
        </p>
        <div className="modal-actions">
          <button onClick={() => setToDelete(null)} className="btn btn-secondary" disabled={deleting}>
            Cancelar
          </button>
          <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </section>
  );
}
