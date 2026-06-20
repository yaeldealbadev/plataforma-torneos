import { useNavigate } from 'react-router-dom';
import type React from 'react';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

// Tarjeta de un juego: recibe el juego por props (tipado) y maneja sus propios eventos.
export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

  // Funciones anidadas que manejan los eventos del componente.
  const handleOpen = () => {
    navigate(`/games/${game.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      style={styles.card}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div style={styles.thumb}>
        {game.image_url ? (
          <img src={game.image_url} alt={game.title} style={styles.img} />
        ) : (
          <span style={styles.placeholder}>Sin imagen</span>
        )}
      </div>
      <div style={styles.body}>
        <h3 style={styles.title}>{game.title}</h3>
        <div style={styles.tags}>
          {game.genre && <span style={styles.tag}>{game.genre}</span>}
          {game.platform && <span style={styles.tag}>{game.platform}</span>}
        </div>
        {game.description && <p style={styles.desc}>{game.description}</p>}
      </div>
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  thumb: {
    width: '100%',
    height: '150px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.875rem',
  },
  title: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#111827',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  tag: {
    fontSize: '0.75rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  desc: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#6b7280',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
};
