import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaMicrophone,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
  FaGlobe,
  FaYoutube,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader';
import GuestCard from '../components/ui/GuestCard';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { PAST_GUESTS } from '../data/guests';
import { LIVE_SESSION } from '../config/site';
import { IMAGES } from '../data/siteContent';

const features = [
  {
    icon: FaMicrophone,
    title: 'Intimate Dialogues',
    description: 'Small-format conversations that allow for deep, meaningful exchanges with speakers.',
  },
  {
    icon: FaGlobe,
    title: 'Global Perspectives',
    description: 'Speakers from diverse backgrounds, industries, and regions sharing unique insights.',
  },
  {
    icon: FaUsers,
    title: 'Interactive Format',
    description: 'Live Q&A sessions where attendees can engage directly with speakers.',
  },
  {
    icon: FaCalendarAlt,
    title: 'Weekly Sessions',
    description: `New conversations stream ${LIVE_SESSION.schedule}, ensuring consistent learning and connection.`,
  },
];

// Show a preview of the archive here; the full set lives on the /our-guests gallery.
const previewGuests = PAST_GUESTS.slice(0, 6);

export default function ConversationsPage() {
  return (
    <>
      <PageHero
        eyebrow="PWI Conversations"
        title={<>Dialogues That <span className="text-gold-400">Inspire</span></>}
        description={`Join intimate conversations with world-class leaders, innovators, and change-makers. New episodes stream live ${LIVE_SESSION.schedule}.`}
        image={IMAGES.conversationsTable}
        imageAlt="Leaders gathered around a table in conversation"
        icon={FaMicrophone}
        actions={[
          {
            label: 'Watch Live on YouTube',
            href: LIVE_SESSION.watchUrl,
            icon: <FaYoutube className="text-lg" />,
          },
          {
            label: 'Browse Past Guests',
            to: '/our-guests',
            icon: <FaPlay className="text-sm" />,
            variant: 'secondary',
          },
        ]}
        stats={[
          { value: '8+', label: 'Conversations' },
          { value: 'Weekly', label: 'Live sessions' },
          { value: '7PM', label: 'GMT' },
          { value: 'YouTube', label: 'Channel' },
        ]}
      />

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="The Experience"
            title="What Makes PWI Conversations Unique"
            description="Our conversations are carefully curated to deliver maximum value and create lasting connections."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="pwi-card pwi-card-accent pwi-card-hover group p-7 text-left"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="pwi-icon-box transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-navy-950">
                    <feature.icon className="text-xl" />
                  </div>
                  <span className="font-serif text-3xl font-bold text-navy-950/15">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-navy-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Watch Live band */}
      <section className="pwi-section-dark relative overflow-hidden py-20">
        <Watermark variant="africa" position="top-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Live {LIVE_SESSION.schedule}
              </span>
              <h2 className="mt-6 font-serif text-3xl font-bold text-white md:text-5xl">
                Watch every conversation on <span className="text-gold-400">YouTube</span>
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-gray-300">
                Subscribe to catch every episode live and revisit a growing archive of leaders
                speaking with depth, candor, and practical generosity.
              </p>
              <a
                href={LIVE_SESSION.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn mt-8 bg-red-600 px-8 py-4 text-white shadow-lg hover:bg-red-700"
              >
                <FaYoutube className="text-2xl" />
                Watch on YouTube
              </a>
            </div>
            <div className="pwi-panel-dark p-6 text-white shadow-2xl shadow-black/20 md:p-8">
              <span className="pwi-eyebrow text-gold-300">Broadcast Rhythm</span>
              <div className="mt-6 grid gap-3">
                {[
                  ['When', LIVE_SESSION.schedule],
                  ['Where', 'YouTube Live'],
                  ['Format', 'Story, questions, practical leadership lessons'],
                  ['Afterwards', 'Archive previewed in the guest gallery'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] gap-4 border-t border-white/10 py-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-gold-300">
                      {label}
                    </span>
                    <span className="text-sm leading-6 text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Conversations archive */}
      <section className="relative overflow-hidden bg-[#f7f5ef] py-24">
        <Watermark variant="radar" position="bottom-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="2025 Season"
            title="Past Conversations"
            description="Remarkable leaders from across Africa, Europe, and the Americas — each with a story worth telling."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previewGuests.map((guest, index) => (
              <GuestCard key={guest.name} guest={guest} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link
              to="/our-guests"
              className="pwi-btn pwi-btn-dark px-8 py-4"
            >
              View the Full 2025 Gallery
              <FaArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
