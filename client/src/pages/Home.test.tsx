import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from './Home';

// Home talks to the API with hardcoded fallbacks; forcing rejections exercises
// the fallback path deterministically.
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('offline')),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('Home', () => {
  it('renders the hero headline and primary CTAs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /stories that move leaders from inspiration to action/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /watch saturday live/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /explore the pathways/i }),
    ).toHaveAttribute('href', '/programs');
  });

  it('renders the proof points and pathway cards', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('featured voices')).toBeInTheDocument();
    expect(screen.getByText('countries represented')).toBeInTheDocument();
    expect(screen.getByText('Watch the conversations')).toBeInTheDocument();
    expect(screen.getByText('Grow through programs')).toBeInTheDocument();
    expect(screen.getByText('Join the fellowship')).toBeInTheDocument();
  });

  it('shows a validation-free subscribe flow with the fallback posts', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Your name'), 'Ama');
    await user.type(screen.getByPlaceholderText('Email address'), 'ama@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    // Fallback posts render while the API is "offline".
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /read the stories/i }).length).toBeGreaterThan(0);
    });
  });
});
