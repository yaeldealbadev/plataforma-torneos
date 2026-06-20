import { useState, type FormEvent, type ChangeEvent } from 'react';
import type React from 'react';
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

  // Juego pendiente de borrar (controla el modal de confirmación).
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

    // Normaliza: los campos opcionales vacíos viajan como null.
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
    <section style={styles.page}>
      <h1 style={styles.heading}>Administración de juegos</h1>

      {/* Formulario controlado de creación / edición */}
      <form onSubmit={handleSubmit} noValidate style={styles.form}>
        <h2 style={styles.formTitle}>{editingId === null ? 'Nuevo juego' : 'Editar juego'}</h2>

        <div style={styles.field}>
          <label htmlFor="title" style={styles.label}>
            Título *
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ ...styles.input, ...(formErrors.title ? styles.inputError : {}) }}
          />
          {formErrors.title && <span style={styles.errorMsg}>{formErrors.title}</span>}
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label htmlFor="genre" style={styles.label}>
              Género
            </label>
            <input id="genre" name="genre" value={form.genre} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label htmlFor="platform" style={styles.label}>
              Plataforma
            </label>
            <input
              id="platform"
              name="platform"
              value={form.platform}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label htmlFor="image_url" style={styles.label}>
            URL de imagen
          </label>
          <input
            id="image_url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            style={{ ...styles.input, ...(formErrors.image_url ? styles.inputError : {}) }}
            placeholder="https://…"
          />
          {formErrors.image_url && <span style={styles.errorMsg}>{formErrors.image_url}</span>}
        </div>

        <div style={styles.field}>
          <label htmlFor="description" style={styles.label}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{ ...styles.input, resize: 'vertical' }}
          />
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={submitting} style={styles.primaryBtn}>
            {submitting ? 'Guardando…' : editingId === null ? 'Crear juego' : 'Guardar cambios'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetForm} style={styles.secondaryBtn}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de juegos */}
      {loading && <p style={styles.info}>Cargando juegos…</p>}
      {error && !loading && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Género</th>
                <th style={styles.th}>Plataforma</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {games && games.length > 0 ? (
                games.map((game) => (
                  <tr key={game.id}>
                    <td style={styles.td}>{game.title}</td>
                    <td style={styles.td}>{game.genre || '—'}</td>
                    <td style={styles.td}>{game.platform || '—'}</td>
                    <td style={styles.td}>
                      <button onClick={() => startEdit(game)} style={styles.editBtn}>
                        Editar
                      </button>
                      <button onClick={() => setToDelete(game)} style={styles.deleteBtn}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.td} colSpan={4}>
                    No hay juegos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de borrado (React Portal) */}
      <Modal isOpen={toDelete !== null} onClose={() => setToDelete(null)} title="Confirmar eliminación">
        <p style={styles.modalText}>
          ¿Seguro que quieres eliminar <strong>{toDelete?.title}</strong>? Esta acción no se puede
          deshacer.
        </p>
        <div style={styles.modalActions}>
          <button onClick={() => setToDelete(null)} style={styles.secondaryBtn} disabled={deleting}>
            Cancelar
          </button>
          <button onClick={confirmDelete} style={styles.deleteBtn} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  heading: {
    margin: '0 0 1.5rem',
    fontSize: '1.6rem',
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginBottom: '2rem',
  },
  formTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 600,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  field: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorMsg: {
    fontSize: '0.8rem',
    color: '#e53e3e',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  primaryBtn: {
    padding: '0.6rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '0.6rem 1.25rem',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  tableWrap: {
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    color: '#6b7280',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f9fafb',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#374151',
  },
  editBtn: {
    marginRight: '0.5rem',
    padding: '0.35rem 0.75rem',
    backgroundColor: '#fff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.35rem 0.75rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  info: {
    color: '#6b7280',
  },
  error: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
  },
  modalText: {
    margin: '0 0 1.25rem',
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.5,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
};
