import { useNotification } from '../../hooks/useNotification';

export default function Toast() {
  const { notification, clear } = useNotification();
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className={`toast ${isSuccess ? 'toast--success' : 'toast--error'}`}>
      <span className="toast__message">{notification.message}</span>
      <button onClick={clear} className="toast__close" aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}
