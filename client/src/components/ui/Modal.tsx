import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

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
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
      </div>
    </div>,
    modalRoot
  );
}
