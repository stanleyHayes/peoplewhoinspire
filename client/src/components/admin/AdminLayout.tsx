import { useMemo, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaShieldAlt,
  FaChevronRight,
} from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import AdminHelpDropdown from './AdminHelpDropdown';
import { runThemeReveal } from '../../utils/themeReveal';

export interface AdminRouteMeta {
  title: string;
  section: string;
  description: string;
}

const routeMeta: Record<string, AdminRouteMeta> = {
  '/admin/dashboard': {
    title: 'Dashboard',
    section: 'Overview',
    description: 'Platform health, activity, and shortcuts.',
  },
  '/admin/posts': {
    title: 'Blog Posts',
    section: 'Content Studio',
    description: 'Publish stories, notes, and insight pieces.',
  },
  '/admin/programs': {
    title: 'Programs',
    section: 'Content Studio',
    description: 'Shape the public program pathways.',
  },
  '/admin/team': {
    title: 'Team',
    section: 'Community',
    description: 'Manage people, roles, and public profiles.',
  },
  '/admin/events': {
    title: 'Events',
    section: 'Content Studio',
    description: 'Coordinate sessions, dates, and recordings.',
  },
  '/admin/site-content': {
    title: 'Site Content',
    section: 'Content Studio',
    description: 'Update page hero images and social links without a redeploy.',
  },
  '/admin/partners': {
    title: 'Partners',
    section: 'Community',
    description: 'Maintain alliance and sponsorship records.',
  },
  '/admin/testimonials': {
    title: 'Testimonials',
    section: 'Community',
    description: 'Curate proof from the PWI network.',
  },
  '/admin/subscribers': {
    title: 'Subscribers',
    section: 'Community',
    description: 'Review the audience and newsletter list.',
  },
  '/admin/contacts': {
    title: 'Messages',
    section: 'Community',
    description: 'Respond to contact and partnership inquiries.',
  },
  '/admin/users': {
    title: 'Users',
    section: 'System',
    description: 'Control platform access and permissions.',
  },
  '/admin/settings': {
    title: 'Settings',
    section: 'System',
    description: 'Tune profile, security, and admin preferences.',
  },
  '/admin/audit-logs': {
    title: 'Audit Logs',
    section: 'System',
    description: 'Trace administrative activity.',
  },
};

const tourSeenKey = 'pwi_admin_show_me_seen';

const tourSteps = [
  {
    title: 'Start with the grouped sidebar',
    body: 'The sidebar is organized into Overview, Content Studio, Community, and System. Open or close each group, then use the branch-line items to jump to the exact workspace you need.',
  },
  {
    title: 'Read the page header',
    body: 'The navbar tells you which admin section you are in, what the current page is for, and the kind of work that belongs there.',
  },
  {
    title: 'Use Help & actions',
    body: 'The dropdown in the navbar contains the full platform guide, page-specific help, text-to-speech, shortcuts, and this replayable tour.',
  },
  {
    title: 'Make careful edits',
    body: 'Most pages let you create, edit, feature, publish, activate, or review records. Check public-facing copy and links before saving.',
  },
];

function AdminTourOverlay({ onClose }: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = tourSteps[stepIndex];
  const isLast = stepIndex === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-navy-950/65 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-navy-950/30">
        <div className="pwi-panel-dark p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
            Show me around
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold">{step.title}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">{step.body}</p>
        </div>

        <div className="p-6">
          <div className="mb-5 flex gap-2">
            {tourSteps.map((tourStep, index) => (
              <button
                key={tourStep.title}
                type="button"
                onClick={() => setStepIndex(index)}
                aria-label={`Go to tour step ${index + 1}`}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= stepIndex ? 'bg-gold-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-navy-900"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
                className="rounded-full border border-navy-950/10 px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLast) {
                    onClose();
                    return;
                  }
                  setStepIndex((current) => current + 1);
                }}
                className="rounded-full bg-navy-950 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.7)] transition-colors hover:bg-navy-800"
              >
                {isLast ? 'Finish tour' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pwi_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('pwi_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pwi_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('pwi_dark_mode', String(darkMode));
  }, [darkMode]);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const toggleDarkMode = (originX?: number, originY?: number) => {
    runThemeReveal(
      originX ?? window.innerWidth - 48,
      originY ?? 48,
      () => setDarkMode((prev) => !prev),
    );
  };

  useEffect(() => {
    try {
      if (!localStorage.getItem(tourSeenKey)) {
        setTourOpen(true);
      }
    } catch {
      setTourOpen(true);
    }
  }, []);

  // Keep the admin area out of search results.
  useEffect(() => {
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!el) {
      el = document.createElement('meta');
      el.name = 'robots';
      document.head.appendChild(el);
    }
    el.content = 'noindex, nofollow';
    return () => {
      el.content = 'index, follow';
    };
  }, []);

  const closeTour = () => {
    try {
      localStorage.setItem(tourSeenKey, 'true');
    } catch {
      // Ignore storage failures; the tour can still close for this session.
    }
    setTourOpen(false);
  };

  const replayTour = () => {
    setTourOpen(true);
  };

  const pageMeta = useMemo(() => {
    const direct = routeMeta[location.pathname];
    if (direct) return direct;

    const prefix = Object.keys(routeMeta).find((path) => location.pathname.startsWith(`${path}/`));
    return prefix
      ? routeMeta[prefix]
      : {
          title: 'Admin',
          section: 'PWI',
          description: 'Manage the People Who Inspire platform.',
        };
  }, [location.pathname]);

  return (
    <div className={`min-h-screen font-admin ${darkMode ? 'dark admin-dark' : ''} bg-[#f7f5ef]`}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-[78px]' : 'md:ml-72'
        }`}
      >
        {/* Top header bar */}
        <header className="admin-header sticky top-0 z-20 border-b border-navy-950/10 bg-white/80 px-4 py-3 shadow-sm shadow-navy-950/5 backdrop-blur-xl sm:px-6">
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-gold-400/70 via-gold-300/40 to-transparent" />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="rounded-lg border border-navy-950/10 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
                aria-label="Toggle menu"
              >
                <FaBars className="text-lg" aria-hidden="true" />
              </button>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-300 shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] sm:flex">
                <FaShieldAlt aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  <span>PWI Admin</span>
                  <FaChevronRight className="text-[9px] text-gold-500" aria-hidden="true" />
                  <span className="text-gold-600">{pageMeta.section}</span>
                </div>
                <h1 className="admin-header-title mt-0.5 truncate font-serif text-2xl font-bold leading-tight text-navy-900">
                  {pageMeta.title}
                </h1>
                <p className="hidden text-sm text-gray-500 md:block">{pageMeta.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <AdminHelpDropdown
                darkMode={darkMode}
                onLogout={logout}
                onReplayTour={replayTour}
                onToggleDarkMode={toggleDarkMode}
                pageMeta={pageMeta}
                pathname={location.pathname}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="admin-content flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
      {tourOpen && <AdminTourOverlay onClose={closeTour} />}
    </div>
  );
}
