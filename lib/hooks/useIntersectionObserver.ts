'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends Element = Element>(
  options?: UseIntersectionObserverOptions
) {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const { triggerOnce = false, ...observerOptions } = options || {};

  // Memoize observer options to prevent recreation on every render
  const memoizedOptions = useMemo(
    () => observerOptions,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      observerOptions.root,
      observerOptions.rootMargin,
      observerOptions.threshold,
    ]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry.isIntersecting;
      setIsIntersecting(isElementIntersecting);

      if (isElementIntersecting && triggerOnce) {
        observer.unobserve(element);
      }
    }, memoizedOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnce, memoizedOptions]);

  return { ref, isIntersecting };
}
