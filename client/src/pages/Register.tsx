import { useState, type FormEvent, type ChangeEvent } from 'react';
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = (name: keyof FormFields) =>
    errors[name] ? 'input--error' : undefined;

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

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} noValidate className="auth-card">
        <h2 className="auth-title">Crear cuenta</h2>

        {errors.server && <p className="state-error">{errors.server}</p>}

        <div className="form-field">
          <label htmlFor="username" className="form-label">Nombre de usuario</label>
          <input
            id="username"
            type="text"
            name="username"
            value={fields.username}
            onChange={handleChange}
            className={inputClass('username')}
            autoComplete="username"
          />
          {errors.username && <span className="form-error-msg">{errors.username}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            value={fields.email}
            onChange={handleChange}
            className={inputClass('email')}
            autoComplete="email"
          />
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            id="password"
            type="password"
            name="password"
            value={fields.password}
            onChange={handleChange}
            className={inputClass('password')}
            autoComplete="new-password"
          />
          {errors.password && <span className="form-error-msg">{errors.password}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={handleChange}
            className={inputClass('confirmPassword')}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="form-error-msg">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Registrando…' : 'Registrarse'}
        </button>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
