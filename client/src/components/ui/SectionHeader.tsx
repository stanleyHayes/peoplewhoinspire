import { motion } from 'framer-motion';

interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  light?: boolean;
  centered?: boolean;
}

export default function SectionHeader({
  subtitle,
  title,
  description,
  light = false,
  centered = true,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-14 ${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}
    >
      {subtitle && (
        <span
          className={`mb-4 inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] ${
            light ? 'text-gold-300' : 'text-navy-800'
          }`}
        >
          <span className="h-0.5 w-8 rounded-full bg-gold-400" />
          {subtitle}
          {centered && <span className="h-0.5 w-8 rounded-full bg-gold-400" />}
        </span>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight ${
          light ? 'text-white' : 'text-navy-800'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`max-w-2xl text-lg leading-relaxed ${centered ? 'mx-auto' : ''} ${
            light ? 'text-white/75' : 'text-gray-600'
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
