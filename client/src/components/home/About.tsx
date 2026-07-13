import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import { IMAGES } from '../../data/siteContent';

const values = [
  { title: 'Purpose', description: 'Living and leading with intentionality' },
  { title: 'Excellence', description: 'Pursuing the highest standards in all we do' },
  { title: 'Integrity', description: 'Building trust through transparency and honesty' },
  { title: 'Impact', description: 'Creating lasting positive change in communities' },
  { title: 'Collaboration', description: 'Achieving more together than apart' },
  { title: 'Service', description: 'Putting others first in leadership' },
];

export default function About() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="Who We Are"
          title="About People Who Inspire"
          description="Founded by Emmanuel Mbansi, PWI is a global platform dedicated to nurturing purpose-driven leaders who transform their communities and the world."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="pwi-image-panel min-h-[420px]"
          >
            <img
              src={IMAGES.aboutLeadership}
              alt="Purpose-driven leaders collaborating around a table"
            />
            <div className="absolute inset-x-5 bottom-5 z-10 grid grid-cols-2 gap-3 text-white">
              <div className="border-l border-gold-400 bg-navy-950/75 p-4 backdrop-blur-sm">
                <p className="font-serif text-2xl font-bold">Mar 2025</p>
                <p className="text-xs uppercase tracking-wide text-gold-300">Founded</p>
              </div>
              <div className="border-l border-gold-400 bg-navy-950/75 p-4 backdrop-blur-sm">
                <p className="font-serif text-2xl font-bold">7+</p>
                <p className="text-xs uppercase tracking-wide text-gold-300">Countries</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="pwi-panel-dark p-8 text-white md:p-10">
              <FaQuoteLeft className="mb-6 text-4xl text-gold-400/40" />
              <p className="text-lg leading-8 md:text-xl">
                "We believe that every individual has the potential to inspire change. Our mission
                is to identify, connect, and empower these leaders to reach their full potential."
              </p>
              <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400">
                  <span className="font-serif font-bold text-navy-950">EM</span>
                </div>
                <div>
                  <p className="font-semibold">Emmanuel Mbansi</p>
                  <p className="text-sm text-gold-300">Founder, People Who Inspire</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-serif text-2xl font-bold text-navy-800">Our Vision</h3>
              <p className="leading-7 text-gray-600">
                To be the leading global platform for purpose-driven leaders, creating a world
                where inspired individuals lead with integrity, excellence, and a commitment to
                positive impact.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group border border-gray-200 p-5 transition-all duration-300 hover:border-gold-400 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 transition-colors duration-300 group-hover:bg-gold-400">
                    <span className="text-gold-600 font-bold text-sm group-hover:text-navy-900 transition-colors duration-300">
                      {value.title[0]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-navy-800 mb-1">{value.title}</h4>
                  <p className="text-sm text-gray-500">{value.description}</p>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
            >
              Learn More About PWI <FaArrowRight className="text-xs" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
