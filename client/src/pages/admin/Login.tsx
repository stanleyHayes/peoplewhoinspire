import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGlobeAfrica,
  FaHandshake,
  FaLightbulb,
  FaLock,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { PWIMonogram } from '../../components/ui/PWILogo';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { IMAGES } from '../../data/siteContent';

const inspiringQuotes = [
  {
    text: 'Your story matters, your leadership matters, and your contribution can change the world.',
    author: 'Emmanuel Mbansi',
  },
  {
    text: 'Leadership becomes visible when inspiration is translated into careful stewardship.',
    author: 'People Who Inspire',
  },
  {
    text: 'The work behind the platform should feel as intentional as the stories it carries.',
    author: 'PWI Admin',
  },
];

const stats = [
  { icon: FaGlobeAfrica, value: '7+', label: 'Countries' },
  { icon: FaUsers, value: '8+', label: 'Voices' },
  { icon: FaLightbulb, value: 'Weekly', label: 'Sessions' },
  { icon: FaHandshake, value: 'PWI', label: 'Community' },
];

const accessNotes = [
  'Editorial publishing',
  'Event operations',
  'Community messages',
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % inspiringQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputFrame = (field: string) =>
    `relative rounded-xl border bg-white transition-all duration-300 ${
      focusedField === field
        ? 'border-gold-400 shadow-[0_0_0_4px_rgba(212,168,67,0.15)]'
        : 'border-navy-950/10 hover:border-navy-950/25'
    }`;

  return (
    <main className="min-h-screen bg-[#f7f5ef] font-admin text-navy-950 lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-navy-950 p-8 text-white lg:flex xl:p-12">
        <img
          src={IMAGES.contactOffice}
          alt="Professional workspace for the PWI admin portal"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,8,13,0.98)_0%,rgba(15,15,26,0.92)_48%,rgba(26,26,46,0.72)_100%)]" />
        <div aria-hidden="true" className="pwi-ring-decor absolute -bottom-24 -right-16 h-72 w-72" />
        <div className="absolute left-0 top-0 h-full w-3 bg-gold-400" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <PWIMonogram size={52} />
              <div>
                <h1 className="font-serif text-2xl font-bold leading-none">
                  People Who Inspire
                </h1>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                  Admin portal
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              Public site
            </Link>
          </motion.div>

          <div className="max-w-3xl py-14">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="pwi-eyebrow text-gold-300"
            >
              Content command center
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mt-5 max-w-2xl font-serif text-5xl font-bold leading-[0.95] xl:text-7xl"
            >
              Steward the stories behind the movement.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-8 text-gray-300"
            >
              Manage conversations, events, posts, guests, messages, and the operational rhythm
              that keeps PWI useful to leaders around the world.
            </motion.p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="pwi-glass rounded-2xl p-5 shadow-2xl shadow-black/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="mb-5 h-1 w-16 bg-gold-400" />
                  <p className="font-serif text-2xl font-bold leading-snug text-white/95">
                    "{inspiringQuotes[quoteIndex].text}"
                  </p>
                  <p className="mt-4 text-sm font-semibold text-gold-300">
                    {inspiringQuotes[quoteIndex].author}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex gap-2">
                {inspiringQuotes.map((quote, i) => (
                  <button
                    key={quote.author}
                    type="button"
                    aria-label={`Show quote ${i + 1}`}
                    onClick={() => setQuoteIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === quoteIndex ? 'w-9 bg-gold-400' : 'w-5 bg-white/25 hover:bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.26 + i * 0.05 }}
                  className="pwi-glass rounded-xl p-4"
                >
                  <Icon className="mb-3 text-lg text-gold-300" />
                  <p className="font-serif text-2xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/50">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
        <div className="absolute left-0 top-0 h-full w-2 bg-gold-400 lg:hidden" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1a1a2e 1px, transparent 0)',
            backgroundSize: '30px 30px',
          }}
        />
        <FaShieldAlt
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-12 hidden text-[16rem] text-navy-950/[0.04] md:block"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 w-full max-w-[540px]"
        >
          <div className="mb-8 flex items-center justify-between gap-5 lg:hidden">
            <div className="flex items-center gap-3">
              <PWIMonogram size={48} />
              <div>
                <h1 className="font-serif text-xl font-bold text-navy-900">
                  People Who Inspire
                </h1>
                <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
                  Admin portal
                </p>
              </div>
            </div>
            <Link to="/" className="text-sm font-semibold text-navy-700 hover:text-gold-600">
              Public site
            </Link>
          </div>

          <div className="pwi-card">
            <div className="pwi-panel-dark border-b border-navy-950/10 p-6 text-white md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <span className="pwi-eyebrow text-gold-300">Secure access</span>
                  <h2 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl">
                    Sign in to PWI Admin
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-300">
                    Use your admin credentials to manage publishing, programs, events, and the
                    community inbox.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-navy-950 shadow-[0_10px_24px_-10px_rgba(212,168,67,0.6)]">
                  <FaLock aria-hidden="true" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-7">
              <div className="grid gap-3 sm:grid-cols-3">
                {accessNotes.map((note) => (
                  <div key={note} className="rounded-xl border border-navy-950/10 bg-[#fbfaf6] p-3">
                    <FaCheckCircle className="mb-2 text-sm text-gold-500" aria-hidden="true" />
                    <p className="text-xs font-semibold leading-5 text-navy-800">{note}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Email address
                </label>
                <div className={inputFrame('email')}>
                  <FaEnvelope
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      focusedField === 'email' ? 'text-gold-500' : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg bg-transparent py-4 pl-12 pr-4 text-navy-900 outline-none placeholder:text-gray-400"
                    placeholder="admin@peoplewhoinspire.global"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Password
                </label>
                <div className={inputFrame('password')}>
                  <FaLock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      focusedField === 'password' ? 'text-gold-500' : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg bg-transparent py-4 pl-12 pr-12 text-navy-900 outline-none placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-navy-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                      rememberMe
                        ? 'border-gold-400 bg-gold-400 text-navy-950'
                        : 'border-navy-950/20 bg-white text-transparent group-hover:border-gold-400'
                    }`}
                  >
                    <FaCheckCircle className="text-[11px]" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-gray-600">Remember this device</span>
                </label>

                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <FaClock className="text-gold-500" aria-hidden="true" />
                  Protected session
                </span>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-navy-950 px-6 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-14px_rgba(26,26,46,0.8)] transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Skeleton tone="dark" className="h-5 w-28" />
                ) : (
                  <>
                    Sign in
                    <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="border-t border-navy-950/10 bg-[#fbfaf6] px-6 py-5 md:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span>Authorized personnel only.</span>
                <span>People Who Inspire &copy; {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
