import type { IconType } from 'react-icons';
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCompass,
  FaEnvelope,
  FaHandshake,
  FaHome,
  FaInstagram,
  FaMicrophoneAlt,
  FaNewspaper,
  FaRegComments,
  FaRocket,
  FaUserFriends,
  FaUserTie,
  FaUsers,
  FaWhatsapp,
} from 'react-icons/fa';
import { CONTACT, SOCIAL } from './site';

export interface NavItem {
  title: string;
  description: string;
  icon: IconType;
  to?: string;
  href?: string;
}

export interface NavGroup {
  title: string;
  description: string;
  icon: IconType;
  items: NavItem[];
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    title: 'About',
    description: 'The mission, story, and people behind PWI.',
    to: '/about',
    icon: FaUsers,
  },
  {
    title: 'Conversations',
    description: 'Weekly leadership conversations and guest stories.',
    to: '/conversations',
    icon: FaMicrophoneAlt,
  },
  {
    title: 'Programs',
    description: 'Leadership pathways, fellowship, and community growth.',
    to: '/programs',
    icon: FaHandshake,
  },
  {
    title: 'Stories',
    description: 'Editorial notes, insights, and impact updates.',
    to: '/blog',
    icon: FaNewspaper,
  },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Start Here',
    description: 'Learn the mission and the people behind PWI.',
    icon: FaCompass,
    items: [
      {
        title: 'Home',
        description: 'Return to the front page and latest highlights.',
        to: '/',
        icon: FaHome,
      },
      {
        title: 'About PWI',
        description: 'See the story, mission, values, and global vision.',
        to: '/about',
        icon: FaUsers,
      },
      {
        title: 'Meet the Founder',
        description: 'Get to know Emmanuel Mbansi and the founding journey.',
        to: '/founder',
        icon: FaUserTie,
      },
    ],
  },
  {
    title: 'Take Part',
    description: 'Programs, fellowship pathways, and live events.',
    icon: FaRocket,
    items: [
      {
        title: 'Programs',
        description: 'Explore leadership, mentorship, and impact pathways.',
        to: '/programs',
        icon: FaHandshake,
      },
      {
        title: 'Fellowship',
        description: 'Join a cohort for structured growth and community.',
        to: '/fellowship',
        icon: FaUserFriends,
      },
      {
        title: 'Events',
        description: 'Find upcoming sessions, gatherings, and replays.',
        to: '/events',
        icon: FaCalendarAlt,
      },
    ],
  },
  {
    title: 'Watch & Read',
    description: 'Conversations, guest stories, and editorial insight.',
    icon: FaRegComments,
    items: [
      {
        title: 'PWI Conversations',
        description: 'Watch weekly impact conversations with global leaders.',
        to: '/conversations',
        icon: FaMicrophoneAlt,
      },
      {
        title: 'Guest Gallery',
        description: 'Browse featured guests and the wisdom they shared.',
        to: '/our-guests',
        icon: FaBookOpen,
      },
      {
        title: 'Blog',
        description: 'Read reflections, updates, and leadership stories.',
        to: '/blog',
        icon: FaNewspaper,
      },
    ],
  },
  {
    title: 'Connect',
    description: 'Reach the team or follow the community channels.',
    icon: FaEnvelope,
    items: [
      {
        title: 'Contact Us',
        description: 'Send a message, partnership note, or media inquiry.',
        to: '/contact',
        icon: FaEnvelope,
      },
      {
        title: 'WhatsApp',
        description: 'Message the PWI team directly for quick questions.',
        href: CONTACT.whatsappUrl,
        icon: FaWhatsapp,
      },
      {
        title: 'Instagram',
        description: 'Follow stories, announcements, and community moments.',
        href: SOCIAL.instagram,
        icon: FaInstagram,
      },
    ],
  },
];
