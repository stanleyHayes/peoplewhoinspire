import type { SiteImageKey } from '../context/SiteContentContext';
import { SOCIAL } from './site';

/**
 * Metadata describing which static site content is CMS-editable from
 * /admin/site-content. The values themselves live in the database
 * (`siteImages` / `socialLinks` settings); this file only labels the fields
 * and documents where each one appears on the public site.
 */

export interface SiteImageField {
  key: SiteImageKey;
  label: string;
  /** Where visitors see this image. */
  placement: string;
  description: string;
}

export const SITE_IMAGE_FIELDS: SiteImageField[] = [
  {
    key: 'heroConversation',
    label: 'Home hero',
    placement: 'Home page hero, featured blog fallback',
    description: 'The large photograph behind the home page headline.',
  },
  {
    key: 'aboutLeadership',
    label: 'About & Founder hero',
    placement: 'About page hero, Founder page hero, mentorship pathway card',
    description: 'Leadership workshop photo used across the story pages.',
  },
  {
    key: 'programsWorkshop',
    label: 'Programs hero',
    placement: 'Programs page hero, masterclasses visuals',
    description: 'Workshop photo introducing the program pathways.',
  },
  {
    key: 'conversationsTable',
    label: 'Conversations hero',
    placement: 'Conversations page hero, conversation cards, event fallbacks',
    description: 'Round-table discussion photo for the weekly live show.',
  },
  {
    key: 'fellowshipCohort',
    label: 'Fellowship hero',
    placement: 'Fellowship page hero, fellowship pathway card',
    description: 'Cohort photo for the Fellowship Hub.',
  },
  {
    key: 'communityStudy',
    label: 'Community photo',
    placement: 'Home impact section, community pathway card, blog fallbacks',
    description: 'Young leaders collaborating — used for community proof.',
  },
  {
    key: 'eventsStage',
    label: 'Events & Guests hero',
    placement: 'Events page hero, Guests page hero, upcoming event fallback',
    description: 'Stage photo for event listings and guest galleries.',
  },
  {
    key: 'blogEditorial',
    label: 'Blog hero',
    placement: 'Blog page hero, article fallback cover',
    description: 'Editorial photo for the insights section.',
  },
  {
    key: 'contactOffice',
    label: 'Contact hero',
    placement: 'Contact page hero',
    description: 'Office photo behind the contact page headline.',
  },
];

export interface SocialLinkField {
  key: keyof typeof SOCIAL;
  label: string;
  placeholder: string;
}

export const SOCIAL_LINK_FIELDS: SocialLinkField[] = [
  {
    key: 'instagram',
    label: 'Instagram URL',
    placeholder: 'https://www.instagram.com/peoplewhoinspire_global',
  },
  {
    key: 'instagramHandle',
    label: 'Instagram handle (display text)',
    placeholder: '@peoplewhoinspire_global',
  },
  {
    key: 'facebook',
    label: 'Facebook URL',
    placeholder: 'https://www.facebook.com/peoplewhoinspireglobal',
  },
  {
    key: 'twitter',
    label: 'X / Twitter URL',
    placeholder: 'https://x.com/peoplewhoinspire',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn URL',
    placeholder: 'https://www.linkedin.com/company/peoplewhoinspire',
  },
  {
    key: 'youtube',
    label: 'YouTube URL',
    placeholder: 'https://www.youtube.com/@peoplewhoinspire',
  },
];

/**
 * Which editable image each program pathway uses, so pages can resolve
 * PROGRAM_VISUALS entries against CMS overrides.
 */
export const PROGRAM_IMAGE_KEYS: Record<string, SiteImageKey> = {
  conversations: 'conversationsTable',
  mentorship: 'aboutLeadership',
  masterclasses: 'programsWorkshop',
  fellowship: 'fellowshipCohort',
  community: 'communityStudy',
};
