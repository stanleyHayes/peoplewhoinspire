import type { Event, Post } from '../types';
import { LIVE_SESSION } from '../config/site';
import { PAST_GUESTS } from './guests';

export const IMAGES = {
  heroConversation: '/images/hero-conversation.jpg',
  aboutLeadership: '/images/about-leadership.jpg',
  programsWorkshop: '/images/programs-workshop.jpg',
  conversationsTable: '/images/conversations-table.jpg',
  fellowshipCohort: '/images/fellowship-cohort.jpg',
  communityStudy: '/images/community-study.jpg',
  eventsStage: '/images/events-stage.jpg',
  blogEditorial: '/images/blog-editorial.jpg',
  contactOffice: '/images/contact-office.jpg',
} as const;

export interface ProgramVisual {
  title: string;
  image: string;
  imageAlt: string;
  accent: string;
}

export const PROGRAM_VISUALS: Record<string, ProgramVisual> = {
  conversations: {
    title: 'PWI Conversations',
    image: IMAGES.conversationsTable,
    imageAlt: 'Leaders gathered around a table in discussion',
    accent: 'border-blue-500',
  },
  mentorship: {
    title: 'Leadership & Mentorship',
    image: IMAGES.aboutLeadership,
    imageAlt: 'A collaborative leadership workshop',
    accent: 'border-emerald-500',
  },
  masterclasses: {
    title: 'Masterclasses',
    image: IMAGES.programsWorkshop,
    imageAlt: 'A facilitator leading a professional workshop',
    accent: 'border-red-500',
  },
  fellowship: {
    title: 'Fellowship Hub',
    image: IMAGES.fellowshipCohort,
    imageAlt: 'A cohort learning together in a workshop setting',
    accent: 'border-purple-500',
  },
  community: {
    title: 'Community',
    image: IMAGES.communityStudy,
    imageAlt: 'A group of young leaders studying and collaborating',
    accent: 'border-cyan-500',
  },
};

function nextSaturdayAt7pmGMT(from = new Date()) {
  const current = new Date(from);
  const day = current.getUTCDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const candidate = new Date(
    Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate() + daysUntilSaturday,
      19,
      0,
      0,
      0,
    ),
  );

  if (candidate.getTime() <= current.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }

  return candidate.toISOString();
}

export function getFallbackEvents(): Event[] {
  const pastDates = [
    '2025-03-15T19:00:00.000Z',
    '2025-03-22T19:00:00.000Z',
    '2025-03-29T19:00:00.000Z',
    '2025-04-05T19:00:00.000Z',
    '2025-04-12T19:00:00.000Z',
    '2025-04-19T19:00:00.000Z',
    '2025-04-26T19:00:00.000Z',
    '2025-05-03T19:00:00.000Z',
  ];

  const pastEvents: Event[] = PAST_GUESTS.slice(0, pastDates.length).map((guest, index) => ({
    _id: `fallback-past-${index + 1}`,
    title: `PWI Conversations with ${guest.name}`,
    description:
      guest.episode ||
      `${guest.title} joined PWI for a purpose-driven conversation on leadership, service, and impact.`,
    date: pastDates[index],
    location: 'YouTube Live - 7PM GMT',
    type: 'virtual',
    registrationLink: LIVE_SESSION.watchUrl,
    recordingLink: guest.youtubeUrl || LIVE_SESSION.watchUrl,
    image: IMAGES.conversationsTable,
    featured: index === 0,
    active: true,
    createdAt: pastDates[index],
  }));

  return [
    {
      _id: 'fallback-upcoming-live-session',
      title: 'PWI Conversations - Live This Saturday',
      description:
        'Join the next live dialogue with a remarkable leader and bring your questions for the interactive conversation.',
      date: nextSaturdayAt7pmGMT(),
      location: 'YouTube Live - 7PM GMT',
      type: 'virtual',
      registrationLink: LIVE_SESSION.watchUrl,
      recordingLink: LIVE_SESSION.watchUrl,
      image: IMAGES.eventsStage,
      featured: true,
      active: true,
      createdAt: new Date().toISOString(),
    },
    ...pastEvents,
  ];
}

export const FALLBACK_POSTS: Post[] = [
  {
    _id: 'fallback-post-launch',
    title: 'Welcome to People Who Inspire',
    slug: 'welcome-to-people-who-inspire',
    excerpt:
      'A note on why PWI exists: to create a global platform for leaders whose stories can move people toward purpose.',
    content:
      '<p>People Who Inspire exists to gather leaders, tell stories of substance, and help emerging changemakers see what is possible.</p>',
    coverImage: IMAGES.heroConversation,
    author: 'People Who Inspire',
    category: 'Platform',
    tags: ['launch', 'leadership', 'impact'],
    published: true,
    featured: true,
    createdAt: '2026-03-14T09:00:00.000Z',
    updatedAt: '2026-03-14T09:00:00.000Z',
  },
  {
    _id: 'fallback-post-community',
    title: 'The Power of Community',
    slug: 'the-power-of-community',
    excerpt:
      'Purpose grows faster in community. Here is how shared stories, mentorship, and accountability shape stronger leaders.',
    content:
      '<p>Communities give leaders a place to practice courage, share resources, and build work that lasts beyond one person.</p>',
    coverImage: IMAGES.communityStudy,
    author: 'People Who Inspire',
    category: 'Insights',
    tags: ['community', 'mentorship'],
    published: true,
    featured: false,
    createdAt: '2026-03-14T10:00:00.000Z',
    updatedAt: '2026-03-14T10:00:00.000Z',
  },
  {
    _id: 'fallback-post-conversations',
    title: 'Why Weekly Conversations Matter',
    slug: 'why-weekly-conversations-matter',
    excerpt:
      'The Saturday live format makes leadership wisdom accessible, consistent, and human.',
    content:
      '<p>Weekly conversations create rhythm. PWI uses that rhythm to make global leadership feel near, practical, and deeply human.</p>',
    coverImage: IMAGES.conversationsTable,
    author: 'People Who Inspire',
    category: 'Conversations',
    tags: ['youtube', 'guests', 'stories'],
    published: true,
    featured: false,
    createdAt: '2026-04-04T19:00:00.000Z',
    updatedAt: '2026-04-04T19:00:00.000Z',
  },
];
