export type WatermarkVariant = 'radar' | 'africa' | 'contours';

type WatermarkPosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center';

interface WatermarkProps {
  variant?: WatermarkVariant;
  position?: WatermarkPosition;
  /** Opacity of the pattern (0–1). */
  opacity?: number;
  /** Tailwind size classes, e.g. 'h-72 w-72'. */
  className?: string;
}

const URLS: Record<WatermarkVariant, string> = {
  radar: '/patterns/radar-rings.svg',
  africa: '/patterns/africa-rings.svg',
  contours: '/patterns/contour-lines.svg',
};

const POSITION_CLASSES: Record<WatermarkPosition, string> = {
  'top-right': '-top-10 -right-10',
  'bottom-right': '-bottom-10 -right-10',
  'top-left': '-top-10 -left-10',
  'bottom-left': '-bottom-10 -left-10',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

const VARIANTS: WatermarkVariant[] = ['radar', 'africa', 'contours'];
const POSITIONS: WatermarkPosition[] = ['top-right', 'bottom-right', 'top-left', 'bottom-left'];

const hashString = (value: string): number =>
  value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

/** Deterministically picks a watermark variant + position from a seed string. */
export function defaultWatermarkFor(seed: string): {
  variant: WatermarkVariant;
  position: WatermarkPosition;
} {
  return {
    variant: VARIANTS[hashString(seed) % VARIANTS.length],
    position: POSITIONS[hashString(seed) % POSITIONS.length],
  };
}

/**
 * Decorative SVG pattern that sits behind section content at very low
 * opacity, drifting or rotating almost imperceptibly. Purely ornamental.
 */
export default function Watermark({
  variant = 'radar',
  position = 'bottom-right',
  opacity = 0.05,
  className = 'h-64 w-64 md:h-80 md:w-80',
}: WatermarkProps) {
  const isContours = variant === 'contours';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 ${POSITION_CLASSES[position]} ${
        isContours ? 'pwi-wm-float aspect-[1440/520]' : 'pwi-wm-spin'
      } ${className}`}
      style={{
        background: `url(${URLS[variant]}) no-repeat center / contain`,
        opacity,
      }}
    />
  );
}
