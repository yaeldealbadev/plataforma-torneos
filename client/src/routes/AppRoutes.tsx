import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Lazy loading: cada página se carga en su propio chunk bajo demanda.
const Home            = lazy(() => import('../pages/Home'));
const Login           = lazy(() => import('../pages/Login'));
const Register        = lazy(() => import('../pages/Register'));
const Games           = lazy(() => import('../pages/Games'));
const GameDetail      = lazy(() => import('../pages/GameDetail'));
const Tournaments     = lazy(() => import('../pages/Tournaments'));
const TournamentDetail = lazy(() => import('../pages/TournamentDetail'));
const MyRegistrations = lazy(() => import('../pages/MyRegistrations'));
const AdminPanel      = lazy(() => import('../pages/AdminPanel'));
const AdminGames      = lazy(() => import('../pages/AdminGames'));
const NotFound        = lazy(() => import('../pages/NotFound'));

// Definición central de rutas de la SPA (React Router v6, rutas anidadas).
export default function AppRoutes() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Cargando…</p>}>
      <Routes>
        <Route element={<Layout />}>
          {/* Públicas */}
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/games"         element={<Games />} />
          <Route path="/games/:id"     element={<GameDetail />} />
          <Route path="/tournaments"   element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />

          {/* Requieren sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-registrations" element={<MyRegistrations />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute requireRole="admin" />}>
            <Route path="/admin"       element={<AdminPanel />} />
            <Route path="/admin/games" element={<AdminGames />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
