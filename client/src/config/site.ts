/**
 * PWI — single source of truth for brand contact + social details.
 *
 * Per the June 2026 website feedback (Section 7 checklist), every handle/URL/contact
 * lives here so it stays consistent across the footer, contact page, and new pages.
 *
 * ⚠️ ITEMS MARKED `TODO` MUST BE CONFIRMED BY PWI BEFORE GO-LIVE.
 *    Replace the placeholder URLs below with the real profile links.
 */

/**
 * Site-level SEO constants. `url` should match the production custom domain (feedback §3.4).
 * The 1200×630 Open Graph image lives at client/public/og-image.png
 * (regenerate from client/scripts/og-image.html with headless Chrome).
 */
export const SITE = {
  name: 'People Who Inspire',
  url: 'https://www.peoplewhoinspire.global',
  defaultTitle: 'People Who Inspire | Global Leadership & Impact Platform',
  defaultDescription:
    'People Who Inspire (PWI) is a global leadership and impact platform connecting, equipping, and empowering purpose-driven leaders. Watch PWI Conversations live every Saturday at 7PM GMT.',
  ogImage: 'https://www.peoplewhoinspire.global/og-image.png',
  themeColor: '#1a1a2e',
} as const;

export const CONTACT = {
  email: 'info@peoplewhoinspire.global',
  // Phone / WhatsApp — confirmed in the feedback document
  phoneDisplay: '+233 26 441 7040',
  whatsappUrl: 'https://wa.me/233264417040',
  // Feedback §4.8: replace the vague "Global Platform" with a real base + global reach
  location: 'Accra, Ghana · Operating Globally',
  timezoneNote:
    'Our team is based in West Africa (GMT). We typically respond within 1 business day.',
} as const;

/**
 * Social profiles.
 * Instagram handle is standardized to @peoplewhoinspire_global everywhere (feedback §4.1/§4.8).
 * TODO: confirm the exact Facebook / Twitter / LinkedIn / YouTube URLs with PWI.
 */
export const SOCIAL = {
  instagramHandle: '@peoplewhoinspire_global',
  instagram: 'https://www.instagram.com/peoplewhoinspire_global',
  facebook: 'https://www.facebook.com/peoplewhoinspireglobal', // TODO: confirm real URL
  twitter: 'https://x.com/peoplewhoinspire', // TODO: confirm real handle/URL
  linkedin: 'https://www.linkedin.com/company/peoplewhoinspire', // TODO: confirm real URL
  youtube: 'https://www.youtube.com/@peoplewhoinspire', // TODO: confirm real channel URL
} as const;

/** Live session details — PWI Conversations stream every Saturday 7PM GMT. */
export const LIVE_SESSION = {
  schedule: 'Every Saturday · 7PM GMT',
  // The button visitors press to watch live / browse recordings.
  watchUrl: SOCIAL.youtube,
} as const;

/** Founder links surfaced on the /founder page (feedback §6). */
export const FOUNDER = {
  name: 'Emmanuel Mbansi',
  instagramHandle: '@emmanuelmbansi',
  instagram: 'https://www.instagram.com/emmanuelmbansi', // TODO: confirm
  linkedin: 'https://www.linkedin.com/in/emmanuelmbansi', // TODO: confirm
  email: 'info@peoplewhoinspire.global', // TODO: confirm a direct address if desired
} as const;

/** Where the Fellowship "Apply Now" button should point (feedback §4.5). */
export const FORMS = {
  // TODO: replace with the real application form URL when available.
  // Until then we route to the contact page.
  fellowshipApplicationUrl: '/contact',
  nominateSpeakerUrl: '/contact',
} as const;
