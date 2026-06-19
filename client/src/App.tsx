import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </NotificationProvider>
  );
}
