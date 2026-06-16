import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

// Placeholder: árbol raíz de la app. Envuelve el provider de auth y las rutas.
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
