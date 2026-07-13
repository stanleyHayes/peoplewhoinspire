import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt, FaPlay, FaYoutube } from 'react-icons/fa';
import { LIVE_SESSION } from '../../config/site';
import { IMAGES } from '../../data/siteContent';
import Parallax from '../motion/Parallax';

const stats = [
  { value: '8+', label: '2025 conversations' },
  { value: '7+', label: 'countries represented' },
  { value: 'Sat', label: 'weekly live format' },
  { value: '7PM', label: 'GMT on YouTube' },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-navy-950">
      <Parallax travel={90} className="absolute inset-x-0 -inset-y-[12%] -z-20">
        <img
          src={IMAGES.heroConversation}
          alt="A collaborative workspace representing global conversations"
          className="h-full w-full object-cover opacity-35"
        />
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,13,0.98)_0%,rgba(26,26,46,0.9)_52%,rgba(26,26,46,0.55)_100%)]" />
      <div className="absolute bottom-0 left-0 right-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="container relative z-10 mx-auto px-4 pt-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="pwi-eyebrow text-gold-300">
              Global leadership and impact platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 font-serif text-4xl font-bold leading-[1.04] text-white md:text-6xl lg:text-7xl"
          >
            Inspiring Leaders.{' '}
            <span className="text-gold-400">Transforming</span>{' '}
            Communities.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-8 max-w-2xl text-lg leading-8 text-gray-200 md:text-xl"
          >
            People Who Inspire is a global leadership and impact platform that connects,
            equips, and empowers the next generation of purpose-driven leaders to create
            meaningful change.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/programs"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-8 py-4 text-lg font-semibold text-navy-950 shadow-lg shadow-gold-950/20 transition-all duration-300 hover:bg-gold-300"
            >
              Explore Programs
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/conversations"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20"
            >
              <FaPlay className="text-sm" />
              PWI Conversations
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-3 border-l border-gold-400/70 bg-navy-950/45 p-5 backdrop-blur-md md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-3xl font-bold text-white md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="pwi-surface bg-white/95 p-6"
          >
            <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white">
                <FaYoutube />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                  Next live session
                </p>
                <h2 className="font-serif text-xl font-bold text-navy-900">
                  PWI Conversations
                </h2>
              </div>
            </div>
            <div className="space-y-4 py-5">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="mt-1 text-gold-500" />
                <div>
                  <p className="font-semibold text-navy-900">{LIVE_SESSION.schedule}</p>
                  <p className="text-sm leading-6 text-gray-600">
                    Join live, ask questions, and revisit every conversation on YouTube.
                  </p>
                </div>
              </div>
            </div>
            <a
              href={LIVE_SESSION.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
            >
              <FaYoutube className="text-red-400" />
              Watch on YouTube
            </a>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
