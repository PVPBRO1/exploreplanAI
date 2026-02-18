import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface TransitionContextValue {
  navigateWithTransition: (to: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigateWithTransition: () => {},
  isTransitioning: false,
});

export function useTransitionNavigate() {
  return useContext(TransitionContext);
}

const TRANSITION_DURATION_MS = 1800;

const routePreloaders: Record<string, () => void> = {
  '/chat': () => import('../pages/ChatPageWrapper'),
  '/': () => import('../pages/HomePage'),
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      const preload = routePreloaders[to];
      if (preload) preload();

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        navigate(to);
        requestAnimationFrame(() => {
          setIsTransitioning(false);
        });
      }, TRANSITION_DURATION_MS);
    },
    [navigate, isTransitioning]
  );

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
}
