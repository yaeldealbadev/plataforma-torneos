import { useContext } from 'react';
import { NotificationContext, type NotificationContextValue } from '../context/NotificationContext';

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de <NotificationProvider>');
  return ctx;
}
