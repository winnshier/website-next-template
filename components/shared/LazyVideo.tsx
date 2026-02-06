'use client';

import { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface LazyVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
  poster?: string;
  threshold?: number;
  fallbackMessage?: string;
}

export function LazyVideo({
  src,
  poster,
  threshold = 0.1,
  fallbackMessage = 'Your browser does not support the video tag.',
  className = '',
  ...props
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { ref: containerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isIntersecting && videoRef.current && !isLoaded) {
      const video = videoRef.current;

      // Set video source
      video.src = src;

      // Load video
      video.load();

      setIsLoaded(true);
    }
  }, [isIntersecting, src, isLoaded]);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        poster={poster}
        onError={handleError}
        className="w-full h-full"
        {...props}
      >
        {hasError && <p className="text-red-500 p-4">{fallbackMessage}</p>}
      </video>
      {!isLoaded && poster && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}
      {!isLoaded && !poster && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
