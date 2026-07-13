import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CONTACT, FOUNDER, LIVE_SESSION, SITE, SOCIAL } from '../config/site';

/**
 * Structured data (schema.org JSON-LD) for the SPA.
 *
 * Renders once inside Layout and rewrites the JSON-LD blocks on every route
 * change: Organization + WebSite site-wide, a BreadcrumbList per path, plus
 * page-specific entities (Person for the founder, Event for the live show).
 * Data-driven pages (e.g. a blog post) can inject their own block with
 * `setPageJsonLd(...)`.
 */

const SCRIPT_ID = 'pwi-jsonld';
const PAGE_SCRIPT_ID = 'pwi-jsonld-page';

const sameAs = [
  SOCIAL.instagram,
  SOCIAL.facebook,
  SOCIAL.twitter,
  SOCIAL.linkedin,
  SOCIAL.youtube,
];

const organization = {
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  description: SITE.defaultDescription,
  email: CONTACT.email,
  foundingDate: '2025-03',
  founder: { '@type': 'Person', name: FOUNDER.name },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Accra',
    addressCountry: 'GH',
  },
  sameAs,
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  publisher: { '@id': `${SITE.url}/#organization` },
};

/** Human-readable names for breadcrumb segments. */
const SEGMENT_NAMES: Record<string, string> = {
  about: 'About',
  founder: 'Founder',
  'emmanuel-mbansi': 'Emmanuel Mbansi',
  programs: 'Programs',
  conversations: 'Conversations',
  'our-guests': 'Our Guests',
  gallery: 'Gallery',
  fellowship: 'Fellowship',
  events: 'Events',
  contact: 'Contact',
  blog: 'Blog',
};

function breadcrumbList(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE.url}/`,
      },
      ...segments.map((segment, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: SEGMENT_NAMES[segment] || segment.replace(/-/g, ' '),
        item: `${SITE.url}/${segments.slice(0, index + 1).join('/')}`,
      })),
    ],
  };
}

const founderPerson = {
  '@type': 'Person',
  name: FOUNDER.name,
  jobTitle: 'Founder & Executive Host',
  worksFor: { '@id': `${SITE.url}/#organization` },
  url: `${SITE.url}/founder`,
  sameAs: [FOUNDER.instagram, FOUNDER.linkedin],
};

const liveEvent = {
  '@type': 'Event',
  name: 'PWI Conversations — Live',
  description:
    'Weekly live conversations with purpose-driven leaders, streamed on YouTube every Saturday at 7PM GMT.',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'VirtualLocation',
    url: LIVE_SESSION.watchUrl,
  },
  organizer: { '@id': `${SITE.url}/#organization` },
  url: `${SITE.url}/conversations`,
};

function graphFor(pathname: string) {
  const graph: object[] = [organization, website];

  if (pathname !== '/') {
    graph.push(breadcrumbList(pathname));
  }
  if (pathname === '/founder' || pathname === '/about/emmanuel-mbansi') {
    graph.push(founderPerson);
  }
  if (pathname === '/conversations' || pathname === '/events') {
    graph.push(liveEvent);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function upsertScript(id: string, data: object) {
  let el = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Inject an extra page-specific JSON-LD block (e.g. BlogPosting on an article
 * page). Pass `null` to remove it. Returns a cleanup function.
 */
export function setPageJsonLd(data: object | null) {
  if (data === null) {
    document.head.querySelector(`script#${PAGE_SCRIPT_ID}`)?.remove();
    return;
  }
  upsertScript(PAGE_SCRIPT_ID, { '@context': 'https://schema.org', ...data });
}

export default function JsonLd() {
  const { pathname } = useLocation();

  useEffect(() => {
    upsertScript(SCRIPT_ID, graphFor(pathname));
  }, [pathname]);

  return null;
}
