import { motion } from 'framer-motion';
import { FaPlay, FaYoutube } from 'react-icons/fa';
import type { Guest } from '../../data/guests';
import { LIVE_SESSION } from '../../config/site';

interface GuestCardProps {
  guest: Guest;
  index?: number;
}

/**
 * Shared card for a PWI Conversations guest — used on the Conversations page archive
 * and the /our-guests gallery (feedback §3.2 / §5).
 */
export default function GuestCard({ guest, index = 0 }: GuestCardProps) {
  const initials = guest.name
    .split(' ')
    .filter((p) => !p.endsWith('.'))
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  // Link to the specific episode if we have it; otherwise fall back to the channel.
  const watchUrl = guest.youtubeUrl || LIVE_SESSION.watchUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="pwi-card pwi-card-hover group flex h-full flex-col"
    >
      <div className="pwi-panel-dark px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-white">
            <span className="mr-2 text-lg leading-none">{guest.flag}</span>
            {guest.country}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-gold-300">
            {guest.airDate || '2025 Season'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="-mt-12 flex items-end gap-4">
          {guest.photo ? (
            <img
              src={guest.photo}
              alt={guest.name}
              className="h-[104px] w-[104px] rounded-full border-4 border-white object-cover shadow-xl shadow-navy-950/10"
            />
          ) : (
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-4 border-white bg-[#11111f] shadow-xl shadow-navy-950/10">
              <span className="font-serif text-3xl font-bold text-gold-400">{initials}</span>
            </div>
          )}
          <span className="mb-3 h-10 w-px bg-navy-950/10" />
        </div>

        <div className="mt-5">
          <h3 className="font-serif text-xl font-bold text-navy-900">{guest.name}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">{guest.title}</p>
        </div>

        {guest.episode && (
          <p className="mt-5 rounded-xl border-l-4 border-gold-400 bg-gold-50 px-4 py-3 text-sm font-semibold leading-6 text-navy-800">
            {guest.episode}
          </p>
        )}
        {guest.quote && (
          <p className="mt-4 line-clamp-3 text-sm italic leading-6 text-gray-500">
            "{guest.quote}"
          </p>
        )}
      </div>

      <div className="border-t border-navy-950/10 bg-[#fbfaf6] px-6 py-5">
        {guest.youtubeUrl ? (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pwi-btn pwi-btn-primary w-full"
          >
            <FaPlay className="text-[10px]" /> Watch Episode
          </a>
        ) : (
          <a
            href={LIVE_SESSION.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pwi-btn w-full border border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:bg-gold-50"
            title="Recording link coming soon"
          >
            <FaYoutube className="text-sm text-red-500" /> On YouTube
          </a>
        )}
      </div>
    </motion.div>
  );
}
