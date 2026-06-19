import { useNotification } from '../../hooks/useNotification';

export default function Toast() {
  const { notification, clear } = useNotification();
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div style={{ ...styles.toast, ...(isSuccess ? styles.success : styles.error) }}>
      <span style={styles.message}>{notification.message}</span>
      <button onClick={clear} style={styles.close} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    minWidth: '280px',
    maxWidth: '520px',
    fontSize: '0.9rem',
  },
  success: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
  },
  error: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
  },
  message: {
    flex: 1,
  },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0 0.25rem',
    flexShrink: 0,
  },
};
