import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin gold reading-progress bar pinned to the top of the viewport.
 * Springs smoothly as the user scrolls; purely decorative.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold-400 via-gold-300 to-navy-500"
    />
  );
}
