import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../config/site';

/**
 * Lightweight, dependency-free SEO manager for the SPA.
 *
 * Rendered once inside Layout, it updates document.title and the social/meta tags on every
 * route change (Googlebot executes JS, so per-route titles still help). For data-driven pages
 * (e.g. a blog post), the page can call `setDocumentMeta(...)` itself to override.
 */

interface PageMeta {
  title: string;
  description: string;
  /** Absolute image URL for og:image / twitter:image. Defaults to SITE.ogImage. */
  image?: string;
  /** og:type — 'website' by default, 'article' for blog posts. */
  type?: 'website' | 'article';
}

// Exact-path → meta. Unmatched paths fall back to SITE defaults.
const ROUTE_META: Record<string, PageMeta> = {
  '/': {
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
  '/about': {
    title: 'About PWI | Our Story & Mission',
    description:
      'Founded by Emmanuel Mbansi in March 2025, People Who Inspire is a movement of purpose-driven leaders transforming communities worldwide. Learn our mission, vision, and values.',
  },
  '/founder': {
    title: 'Emmanuel Mbansi | Founder & Executive Host — PWI',
    description:
      'Meet Emmanuel Mbansi — MBA graduate, global leadership convener, and founder of People Who Inspire. The living proof of concept behind the platform.',
  },
  '/programs': {
    title: 'Programs | PWI Conversations, Fellowship & Masterclasses',
    description:
      'Explore PWI programs: Conversations, Leadership & Mentorship, Masterclasses, the Fellowship Hub, and a global community of purpose-driven leaders.',
  },
  '/conversations': {
    title: 'PWI Conversations | Dialogues That Inspire',
    description:
      'Intimate conversations with world-class leaders, streamed live every Saturday at 7PM GMT on YouTube. Explore the 2025 season of PWI Conversations.',
  },
  '/our-guests': {
    title: '2025 Guests | Voices That Changed Us — PWI Conversations',
    description:
      'Meet the remarkable leaders featured on PWI Conversations in 2025 — from Africa, Europe, and the Americas. Watch every episode on YouTube.',
  },
  '/fellowship': {
    title: 'PWI Fellowship | Accelerate Your Leadership Impact',
    description:
      'An exclusive fellowship for high-potential leaders: world-class mentorship, project funding, and a global network of change-makers. Apply for the next cohort.',
  },
  '/events': {
    title: 'Events | PWI Conversations & Gatherings',
    description:
      'Join PWI events and our weekly Conversations, live every Saturday at 7PM GMT on YouTube. Watch past session recordings and register for upcoming sessions.',
  },
  '/contact': {
    title: 'Contact PWI | Get in Touch',
    description:
      'Questions about our programs or partnerships? Reach People Who Inspire by email, WhatsApp, or social media. Based in Accra, Ghana, operating globally.',
  },
  '/blog': {
    title: 'Blog | Insights & Stories from PWI',
    description:
      'Thought-leadership articles, episode recaps, and stories of impact from the People Who Inspire community of purpose-driven leaders.',
  },
};

/** Imperatively set the document title + key meta tags. Exported for data-driven pages. */
export function setDocumentMeta(meta: PageMeta, path?: string) {
  const url = `${SITE.url}${path ?? ''}`;
  const image = meta.image || SITE.ogImage;
  document.title = meta.title;

  const setTag = (selector: string, attr: string, key: string, value: string) => {
    let el = document.head.querySelector<HTMLElement>(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  setTag('meta[name="description"]', 'name', 'description', meta.description);
  setTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  setTag('meta[property="og:type"]', 'property', 'og:type', meta.type || 'website');
  setTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
  setTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
  setTag('meta[property="og:url"]', 'property', 'og:url', url);
  setTag('meta[property="og:image"]', 'property', 'og:image', image);
  setTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  setTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);
  setTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

  // Canonical link
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta =
      ROUTE_META[pathname] ||
      // Sensible fallback for unmapped paths (e.g. /blog/:slug before its data loads)
      (pathname.startsWith('/blog')
        ? ROUTE_META['/blog']
        : { title: SITE.defaultTitle, description: SITE.defaultDescription });
    setDocumentMeta(meta, pathname);
  }, [pathname]);

  return null;
}
