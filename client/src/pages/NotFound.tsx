import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function NotFound() {
  return (
    <section className="not-found">
      {/* Orbe de resplandor — rojo/morado para reforzar el tono de "error" */}
      <div className="not-found__orb" aria-hidden="true" />

      <div className="not-found__content">
        <img
          src={logo}
          alt="Plataforma Torneos"
          className="not-found__logo"
        />

        {/* Código 404 con gradiente cyan→morado y glitch sutil */}
        <p className="not-found__code" aria-hidden="true">404</p>

        <hr className="not-found__divider" aria-hidden="true" />

        <h1 className="not-found__title">Página no encontrada</h1>
        <p className="not-found__subtitle">
          La ruta que buscas no existe o fue movida.
        </p>

        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
