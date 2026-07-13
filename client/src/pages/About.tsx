import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaBullseye,
  FaEye,
  FaHandsHelping,
  FaAward,
  FaGlobe,
  FaLightbulb,
  FaArrowRight,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { useSiteContent } from '../context/SiteContentContext';

const values = [
  {
    icon: FaBullseye,
    title: 'Purpose',
    description: 'We believe every individual has a unique calling. We help leaders discover and live out their purpose with clarity and conviction.',
  },
  {
    icon: FaAward,
    title: 'Excellence',
    description: 'We pursue the highest standards in everything we do, from our programs to our partnerships and community engagement.',
  },
  {
    icon: FaHandsHelping,
    title: 'Integrity',
    description: 'We build trust through transparency, honesty, and consistency in our actions, relationships, and communications.',
  },
  {
    icon: FaGlobe,
    title: 'Impact',
    description: 'We measure success by the positive change we create in communities and lives around the world.',
  },
  {
    icon: FaLightbulb,
    title: 'Collaboration',
    description: 'We believe in the power of working together, bridging cultures, and leveraging collective wisdom for greater outcomes.',
  },
  {
    icon: FaEye,
    title: 'Service',
    description: 'We lead by serving others, putting the needs of communities and emerging leaders at the center of all we do.',
  },
];

// Feedback §4.2: specific months + expanded descriptions. TODO: confirm exact dates with PWI.
const milestones = [
  {
    year: 'Mar 2025',
    title: 'PWI Founded',
    description:
      "People Who Inspire was established by Emmanuel Mbansi with a vision to give the world's most remarkable leaders a space to share the stories behind their impact. What began as an idea quickly became a movement.",
  },
  {
    year: 'Apr 2025',
    title: 'First Conversations',
    description:
      'The PWI Conversations series launched, streaming live every Saturday at 7PM GMT. Early episodes featured leaders from across Africa and the diaspora, setting the intimate, substance-first tone the platform is known for.',
  },
  {
    year: 'Jul 2025',
    title: 'Fellowship Hub Inaugurated',
    description:
      'PWI opened the Fellowship Hub for high-potential emerging leaders — pairing them with mentorship, project resources, and a global peer network to accelerate their impact.',
  },
  {
    year: 'Oct 2025',
    title: 'Global Expansion',
    description:
      'Conversations grew to span 7+ countries across Africa, Europe, and the Americas, drawing a worldwide audience and establishing PWI as a genuinely global leadership platform.',
  },
];

const operatingModel = [
  {
    label: 'Discover',
    title: 'Find leaders with substance',
    description: 'We look for people whose lived experience, discipline, and service can unlock courage in others.',
  },
  {
    label: 'Convene',
    title: 'Create rooms for honest dialogue',
    description: 'Live conversations, cohorts, and events give the community direct access to tested leadership wisdom.',
  },
  {
    label: 'Equip',
    title: 'Turn inspiration into practice',
    description: 'Programs, mentorship, and project support help emerging leaders move from intention to action.',
  },
  {
    label: 'Amplify',
    title: 'Share stories that travel',
    description: 'PWI keeps the lessons visible through media, archives, partnerships, and community storytelling.',
  },
];

export default function AboutPage() {
  const { images } = useSiteContent();

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={<>Our Story &amp; <span className="text-gold-400">Mission</span></>}
        description="People Who Inspire is more than an organization. It is a movement of purpose-driven leaders dedicated to transforming communities and building a better world."
        image={images.aboutLeadership}
        imageAlt="A leadership team collaborating in a bright workspace"
        icon={FaBullseye}
        stats={[
          { value: '2025', label: 'Founded' },
          { value: 'Weekly', label: 'Conversations' },
          { value: '7+', label: 'Countries' },
          { value: 'PWI', label: 'Community' },
        ]}
      />

      {/* Mission Section */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="contours" position="bottom-left" opacity={0.04} className="h-auto w-[34rem]" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-gold-400 text-sm font-semibold tracking-[0.2em] uppercase">
                Our Mission
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mt-3 mb-6">
                Empowering Leaders to Create Lasting Change
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Founded by Emmanuel Mbansi, People Who Inspire (PWI) was born from a deep
                conviction that every individual has the potential to lead with purpose and
                create meaningful impact in their sphere of influence.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our platform identifies, connects, equips, and empowers purpose-driven
                leaders across the globe. Through our innovative programs, mentorship
                initiatives, and vibrant community, we are building a generation of leaders
                who lead with integrity, excellence, and a heart for service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From intimate conversations with world-class leaders to immersive fellowship
                programs, every PWI experience is designed to unlock potential, foster
                collaboration, and drive sustainable impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="pwi-panel-dark p-10 text-white"
            >
              <h3 className="font-serif text-2xl font-bold mb-6 text-gold-400">
                Our Vision
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg mb-8">
                To be the leading global platform for purpose-driven leaders, creating a world
                where inspired individuals lead with integrity, excellence, and a commitment to
                positive impact in every community they serve.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '50+', label: 'Countries' },
                  { value: '1000+', label: 'Leaders' },
                  { value: '100+', label: 'Programs' },
                  { value: '25+', label: 'Partners' },
                ].map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-gold-400 font-serif">{stat.value}</div>
                    <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Operating model */}
      <section className="pwi-soft-band py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <span className="pwi-eyebrow text-gold-600">How PWI Works</span>
              <h2 className="mt-4 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
                A simple model for turning inspiration into visible leadership.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {operatingModel.map((item, index) => (
                <motion.article
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="pwi-card pwi-card-hover p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="pwi-meta-pill">{item.label}</span>
                    <span className="font-serif text-3xl font-bold text-navy-950/15">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-500">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder (feedback §4.2 / §6) */}
      <section className="pwi-section-dark relative overflow-hidden py-24">
        <Watermark variant="africa" position="top-right" opacity={0.06} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Photo placeholder — TODO: Emmanuel headshot */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <div className="mx-auto flex aspect-[4/3] max-w-md items-center justify-center rounded-2xl border border-white/10 bg-navy-900">
                <div className="text-center">
                  <span className="block font-serif text-7xl font-bold text-gold-400">EM</span>
                  <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Founder & Executive Host
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <span className="text-gold-400 text-sm font-semibold tracking-[0.2em] uppercase">
                Meet the Founder
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-3 mb-6">
                Emmanuel Mbansi
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Emmanuel Mbansi is not simply the founder of People Who Inspire — he is its living
                proof of concept. An MBA graduate and Adiba Youth Leadership alumnus, he convenes a
                global conversation with remarkable leaders every Saturday at 7PM GMT.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                His journey is the most compelling example of "a person who inspires."
              </p>
              <Link
                to="/founder"
                className="pwi-btn pwi-btn-primary px-7 py-3.5"
              >
                Read His Story <FaArrowRight className="text-sm" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="Core Values"
            title="What Guides Us"
            description="Our values are the foundation of everything we do, shaping how we lead, serve, and create impact."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="pwi-card pwi-card-accent pwi-card-hover group p-8"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="pwi-icon-box transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-navy-950">
                    <value.icon className="text-xl" />
                  </div>
                  <span className="font-serif text-4xl font-bold text-navy-950/10">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-800 mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="radar" position="top-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="Our Journey"
            title="Milestones"
            description="Key moments in our journey of building a global leadership platform."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="pwi-card pwi-card-hover flex gap-5 p-6"
              >
                <div className="shrink-0">
                  <span className="flex min-w-24 justify-center rounded-lg bg-navy-950 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gold-300">
                    {milestone.year}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm leading-6 text-gray-500">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
