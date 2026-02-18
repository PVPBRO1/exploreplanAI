import { useTransitionNavigate } from './TransitionContext';
import type { ReactNode, MouseEvent } from 'react';

interface LinkButtonProps {
  to: string;
  className?: string;
  children: ReactNode;
}

export function LinkButton({ to, className = '', children }: LinkButtonProps) {
  const { navigateWithTransition } = useTransitionNavigate();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const btn = e.currentTarget;
    btn.style.transform = 'scale(0.95)';
    btn.style.opacity = '0.8';
    btn.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

    setTimeout(() => {
      navigateWithTransition(to);
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
