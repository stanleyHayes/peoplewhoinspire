import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaComments,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaHandshake,
  FaUsers,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { PROGRAM_VISUALS } from '../data/siteContent';
import { PROGRAM_IMAGE_KEYS } from '../config/editableContent';
import { useSiteContent } from '../context/SiteContentContext';

const programs = [
  {
    key: 'conversations',
    icon: FaComments,
    title: 'PWI Conversations',
    description:
      'Intimate and powerful dialogue sessions featuring influential leaders from diverse fields sharing their journeys, insights, and wisdom on purpose-driven leadership.',
    features: [
      'Weekly live sessions with global leaders',
      'Interactive Q&A with speakers',
      'Recorded sessions for on-demand access',
      'Networking opportunities with attendees',
    ],
    link: '/conversations',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    key: 'mentorship',
    icon: FaGraduationCap,
    title: 'Leadership & Mentorship',
    description:
      'Structured mentorship programs that pair emerging leaders with seasoned mentors, providing personalized guidance for professional and personal development.',
    features: [
      'One-on-one mentorship matching',
      'Group mentoring cohorts',
      'Leadership assessment tools',
      'Progress tracking and milestones',
    ],
    link: '/programs',
    gradient: 'from-emerald-600 to-teal-700',
  },
  {
    key: 'masterclasses',
    icon: FaChalkboardTeacher,
    title: 'Masterclasses',
    description:
      'Expert-led intensive learning experiences covering critical leadership competencies from strategic thinking to innovation and social impact management.',
    features: [
      'Industry expert instructors',
      'Practical frameworks and tools',
      'Certificates of completion',
      'Peer learning and collaboration',
    ],
    link: '/programs',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    key: 'fellowship',
    icon: FaHandshake,
    title: 'Fellowship Hub',
    description:
      'An exclusive fellowship program designed for high-potential leaders, providing intensive development through resources, mentorship, and hands-on project experience.',
    features: [
      'Competitive selection process',
      'Funded project opportunities',
      'Access to exclusive resources',
      'Alumni network and support',
    ],
    link: '/fellowship',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    key: 'community',
    icon: FaUsers,
    title: 'Community',
    description:
      'A vibrant global community of purpose-driven individuals who collaborate, share resources, and support each other on their leadership journeys.',
    features: [
      'Online community platform',
      'Local chapter meetups',
      'Resource sharing library',
      'Collaborative projects',
    ],
    link: '/programs',
    gradient: 'from-cyan-600 to-blue-600',
  },
] as const;

export default function ProgramsPage() {
  const { images } = useSiteContent();

  return (
    <>
      <PageHero
        eyebrow="Our Programs"
        title={<>Pathways to <span className="text-gold-400">Impact</span></>}
        description="Discover programs designed to develop, connect, and empower purpose-driven leaders at every stage of their journey."
        image={images.programsWorkshop}
        imageAlt="A workshop session with people learning together"
        icon={FaGraduationCap}
        stats={[
          { value: '5', label: 'Core pathways' },
          { value: 'Live', label: 'Learning format' },
          { value: 'Global', label: 'Community' },
          { value: 'Impact', label: 'Outcome' },
        ]}
      />

      {/* Programs List */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="radar" position="top-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="What We Offer"
            title="Our Programs"
            description="Each program is thoughtfully designed to address a specific aspect of leadership development and community impact."
          />

          <div className="mb-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="pwi-panel-dark p-7 text-white md:p-8">
              <span className="pwi-eyebrow text-gold-300">Program Map</span>
              <h3 className="mt-4 font-serif text-3xl font-bold">
                Pick the room that matches your next leadership move.
              </h3>
              <p className="mt-4 leading-7 text-gray-300">
                PWI now reads less like a catalog and more like a progression: listen, learn,
                practice, belong, and build visible impact with people moving in the same direction.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {programs.slice(0, 4).map((program, index) => (
                <div key={program.title} className="pwi-card pwi-card-accent p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`pwi-icon-box bg-gradient-to-br ${program.gradient}`}>
                      <program.icon className="text-xl text-white" />
                    </div>
                    <span className="font-serif text-3xl font-bold text-navy-950/15">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-bold text-navy-900">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {program.features[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {programs.map((program, index) => (
              <motion.article
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="pwi-card grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.86fr)]"
              >
                <div className={`p-7 md:p-10 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <div className="mb-7 flex flex-wrap items-center gap-4">
                    <span className="pwi-number-badge">0{index + 1}</span>
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-navy-900">
                      <program.icon className="text-xl text-gold-400" />
                    </div>
                  </div>
                  <span className="pwi-eyebrow text-gold-500">PWI Pathway</span>
                  <h3 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
                    {program.title}
                  </h3>
                  <p className="mt-5 max-w-2xl leading-8 text-gray-600">
                    {program.description}
                  </p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {program.features.map((feature) => (
                      <li key={feature} className="pwi-check-row">
                        <FaCheckCircle className="text-gold-400 mt-1 shrink-0" />
                        <span className="text-sm leading-6 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={program.link}
                    className="pwi-btn pwi-btn-dark mt-8"
                  >
                    Learn More <FaArrowRight />
                  </Link>
                </div>

                <div className={index % 2 !== 0 ? 'lg:order-1' : ''}>
                  <div className={`pwi-image-panel h-full min-h-[340px] border-l-4 ${PROGRAM_VISUALS[program.key].accent}`}>
                    <img
                      src={(PROGRAM_IMAGE_KEYS[program.key] && images[PROGRAM_IMAGE_KEYS[program.key]]) || PROGRAM_VISUALS[program.key].image}
                      alt={PROGRAM_VISUALS[program.key].imageAlt}
                    />
                    <div className="absolute bottom-6 left-6 z-10 max-w-sm text-white">
                      <p className="text-xs font-bold uppercase tracking-wide text-gold-300">
                        {program.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-200">
                        Built for practical growth, meaningful connection, and visible community impact.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pwi-section-dark relative overflow-hidden py-24">
        <Watermark variant="africa" position="bottom-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Join our community of purpose-driven leaders and discover the program that is right for you.
            </p>
            <Link
              to="/contact"
              className="pwi-btn pwi-btn-primary px-8 py-4 text-lg"
            >
              Get Started <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
