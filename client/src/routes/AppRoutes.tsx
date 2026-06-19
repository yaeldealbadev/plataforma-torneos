import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Games from '../pages/Games';
import GameDetail from '../pages/GameDetail';
import Tournaments from '../pages/Tournaments';
import TournamentDetail from '../pages/TournamentDetail';
import MyRegistrations from '../pages/MyRegistrations';
import AdminPanel from '../pages/AdminPanel';
import NotFound from '../pages/NotFound';

// Placeholder: definición central de rutas de la SPA.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />

        {/* Requieren sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-registrations" element={<MyRegistrations />} />
        </Route>

        {/* Solo admin */}
        <Route element={<ProtectedRoute requireRole="admin" />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
