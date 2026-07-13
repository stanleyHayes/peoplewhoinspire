import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

const easeOutQuad = (t: number): number => t * (2 - t);

/**
 * Counts up from zero to `value` when scrolled into view. The number is
 * written directly to the DOM node during the animation to avoid ~120 React
 * re-renders per counter. Renders the final value immediately for users who
 * prefer reduced motion.
 */
export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  durationMs = 1800,
  className,
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const inView = useInView(containerRef, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!inView) return undefined;

    const node = nodeRef.current;
    if (!node) return undefined;

    const render = (current: number) => {
      node.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      render(value);
      return undefined;
    }

    let start: number | null = null;
    const step = (timestamp: number): void => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      render(Math.round(easeOutQuad(progress) * value));
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      }
    };
    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [inView, value, suffix, prefix, durationMs]);

  return (
    <span ref={containerRef} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span ref={nodeRef}>{`${prefix}0${suffix}`}</span>
    </span>
  );
}
