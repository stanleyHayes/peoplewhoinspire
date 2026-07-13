import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaGlobeAfrica,
  FaHandshake,
  FaMicrophoneAlt,
  FaPlay,
  FaQuoteLeft,
  FaRocket,
  FaUsers,
  FaYoutube,
} from 'react-icons/fa';
import { CONTACT, LIVE_SESSION } from '../config/site';
import { PAST_GUESTS } from '../data/guests';
import {
  FALLBACK_POSTS,
  PROGRAM_VISUALS,
  getFallbackEvents,
} from '../data/siteContent';
import { PROGRAM_IMAGE_KEYS } from '../config/editableContent';
import { useSiteContent, type SiteImages } from '../context/SiteContentContext';
import api from '../services/api';
import type { Event as SiteEvent, Post } from '../types';
import { Reveal, Reveal3D } from '../components/motion/Reveal';
import { Skeleton } from '../components/ui/Skeleton';
import Watermark from '../components/ui/Watermark';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Constellation from '../components/ui/Constellation';

const proofPoints = [
  { numeric: PAST_GUESTS.length, suffix: '+', label: 'featured voices' },
  { numeric: 7, suffix: '+', label: 'countries represented' },
  { text: 'Sat', label: 'weekly live rhythm' },
  { text: '7PM', label: 'GMT on YouTube' },
];

const operatingPillars = [
  {
    icon: FaMicrophoneAlt,
    title: 'Surface real stories',
    description: 'We make leadership human through conversations with builders, creatives, public servants, and founders.',
  },
  {
    icon: FaHandshake,
    title: 'Create access',
    description: 'Programs and fellowship pathways turn inspiration into mentorship, structure, and practical community.',
  },
  {
    icon: FaGlobeAfrica,
    title: 'Connect across borders',
    description: 'PWI is built from Ghana for a global audience of emerging and established purpose-driven leaders.',
  },
  {
    icon: FaRocket,
    title: 'Move people to action',
    description: 'Every touchpoint points toward service, excellence, integrity, and measurable community impact.',
  },
];

const pathways = (images: SiteImages) => [
  {
    title: 'Watch the conversations',
    label: 'Weekly signal',
    description: 'Join the Saturday live room and learn from leaders who have done the work in public.',
    to: '/conversations',
    image: images[PROGRAM_IMAGE_KEYS.conversations],
    imageAlt: PROGRAM_VISUALS.conversations.imageAlt,
    icon: FaYoutube,
  },
  {
    title: 'Grow through programs',
    label: 'Practical pathways',
    description: 'Explore mentorship, masterclasses, and community experiences for purpose-led growth.',
    to: '/programs',
    image: images[PROGRAM_IMAGE_KEYS.mentorship],
    imageAlt: PROGRAM_VISUALS.mentorship.imageAlt,
    icon: FaBookOpen,
  },
  {
    title: 'Join the fellowship',
    label: 'Deeper formation',
    description: 'Step into a cohort designed for accountability, exposure, and hands-on leadership practice.',
    to: '/fellowship',
    image: images[PROGRAM_IMAGE_KEYS.fellowship],
    imageAlt: PROGRAM_VISUALS.fellowship.imageAlt,
    icon: FaUsers,
  },
];

const guestHighlights = PAST_GUESTS.slice(0, 6);

const postImageFallbacks = (images: SiteImages) => [
  {
    pattern: /community|mentorship|network|together/i,
    image: images.communityStudy,
  },
  {
    pattern: /conversation|youtube|guest|dialogue|story/i,
    image: images.conversationsTable,
  },
  {
    pattern: /fellowship|cohort|formation/i,
    image: images.fellowshipCohort,
  },
  {
    pattern: /program|masterclass|workshop|learning/i,
    image: images.programsWorkshop,
  },
  {
    pattern: /event|gathering|stage|live/i,
    image: images.eventsStage,
  },
  {
    pattern: /welcome|platform|launch|impact|leadership|purpose/i,
    image: images.heroConversation,
  },
];

