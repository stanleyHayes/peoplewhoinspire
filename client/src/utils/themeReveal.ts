/**
 * Animate a theme switch as a circular reveal expanding from the toggle's
 * screen position, using the View Transitions API. Falls back to an instant
 * switch when the API is unsupported or the user prefers reduced motion.
 */
export function runThemeReveal(
  originX: number,
  originY: number,
  applyTheme: () => void,
): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('startViewTransition' in document) || prefersReducedMotion) {
    applyTheme();
    return;
  }

  const transition = document.startViewTransition(() => {
    applyTheme();
  });

  const maxRadius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  );

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${originX}px ${originY}px)`,
            `circle(${maxRadius}px at ${originX}px ${originY}px)`,
          ],
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      /* transition skipped — theme was already applied */
    });
}
