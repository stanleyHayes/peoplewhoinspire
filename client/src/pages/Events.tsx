import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaVideo,
  FaUsers,
  FaDesktop,
  FaStar,
  FaYoutube,
  FaPlay,
} from 'react-icons/fa';
import api from '../services/api';
import { LIVE_SESSION } from '../config/site';
import PageHero from '../components/ui/PageHero';
import { PublicCardGridSkeleton } from '../components/ui/Skeleton';
import Watermark from '../components/ui/Watermark';
import { getFallbackEvents } from '../data/siteContent';
import { useSiteContent } from '../context/SiteContentContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  registrationLink?: string;
  recordingLink?: string;
  featured: boolean;
  active: boolean;
}

const typeConfig: Record<string, { icon: typeof FaVideo; label: string; color: string; gradient: string }> = {
  virtual: { icon: FaVideo, label: 'Virtual', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  'in-person': { icon: FaUsers, label: 'In-Person', color: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
  hybrid: { icon: FaDesktop, label: 'Hybrid', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-violet-600' },
};

const EVENTS_PER_PAGE = 6;

export default function EventsPage() {
  const { images, social } = useSiteContent();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        // Handle both paginated and flat responses
        const data = response.data.events || response.data;
        const resolved = Array.isArray(data) && data.length > 0 ? data : getFallbackEvents();
        setEvents(resolved);
      } catch {
        setEvents(getFallbackEvents());
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcoming = events
    .filter((e) => new Date(e.date) >= now && e.active !== false)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = events
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allDisplayed = filter === 'upcoming' ? upcoming : past;
  const displayed = allDisplayed.slice(0, visibleCount);
  const hasMore = visibleCount < allDisplayed.length;

  return (
    <>
      <PageHero
        eyebrow="Events & Gatherings"
        title={<>Where Leaders <span className="text-gold-400">Connect</span></>}
        description="Join upcoming events, workshops, masterclasses, and weekly conversations designed to inspire and equip purpose-driven leaders."
        image={images.eventsStage}
        imageAlt="A live event with a speaker presenting to an audience"
        icon={FaCalendarAlt}
        actions={[
          {
            label: `Watch Live - ${LIVE_SESSION.schedule}`,
            href: social.youtube,
            icon: <FaYoutube className="text-lg" />,
          },
        ]}
        stats={[
          { value: upcoming.length.toString(), label: 'Upcoming' },
          { value: past.length.toString(), label: 'Past sessions' },
          { value: '7PM', label: 'GMT' },
          { value: 'Virtual', label: 'Format' },
        ]}
      />

      {/* Events List */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="radar" position="bottom-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          >
            <div>
              <span className="pwi-eyebrow text-gold-600">Event Calendar</span>
              <h2 className="mt-4 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
                Follow the gatherings, workshops, and conversations as they happen.
              </h2>
            </div>
            <div className="pwi-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setFilter('upcoming'); setVisibleCount(EVENTS_PER_PAGE); }}
                  className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all cursor-pointer ${
                    filter === 'upcoming'
                      ? 'bg-navy-900 text-white shadow-lg'
                      : 'bg-[#f7f5ef] text-gray-600 hover:bg-gold-50'
                  }`}
                >
                  Upcoming ({upcoming.length})
                </button>
                <button
                  onClick={() => { setFilter('past'); setVisibleCount(EVENTS_PER_PAGE); }}
                  className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all cursor-pointer ${
                    filter === 'past'
                      ? 'bg-navy-900 text-white shadow-lg'
                      : 'bg-[#f7f5ef] text-gray-600 hover:bg-gold-50'
                  }`}
                >
                  Past ({past.length})
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['Weekly', 'Saturday rhythm'],
                  ['7PM', 'GMT sessions'],
                  ['Hybrid', 'Event formats'],
                ].map(([value, label]) => (
                  <div key={label} className="border border-navy-950/10 bg-[#fbfaf6] p-4">
                    <div className="font-serif text-2xl font-bold text-navy-900">{value}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <PublicCardGridSkeleton count={6} columnsClass="grid-cols-1 lg:grid-cols-2" />
          ) : displayed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-navy-900 shadow-lg">
                <FaCalendarAlt className="text-gold-400 text-3xl" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy-800 mb-3">
                {filter === 'upcoming'
                  ? 'Next session: this Saturday'
                  : 'Recordings coming soon'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {filter === 'upcoming'
                  ? `PWI Conversations stream live ${LIVE_SESSION.schedule}. Join us on YouTube, or subscribe to be notified of special events.`
                  : 'Past session recordings are being uploaded. Catch every episode on our YouTube channel.'}
              </p>
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn pwi-btn-dark text-sm"
              >
                <FaYoutube className="text-base text-gold-400" /> Watch on YouTube
              </a>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {displayed.map((event, index) => {
                const date = new Date(event.date);
                const month = date.toLocaleDateString('en', { month: 'short' });
                const day = date.getDate();
                const weekday = date.toLocaleDateString('en', { weekday: 'long' });
                const time = date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
                const type = typeConfig[event.type] || typeConfig.virtual;
                const isPast = date < now;

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className={`pwi-card pwi-card-hover group flex flex-col md:flex-row ${
                      isPast
                        ? 'opacity-80'
                        : event.featured
                        ? 'border-gold-300 shadow-md shadow-gold-400/10'
                        : ''
                    }`}
                  >
                    {/* Date column */}
                    <div
                      className={`bg-gradient-to-br ${type.gradient} px-4 py-3 md:p-8 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-1 md:min-w-[140px] shrink-0 ${
                        isPast ? 'opacity-60' : ''
                      }`}
                    >
                      <span className="text-white/80 text-xs md:text-sm font-semibold uppercase">
                        {month}
                      </span>
                      <span className="text-white text-2xl md:text-5xl font-bold leading-none">
                        {day}
                      </span>
                      <span className="text-white/60 text-xs md:text-sm">{weekday}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-8 bg-white">
                      <div className="flex flex-wrap items-start sm:items-center gap-2 mb-3">
                        <h3 className="font-serif text-base sm:text-xl font-bold text-navy-800 w-full sm:w-auto">
                          {event.title}
                        </h3>
                        {event.featured && !isPast && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-100 text-gold-700 rounded-lg text-xs font-semibold">
                            <FaStar className="text-[10px]" /> Featured
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${type.color}`}
                        >
                          <type.icon className="text-[10px]" />
                          {type.label}
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                        {event.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-6 sm:gap-y-2 mb-4 sm:mb-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="text-gold-400 text-xs" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gold-400 text-xs" />
                          {date.toLocaleDateString('en', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at {time}
                        </div>
                      </div>

                      {event.registrationLink && !isPast && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pwi-btn pwi-btn-dark px-4 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm"
                        >
                          Register Now <FaArrowRight className="text-xs" />
                        </a>
                      )}

                      {event.recordingLink && isPast && (
                        <a
                          href={event.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pwi-btn pwi-btn-primary px-4 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm"
                        >
                          <FaPlay className="text-[10px]" /> Watch Recording
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-12"
                >
                  <button
                    onClick={() => setVisibleCount((prev) => prev + EVENTS_PER_PAGE)}
                    className="rounded-lg bg-navy-900 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-navy-800 cursor-pointer"
                  >
                    Load More Events
                  </button>
                  <p className="text-sm text-gray-400 mt-3">
                    Showing {displayed.length} of {allDisplayed.length} events
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
