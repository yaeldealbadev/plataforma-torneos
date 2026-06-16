import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Placeholder del layout principal: navbar + contenido de la ruta activa.
export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
