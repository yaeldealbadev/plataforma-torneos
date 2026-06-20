import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    notify('Sesión cerrada correctamente.', 'success');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" end className="navbar__logo">
        Torneos
      </NavLink>

      <div className="navbar__links">
        <NavLink to="/games" className="navbar__link">
          Juegos
        </NavLink>
        <NavLink to="/tournaments" className="navbar__link">
          Torneos
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/my-registrations" className="navbar__link">
            Mis inscripciones
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin" className="navbar__link">
              Admin Torneos
            </NavLink>
            <NavLink to="/admin/games" className="navbar__link">
              Admin Juegos
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar__auth">
        {isAuthenticated ? (
          <>
            <span className="navbar__username">{user?.username}</span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar__link">
              Entrar
            </NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
