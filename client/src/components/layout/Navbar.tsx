import { Link } from 'react-router-dom';

// Placeholder de la barra de navegación.
export default function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/games">Juegos</Link>
      <Link to="/tournaments">Torneos</Link>
      <Link to="/login">Entrar</Link>
    </nav>
  );
}
