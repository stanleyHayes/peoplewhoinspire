import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBookOpen,
  FaChevronDown,
  FaCog,
  FaExternalLinkAlt,
  FaMoon,
  FaPlay,
  FaQuestionCircle,
  FaRedo,
  FaSignOutAlt,
  FaStop,
  FaSun,
  FaVolumeUp,
} from 'react-icons/fa';
import type { AdminRouteMeta } from './AdminLayout';

interface PageHelp {
  purpose: string;
  steps: string[];
}

interface AdminHelpDropdownProps {
  darkMode: boolean;
  onLogout: () => void;
  onReplayTour: () => void;
  onToggleDarkMode: (originX?: number, originY?: number) => void;
  pageMeta: AdminRouteMeta;
  pathname: string;
}

const usageGuide = [
  'Use the grouped sidebar to move between overview, publishing, community, and system pages.',
  'Open a page, review the table or cards, then use the primary action button to create or update records.',
  'Featured and published states decide what appears prominently on the public website.',
  'Use Settings for profile, password, and admin preferences. Use Audit Logs when you need to trace activity.',
];

const pageHelp: Record<string, PageHelp> = {
  '/admin/dashboard': {
    purpose: 'The dashboard gives you the fastest read on platform health, totals, and recent work.',
    steps: [
      'Start here after login to spot content or community areas that need attention.',
      'Use the shortcut cards to jump into common admin tasks.',
      'Treat the metrics as a quick check before editing deeper records.',
    ],
  },
  '/admin/posts': {
    purpose: 'Blog Posts controls the stories, announcements, and insight articles shown on the public site.',
    steps: [
      'Create a post with a title, excerpt, category, tags, and article body.',
      'Use Published to make it public, and Featured to promote it in blog surfaces.',
      'Add a cover image when possible; otherwise the site chooses a topic-aware fallback image.',
    ],
  },
  '/admin/programs': {
    purpose: 'Programs manages the public pathways people can explore before joining PWI activities.',
    steps: [
      'Keep program names short, clear, and outcome-focused.',
      'Use descriptions and features to explain what participants get.',
      'Set active ordering so the public page reads like a coherent pathway.',
    ],
  },
  '/admin/team': {
    purpose: 'Team manages the people presented as part of the PWI organization.',
    steps: [
      'Add each person with a role, short bio, and image when available.',
      'Use ordering to control how profiles appear.',
      'Keep bios concise and public-facing.',
    ],
  },
  '/admin/events': {
    purpose: 'Events manages upcoming sessions, past recordings, and public calendar details.',
    steps: [
      'Create upcoming events with date, location, type, and registration link.',
      'For past events, add recording links so visitors can replay sessions.',
      'Feature important events when they should be promoted more visibly.',
    ],
  },
  '/admin/site-content': {
    purpose: 'Site Content lets you swap public hero and banner images and update social links without a redeploy.',
    steps: [
      'Upload a custom image for any page hero, or reset it to the bundled default.',
      'Update the official social profile URLs used in the footer, contact page, navbar, and SEO metadata.',
      'Click Save & publish — changes go live for visitors immediately.',
    ],
  },
  '/admin/partners': {
    purpose: 'Partners manages organizations and collaborators connected to PWI.',
    steps: [
      'Add partner names, descriptions, and website links.',
      'Use featured and order settings to control public emphasis.',
      'Keep partner descriptions proof-oriented and current.',
    ],
  },
  '/admin/testimonials': {
    purpose: 'Testimonials stores community proof and short endorsement quotes.',
    steps: [
      'Add the person, role, organization, quote, and rating.',
      'Feature the strongest testimonials for public sections.',
      'Keep quotes specific, credible, and easy to scan.',
    ],
  },
  '/admin/subscribers': {
    purpose: 'Subscribers shows the people who joined the PWI mailing list.',
    steps: [
      'Review subscription growth and individual subscriber records.',
      'Use this page to confirm who is active on the list.',
      'Keep the list clean before campaign or newsletter work.',
    ],
  },
  '/admin/contacts': {
    purpose: 'Messages is the inbox for public contact, partnership, and inquiry submissions.',
    steps: [
      'Open new messages to understand the request.',
      'Mark messages as read or replied as you process them.',
      'Use the subject and sender details to route follow-up work.',
    ],
  },
  '/admin/users': {
    purpose: 'Users controls who can access the admin platform and what role they have.',
    steps: [
      'Invite only trusted team members.',
      'Assign the lowest role that gives someone the access they need.',
      'Deactivate users who should no longer manage the platform.',
    ],
  },
  '/admin/settings': {
    purpose: 'Settings controls your profile, password, preferences, and platform configuration.',
    steps: [
      'Update profile details and password from the account sections.',
      'Choose admin preferences such as the default landing page.',
      'Review configuration carefully because settings can affect multiple admin surfaces.',
    ],
  },
  '/admin/audit-logs': {
    purpose: 'Audit Logs records administrative actions so platform changes can be traced.',
    steps: [
      'Filter by action or resource when investigating a change.',
      'Use timestamps and user details to understand who did what.',
      'Check logs after sensitive updates such as user or settings changes.',
    ],
  },
};

