import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { IMAGES } from '../../data/siteContent';
import { Skeleton } from '../ui/Skeleton';

export default function CTA() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    try {
      await api.post('/subscribers', { email, name });
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
    <section className="bg-[#f7f5ef] py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid overflow-hidden bg-navy-950 shadow-2xl shadow-navy-950/20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pwi-image-panel min-h-[320px] lg:min-h-full">
            <img src={IMAGES.communityStudy} alt="Purpose-driven leaders working together" />
          </div>

          <div className="relative z-10 px-8 py-16 md:px-14 lg:px-16">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pwi-eyebrow mb-4 text-gold-400"
              >
                Join the Movement
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mb-6 font-serif text-3xl font-bold text-white md:text-5xl"
              >
                Ready to Make Your <span className="text-gold-400">Impact</span>?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-10 max-w-xl text-lg leading-8 text-gray-300"
              >
                Join thousands of purpose-driven leaders who are transforming communities
                worldwide. Subscribe to stay updated on programs, events, and opportunities.
              </motion.p>

              {/* Newsletter Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubscribe}
                className="mb-8 grid max-w-2xl gap-3 sm:grid-cols-[160px_1fr_auto]"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg border border-white/20 bg-white/10 px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="rounded-lg border border-white/20 bg-white/10 px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-gold-400 px-8 py-4 font-semibold text-navy-950 shadow-lg transition-all duration-300 hover:bg-gold-300 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Skeleton tone="gold" className="h-5 w-24" /> : 'Subscribe'}
                </button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium transition-colors"
                >
                  Or get in touch with us directly
                  <FaArrowRight className="text-sm" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
