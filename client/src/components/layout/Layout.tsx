import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from '../ui/Toast';

export default function Layout() {
  return (
    <>
      <Navbar />
      <Toast />
      <main>
        <Outlet />
      </main>
    </>
  );
}
