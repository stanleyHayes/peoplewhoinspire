import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface HeroAction {
  label: string;
  to?: string;
  href?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'dark';
}

interface HeroStat {
  value: string;
  label: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  icon?: IconType;
  actions?: HeroAction[];
  stats?: HeroStat[];
  meta?: ReactNode;
}

function actionClasses(variant: HeroAction['variant'] = 'primary') {
  if (variant === 'secondary') {
    return 'pwi-btn pwi-btn-ghost-light';
  }
  if (variant === 'dark') {
    return 'pwi-btn bg-white text-navy-950 shadow-lg shadow-navy-950/30 hover:bg-gold-100';
  }
  return 'pwi-btn pwi-btn-primary';
}

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  icon: Icon,
  actions = [],
  stats = [],
  meta,
}: PageHeroProps) {
  const hasPanel = stats.length > 0 || meta;

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pt-36 text-white md:pt-40">
      {/* Full-bleed photo */}
      <div className="absolute inset-0 -z-30 scale-[1.025]">
        <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>
      {/* Layered navy gradients for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,8,13,0.96) 0%, rgba(26,26,46,0.84) 44%, rgba(26,26,46,0.5) 100%),' +
            'linear-gradient(0deg, rgba(8,8,13,0.92) 0%, rgba(8,8,13,0.25) 42%, rgba(8,8,13,0.35) 100%)',
        }}
      />
      {/* Giant gold concentric ring bleeding off the edge */}
      <div
        aria-hidden="true"
        className="pwi-ring-decor absolute -bottom-28 -right-20 -z-10 hidden h-72 w-72 lg:block"
      />
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-24 -z-10 hidden text-[19rem] text-white/[0.05] lg:block"
        />
      )}

      <div className="container mx-auto px-4 pb-16 lg:px-8 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.62fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="pwi-eyebrow text-gold-300">{eyebrow}</span>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.02] text-white md:text-7xl lg:text-[5rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              {description}
            </p>
            {actions.length > 0 && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {actions.map((action) => {
                  const classes = actionClasses(action.variant);
                  if (action.href) {
                    return (
                      <a
                        key={action.label}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes}
                      >
                        {action.icon}
                        {action.label}
                      </a>
                    );
                  }
                  return (
                    <Link key={action.label} to={action.to || '/'} className={classes}>
                      {action.icon}
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {hasPanel && (
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="pwi-glass relative overflow-hidden rounded-2xl p-6 shadow-2xl shadow-navy-950/40 md:p-7"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                {eyebrow}
              </p>
              {meta && (
                <div className={stats.length > 0 ? 'mt-4 border-b border-white/10 pb-5' : 'mt-4'}>
                  {meta}
                </div>
              )}
              {stats.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/[0.07] p-4">
                      <div className="font-serif text-2xl font-bold text-gold-300">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/65">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-5 text-sm leading-6 text-white/65">{imageAlt}</p>
            </motion.aside>
          )}
        </div>
      </div>
    </section>
  );
}
