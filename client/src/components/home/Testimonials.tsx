import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import api from '../../services/api';

// Feedback §3.3: no fake/placeholder testimonials. This section only renders REAL,
// active testimonials added via the admin CMS — and hides itself entirely when there
// are none ("even 2 real ones beat any number of fake ones").

interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  image?: string;
  rating: number;
  featured?: boolean;
  active?: boolean;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/testimonials');
        const data: Testimonial[] = response.data;
        // Filter to only featured and active testimonials, limit to 3
        const filtered = data
          .filter((t) => t.featured !== false && t.active !== false)
          .slice(0, 3);
        setTestimonials(filtered);
      } catch {
        // No testimonials — section stays hidden
      }
    };
    fetchTestimonials();
  }, []);

  // Hide the section entirely until real testimonials exist (feedback §3.3).
  if (testimonials.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24">
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <SectionHeader
          subtitle="Testimonials"
          title="Voices of Impact"
          description="Hear from leaders who have been transformed through our programs and community."
          light
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/40"
            >
              <FaQuoteLeft className="text-gold-400/40 text-3xl mb-4" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <FaStar key={i} className="text-gold-400 text-sm" />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center">
                    <span className="text-gold-400 font-semibold text-sm">
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-gray-400 text-xs">
                    {testimonial.role}, {testimonial.organization}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
