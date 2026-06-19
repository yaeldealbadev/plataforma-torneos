import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import type React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Modal reutilizable con React Portals (createPortal).
 * Se renderiza fuera del árbol del componente, en el div#modal-root de index.html,
 * lo que evita problemas de overflow/z-index con los contenedores padre.
 */
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Cierra con la tecla Escape mientras el modal está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose} role="presentation">
      <div
        style={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && <h3 style={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>,
    modalRoot
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '1rem',
  },
  content: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  title: {
    margin: '0 0 0.75rem',
    fontSize: '1.2rem',
    fontWeight: 600,
  },
};
