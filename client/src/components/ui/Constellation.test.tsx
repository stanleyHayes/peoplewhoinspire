import { render } from '@testing-library/react';
import Constellation from './Constellation';

describe('Constellation', () => {
  it('renders the network motif with edges and nodes', () => {
    const { container } = render(<Constellation />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('line')).toHaveLength(12);
    expect(container.querySelectorAll('circle')).toHaveLength(10);
  });

  it('highlights the gold nodes with the brand gold color', () => {
    const { container } = render(<Constellation />);
    const goldNodes = Array.from(container.querySelectorAll('circle')).filter(
      (node) => node.getAttribute('fill') === '#d4a843',
    );
    expect(goldNodes).toHaveLength(2);
  });

  it('respects the opacity prop', () => {
    const { container } = render(<Constellation opacity={0.2} />);
    expect(container.querySelector('svg')?.style.opacity).toBe('0.2');
  });
});
