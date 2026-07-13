import { Link } from 'react-router-dom';
import { FaYoutube, FaUserPlus } from 'react-icons/fa';
import GuestCard from '../components/ui/GuestCard';
import SectionHeader from '../components/ui/SectionHeader';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { GUESTS, PAST_GUESTS } from '../data/guests';
import { FORMS } from '../config/site';
import { useSiteContent } from '../context/SiteContentContext';

/**
 * 2025 Conversations Gallery — "Voices That Changed Us" (feedback §5).
 * Proves what PWI has built. Guest data is shared with the Conversations page
 * via `client/src/data/guests.ts`.
 */

const host = GUESTS.find((g) => g.isHost);
const seasonNotes = [
  { value: '8+', label: 'Published conversations' },
  { value: '7+', label: 'Countries represented' },
  { value: 'Sat', label: 'Weekly live rhythm' },
];

export default function GuestsPage() {
  const { images, social } = useSiteContent();

  return (
    <>
      <PageHero
        eyebrow="PWI Conversations - 2025 Season"
        title={<>Voices That <span className="text-gold-400">Changed Us</span></>}
        description="Every conversation on PWI features a remarkable leader with a story worth telling. Here is the 2025 season - intimate, global, and always inspiring."
        image={images.eventsStage}
        imageAlt="A speaker presenting to an audience"
        icon={FaYoutube}
        stats={[
          { value: '8+', label: 'Conversations' },
          { value: '7+', label: 'Countries' },
          { value: 'Sat', label: '7PM GMT' },
          { value: 'Live', label: 'YouTube' },
        ]}
      />

      {/* Host card */}
      {host && (
        <section className="pwi-soft-band py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div>
                <span className="pwi-eyebrow text-gold-600">Your Host</span>
                <h2 className="mt-4 font-serif text-4xl font-bold text-navy-900">
                  Emmanuel anchors the archive with curiosity, warmth, and practical leadership questions.
                </h2>
                <p className="mt-5 max-w-2xl leading-8 text-gray-600">
                  Each episode is built to surface the human story behind impact: what shaped the
                  leader, what tested them, and what others can carry into their own work.
                </p>
              </div>
              <div>
                <GuestCard guest={host} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Guest grid */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="2025 Guests"
            title="The People in the Room"
            description="A growing archive of leaders from across Africa, Europe, and the Americas - each episode carrying a lesson, a turning point, and a story worth replaying."
          />

          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {seasonNotes.map((note) => (
              <div key={note.label} className="pwi-card p-5 text-center">
                <div className="font-serif text-3xl font-bold text-navy-900">{note.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  {note.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PAST_GUESTS.map((guest, index) => (
              <GuestCard key={guest.name} guest={guest} index={index} />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-10 max-w-2xl mx-auto">
            This list is being finalized. Titles, episode dates, and recordings are confirmed
            on a rolling basis — check back as the 2025 archive is completed.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pwi-section-dark relative overflow-hidden py-24">
        <Watermark variant="africa" position="bottom-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-8 max-w-2xl mx-auto">
            Know Someone Who Should Be on{' '}
            <span className="text-gold-400">PWI Conversations</span>?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={FORMS.nominateSpeakerUrl}
              className="pwi-btn pwi-btn-primary px-8 py-4"
            >
              <FaUserPlus /> Nominate a Speaker
            </Link>
            <a
              href={social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="pwi-btn pwi-btn-ghost-light px-8 py-4"
            >
              <FaYoutube className="text-lg" /> Watch All Episodes
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
