import { useParams, Link } from 'react-router-dom';
import type React from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Game } from '../types';

// Detalle de un juego. Toma el :id de la URL con useParams.
export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: game, loading, error } = useFetch<Game>(`/games/${id}`);

  if (loading) return <p style={styles.info}>Cargando juego…</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!game) return <p style={styles.info}>Juego no encontrado.</p>;

  return (
    <section style={styles.page}>
      <Link to="/games" style={styles.back}>
        ← Volver al catálogo
      </Link>

      <div style={styles.layout}>
        <div style={styles.thumb}>
          {game.image_url ? (
            <img src={game.image_url} alt={game.title} style={styles.img} />
          ) : (
            <span style={styles.placeholder}>Sin imagen</span>
          )}
        </div>

        <div style={styles.content}>
          <h1 style={styles.title}>{game.title}</h1>
          <div style={styles.tags}>
            {game.genre && <span style={styles.tag}>{game.genre}</span>}
            {game.platform && <span style={styles.tag}>{game.platform}</span>}
          </div>
          <p style={styles.desc}>{game.description || 'Sin descripción disponible.'}</p>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  back: {
    display: 'inline-block',
    marginBottom: '1.25rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  layout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  thumb: {
    flex: '1 1 280px',
    minHeight: '220px',
    maxWidth: '380px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  content: {
    flex: '1 1 320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tag: {
    fontSize: '0.8rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  desc: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.6,
  },
  info: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem',
  },
  error: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
  },
};
