import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SiteContentProvider, useSiteContent } from './SiteContentContext';
import { IMAGES } from '../data/siteContent';
import { SOCIAL } from '../config/site';

const mockGet = vi.fn();

vi.mock('../services/api', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

function Probe() {
  const { images, social } = useSiteContent();
  return (
    <div>
      <span data-testid="hero">{images.heroConversation}</span>
      <span data-testid="blog">{images.blogEditorial}</span>
      <span data-testid="instagram">{social.instagram}</span>
      <span data-testid="youtube">{social.youtube}</span>
    </div>
  );
}

describe('SiteContentContext', () => {
  it('serves bundled defaults when the settings fetch fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('offline'));

    render(
      <SiteContentProvider>
        <Probe />
      </SiteContentProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toHaveTextContent(IMAGES.heroConversation);
    });
    expect(screen.getByTestId('instagram')).toHaveTextContent(SOCIAL.instagram);
  });

  it('merges CMS image and social overrides over the defaults', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        siteImages: { heroConversation: 'https://cdn.example.com/custom-hero.jpg' },
        social: { instagram_url: 'https://instagram.com/custom' },
      },
    });

    render(
      <SiteContentProvider>
        <Probe />
      </SiteContentProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toHaveTextContent('https://cdn.example.com/custom-hero.jpg');
    });
    // Untouched keys keep their defaults
    expect(screen.getByTestId('blog')).toHaveTextContent(IMAGES.blogEditorial);
    expect(screen.getByTestId('instagram')).toHaveTextContent('https://instagram.com/custom');
    expect(screen.getByTestId('youtube')).toHaveTextContent(SOCIAL.youtube);
  });

  it('ignores blank overrides and falls back to defaults', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        siteImages: { heroConversation: '   ' },
        social: { instagram_url: '' },
      },
    });

    render(
      <SiteContentProvider>
        <Probe />
      </SiteContentProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toHaveTextContent(IMAGES.heroConversation);
    });
    expect(screen.getByTestId('instagram')).toHaveTextContent(SOCIAL.instagram);
  });
});
