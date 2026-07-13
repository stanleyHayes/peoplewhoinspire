import { motion } from 'framer-motion';
import {
  FaRocket,
  FaUserGraduate,
  FaProjectDiagram,
  FaNetworkWired,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaCalendarCheck,
  FaHourglassHalf,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader';
import { FORMS } from '../config/site';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { IMAGES } from '../data/siteContent';

// Feedback §4.5: real cohort dates create urgency. TODO: confirm exact dates with PWI.
const cohort = {
  opens: 'Applications open · September 2026',
  deadline: 'Deadline · October 31, 2026',
};

const benefits = [
  {
    icon: FaUserGraduate,
    title: 'Mentorship',
    description: 'Personalized mentorship from seasoned leaders in your field of interest.',
  },
  {
    icon: FaProjectDiagram,
    title: 'Project Funding',
    description: 'Access to resources and funding for community impact projects.',
  },
  {
    icon: FaNetworkWired,
    title: 'Global Network',
    description: 'Join an exclusive network of high-potential leaders across the world.',
  },
  {
    icon: FaRocket,
    title: 'Accelerated Growth',
    description: 'Intensive development programs to fast-track your leadership journey.',
  },
];

const eligibility = [
  'Demonstrated commitment to purpose-driven leadership',
  'Active involvement in community service or social impact',
  'Strong track record of leadership in any field',
  'Willingness to commit to the full fellowship program duration',
  'Passion for collaboration and peer learning',
  'Alignment with PWI core values',
];

export default function FellowshipPage() {
  return (
    <>
      <PageHero
        eyebrow="Fellowship Hub"
        title={<>The PWI <span className="text-gold-400">Fellowship</span></>}
        description="An exclusive program for high-potential leaders ready to accelerate their impact through mentorship, resources, and a global community."
        image={IMAGES.fellowshipCohort}
        imageAlt="A leadership cohort in a workshop setting"
        icon={FaRocket}
        actions={[
          {
            label: 'Apply Now',
            to: FORMS.fellowshipApplicationUrl,
            icon: <FaArrowRight />,
          },
        ]}
        meta={
          <div className="mb-5 space-y-3">
            <span className="flex items-center gap-2 text-sm text-gold-300">
              <FaCalendarCheck className="text-gold-400" /> {cohort.opens}
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-300">
              <FaHourglassHalf className="text-gold-400" /> {cohort.deadline}
            </span>
          </div>
        }
      />

      {/* Benefits */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="contours" position="bottom-right" opacity={0.04} className="h-auto w-[34rem]" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="Why Join"
            title="Fellowship Benefits"
            description="Our fellowship provides a comprehensive suite of resources designed to accelerate your leadership journey."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="pwi-card pwi-card-accent pwi-card-hover group p-8"
              >
                <div className="mb-7 flex items-start justify-between">
                  <div className="pwi-icon-box transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-navy-950">
                    <benefit.icon className="text-xl" />
                  </div>
                  <span className="font-serif text-4xl font-bold text-navy-950/10">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-navy-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="relative overflow-hidden bg-gray-50 py-24">
        <Watermark variant="radar" position="top-left" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-gold-400 text-sm font-semibold tracking-[0.2em] uppercase">
                Eligibility
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800 mt-3 mb-6">
                Who Should Apply?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                The PWI Fellowship is designed for emerging and established leaders who are
                committed to making a lasting impact. We look for individuals who embody our
                core values and demonstrate a genuine passion for purpose-driven leadership.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {eligibility.map((item) => (
                  <li key={item} className="pwi-check-row">
                    <FaCheckCircle className="text-gold-400 mt-1 shrink-0" />
                    <span className="text-sm leading-6 text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="pwi-panel-dark p-10 text-white"
            >
              <FaStar className="text-white/20 text-6xl mb-6" />
              <h3 className="font-serif text-2xl font-bold mb-4">Application Process</h3>
              <div className="grid gap-4">
                {[
                  { step: '01', title: 'Submit Application', desc: 'Complete the online application form with your background and vision.' },
                  { step: '02', title: 'Review & Shortlisting', desc: 'Our team reviews applications and shortlists candidates.' },
                  { step: '03', title: 'Interview', desc: 'Selected candidates participate in a virtual interview.' },
                  { step: '04', title: 'Selection & Onboarding', desc: 'Successful fellows are welcomed into the program.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                      <span className="font-bold text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-white/70 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
