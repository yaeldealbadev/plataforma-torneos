import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div className={className ? `card ${className}` : 'card'} onClick={onClick}>
      {children}
    </div>
  );
}