const defaultPostImages = (images: SiteImages) => [
  images.heroConversation,
  images.communityStudy,
  images.conversationsTable,
];

function getPostCardImage(images: SiteImages, post: Post, index: number) {
  if (post.coverImage || post.image) return post.coverImage || post.image;

  const searchable = [
    post.category,
    post.title,
    post.excerpt,
    ...(post.tags || []),
  ].join(' ');

  const fallbacks = defaultPostImages(images);
  return (
    postImageFallbacks(images).find((fallback) => fallback.pattern.test(searchable))?.image ||
    fallbacks[index % fallbacks.length]
  );
}

function formatEventDate(event: SiteEvent) {
  const date = new Date(event.date);
  return date.toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Home() {
  const { images, social } = useSiteContent();
  const [featuredEvent, setFeaturedEvent] = useState<SiteEvent>(() => getFallbackEvents()[0]);
  const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS.slice(0, 3));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLandingContent = async () => {
      try {
        const [eventsResponse, postsResponse] = await Promise.allSettled([
          api.get<SiteEvent[]>('/events'),
          api.get<Post[]>('/posts'),
        ]);

        if (eventsResponse.status === 'fulfilled') {
          const now = new Date();
          const upcoming = eventsResponse.value.data
            .filter((event) => event.active !== false && new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

          if (upcoming) {
            setFeaturedEvent(upcoming);
          }
        }

        if (postsResponse.status === 'fulfilled') {
          const published = postsResponse.value.data
            .filter((post) => post.published !== false)
            .sort((a, b) => Number(b.featured) - Number(a.featured))
            .slice(0, 3);

          if (published.length > 0) {
            setPosts(published);
          }
        }
      } catch {
        // Fallback content already seeded.
      }
    };

    fetchLandingContent();
  }, []);

  const featuredGuests = useMemo(
    () => guestHighlights.filter((guest) => !guest.title.includes('[Confirm')),
    [],
  );

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      await api.post('/subscribers', { name, email });
      toast.success('Welcome to the PWI community!');
      setName('');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero — full-bleed photo, layered navy gradients, glass card */}
      <section className="relative isolate overflow-hidden bg-navy-950 pt-36 text-white md:pt-44">
        <div className="absolute inset-0 -z-30 scale-[1.025]">
          <img
            src={images.heroConversation}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{
            background:
              'linear-gradient(90deg, rgba(8,8,13,0.97) 0%, rgba(26,26,46,0.86) 42%, rgba(26,26,46,0.52) 100%),' +
              'linear-gradient(0deg, rgba(8,8,13,0.95) 0%, rgba(8,8,13,0.2) 45%, rgba(8,8,13,0.4) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pwi-ring-decor absolute -bottom-24 -right-16 -z-10 hidden h-80 w-80 lg:block"
        />
        <FaGlobeAfrica
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-28 -z-10 hidden text-[20rem] text-white/[0.05] lg:block"
        />

        <div className="container mx-auto px-4 pb-16 lg:px-8 lg:pb-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)] lg:items-end">
            <div className="max-w-3xl">
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="pwi-eyebrow text-gold-300"
              >
                Global leadership and impact platform
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="mt-6 font-serif text-5xl font-bold leading-[1.02] text-white md:text-7xl lg:text-[5.4rem]"
              >
                Stories that move leaders from inspiration to action.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="mt-7 max-w-2xl text-lg leading-8 text-white/80 md:text-xl"
              >
                People Who Inspire connects purpose-driven leaders through weekly conversations,
                practical programs, and a global community built for meaningful change.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-9 flex flex-col gap-4 sm:flex-row"
              >
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pwi-btn pwi-btn-primary px-8 py-4 text-base"
                >
                  <FaYoutube aria-hidden="true" />
                  Watch Saturday Live
                </a>
                <Link
                  to="/programs"
                  className="pwi-btn pwi-btn-ghost-light px-8 py-4 text-base"
                >
                  Explore the pathways
                  <FaArrowRight className="text-xs" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>

            {/* Glass "next conversation" card */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pwi-glass relative overflow-hidden rounded-2xl p-3 shadow-2xl shadow-navy-950/50"
            >
              <div className="rounded-xl bg-navy-950/85 p-6 md:p-7">
                <div className="flex items-center gap-2">
                  <span className="pwi-pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-gold-400" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                    Next conversation
                  </p>
                </div>
                <h2 className="mt-3 font-serif text-2xl font-bold text-white">
                  {featuredEvent.title}
                </h2>
                <div className="mt-5 grid gap-3 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gold-400" aria-hidden="true" />
                    {formatEventDate(featuredEvent)} · {LIVE_SESSION.schedule}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaPlay className="text-gold-400" aria-hidden="true" />
                    YouTube live room with replay access
                  </span>
                </div>
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pwi-btn pwi-btn-primary mt-6 w-full"
                >
                  <FaYoutube aria-hidden="true" />
                  Set a reminder
                </a>
              </div>
            </motion.aside>
          </div>

          {/* Proof strip with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.38 }}
            className="pwi-glass mt-14 grid rounded-2xl sm:grid-cols-2 lg:grid-cols-4"
          >
            {proofPoints.map((point) => (
              <div key={point.label} className="border-white/10 p-6 sm:border-r last:border-r-0">
                <p className="font-serif text-4xl font-bold text-white">
                  {'numeric' in point && point.numeric !== undefined ? (
                    <AnimatedCounter value={point.numeric} suffix={point.suffix} />
                  ) : (
                    point.text
                  )}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gold-300">
                  {point.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What PWI does */}
      <section className="relative overflow-hidden bg-[#f7f5ef] py-20 md:py-28">
        <Watermark variant="radar" position="top-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="pwi-eyebrow text-gold-500">What PWI does</span>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy-900 md:text-5xl">
                A platform for people already carrying something meaningful.
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                PWI gives emerging and established leaders a place to hear honest stories,
                sharpen their language, meet aligned people, and turn conviction into visible
                work.
              </p>
              <Link to="/about" className="pwi-btn pwi-btn-dark mt-8">
                Understand the mission
                <FaArrowRight className="text-xs" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {operatingPillars.map((pillar, index) => (
                <Reveal3D key={pillar.title} delay={index * 0.08} className="h-full">
                  <article className="pwi-card pwi-card-accent pwi-card-hover group h-full p-7">
                    <div className="mb-7 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-gold-400 transition-colors group-hover:bg-gold-400 group-hover:text-navy-950">
                        <pillar.icon aria-hidden="true" />
                      </div>
                      <span className="font-serif text-5xl font-bold text-gray-100">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-navy-900">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{pillar.description}</p>
                  </article>
                </Reveal3D>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pathways — image cards with floating gold icon chip */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <Watermark variant="contours" position="bottom-right" opacity={0.04} className="h-auto w-[34rem]" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="pwi-eyebrow text-gold-500">Choose your door in</span>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-navy-900 md:text-5xl">
                Watch, grow, or join a cohort. Start where momentum already exists.
              </h2>
            </div>
            <Link to="/programs" className="pwi-btn pwi-btn-outline">
              View all programs
              <FaArrowRight className="text-xs" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pathways(images).map((pathway, index) => (
              <Reveal3D key={pathway.title} delay={index * 0.1} className="h-full">
                <article className="pwi-card pwi-card-hover group h-full">
                  <Link to={pathway.to} className="flex h-full flex-col">
                    <div className="relative h-56 shrink-0 overflow-hidden">
                      <img
                        src={pathway.image}
                        alt={pathway.imageAlt}
                        className="pwi-zoom-img h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/35 to-transparent" />
                    </div>
                    <div className="relative -mt-7 ml-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-xl text-navy-950 shadow-[0_12px_24px_-8px_rgba(212,168,67,0.55)]">
                      <pathway.icon aria-hidden="true" />
                    </div>
                    <div className="flex flex-1 flex-col p-7 pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                        {pathway.label}
                      </p>
                      <h3 className="mt-3 font-serif text-2xl font-bold text-navy-900">
                        {pathway.title}
                      </h3>
                      <p className="mt-3 flex-1 leading-7 text-gray-600">{pathway.description}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 group-hover:text-gold-600">
                        Step inside
                        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* The Saturday room */}
      <section className="pwi-section-dark relative overflow-hidden py-20 text-white md:py-28">
        <Watermark variant="africa" position="top-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="pwi-eyebrow text-gold-300">The Saturday room</span>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                A weekly space where impact gets a voice.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/75">
                PWI Conversations is the heartbeat of the platform: a live, accessible rhythm
                where leaders tell the truth about the work, not just the highlight reel.
              </p>
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="pwi-btn pwi-btn-primary mt-8"
              >
                <FaYoutube aria-hidden="true" />
                Watch on YouTube
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featuredGuests.map((guest, index) => (
                <Reveal key={guest.name} delay={index * 0.06} className="h-full">
                  <div className="pwi-glass h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/40">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-navy-950">
                      {guest.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">{guest.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{guest.title}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gold-300">
                      {guest.country}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Field notes */}
      <section className="relative overflow-hidden bg-[#f7f5ef] py-20 md:py-28">
        <Watermark variant="radar" position="bottom-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <div className="pwi-panel-dark relative overflow-hidden rounded-2xl p-8 text-white md:p-10">
              <Constellation className="absolute -right-16 -top-10 h-72 w-96" opacity={0.4} />
              <div className="relative z-10 flex min-h-[400px] flex-col justify-between">
                <div>
                  <span className="pwi-eyebrow text-gold-300">Field notes</span>
                  <h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                    The ideas behind the movement.
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
                    Stories, reflections, and leadership notes give the community language for
                    the work they are already trying to build.
                  </p>
                </div>
                <Link
                  to="/blog"
                  className="pwi-btn mt-8 w-fit bg-white text-navy-950 shadow-lg shadow-navy-950/30 hover:bg-gold-100"
                >
                  Read the stories
                  <FaArrowRight className="text-xs" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {posts.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="pwi-card pwi-card-hover group p-5"
                >
                  <Link to={`/blog/${post.slug}`} className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
                    <div className="relative h-36 overflow-hidden rounded-xl bg-navy-950">
                      <img
                        src={getPostCardImage(images, post, index)}
                        alt={post.title}
                        className="pwi-zoom-img h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                        {post.category}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold leading-snug text-navy-900">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="pwi-panel-dark relative grid overflow-hidden rounded-3xl shadow-2xl shadow-navy-950/15 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative min-h-[340px] overflow-hidden lg:min-h-full">
              <img
                src={images.communityStudy}
                alt="Purpose-driven leaders collaborating"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-navy-950/10 lg:bg-gradient-to-r" />
            </div>

            <div className="relative p-8 text-white md:p-12 lg:p-14">
              <Constellation className="absolute -right-10 top-0 h-64 w-80" opacity={0.35} />
              <div className="relative z-10">
                <FaQuoteLeft className="mb-6 text-4xl text-gold-400/35" aria-hidden="true" />
                <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
                  Join the people choosing purpose with structure.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
                  Subscribe for conversation reminders, program updates, and leadership notes from
                  the PWI community.
                </p>

                <div className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
                  {['Saturday reminders', 'Program openings', 'Community notes'].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <FaCheckCircle className="text-gold-400" aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>

                <form onSubmit={handleSubscribe} className="mt-9 grid gap-3 lg:grid-cols-[160px_1fr_auto]">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder-white/45 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-400/70"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email address"
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder-white/45 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-400/70"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="pwi-btn pwi-btn-primary px-7 py-3.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <Skeleton tone="gold" className="h-5 w-20" />
                    ) : (
                      <>
                        Join
                        <FaEnvelope className="text-xs" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300 transition-colors hover:text-gold-200"
                >
                  Prefer a direct conversation? Contact {CONTACT.email}
                  <FaArrowRight className="text-xs" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
