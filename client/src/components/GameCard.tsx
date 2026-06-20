import { useNavigate } from 'react-router-dom';
import type React from 'react';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

// Tarjeta de un juego: recibe el juego por props (tipado) y maneja sus propios eventos.
export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

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
      className="game-card"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="game-card__thumb">
        {game.image_url ? (
          <img src={game.image_url} alt={game.title} className="game-card__img" />
        ) : (
          <span className="game-card__placeholder">Sin imagen</span>
        )}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title">{game.title}</h3>
        <div className="game-card__tags">
          {game.genre && <span className="game-card__tag">{game.genre}</span>}
          {game.platform && <span className="game-card__tag">{game.platform}</span>}
        </div>
        {game.description && <p className="game-card__desc">{game.description}</p>}
      </div>
    </article>
  );
}
