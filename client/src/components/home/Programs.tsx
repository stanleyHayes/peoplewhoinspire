import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaComments,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaHandshake,
  FaUsers,
  FaArrowRight,
} from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import { PROGRAM_VISUALS } from '../../data/siteContent';

const programs = [
  {
    key: 'conversations',
    icon: FaComments,
    title: 'PWI Conversations',
    description:
      'Intimate dialogue sessions featuring influential leaders sharing their journeys, insights, and wisdom on purpose-driven leadership and impact.',
    link: '/conversations',
  },
  {
    key: 'mentorship',
    icon: FaGraduationCap,
    title: 'Leadership & Mentorship',
    description:
      'Structured mentorship programs pairing emerging leaders with seasoned mentors who guide their personal and professional growth journey.',
    link: '/programs',
  },
  {
    key: 'masterclasses',
    icon: FaChalkboardTeacher,
    title: 'Masterclasses',
    description:
      'Expert-led intensive sessions on critical leadership skills including strategic thinking, communication, innovation, and social impact.',
    link: '/programs',
  },
  {
    key: 'fellowship',
    icon: FaHandshake,
    title: 'Fellowship Hub',
    description:
      'An exclusive fellowship program for high-potential leaders, providing resources, networking, and hands-on project experience.',
    link: '/fellowship',
  },
  {
    key: 'community',
    icon: FaUsers,
    title: 'Community',
    description:
      'A vibrant global community of purpose-driven individuals who collaborate, share resources, and support each other\'s leadership journeys.',
    link: '/programs',
  },
] as const;

export default function Programs() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="Our Programs"
          title="Pathways to Impact"
          description="Discover our comprehensive suite of programs designed to develop, connect, and empower the next generation of global leaders."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link to={program.link} className="block h-full">
                <div className="h-full overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl">
                  <div className="pwi-image-panel h-48 min-h-0">
                    <img
                      src={PROGRAM_VISUALS[program.key].image}
                      alt={PROGRAM_VISUALS[program.key].imageAlt}
                    />
                    <div className="absolute left-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-navy-950/85 backdrop-blur-sm">
                      <program.icon className="text-lg text-gold-400" />
                    </div>
                  </div>

                  <div className={`border-l-4 ${PROGRAM_VISUALS[program.key].accent} p-6`}>
                    <h3 className="mb-3 font-serif text-xl font-bold text-navy-800">
                      {program.title}
                    </h3>
                    <p className="mb-6 leading-7 text-gray-500">{program.description}</p>

                    <div className="flex items-center gap-2 text-sm font-semibold text-gold-600 group-hover:text-gold-700">
                      Learn More
                      <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