function resolvePageHelp(pathname: string) {
  const direct = pageHelp[pathname];
  if (direct) return direct;

  const prefix = Object.keys(pageHelp).find((path) => pathname.startsWith(`${path}/`));
  return prefix
    ? pageHelp[prefix]
    : {
        purpose: 'This admin page helps you manage the People Who Inspire platform.',
        steps: [
          'Review the page contents before making edits.',
          'Use primary actions to add or update records.',
          'Save changes only after checking public-facing copy and links.',
        ],
      };
}

export default function AdminHelpDropdown({
  darkMode,
  onLogout,
  onReplayTour,
  onToggleDarkMode,
  pageMeta,
  pathname,
}: AdminHelpDropdownProps) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const currentHelp = useMemo(() => resolvePageHelp(pathname), [pathname]);

  const speechText = useMemo(
    () =>
      [
        'People Who Inspire admin usage guide.',
        ...usageGuide,
        `${pageMeta.title}. ${currentHelp.purpose}`,
        ...currentHelp.steps,
      ].join(' '),
    [currentHelp, pageMeta.title],
  );

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakGuide = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const replayTour = () => {
    setOpen(false);
    stopSpeech();
    onReplayTour();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2.5 rounded-full border bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-all hover:border-gold-300 hover:bg-gold-50/60 ${
          open ? 'border-gold-400 ring-2 ring-gold-400/20' : 'border-navy-950/10'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FaQuestionCircle className="text-gold-500" aria-hidden="true" />
        Help & actions
        <FaChevronDown
          className={`text-xs text-gray-400 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2.5 w-[min(92vw,440px)] overflow-hidden rounded-xl border border-navy-950/10 bg-white shadow-[0_12px_32px_rgba(26,26,46,0.14)]"
          role="menu"
        >
          {/* Header — flat light wash (IAA-style), not a dark block */}
          <div className="border-b border-navy-950/10 bg-gradient-to-br from-gold-50 via-white to-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-600 ring-1 ring-gold-400/20">
                  <FaQuestionCircle aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                    Admin guide
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-navy-950">
                    How to use this platform
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-gray-500">
                    Quick help for the full admin system and the page you are currently viewing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={speaking ? stopSpeech : speakGuide}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950 transition-colors hover:bg-gold-300"
                aria-label={speaking ? 'Stop text to speech' : 'Read guide aloud'}
              >
                {speaking ? <FaStop aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            <section className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <FaBookOpen className="text-gold-500" aria-hidden="true" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-navy-900">
                  Usage guide
                </h3>
              </div>
              <div className="grid gap-2">
                {usageGuide.map((item, index) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-lg border border-navy-950/10 bg-[#fbfaf6] p-3"
                  >
                    <span className="font-serif text-lg font-bold text-gold-500">0{index + 1}</span>
                    <p className="text-sm leading-6 text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-navy-950/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                Current page
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold text-navy-950">
                {pageMeta.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{currentHelp.purpose}</p>
              <ul className="mt-3 space-y-2">
                {currentHelp.steps.map((step) => (
                  <li key={step} className="flex gap-2 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    {step}
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-2 border-t border-navy-950/10 p-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={replayTour}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-200 hover:bg-gold-50/60"
              >
                <FaRedo className="text-gold-500" aria-hidden="true" />
                Show me around
              </button>
              <button
                type="button"
                onClick={speaking ? stopSpeech : speakGuide}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-200 hover:bg-gold-50/60"
              >
                {speaking ? <FaStop className="text-gold-500" /> : <FaPlay className="text-gold-500" />}
                {speaking ? 'Stop audio' : 'Read aloud'}
              </button>
              <button
                type="button"
                onClick={(event) => onToggleDarkMode(event.clientX, event.clientY)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-200 hover:bg-gold-50/60"
              >
                {darkMode ? <FaSun className="text-gold-500" /> : <FaMoon className="text-gold-500" />}
                {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
              <Link
                to="/admin/settings"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-200 hover:bg-gold-50/60"
              >
                <FaCog className="text-gold-500" aria-hidden="true" />
                Settings
              </Link>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-200 hover:bg-gold-50/60"
              >
                <FaExternalLinkAlt className="text-gold-500" aria-hidden="true" />
                Visit site
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
              >
                <FaSignOutAlt aria-hidden="true" />
                Logout
              </button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
