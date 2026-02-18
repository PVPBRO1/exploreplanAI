import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { RouteLoader } from './RouteLoader';
import { TransitionProvider, useTransitionNavigate } from './TransitionContext';

const HomePage = lazy(() => import('../pages/HomePage'));
const ChatPage = lazy(() => import('../pages/ChatPageWrapper'));

export { ChatPage as ChatPagePreload };

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const reducedMotionTransition = {
  duration: 0.01,
};

function InnerRoutes() {
  const location = useLocation();
  const { isTransitioning } = useTransitionNavigate();

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = prefersReduced ? reducedMotionVariants : pageVariants;
  const transition = prefersReduced ? reducedMotionTransition : pageTransition;

  if (isTransitioning) {
    return <RouteLoader />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className="min-h-screen"
      >
        <Suspense fallback={<RouteLoader />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedRoutes() {
  return (
    <TransitionProvider>
      <InnerRoutes />
    </TransitionProvider>
  );
}
