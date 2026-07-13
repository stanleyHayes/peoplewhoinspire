import { render } from '@testing-library/react';
import Watermark, { defaultWatermarkFor } from './Watermark';

describe('Watermark', () => {
  it('renders a decorative, aria-hidden element with the radar pattern', () => {
    const { container } = render(<Watermark variant="radar" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.background).toContain('/patterns/radar-rings.svg');
    expect(el.className).toContain('pwi-wm-spin');
  });

  it('uses the float animation and africa pattern when requested', () => {
    const { container } = render(<Watermark variant="contours" position="top-left" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.background).toContain('/patterns/contour-lines.svg');
    expect(el.className).toContain('pwi-wm-float');
    expect(el.className).toContain('-top-10');
  });

  it('applies the requested opacity', () => {
    const { container } = render(<Watermark variant="africa" opacity={0.12} />);
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe('0.12');
  });
});

describe('defaultWatermarkFor', () => {
  it('is deterministic for the same seed', () => {
    expect(defaultWatermarkFor('About PWI')).toEqual(defaultWatermarkFor('About PWI'));
  });

  it('returns known variants and positions', () => {
    const result = defaultWatermarkFor('seed');
    expect(['radar', 'africa', 'contours']).toContain(result.variant);
    expect(['top-right', 'bottom-right', 'top-left', 'bottom-left']).toContain(result.position);
  });
});
