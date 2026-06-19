import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface FormFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  server?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.username.trim()) {
    errors.username = 'El nombre de usuario es obligatorio.';
  } else if (fields.username.trim().length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres.';
  }
  if (!fields.email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Ingresa un correo válido.';
  }
  if (!fields.password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (fields.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState<FormFields>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await register(fields.username.trim(), fields.email.trim(), fields.password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrors({ server: err.response.data.message });
      } else {
        setErrors({ server: 'Error al registrarse. Inténtalo de nuevo.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name: keyof FormFields) => ({
    name,
    value: fields[name],
    onChange: handleChange,
    style: { ...styles.input, ...(errors[name] ? styles.inputError : {}) },
  });

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} noValidate style={styles.card}>
        <h2 style={styles.title}>Crear cuenta</h2>

        {errors.server && <p style={styles.serverError}>{errors.server}</p>}

        <div style={styles.fieldGroup}>
          <label htmlFor="username" style={styles.label}>
            Nombre de usuario
          </label>
          <input id="username" type="text" autoComplete="username" {...field('username')} />
          {errors.username && <span style={styles.errorMsg}>{errors.username}</span>}
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="email" style={styles.label}>
            Correo electrónico
          </label>
          <input id="email" type="email" autoComplete="email" {...field('email')} />
          {errors.email && <span style={styles.errorMsg}>{errors.email}</span>}
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="password" style={styles.label}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...field('password')}
          />
          {errors.password && <span style={styles.errorMsg}>{errors.password}</span>}
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...field('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span style={styles.errorMsg}>{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Registrando…' : 'Registrarse'}
        </button>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={styles.link}>
            Inicia sesión
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
    maxWidth: '420px',
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
  fieldGroup: {
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
