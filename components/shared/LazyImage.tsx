'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: ImageProps['src'];
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  threshold = 0.1,
  className = '',
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<ImageProps['src']>(fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    triggerOnce: true,
  });

  // Load image when in viewport - moved to useEffect to avoid render-time setState
  useEffect(() => {
    if (isIntersecting && !hasError && imageSrc === fallbackSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, hasError, imageSrc, fallbackSrc, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoaded(false);
    }
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
