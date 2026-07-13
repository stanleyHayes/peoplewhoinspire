import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaPaperPlane,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CONTACT } from '../config/site';
import PageHero from '../components/ui/PageHero';
import { Skeleton } from '../components/ui/Skeleton';
import Watermark from '../components/ui/Watermark';
import { useSiteContent } from '../context/SiteContentContext';

export default function ContactPage() {
  const { images, social } = useSiteContent();
  const followLinks = [
    { icon: FaFacebookF, href: social.facebook, label: 'Facebook' },
    { icon: FaTwitter, href: social.twitter, label: 'Twitter' },
    { icon: FaInstagram, href: social.instagram, label: 'Instagram' },
    { icon: FaLinkedinIn, href: social.linkedin, label: 'LinkedIn' },
    { icon: FaYoutube, href: social.youtube, label: 'YouTube' },
    { icon: FaWhatsapp, href: CONTACT.whatsappUrl, label: 'WhatsApp' },
  ];

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contacts', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>Get in <span className="text-gold-400">Touch</span></>}
        description="Have questions about programs, partnerships, speaker nominations, or the Fellowship? We would love to hear from you."
        image={images.contactOffice}
        imageAlt="A professional team workspace"
        icon={FaEnvelope}
        stats={[
          { value: 'GMT', label: 'Timezone' },
          { value: '24-48h', label: 'Response' },
          { value: 'WhatsApp', label: 'Available' },
          { value: 'Global', label: 'Reach' },
        ]}
      />

      {/* Contact Form & Info */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="contours" position="bottom-right" opacity={0.04} className="h-auto w-[34rem]" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="pwi-panel-dark p-7 text-white md:p-8 lg:col-span-1"
            >
              <h2 className="font-serif text-2xl font-bold text-white mb-6">
                Contact Information
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Reach out to us through any of the channels below. Our team is ready to assist
                you with any inquiries about our programs, partnerships, or general questions.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="text-gray-300 hover:text-gold-300 transition-colors"
                    >
                      {CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">WhatsApp</h3>
                    <a
                      href={CONTACT.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gold-300 transition-colors"
                    >
                      Chat with us: {CONTACT.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-gray-300">{CONTACT.location}</p>
                    <p className="text-gray-400 text-sm mt-1">{CONTACT.timezoneNote}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                    <FaInstagram />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Social</h3>
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gold-300 transition-colors"
                    >
                      {social.instagramHandle}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {followLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-gold-300 transition-all duration-300 hover:bg-gold-400 hover:text-navy-950"
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2"
            >
              <div className="pwi-card p-8 md:p-10">
                <h2 className="font-serif text-2xl font-bold text-navy-800 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we will respond within 24-48 hours.
                </p>

                <div className="mb-8 grid gap-3 sm:grid-cols-3">
                  {['Programs', 'Partnerships', 'Speaker nominations'].map((item) => (
                    <div key={item} className="border border-navy-950/10 bg-[#fbfaf6] p-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-gold-600">
                        Best for
                      </span>
                      <p className="mt-1 text-sm font-semibold text-navy-900">{item}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Programs">Programs</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sponsorship">Sponsorship</option>
                      <option value="Media">Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="pwi-btn pwi-btn-dark px-8 py-4 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Skeleton tone="dark" className="h-5 w-32" />
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
