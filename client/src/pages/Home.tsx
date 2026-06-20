import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Home() {
  return (
    <section className="hero">
      {/* Orbe de resplandor animado detrás del logo */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow-orb" />
      </div>

      <div className="hero__content">
        {/* Logo con float + glow pulsante */}
        <div className="hero__logo-wrap">
          <img
            src={logo}
            alt="Plataforma Torneos"
            className="hero__logo"
          />
        </div>

        {/*
          Título debajo del logo.
          Si el logo ya incluye el texto "TORNEOS", elimina esta línea.
        */}
        <h1 className="hero__title">TORNEOS</h1>

        <p className="hero__tagline">Compite. Mejora. Gana.</p>

        <hr className="hero__divider" aria-hidden="true" />

        <div className="hero__ctas">
          <Link to="/tournaments" className="btn btn-primary hero__cta-btn">
            Ver Torneos
          </Link>
          <Link to="/games" className="btn btn-ghost hero__cta-btn">
            Explorar Juegos
          </Link>
        </div>
      </div>
    </section>
  );
}
