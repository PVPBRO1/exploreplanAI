import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
}

export function useCountUp({ end, start = 0, duration = 2500, delay = 0 }: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 },
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationId: number;
    const startCount = start;
    const range = end - startCount;

    const delayTimer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(startCount + range * eased));
        if (progress < 1) {
          animationId = requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };
      animationId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animationId);
    };
  }, [hasStarted, end, start, duration, delay]);

  const formattedCount = count.toLocaleString();

  return { count, formattedCount, ref };
}
