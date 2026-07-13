import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaTimes, FaYoutube } from 'react-icons/fa';
import type { NavGroup, NavItem } from '../../config/navigation';
import { NAV_GROUPS } from '../../config/navigation';
import { LIVE_SESSION } from '../../config/site';
import { PWIMonogram } from '../ui/PWILogo';

type NavSection = NavGroup & {
  shortTitle: string;
};

const NAV_SECTIONS: NavSection[] = [
  {
    ...NAV_GROUPS[0],
    shortTitle: 'About',
    items: NAV_GROUPS[0].items.filter((item) => item.to !== '/'),
  },
  { ...NAV_GROUPS[1], shortTitle: 'Programs' },
  {
    ...NAV_GROUPS[2],
    shortTitle: 'Conversations',
    items: NAV_GROUPS[2].items.filter((item) => item.to !== '/blog'),
  },
];

function isPathActive(to: string | undefined, pathname: string) {
  if (!to) return false;
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isSectionActive(section: NavSection, pathname: string) {
  return section.items.some((item) => isPathActive(item.to, pathname));
}

function NavDestination({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        <span className="block text-sm font-bold text-navy-950">{item.title}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-600">{item.description}</span>
      </a>
    );
  }

  return (
    <Link to={item.to || '/'} className={className} onClick={onNavigate}>
      <span className="block text-sm font-bold text-navy-950">{item.title}</span>
      <span className="mt-1 block text-xs leading-5 text-gray-600">{item.description}</span>
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Utility bar — live session signal */}
      <div
        className={`hidden overflow-hidden bg-navy-950 text-white/70 transition-all duration-300 lg:block ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] lg:px-8">
          <span className="flex items-center gap-2">
            <span className="pwi-pulse-dot inline-block h-2 w-2 rounded-full bg-gold-400" />
            {LIVE_SESSION.schedule} · Live on YouTube
          </span>
          <a
            href={LIVE_SESSION.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gold-300 transition-colors hover:text-gold-200"
          >
            <FaYoutube aria-hidden="true" />
            Watch the next conversation
          </a>
        </div>
      </div>

      {/* Main glass bar */}
      <nav
        className={`relative border-b transition-all duration-300 ${
          scrolled
            ? 'border-navy-950/10 bg-white/85 shadow-lg shadow-navy-950/10 backdrop-blur-xl'
            : 'border-transparent bg-white/55 backdrop-blur-md'
        }`}
      >
        {/* gold gradient hairline that appears on scroll */}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-gold-400 via-gold-300 to-navy-500 transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="People Who Inspire home">
              <PWIMonogram size={42} />
              <div className="min-w-0">
                <span className="block truncate font-serif text-lg font-bold leading-none text-navy-950">
                  People Who Inspire
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.3em] text-gold-600">
                  EST. 2025
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-5 lg:flex">
              {/* Segmented pill nav */}
              <div className="flex items-center gap-1 rounded-full border border-navy-950/10 bg-white/60 p-1">
                {NAV_SECTIONS.map((section) => {
                  const isActive = isSectionActive(section, location.pathname);
                  const isExpanded = openSection === section.shortTitle;

                  return (
                    <div
                      key={section.shortTitle}
                      className="relative"
                      onMouseEnter={() => setOpenSection(section.shortTitle)}
                      onMouseLeave={() => setOpenSection((value) => (value === section.shortTitle ? null : value))}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenSection((value) => (value === section.shortTitle ? null : section.shortTitle))}
                        onFocus={() => setOpenSection(section.shortTitle)}
                        aria-haspopup="menu"
                        aria-expanded={isExpanded}
                        className={`relative flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                          isActive || isExpanded
                            ? 'text-navy-950'
                            : 'text-navy-700 hover:text-navy-950'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-full bg-gold-100 ring-1 ring-gold-300/60"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10">{section.shortTitle}</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.16 }}
                            className="absolute left-1/2 top-full z-50 mt-4 w-[22rem] -translate-x-1/2 rounded-2xl border border-navy-950/10 bg-white/95 p-2 shadow-2xl shadow-navy-950/15 backdrop-blur-xl"
                            onMouseEnter={() => setOpenSection(section.shortTitle)}
                          >
                            <div className="border-l-4 border-gold-400 px-4 py-3">
                              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold-600">
                                {section.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-gray-600">{section.description}</p>
                            </div>
                            <div className="mt-2 grid gap-1">
                              {section.items.map((item) => {
                                const active = isPathActive(item.to, location.pathname);
                                return (
                                  <NavDestination
                                    key={item.title}
                                    item={item}
                                    className={`block rounded-xl border p-4 text-left transition-all hover:border-gold-400 hover:bg-gold-50 ${
                                      active ? 'border-gold-400 bg-gold-50' : 'border-transparent'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <Link
                  to="/blog"
                  className={`relative flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                    isPathActive('/blog', location.pathname)
                      ? 'text-navy-950'
                      : 'text-navy-700 hover:text-navy-950'
                  }`}
                >
                  {isPathActive('/blog', location.pathname) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gold-100 ring-1 ring-gold-300/60"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">Stories</span>
                </Link>
              </div>

              <Link to="/contact" className="pwi-btn pwi-btn-primary">
                Join PWI
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="rounded-full p-2.5 text-xl text-navy-950 transition-colors hover:bg-navy-950 hover:text-white lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24 }}
              className="border-t border-navy-950/10 bg-[#f7f5ef]/95 backdrop-blur-md lg:hidden"
            >
              <div className="container mx-auto max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-5">
                <div className="space-y-4">
                  {NAV_SECTIONS.map((section) => (
                    <section key={section.shortTitle} className="rounded-2xl border border-navy-950/10 bg-white p-4">
                      <div className="mb-3 border-l-4 border-gold-400 pl-3">
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold-600">
                          {section.shortTitle}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{section.description}</p>
                      </div>
                      <div className="grid gap-2">
                        {section.items.map((item) => {
                          const active = isPathActive(item.to, location.pathname);
                          return (
                            <NavDestination
                              key={item.title}
                              item={item}
                              onNavigate={() => setIsOpen(false)}
                              className={`block rounded-xl border p-3 text-left transition-all hover:border-gold-400 hover:bg-gold-50 ${
                                active ? 'border-gold-400 bg-gold-50' : 'border-navy-950/10'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <div className="grid gap-2">
                    <Link
                      to="/blog"
                      className="rounded-xl border border-navy-950/10 bg-white p-4 text-sm font-bold text-navy-950"
                      onClick={() => setIsOpen(false)}
                    >
                      Stories
                    </Link>
                    <Link
                      to="/contact"
                      className="pwi-btn pwi-btn-primary w-full py-3.5 text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      Join PWI
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
