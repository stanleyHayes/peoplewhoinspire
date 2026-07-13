import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealOrigin = 'bottom' | 'top' | 'left' | 'right' | 'center';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating — handy for staggering siblings. */
  delay?: number;
  /** Animate every time it scrolls into view instead of just once. */
  repeat?: boolean;
}

interface Reveal3DProps extends RevealProps {
  /** Vertical offset (px) the element rises from. */
  y?: number;
  /** Starting tilt in degrees around the X (or Y) axis. */
  tilt?: number;
  /** Axis to rotate around. 'x' tips forward/back, 'y' swings left/right. */
  axis?: 'x' | 'y';
  /** Transform origin for the tilt. */
  origin?: RevealOrigin;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const ORIGIN_MAP: Record<RevealOrigin, string> = {
  bottom: 'center bottom',
  top: 'center top',
  left: 'left center',
  right: 'right center',
  center: 'center center',
};

/**
 * Scroll-triggered 3D reveal: the element tips into place from a perspective
 * tilt while rising and fading in. Falls back to a plain fade when the user
 * prefers reduced motion.
 */
export function Reveal3D({
  children,
  className,
  delay = 0,
  repeat = false,
  y = 80,
  tilt = 24,
  axis = 'x',
  origin = 'bottom',
}: Reveal3DProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: !repeat, amount: 0.2 }}
        transition={{ duration: 0.5, delay }}
      >
        {children}
      </motion.div>
    );
  }

  const hidden =
    axis === 'x'
      ? { opacity: 0, y, rotateX: tilt }
      : { opacity: 0, y, rotateY: tilt };
  const shown =
    axis === 'x'
      ? { opacity: 1, y: 0, rotateX: 0 }
      : { opacity: 1, y: 0, rotateY: 0 };

  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1200, transformOrigin: ORIGIN_MAP[origin] }}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Simple scroll-triggered fade-and-rise. A lighter-weight sibling of Reveal3D
 * for text blocks and rows where a 3D tilt would be too much.
 */
export function Reveal({ children, className, delay = 0, repeat = false }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
