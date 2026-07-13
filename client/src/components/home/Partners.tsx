import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaGlobe,
  FaExternalLinkAlt,
  FaHandshake,
  FaArrowRight,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import api from '../../services/api';

const fallbackPartners = [
  { name: 'Tony Blair Institute', description: 'Global organization supporting governments in delivering change for their people.' },
  { name: 'African Leadership Academy', description: 'Developing the next generation of African leaders.' },
  { name: 'Mandela Washington Fellowship', description: 'Empowering young African leaders through academic and leadership training.' },
  { name: 'Global Shapers Community', description: 'Young people working together to address local and global challenges.' },
  { name: 'Ashoka Foundation', description: 'The world\'s largest network of social entrepreneurs.' },
  { name: 'United Nations Youth Envoy', description: 'Advocating for the needs and rights of young people globally.' },
];

interface Partner {
  _id?: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>(fallbackPartners);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await api.get('/partners');
        const data: Partner[] = response.data;
        const filtered = data
          .filter((p) => p.featured !== false && p.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (filtered.length > 0) {
          setPartners(filtered);
        }
      } catch {
        // Keep fallback
      }
    };
    fetchPartners();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="Our Network"
          title="Organizations That Inspire Us"
          description="We're inspired by — and aspire to collaborate with — forward-thinking organizations committed to developing the next generation of global leaders."
        />

        {/* Partner Marquee Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-16 overflow-hidden bg-navy-950 px-4 py-6"
        >
          {/* Fade edges */}
          <div className="absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-navy-950 to-transparent" />
          <div className="absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-navy-950 to-transparent" />

          {/* Scrolling content */}
          <div className="flex animate-marquee gap-12 items-center">
            {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner._id || partner.name}-${i}`}
                  className="flex items-center gap-3 shrink-0"
                >
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-8 w-auto object-contain brightness-0 invert opacity-80"
                    />
                  ) : (
                    <>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-400/30 bg-white/10 shadow-sm">
                        <span className="text-sm font-bold text-gold-300">
                          {partner.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        {partner.name}
                      </span>
                    </>
                  )}
                  <span className="text-white/20 mx-4">|</span>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Partner Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
              <motion.div
                key={partner._id || partner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative"
              >
                <div className="h-full overflow-hidden border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl">
                  {/* Top gradient bar */}
                  <div className="h-1.5 bg-gold-400" />

                  <div className="p-7">
                    {/* Logo / Initial */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-950 shadow-lg transition-transform duration-300 group-hover:scale-105">
                            <span className="text-lg font-bold text-gold-300">
                              {partner.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif font-bold text-navy-800 text-lg leading-snug">
                            {partner.name}
                          </h3>
                        </div>
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-gray-300 hover:text-gold-500 hover:bg-gold-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FaExternalLinkAlt className="text-sm" />
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    {partner.description && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-5">
                        {partner.description}
                      </p>
                    )}

                    {/* Bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FaHandshake className="text-sm" />
                        <span className="text-xs font-medium">Inspiration network</span>
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-gold-500 hover:text-gold-600 transition-colors"
                        >
                          Visit
                          <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center gap-3 border border-gray-200 bg-white px-8 py-5 shadow-sm sm:flex-row">
            <FaGlobe className="text-gold-400" />
            <span className="text-gray-500 text-sm">
              Interested in partnering with PWI?
            </span>
            <Link
              to="/contact"
              className="text-sm font-semibold text-navy-800 hover:text-gold-500 transition-colors flex items-center gap-1"
            >
              Get in Touch <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
