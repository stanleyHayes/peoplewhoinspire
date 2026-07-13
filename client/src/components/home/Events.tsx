import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaVideo,
  FaUsers,
  FaDesktop,
} from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import { PublicCardGridSkeleton } from '../ui/Skeleton';
import api from '../../services/api';
import { getFallbackEvents } from '../../data/siteContent';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  registrationLink?: string;
  featured: boolean;
  active: boolean;
}

const typeConfig = {
  virtual: { icon: FaVideo, label: 'Virtual', color: 'bg-blue-100 text-blue-700' },
  'in-person': { icon: FaUsers, label: 'In-Person', color: 'bg-emerald-100 text-emerald-700' },
  hybrid: { icon: FaDesktop, label: 'Hybrid', color: 'bg-purple-100 text-purple-700' },
};

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600',
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        const data: Event[] = response.data;
        // Only show upcoming active events
        const now = new Date();
        const upcoming = data
          .filter((e) => new Date(e.date) >= now && e.active !== false)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setEvents(upcoming.length > 0 ? upcoming : getFallbackEvents().filter((e) => new Date(e.date) >= now).slice(0, 3));
      } catch {
        const now = new Date();
        setEvents(getFallbackEvents().filter((e) => new Date(e.date) >= now).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#f7f5ef] py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <PublicCardGridSkeleton count={3} />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="bg-[#f7f5ef] py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="Upcoming Events"
          title="Join Us"
          description="Connect with purpose-driven leaders at our upcoming events, workshops, and conversations."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const date = new Date(event.date);
            const month = date.toLocaleDateString('en', { month: 'short' });
            const day = date.getDate();
            const year = date.getFullYear();
            const time = date.toLocaleTimeString('en', {
              hour: 'numeric',
              minute: '2-digit',
            });
            const type = typeConfig[event.type] || typeConfig.virtual;
            const gradient = gradients[index % gradients.length];

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl">
                  {/* Date header */}
                  <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} p-6`}>
                    <div className="relative flex items-center gap-4">
                      <div className="min-w-[70px] bg-white/20 p-3 text-center backdrop-blur-sm">
                        <span className="text-white/80 text-xs font-semibold uppercase block">
                          {month}
                        </span>
                        <span className="text-white text-3xl font-bold block leading-none">
                          {day}
                        </span>
                        <span className="text-white/60 text-xs block">{year}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-serif font-bold text-lg leading-snug mb-1">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-sm`}
                        >
                          <type.icon className="text-[10px]" />
                          {type.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="mb-5 line-clamp-2 text-sm leading-7 text-gray-500">
                      {event.description}
                    </p>

                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-gold-400 text-xs shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <FaCalendarAlt className="text-gold-400 text-xs shrink-0" />
                        <span>
                          {date.toLocaleDateString('en', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          at {time}
                        </span>
                      </div>
                    </div>

                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800 group-hover:shadow-lg"
                      >
                        Register Now <FaArrowRight className="text-xs" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-navy-800 font-semibold hover:text-gold-500 transition-colors"
          >
            View All Events <FaArrowRight className="text-sm" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
