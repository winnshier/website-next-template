'use client';

import { motion, MotionProps } from 'framer-motion';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { fadeInUp, fadeIn, slideInLeft, slideInRight } from '@/lib/utils/animations';

type AnimationType = 'fadeInUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight';

interface AnimatedSectionProps extends Omit<MotionProps, 'initial' | 'animate' | 'variants'> {
  children: React.ReactNode;
  animation?: AnimationType;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

const animationVariants: Record<AnimationType, any> = {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight,
};

export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  threshold = 0.1,
  delay = 0,
  duration = 0.6,
  className = '',
  ...motionProps
}: AnimatedSectionProps) {
  const { ref: observerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    triggerOnce: true,
  });

  const prefersReducedMotion = usePrefersReducedMotion();

  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = animationVariants[animation];

  return (
    <motion.div
      ref={observerRef}
      initial="hidden"
      animate={isIntersecting ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
