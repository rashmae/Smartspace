import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';

/**
 * Apple.com-inspired scroll progress hairline pinned discreetly beneath the header.
 */
export const ScrollProgressBar: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0077C8] via-[#38BDF8] to-[#8CC63F] origin-left z-[60] pointer-events-none"
      aria-hidden="true"
    />
  );
};

/**
 * Apple.com-inspired scroll-linked product showcase stage:
 * Smoothly scales and settles into focus as the user scrolls past the hero.
 */
export const ScrollScaleStage: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.6,
  });

  const scale = useTransform(smoothProgress, [0, 1], [0.96, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.35, 1], [0.85, 0.96, 1]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Framer.com-inspired tactile spring interaction card/button surface.
 */
export const SpringSurface: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.988 }}
      transition={{ type: 'spring', stiffness: 440, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pentagram / Apple editorial upward entrance reveal.
 */
export const EditorialReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
