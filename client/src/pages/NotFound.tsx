import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCompass, FaEnvelope, FaHome, FaYoutube } from 'react-icons/fa';
import { useSiteContent } from '../context/SiteContentContext';
import Watermark from '../components/ui/Watermark';
import Constellation from '../components/ui/Constellation';

const quickLinks = [
  { to: '/conversations', label: 'Watch Conversations' },
  { to: '/programs', label: 'Explore Programs' },
  { to: '/blog', label: 'Read Stories' },
  { to: '/contact', label: 'Contact Us' },
];

export default function NotFound() {
  const { social } = useSiteContent();

  return (
    <section className="pwi-section-dark relative flex min-h-[88vh] items-center overflow-hidden pt-32 text-white md:pt-36">
      <Watermark variant="africa" position="top-right" opacity={0.07} />
      <div
        aria-hidden="true"
        className="pwi-ring-decor absolute -bottom-24 -left-20 hidden h-72 w-72 lg:block"
      />
      <Constellation className="absolute -right-10 top-24 hidden h-80 w-[26rem] lg:block" opacity={0.4} />

      <div className="container relative z-10 mx-auto px-4 py-20 text-center lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pwi-eyebrow justify-center text-gold-300"
        >
          Error 404
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 font-serif text-[7rem] font-bold leading-none md:text-[11rem]"
        >
          4<span className="text-gold-400">0</span>4
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight md:text-4xl"
        >
          This story hasn&rsquo;t been written yet.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/70"
        >
          The page you are looking for moved, never existed, or is still being drafted.
          Let&rsquo;s get you back to the work that matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link to="/" className="pwi-btn pwi-btn-primary px-8 py-4 text-base">
            <FaHome aria-hidden="true" />
            Back to home
          </Link>
          <a
            href={social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="pwi-btn pwi-btn-ghost-light px-8 py-4 text-base"
          >
            <FaYoutube aria-hidden="true" />
            Watch Saturday Live
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-14 max-w-3xl"
        >
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
            <FaCompass className="text-gold-400" aria-hidden="true" />
            Try one of these instead
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="pwi-glass group flex items-center justify-between rounded-xl px-5 py-4 text-sm font-semibold text-white/85 transition-all hover:-translate-y-0.5 hover:border-gold-400/40 hover:text-gold-200"
              >
                {link.label}
                <FaArrowLeft className="rotate-180 text-xs text-gold-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </motion.div>

        <p className="mt-14 text-sm text-white/45">
          Think this is a mistake?{' '}
          <a
            href="mailto:info@peoplewhoinspire.global"
            className="inline-flex items-center gap-1.5 font-semibold text-gold-300 transition-colors hover:text-gold-200"
          >
            <FaEnvelope className="text-xs" aria-hidden="true" />
            Tell us about it
          </a>
        </p>
      </div>
    </section>
  );
}
