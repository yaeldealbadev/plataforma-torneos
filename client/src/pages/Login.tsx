import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface FormErrors {
  email?: string;
  password?: string;
  server?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Ingresa un correo válido.';
  }
  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  }
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrors({ server: err.response.data.message });
      } else {
        setErrors({ server: 'Error al iniciar sesión. Inténtalo de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} noValidate style={styles.card}>
        <h2 style={styles.title}>Iniciar sesión</h2>

        {errors.server && <p style={styles.serverError}>{errors.server}</p>}

        <div style={styles.field}>
          <label htmlFor="email" style={styles.label}>
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
            autoComplete="email"
          />
          {errors.email && <span style={styles.errorMsg}>{errors.email}</span>}
        </div>

        <div style={styles.field}>
          <label htmlFor="password" style={styles.label}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
            autoComplete="current-password"
          />
          {errors.password && <span style={styles.errorMsg}>{errors.password}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>

        <p style={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={styles.link}>
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  serverError: {
    margin: 0,
    padding: '0.75rem',
    borderRadius: '4px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
    fontSize: '0.875rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    outline: 'none',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  errorMsg: {
    fontSize: '0.8rem',
    color: '#e53e3e',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.625rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
};
