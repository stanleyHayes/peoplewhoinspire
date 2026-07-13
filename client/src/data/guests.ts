/**
 * PWI Conversations — 2025 guest list.
 *
 * Built from Section 5 of the June 2026 website feedback. This single list powers BOTH
 * the Conversations page archive and the /our-guests gallery, so it only needs editing once.
 *
 * ⚠️ The feedback notes this table was drawn from Instagram screenshots and is INCOMPLETE.
 *    Emmanuel must confirm titles, episode titles, air dates, and provide a `youtubeUrl`
 *    + `photo` for every guest. Fields marked `''` or `[Confirm ...]` are TODOs.
 */

export interface Guest {
  name: string;
  title: string;
  country: string;
  /** Flag emoji(s) for the country. */
  flag: string;
  /** Episode topic/title — TODO confirm from Emmanuel. */
  episode?: string;
  /** Air date, e.g. "March 2025" — TODO confirm. */
  airDate?: string;
  /** A standout quote from the episode (optional). */
  quote?: string;
  /** YouTube recording URL — TODO add for every guest. */
  youtubeUrl?: string;
  /** Headshot image URL/path — TODO add. */
  photo?: string;
  /** Marks Emmanuel as host (rendered first / highlighted). */
  isHost?: boolean;
}

export const GUESTS: Guest[] = [
  {
    name: 'Emmanuel Mbansi',
    title: 'Host & Executive Founder, PWI',
    country: 'Ghana',
    flag: '🇬🇭',
    episode: 'Host of PWI Conversations',
    isHost: true,
    youtubeUrl: '', // TODO
    photo: '', // TODO: Emmanuel headshot
  },
  {
    name: 'Guy Bertrand',
    title: 'Award-Winning Cameroon Expert',
    country: 'Cameroon',
    flag: '🇨🇲',
    youtubeUrl: '', // TODO: get YouTube link
    photo: '',
  },
  {
    name: 'Jacob Walker',
    title: 'Educational Musician & Global Affairs Director',
    country: 'USA',
    flag: '🇺🇸',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Rev. Edwin Dadson',
    title: 'International Musician',
    country: 'Ghana',
    flag: '🇬🇭',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Kafui Dey',
    title: 'Media & Communications Professional',
    country: 'Ghana',
    flag: '🇬🇭',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Dr. Mary Eyram Ashinyo',
    title: 'Ministry of Health — NC',
    country: 'Ghana / USA',
    flag: '🇬🇭🇺🇸',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Tom-Chris Emewulu',
    title: 'Venture Creator & Entrepreneur',
    country: 'Nigeria',
    flag: '🇳🇬',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Barr. Alfred Eli K. Dei',
    title: 'Co-Founder & Entrepreneur',
    country: 'Ghana',
    flag: '🇬🇭',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Michael Adote',
    title: 'Global Leader', // TODO: confirm title
    country: 'Ghana',
    flag: '🇬🇭',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Christina Maldonado',
    title: '[Confirm title]', // TODO
    country: '[Confirm country]', // TODO
    flag: '🌍',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Jim Seaklund',
    title: '[Confirm title]', // TODO
    country: '[Confirm country]', // TODO
    flag: '🌍',
    youtubeUrl: '', // TODO
    photo: '',
  },
  {
    name: 'Barrett Nash',
    title: '[Confirm title]', // TODO
    country: '[Confirm country]', // TODO
    flag: '🌍',
    youtubeUrl: '', // TODO
    photo: '',
  },
];

/** Guests excluding the host — used for the "past guests" archive grids. */
export const PAST_GUESTS = GUESTS.filter((g) => !g.isHost);
