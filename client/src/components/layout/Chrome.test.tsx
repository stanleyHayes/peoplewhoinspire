import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { CONTACT, SOCIAL } from '../../config/site';

describe('Navbar', () => {
  it('renders the brand, primary sections and Join CTA', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /people who inspire home/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Programs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conversations' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stories' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'Join PWI' })).toHaveAttribute('href', '/contact');
  });

  it('opens the mobile drawer from the toggle button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: /toggle menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Footer', () => {
  it('renders contact details, social links and the live CTA', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(CONTACT.email)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.phoneDisplay)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /watch live/i }),
    ).toHaveAttribute('href', SOCIAL.youtube);
    const instagramLinks = screen.getAllByRole('link', { name: 'Instagram' });
    expect(instagramLinks.some((link) => link.getAttribute('href') === SOCIAL.instagram)).toBe(true);
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it('renders all four navigation group headings', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );
    for (const title of ['Start Here', 'Take Part', 'Watch & Read', 'Connect']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });
});
