import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SEO, { setDocumentMeta } from './SEO';
import { SITE } from '../config/site';

describe('setDocumentMeta', () => {
  it('sets the title, description, canonical and social tags', () => {
    setDocumentMeta(
      { title: 'Test Title', description: 'Test description' },
      '/about',
    );

    expect(document.title).toBe('Test Title');
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Test description',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE.url}/about`,
    );
    expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Test Title',
    );
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${SITE.url}/about`,
    );
    expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });

  it('falls back to the default OG image and website type', () => {
    setDocumentMeta({ title: 'T', description: 'D' }, '/programs');
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      SITE.ogImage,
    );
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'website',
    );
  });

  it('supports article meta with a custom image', () => {
    setDocumentMeta(
      { title: 'Post', description: 'D', type: 'article', image: 'https://x.test/cover.png' },
      '/blog/post',
    );
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'article',
    );
    expect(document.head.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://x.test/cover.png',
    );
  });
});

describe('SEO route manager', () => {
  it('applies route-specific meta for known paths', () => {
    render(
      <MemoryRouter initialEntries={['/conversations']}>
        <SEO />
      </MemoryRouter>,
    );
    expect(document.title).toContain('Conversations');
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE.url}/conversations`,
    );
  });

  it('falls back to the site default meta for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <SEO />
      </MemoryRouter>,
    );
    expect(document.title).toBe(SITE.defaultTitle);
  });
});
