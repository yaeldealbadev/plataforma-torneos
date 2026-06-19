import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import type React from 'react';

const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? '#3b82f6' : '#374151',
  fontWeight: isActive ? 600 : 400,
  textDecoration: 'none',
  fontSize: '0.95rem',
});

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
    <nav style={styles.nav}>
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          fontSize: '1.1rem',
          fontWeight: 700,
          color: isActive ? '#3b82f6' : '#111827',
          textDecoration: 'none',
          marginRight: 'auto',
        })}
      >
        Torneos
      </NavLink>

      <div style={styles.links}>
        <NavLink to="/games" style={linkStyle}>
          Juegos
        </NavLink>
        <NavLink to="/tournaments" style={linkStyle}>
          Torneos
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/my-registrations" style={linkStyle}>
            Mis inscripciones
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" style={linkStyle}>
            Panel admin
          </NavLink>
        )}
      </div>

      <div style={styles.auth}>
        {isAuthenticated ? (
          <>
            <span style={styles.username}>{user?.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>
              Entrar
            </NavLink>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                padding: '0.4rem 0.875rem',
                borderRadius: '4px',
                backgroundColor: isActive ? '#2563eb' : '#3b82f6',
                color: '#fff',
                fontSize: '0.875rem',
                textDecoration: 'none',
              })}
            >
              Registrarse
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.75rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fff',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  username: {
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  logoutBtn: {
    padding: '0.4rem 0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
};
