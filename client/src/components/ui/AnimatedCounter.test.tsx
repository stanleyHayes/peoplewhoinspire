import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AnimatedCounter from './AnimatedCounter';

describe('AnimatedCounter', () => {
  it('renders the final value immediately when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    render(<AnimatedCounter value={12} suffix="+" />);
    expect(screen.getByText('12+')).toBeInTheDocument();
  });

  it('animates up to the final value (with prefix and suffix)', async () => {
    render(<AnimatedCounter value={7} prefix="$" suffix="k" />);
    expect(await screen.findByText('$7k')).toBeInTheDocument();
  });
});
