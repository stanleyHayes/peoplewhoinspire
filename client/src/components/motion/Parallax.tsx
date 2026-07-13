import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /**
   * Total vertical travel in pixels across one viewport pass. A higher number
   * means a more pronounced drift. The element moves from +travel to -travel as
   * it scrolls up through the viewport, so it drifts slower than the page.
   */
  travel?: number;
}

/**
 * Wraps content in a scroll-linked vertical parallax. Best used on an oversized
 * layer inside an `overflow-hidden` container (e.g. a hero background image
 * sized slightly larger than its frame so the drift never reveals an edge).
 *
 * No-ops for users who prefer reduced motion.
 */
export default function Parallax({ children, className, travel = 70 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduced ? undefined : { y, willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
