import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import type { NavItem } from '../../config/navigation';
import { NAV_GROUPS } from '../../config/navigation';
import { CONTACT, LIVE_SESSION, SOCIAL } from '../../config/site';
import { PWIMonogram } from '../ui/PWILogo';

const socials = [
  { icon: FaFacebookF, href: SOCIAL.facebook, label: 'Facebook' },
  { icon: FaTwitter, href: SOCIAL.twitter, label: 'Twitter' },
  { icon: FaInstagram, href: SOCIAL.instagram, label: 'Instagram' },
  { icon: FaLinkedinIn, href: SOCIAL.linkedin, label: 'LinkedIn' },
  { icon: FaYoutube, href: SOCIAL.youtube, label: 'YouTube' },
  { icon: FaWhatsapp, href: CONTACT.whatsappUrl, label: 'WhatsApp' },
];

function FooterLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const classes =
    'group flex items-center gap-2.5 py-1.5 text-sm text-gray-400 transition-all duration-300 hover:translate-x-0.5 hover:text-gold-200';
  const content = (
    <>
      <Icon className="text-xs text-gold-400/70 transition-colors group-hover:text-gold-300" aria-hidden="true" />
      <span>{item.title}</span>
    </>
  );

  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link to={item.to || '/'} className={classes}>
      {content}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden text-gray-300">
      {/* layered navy gradient with soft gold glows */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 0%, rgba(212,168,67,0.16), transparent 32%),' +
            'radial-gradient(circle at 92% 8%, rgba(58,58,125,0.45), transparent 40%),' +
            'linear-gradient(180deg, #1a1a2e 0%, #121225 52%, #08080d 100%)',
        }}
      />
      {/* giant concentric ring circle bleeding off the corner */}
      <div
        aria-hidden="true"
        className="pwi-ring-decor absolute -bottom-40 -right-32 h-80 w-80 opacity-70"
      />

      <div className="container relative z-10 mx-auto px-4 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-12 xl:grid-cols-[0.9fr_1.1fr_1.6fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-3">
              <PWIMonogram size={44} />
              <div>
                <span className="block font-serif text-xl font-bold leading-none text-white">
                  People Who Inspire
                </span>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-gold-400">
                  EST. 2025
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-md leading-relaxed text-gray-400">
              A global leadership and impact platform connecting, equipping, and empowering
              purpose-driven leaders to create meaningful change.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/40 hover:bg-gold-400 hover:text-navy-950"
                >
                  <social.icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Glass CTA card */}
          <div className="pwi-glass relative overflow-hidden rounded-2xl p-7 shadow-2xl shadow-navy-950/40">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <p className="pwi-eyebrow text-gold-300">{LIVE_SESSION.schedule}</p>
            <h2 className="mt-4 font-serif text-2xl font-bold leading-snug text-white">
              Watch leaders share the stories behind their impact.
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={LIVE_SESSION.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn pwi-btn-primary w-full"
              >
                <FaYoutube aria-hidden="true" />
                Watch Live
              </a>
              <Link to="/contact" className="pwi-btn pwi-btn-ghost-light w-full">
                Get Involved
                <FaArrowRight className="text-xs" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-7 grid gap-3 border-t border-white/10 pt-6 text-sm text-gray-300">
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 transition-colors hover:text-gold-300">
                <FaEnvelope className="text-gold-400" aria-hidden="true" />
                {CONTACT.email}
              </a>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-gold-300"
              >
                <FaWhatsapp className="text-gold-400" aria-hidden="true" />
                {CONTACT.phoneDisplay}
              </a>
              <span className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-gold-400" aria-hidden="true" />
                {CONTACT.location}
              </span>
              <span className="flex items-center gap-3">
                <FaClock className="text-gold-400" aria-hidden="true" />
                {CONTACT.timezoneNote}
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="relative inline-block font-serif text-lg font-bold text-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-7 after:rounded-full after:bg-gold-400">
                  {group.title}
                </h3>
                <p className="mt-4 text-xs leading-relaxed text-gray-500">{group.description}</p>
                <div className="mt-3 grid gap-0.5">
                  {group.items.map((item) => (
                    <FooterLink key={`${group.title}-${item.title}`} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
          <p>&copy; {new Date().getFullYear()} People Who Inspire. All rights reserved.</p>
          <p className="text-xs text-gray-600">
            Built for leaders, mentors, and communities creating measurable impact.
          </p>
        </div>
      </div>
    </footer>
  );
}
