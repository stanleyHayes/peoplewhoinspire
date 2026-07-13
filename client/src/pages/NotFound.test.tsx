import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('renders the 404 message and recovery links', () => {
    render(
      <MemoryRouter initialEntries={['/missing-page']}>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText(/error 404/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /this story hasn’t been written yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Explore Programs' })).toHaveAttribute(
      'href',
      '/programs',
    );
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
  });

  it('offers a way to report the problem', () => {
    render(
      <MemoryRouter initialEntries={['/missing-page']}>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /tell us about it/i })).toHaveAttribute(
      'href',
      'mailto:info@peoplewhoinspire.global',
    );
  });
});
