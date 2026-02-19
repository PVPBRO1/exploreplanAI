import { useState, useEffect } from 'react';

export function useRotatingPlaceholder(placeholders: string[], interval = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        setIsAnimating(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [placeholders.length, interval]);

  return {
    currentPlaceholder: placeholders[currentIndex],
    isAnimating,
  };
}
