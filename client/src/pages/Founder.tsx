import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap,
  FaTrophy,
  FaGlobeAfrica,
  FaMicrophone,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaArrowRight,
  FaQuoteLeft,
} from 'react-icons/fa';
import { FOUNDER } from '../config/site';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { useSiteContent } from '../context/SiteContentContext';

/**
 * Founder page — Emmanuel Mbansi (feedback §6).
 * Story copy is the feedback's suggested draft — Emmanuel to edit/personalize.
 * TODO: supply a high-res headshot (min 800×1000px) for the hero.
 */

const credentials = [
  { icon: FaGraduationCap, label: 'MBA', detail: 'Mansay Business School' },
  {
    icon: FaTrophy,
    label: 'President, Adiba Youth Leadership Alumni Network',
    detail: 'Class of 2024',
  },
  { icon: FaGlobeAfrica, label: 'Co-Founder', detail: 'Impact Africa Alliance' },
  {
    icon: FaMicrophone,
    label: 'Executive Host & Founder, People Who Inspire',
    detail: 'Est. March 2025',
  },
];

const founderPrinciples = [
  'Ask questions that make leaders tell the truth beneath the title.',
  'Make global stories feel close enough to learn from.',
  'Use inspiration as a beginning, then point people toward action.',
];

export default function FounderPage() {
  const { images } = useSiteContent();

  return (
    <>
      <PageHero
        eyebrow="Founder & Executive Host"
        title="Emmanuel Mbansi"
        description="MBA Graduate - Global Leadership Convener - Founder, People Who Inspire"
        image={images.aboutLeadership}
        imageAlt="A leadership gathering representing the PWI founder story"
        icon={FaMicrophone}
        meta={
          <div className="mb-5 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gold-400">
              <span className="font-serif text-4xl font-bold text-navy-950">EM</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-gold-300">
              Convening stories that move leaders to act
            </p>
          </div>
        }
        stats={[
          { value: 'MBA', label: 'Graduate' },
          { value: '2024', label: 'Adiba Alumni' },
          { value: '2025', label: 'PWI Founded' },
          { value: '7PM', label: 'Weekly Host' },
        ]}
      />

      {/* Section 2 — His Story */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="radar" position="top-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <span className="pwi-eyebrow text-gold-500">His Story</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mt-3 mb-8">
                The Living Proof of Concept
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p>
                  Emmanuel Mbansi is not simply the founder of People Who Inspire — he is its living
                  proof of concept.
                </p>
                <p>
                  A holder of an MBA from Mansay Business School and a proud graduate of the Adiba
                  Youth Leadership Program (Class of 2024), Emmanuel has built a reputation as one of
                  West Africa's most purposeful young leaders. As President of the Adiba Alumni Network
                  and co-founder of Impact Africa Alliance, he operates at the intersection of
                  leadership development, organizational building, and continental impact.
                </p>
                <p>
                  People Who Inspire was born from a simple but powerful belief: every individual
                  carries a story that could change someone else's life — if only the world had the
                  right space to hear it. Emmanuel created that space. Every Saturday at 7PM GMT, he
                  sits across from some of the world's most remarkable leaders — from doctors and
                  diplomats to entrepreneurs and educators — and invites them to speak their truth.
                </p>
                <p>
                  Since launching in March 2025, Emmanuel has hosted conversations with leaders
                  spanning 7+ countries across Africa, Europe, and the Americas. Each episode draws
                  viewers from across the globe — not for celebrity, but for substance.
                </p>
                <p>
                  His story is not finished. It is, like the platform he built, a story of someone who
                  inspires.
                </p>
              </div>
            </div>
            <aside className="pwi-card pwi-card-accent p-7">
              <span className="pwi-meta-pill">Host Notes</span>
              <h3 className="mt-5 font-serif text-2xl font-bold text-navy-900">
                Convening principles
              </h3>
              <div className="mt-6 space-y-4">
                {founderPrinciples.map((principle, index) => (
                  <div key={principle} className="flex gap-4 border-t border-navy-950/10 pt-4 first:border-t-0 first:pt-0">
                    <span className="pwi-number-badge h-10 min-w-10 text-base">0{index + 1}</span>
                    <p className="text-sm leading-6 text-gray-600">{principle}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Section 3 — Credentials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((c, index) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="pwi-card pwi-card-hover p-7 text-center"
              >
                <div className="pwi-icon-box mx-auto mb-5">
                  <c.icon className="text-xl" />
                </div>
                <h3 className="font-semibold text-navy-800 text-sm leading-snug mb-2">{c.label}</h3>
                <p className="text-gray-500 text-xs">{c.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Pull quote */}
      <section className="pwi-section-dark relative overflow-hidden py-24">
        <Watermark variant="africa" position="top-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FaQuoteLeft className="text-gold-400/40 text-4xl mx-auto mb-6" />
            <p className="font-serif text-2xl md:text-3xl font-bold text-white leading-snug mb-6">
              "Every person you meet is carrying a story that could change your life — if you take
              the time to listen."
            </p>
            <p className="text-gold-400 font-medium">— Emmanuel Mbansi, Founder</p>
          </div>
        </div>
      </section>

      {/* Section 5 — Connect */}
      <section className="pwi-soft-band py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="pwi-card grid gap-8 p-8 text-center md:p-10 lg:grid-cols-[1fr_auto] lg:text-left">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-800 mb-3">
                Connect with Emmanuel
              </h2>
              <p className="text-gray-500 max-w-xl">
                Reach out, follow the journey, or invite Emmanuel to convene a conversation.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
              <a
                href={FOUNDER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn pwi-btn-dark"
              >
                <FaLinkedinIn /> LinkedIn
              </a>
              <a
                href={FOUNDER.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn pwi-btn-dark"
              >
                <FaInstagram /> {FOUNDER.instagramHandle}
              </a>
              <a
                href={`mailto:${FOUNDER.email}`}
                className="pwi-btn pwi-btn-primary"
              >
                <FaEnvelope /> Email
              </a>
              <Link
                to="/our-guests"
                className="inline-flex items-center gap-2 px-6 py-3 text-navy-800 font-semibold hover:text-gold-600 transition-colors"
              >
                Hosted leaders <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
