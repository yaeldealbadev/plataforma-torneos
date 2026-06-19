import { createContext, useState, useCallback, useRef, type ReactNode } from 'react';

export type NotificationType = 'success' | 'error';

export interface NotificationItem {
  message: string;
  type: NotificationType;
}

export interface NotificationContextValue {
  notification: NotificationItem | null;
  notify: (message: string, type?: NotificationType) => void;
  clear: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const DISMISS_MS = 3500;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification(null);
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ message, type });
    timerRef.current = setTimeout(() => setNotification(null), DISMISS_MS);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, notify, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}
