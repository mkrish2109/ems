// hooks/useAdVisibility.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAdVisibilityReturn {
  ref: (node: Element | null) => void;
  shouldLoad: boolean;
  isVisible: boolean;
}

export function useAdVisibility(
  options: IntersectionObserverInit = { threshold: 0.1 }
): UseAdVisibilityReturn {
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: Element | null) => {
    if (!node) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      setIsVisible(visible);
      
      if (visible && !shouldLoad) {
        setTimeout(() => setShouldLoad(true), 100);
      }
    }, options);

    observerRef.current.observe(node);
  }, [options, shouldLoad]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref, shouldLoad, isVisible };
}