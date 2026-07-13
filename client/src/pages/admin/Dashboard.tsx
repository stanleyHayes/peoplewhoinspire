import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaDatabase,
  FaEnvelope,
  FaExclamationCircle,
  FaGlobe,
  FaHistory,
  FaImage,
  FaInbox,
  FaNewspaper,
  FaPencilAlt,
  FaPlus,
  FaStar,
  FaTasks,
  FaUserFriends,
  FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import type { DashboardStats } from '../../types';
import { AdminDashboardSkeleton } from '../../components/ui/Skeleton';

type Tone = 'navy' | 'gold' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';

type DashboardContent = NonNullable<DashboardStats['content']>;
type DashboardRecent = NonNullable<DashboardStats['recent']>;
type DashboardAudit = NonNullable<DashboardStats['audit']>;

interface BarPoint {
  label: string;
  value: number;
  detail: string;
  tone: Tone;
}

interface ActivityItem {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  date: string;
  link: string;
  tone: Tone;
}

const toneStyles: Record<
  Tone,
  {
    text: string;
    bg: string;
    soft: string;
    border: string;
    bar: string;
    track: string;
    gradient: string;
    ring: string;
  }
> = {
  navy: {
    text: 'text-navy-900',
    bg: 'bg-navy-950',
    soft: 'bg-navy-50 text-navy-900',
    border: 'border-navy-200',
    bar: 'bg-navy-900',
    track: 'bg-navy-950/10',
    gradient: 'from-navy-950 to-navy-700',
    ring: 'ring-navy-950/10',
  },
  gold: {
    text: 'text-gold-700',
    bg: 'bg-gold-400',
    soft: 'bg-gold-50 text-gold-700',
    border: 'border-gold-200',
    bar: 'bg-gold-400',
    track: 'bg-gold-400/15',
    gradient: 'from-gold-400 to-amber-500',
    ring: 'ring-gold-400/30',
  },
  blue: {
    text: 'text-blue-700',
    bg: 'bg-blue-600',
    soft: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
    bar: 'bg-blue-600',
    track: 'bg-blue-600/10',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/20',
  },
  emerald: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-600',
    soft: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200',
    bar: 'bg-emerald-600',
    track: 'bg-emerald-600/10',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    text: 'text-amber-700',
    bg: 'bg-amber-500',
    soft: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
    track: 'bg-amber-500/15',
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/20',
  },
  rose: {
    text: 'text-rose-700',
    bg: 'bg-rose-600',
    soft: 'bg-rose-50 text-rose-700',
    border: 'border-rose-200',
    bar: 'bg-rose-600',
    track: 'bg-rose-600/10',
    gradient: 'from-rose-500 to-red-600',
    ring: 'ring-rose-500/20',
  },
  violet: {
    text: 'text-violet-700',
    bg: 'bg-violet-600',
    soft: 'bg-violet-50 text-violet-700',
    border: 'border-violet-200',
    bar: 'bg-violet-600',
    track: 'bg-violet-600/10',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-500/20',
  },
  cyan: {
    text: 'text-cyan-700',
    bg: 'bg-cyan-600',
    soft: 'bg-cyan-50 text-cyan-700',
    border: 'border-cyan-200',
    bar: 'bg-cyan-600',
    track: 'bg-cyan-600/10',
    gradient: 'from-cyan-500 to-sky-600',
    ring: 'ring-cyan-500/20',
  },
};

const emptyContent: DashboardContent = {
  posts: { total: 0, published: 0, drafts: 0, featured: 0, withImages: 0 },
  programs: { total: 0, featured: 0, withImages: 0 },
  team: { total: 0, withImages: 0 },
  events: { total: 0, active: 0, upcoming: 0, past: 0, featured: 0, withImages: 0 },
  partners: { total: 0, active: 0, featured: 0, withLogos: 0 },
  testimonials: { total: 0, active: 0, featured: 0, withImages: 0 },
  subscribers: { total: 0, subscribed: 0, unsubscribed: 0 },
  contacts: { total: 0, unread: 0, replied: 0, pending: 0 },
};

const emptyRecent: DashboardRecent = {
  posts: [],
  events: [],
  contacts: [],
  auditLogs: [],
};

const emptyAudit: DashboardAudit = {
  total30d: 0,
  actions: {},
};

const emptyStats: DashboardStats = {
  posts: 0,
  programs: 0,
  team: 0,
  events: 0,
  partners: 0,
  testimonials: 0,
  subscribers: 0,
  contacts: 0,
  content: emptyContent,
  recent: emptyRecent,
  audit: emptyAudit,
};

const quickActions = [
  {
    label: 'New Story',
    desc: 'Draft a post or field note',
    link: '/admin/posts',
    icon: FaNewspaper,
    tone: 'blue' as const,
  },
  {
    label: 'Create Event',
    desc: 'Schedule the next session',
    link: '/admin/events',
    icon: FaCalendarAlt,
    tone: 'amber' as const,
  },
  {
    label: 'Review Inbox',
    desc: 'Reply to new messages',
    link: '/admin/contacts',
    icon: FaInbox,
    tone: 'rose' as const,
  },
  {
    label: 'Update Settings',
    desc: 'Profile, access, and help',
    link: '/admin/settings',
    icon: FaTasks,
    tone: 'navy' as const,
  },
];

function mergeStats(data: Partial<DashboardStats> = {}): DashboardStats {
  const incomingContent = data.content;
  const incomingRecent = data.recent;
  const incomingAudit = data.audit;

  return {
    ...emptyStats,
    ...data,
    content: {
      posts: { ...emptyContent.posts, ...incomingContent?.posts },
      programs: { ...emptyContent.programs, ...incomingContent?.programs },
      team: { ...emptyContent.team, ...incomingContent?.team },
      events: { ...emptyContent.events, ...incomingContent?.events },
      partners: { ...emptyContent.partners, ...incomingContent?.partners },
      testimonials: { ...emptyContent.testimonials, ...incomingContent?.testimonials },
      subscribers: { ...emptyContent.subscribers, ...incomingContent?.subscribers },
      contacts: { ...emptyContent.contacts, ...incomingContent?.contacts },
    },
    recent: {
      ...emptyRecent,
      ...incomingRecent,
    },
    audit: {
      ...emptyAudit,
      ...incomingAudit,
      actions: {
        ...emptyAudit.actions,
        ...incomingAudit?.actions,
      },
    },
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function barSize(value: number, total: number): number {
  const raw = percent(value, total);
  if (raw === 0 && value > 0) return 6;
  return raw;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'No date';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timeAgo(dateString?: string): string {
  if (!dateString) return 'Recently';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${toneStyles[tone].soft} ${toneStyles[tone].border}`}
    >
      {label}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  action?: { label: string; link: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-300">
          <Icon className="text-sm" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {eyebrow}
          </p>
          <h2 className="font-serif text-xl font-bold text-navy-900">{title}</h2>
        </div>
      </div>
      {action && (
        <Link
          to={action.link}
          className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2 text-sm font-semibold text-navy-900 transition-all hover:border-gold-300 hover:bg-gold-50"
        >
          {action.label}
          <FaArrowRight className="text-xs text-gold-500" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  link,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  detail: string;
  tone: Tone;
  link: string;
}) {
  return (
    <Link
      to={link}
      className={`group pwi-admin-card block rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-xl ${toneStyles[tone].ring}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${toneStyles[tone].gradient} text-white shadow-lg`}
        >
          <Icon className="text-sm" aria-hidden="true" />
        </span>
        <FaArrowRight
          className="text-xs text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gold-500"
          aria-hidden="true"
        />
      </div>
      <p className="font-serif text-3xl font-bold leading-none text-navy-900">
        {formatNumber(value)}
      </p>
      <p className="mt-2 text-sm font-semibold text-gray-700">{label}</p>
      <p className="mt-1 min-h-9 text-xs leading-5 text-gray-500">{detail}</p>
    </Link>
  );
}

function HorizontalBar({
  label,
  value,
  total,
  tone,
  detail,
}: {
  label: string;
  value: number;
  total: number;
  tone: Tone;
  detail: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-navy-900">{label}</p>
          <p className="text-xs text-gray-500">{detail}</p>
        </div>
        <span className="font-serif text-xl font-bold text-navy-900">{formatNumber(value)}</span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${toneStyles[tone].track}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barSize(value, total)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${toneStyles[tone].bar}`}
        />
      </div>
    </div>
  );
}

function VerticalBarChart({ points }: { points: BarPoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="pwi-admin-card rounded-2xl p-5">
      <SectionHeader icon={FaChartBar} eyebrow="Module volume" title="Content by Area" />
      <div className="flex h-64 items-end gap-3 border-b border-gray-200 pb-4 sm:gap-4">
        {points.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3">
            <div className="flex h-44 w-full items-end justify-center rounded-lg bg-gray-50 px-2 py-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barSize(point.value, maxValue)}%` }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className={`w-full max-w-14 rounded-t-lg ${toneStyles[point.tone].bar}`}
              />
            </div>
            <div className="w-full text-center">
              <p className="font-serif text-xl font-bold leading-none text-navy-900">
                {formatNumber(point.value)}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-gray-500">{point.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {points.slice(0, 3).map((point) => (
          <div key={point.detail} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
            <p className={`text-xs font-bold uppercase tracking-wide ${toneStyles[point.tone].text}`}>
              {point.label}
            </p>
            <p className="mt-1 text-sm text-gray-500">{point.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(() => mergeStats());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        setStats(mergeStats(response.data));
        setFetchError(false);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const content = stats.content ?? emptyContent;
  const recent = stats.recent ?? emptyRecent;
  const audit = stats.audit ?? emptyAudit;

  const totalRecords =
    stats.posts +
    stats.programs +
    stats.team +
    stats.events +
    stats.partners +
    stats.testimonials +
    stats.subscribers +
    stats.contacts;

  const editorialTotal = content.posts.total + content.programs.total + content.events.total;
  const communityTotal =
    content.team.total + content.partners.total + content.testimonials.total;
  const audienceTotal = content.subscribers.total + content.contacts.total;

  const assetPossible =
    content.posts.total +
    content.programs.total +
    content.team.total +
    content.events.total +
    content.partners.total +
    content.testimonials.total;
  const assetReady =
    content.posts.withImages +
    content.programs.withImages +
    content.team.withImages +
    content.events.withImages +
    content.partners.withLogos +
    content.testimonials.withImages;
  const assetGap = Math.max(assetPossible - assetReady, 0);

  const publishReadyTotal =
    content.posts.total +
    content.events.total +
    content.partners.total +
    content.testimonials.total;
  const publishReadyCount =
    content.posts.published +
    content.events.active +
    content.partners.active +
    content.testimonials.active;

  const readinessScore = Math.round(
    (percent(publishReadyCount, publishReadyTotal) +
      percent(assetReady, assetPossible) +
      percent(content.contacts.replied, content.contacts.total)) /
      3
  );

  const metricCards = [
    {
      icon: FaDatabase,
      label: 'Platform Records',
      value: totalRecords,
      detail: 'All managed content, people, subscribers, and messages.',
      tone: 'navy' as const,
      link: '/admin/dashboard',
    },
    {
      icon: FaNewspaper,
      label: 'Content Library',
      value: editorialTotal,
      detail: `${content.posts.published} posts live, ${content.events.upcoming} upcoming events.`,
      tone: 'blue' as const,
      link: '/admin/posts',
    },
    {
      icon: FaUsers,
      label: 'Community Proof',
      value: communityTotal,
      detail: `${content.partners.active} active partners and ${content.testimonials.active} testimonials.`,
      tone: 'violet' as const,
      link: '/admin/team',
    },
    {
      icon: FaUserFriends,
      label: 'Audience Signals',
      value: audienceTotal,
      detail: `${content.subscribers.subscribed} subscribed, ${content.contacts.pending} messages pending.`,
      tone: 'emerald' as const,
      link: '/admin/subscribers',
    },
    {
      icon: FaEnvelope,
      label: 'Unread Messages',
      value: content.contacts.unread,
      detail:
        content.contacts.unread > 0
          ? 'Fresh contact requests need review.'
          : 'Inbox is clear for now.',
      tone: content.contacts.unread > 0 ? ('rose' as const) : ('emerald' as const),
      link: '/admin/contacts',
    },
    {
      icon: FaHistory,
      label: 'Admin Actions',
      value: audit.total30d,
      detail: 'Tracked administrative activity over the last 30 days.',
      tone: 'gold' as const,
      link: '/admin/audit-logs',
    },
  ];

  const moduleBars: BarPoint[] = [
    {
      label: 'Posts',
      value: content.posts.total,
      detail: `${content.posts.published} published / ${content.posts.drafts} drafts`,
      tone: 'blue',
    },
    {
      label: 'Programs',
      value: content.programs.total,
      detail: `${content.programs.featured} featured`,
      tone: 'emerald',
    },
    {
      label: 'Events',
      value: content.events.total,
      detail: `${content.events.upcoming} upcoming / ${content.events.past} past`,
      tone: 'amber',
    },
    {
      label: 'People',
      value: content.team.total,
      detail: `${content.team.withImages} with portraits`,
      tone: 'violet',
    },
    {
      label: 'Partners',
      value: content.partners.total,
      detail: `${content.partners.active} active`,
      tone: 'rose',
    },
    {
      label: 'Audience',
      value: audienceTotal,
      detail: `${content.subscribers.subscribed} subscribers`,
      tone: 'cyan',
    },
  ];

  const pipelineBars = [
    {
      label: 'Published Posts',
      value: content.posts.published,
      total: Math.max(content.posts.total, 1),
      tone: 'blue' as const,
      detail: `${content.posts.drafts} drafts waiting`,
    },
    {
      label: 'Active Events',
      value: content.events.active,
      total: Math.max(content.events.total, 1),
      tone: 'amber' as const,
      detail: `${content.events.upcoming} upcoming dates`,
    },
    {
      label: 'Active Partners',
      value: content.partners.active,
      total: Math.max(content.partners.total, 1),
      tone: 'rose' as const,
      detail: `${content.partners.featured} featured`,
    },
    {
      label: 'Replied Messages',
      value: content.contacts.replied,
      total: Math.max(content.contacts.total, 1),
      tone: 'emerald' as const,
      detail: `${content.contacts.pending} still pending`,
    },
  ];

  const assetCoverage = [
    {
      label: 'Post Covers',
      value: content.posts.withImages,
      total: content.posts.total,
      tone: 'blue' as const,
      detail: 'Story visuals ready',
    },
    {
      label: 'Program Images',
      value: content.programs.withImages,
      total: content.programs.total,
      tone: 'emerald' as const,
      detail: 'Program visuals ready',
    },
    {
      label: 'Team Portraits',
      value: content.team.withImages,
      total: content.team.total,
      tone: 'violet' as const,
      detail: 'People profiles ready',
    },
    {
      label: 'Event Images',
      value: content.events.withImages,
      total: content.events.total,
      tone: 'amber' as const,
      detail: 'Event visuals ready',
    },
    {
      label: 'Partner Logos',
      value: content.partners.withLogos,
      total: content.partners.total,
      tone: 'rose' as const,
      detail: 'Alliance branding ready',
    },
    {
      label: 'Testimonials',
      value: content.testimonials.withImages,
      total: content.testimonials.total,
      tone: 'cyan' as const,
      detail: 'Proof cards ready',
    },
  ];

  const queueItems = [
    {
      label: 'Answer unread messages',
      value: content.contacts.unread,
      detail: 'Contact forms that have not been opened yet.',
      link: '/admin/contacts',
      tone: content.contacts.unread > 0 ? ('rose' as const) : ('emerald' as const),
      icon: content.contacts.unread > 0 ? FaExclamationCircle : FaCheckCircle,
    },
    {
      label: 'Finish draft posts',
      value: content.posts.drafts,
      detail: 'Draft stories that can become public content.',
      link: '/admin/posts',
      tone: content.posts.drafts > 0 ? ('amber' as const) : ('emerald' as const),
      icon: content.posts.drafts > 0 ? FaPencilAlt : FaCheckCircle,
    },
    {
      label: 'Close media gaps',
      value: assetGap,
      detail: 'Records without a cover, image, portrait, or logo.',
      link: '/admin/posts',
      tone: assetGap > 0 ? ('gold' as const) : ('emerald' as const),
      icon: assetGap > 0 ? FaImage : FaCheckCircle,
    },
    {
      label: 'Promote upcoming events',
      value: content.events.upcoming,
      detail: 'Upcoming public moments that can be featured.',
      link: '/admin/events',
      tone: content.events.upcoming > 0 ? ('blue' as const) : ('navy' as const),
      icon: FaCalendarAlt,
    },
  ];

  const activityItems = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...recent.contacts.map((contact) => ({
        id: `contact-${contact._id}`,
        eyebrow: contact.replied ? 'Replied message' : contact.read ? 'Open message' : 'Unread message',
        title: contact.subject,
        detail: `${contact.name} - ${contact.email}`,
        date: contact.createdAt,
        link: '/admin/contacts',
        tone: contact.replied ? ('emerald' as const) : contact.read ? ('amber' as const) : ('rose' as const),
      })),
      ...recent.posts.map((post) => ({
        id: `post-${post._id}`,
        eyebrow: post.published ? 'Published post' : 'Draft post',
        title: post.title,
        detail: post.category || 'Blog post',
        date: post.updatedAt || post.createdAt,
        link: '/admin/posts',
        tone: post.published ? ('blue' as const) : ('amber' as const),
      })),
      ...recent.events.map((event) => ({
        id: `event-${event._id}`,
        eyebrow: event.active ? 'Active event' : 'Inactive event',
        title: event.title,
        detail: `${event.type || 'event'} - ${formatDate(event.date)}`,
        date: event.createdAt || event.date,
        link: '/admin/events',
        tone: event.featured ? ('gold' as const) : ('cyan' as const),
      })),
      ...recent.auditLogs.map((log) => ({
        id: `audit-${log._id}`,
        eyebrow: `${log.action} ${log.resource}`,
        title: log.description,
        detail: log.userName,
        date: log.createdAt,
        link: '/admin/audit-logs',
        tone: log.action === 'delete' ? ('rose' as const) : log.action === 'create' ? ('emerald' as const) : ('navy' as const),
      })),
    ];

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [recent]);

  const auditBars = Object.entries(audit.actions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const auditMax = Math.max(...auditBars.map(([, value]) => value), 1);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="pwi-admin-page space-y-6">
      {fetchError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          The live dashboard data could not be refreshed. Showing the last available snapshot.
        </div>
      )}

      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark text-white shadow-2xl shadow-navy-950/15"
      >
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(255,255,255,0.38) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.38) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
                  <FaBolt aria-hidden="true" />
                  PWI Command Snapshot
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300">
                  {formatNumber(totalRecords)} platform records
                </span>
              </div>
              <div className="max-w-3xl">
                <p className="text-sm font-semibold text-gold-300">{getGreeting()},</p>
                <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                  {user?.name || 'Admin'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                  This is the operating view for content, community, events, inbox, audience, and
                  admin activity across People Who Inspire.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/admin/posts"
                  className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-300"
                >
                  <FaPlus className="text-xs" aria-hidden="true" />
                  New Post
                </Link>
                <Link
                  to="/admin/events"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/15"
                >
                  <FaCalendarAlt className="text-xs text-gold-300" aria-hidden="true" />
                  Add Event
                </Link>
                <Link
                  to="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/15"
                >
                  <FaGlobe className="text-xs text-gold-300" aria-hidden="true" />
                  View Site
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="rounded-xl border border-navy-950/10 bg-white p-5 shadow-[0_12px_32px_rgba(26,26,46,0.14)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                    Readiness
                  </p>
                  <p className="mt-1 text-sm text-gray-500">Publishing, visuals, and replies</p>
                </div>
                <div
                  className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#d4a843 ${readinessScore}%, rgba(26,26,46,0.08) 0)`,
                  }}
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white ring-1 ring-navy-950/5">
                    <span className="font-serif text-2xl font-bold text-navy-950">{readinessScore}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <HorizontalBar
                  label="Public readiness"
                  value={publishReadyCount}
                  total={Math.max(publishReadyTotal, 1)}
                  tone="gold"
                  detail={`${publishReadyTotal} public-facing records checked`}
                />
                <HorizontalBar
                  label="Visual coverage"
                  value={assetReady}
                  total={Math.max(assetPossible, 1)}
                  tone="cyan"
                  detail={`${assetGap} media gaps remaining`}
                />
                <HorizontalBar
                  label="Response coverage"
                  value={content.contacts.replied}
                  total={Math.max(content.contacts.total, 1)}
                  tone="emerald"
                  detail={`${content.contacts.pending} message threads pending`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <MetricCard {...card} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <VerticalBarChart points={moduleBars} />

        <div className="pwi-admin-card rounded-2xl p-5">
          <SectionHeader icon={FaChartLine} eyebrow="Publishing flow" title="Pipeline Health" />
          <div className="space-y-5">
            {pipelineBars.map((item) => (
              <HorizontalBar key={item.label} {...item} />
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Featured</p>
              <p className="mt-2 font-serif text-2xl font-bold text-navy-900">
                {formatNumber(
                  content.posts.featured +
                    content.programs.featured +
                    content.events.featured +
                    content.partners.featured +
                    content.testimonials.featured
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500">Items promoted across the public site</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Audit Mix</p>
              <p className="mt-2 font-serif text-2xl font-bold text-navy-900">
                {formatNumber(audit.total30d)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Admin actions in the last 30 days</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="pwi-admin-card rounded-2xl p-5">
          <SectionHeader icon={FaTasks} eyebrow="Action queue" title="What Needs Attention" />
          <div className="space-y-3">
            {queueItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.link}
                  className="group flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gold-300 hover:bg-gold-50/40"
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[item.tone].soft}`}
                  >
                    <Icon className="text-sm" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-navy-900">{item.label}</span>
                      <span className={`font-serif text-xl font-bold ${toneStyles[item.tone].text}`}>
                        {formatNumber(item.value)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-gray-500">{item.detail}</span>
                  </span>
                  <FaArrowRight
                    className="mt-3 text-xs text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gold-500"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pwi-admin-card rounded-2xl p-5">
          <SectionHeader icon={FaImage} eyebrow="Asset coverage" title="Visual Readiness" />
          <div className="grid gap-4 md:grid-cols-2">
            {assetCoverage.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                  <StatusBadge
                    label={`${percent(item.value, item.total)}%`}
                    tone={percent(item.value, item.total) >= 80 ? 'emerald' : item.tone}
                  />
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barSize(item.value, Math.max(item.total, 1))}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-full ${toneStyles[item.tone].bar}`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {formatNumber(item.value)} of {formatNumber(item.total)} ready
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="pwi-admin-card rounded-2xl p-5">
          <SectionHeader
            icon={FaHistory}
            eyebrow="Latest movement"
            title="Recent Activity"
            action={{ label: 'Open audit log', link: '/admin/audit-logs' }}
          />
          {activityItems.length > 0 ? (
            <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
              {activityItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group grid gap-3 bg-white p-4 transition-all hover:bg-gray-50 sm:grid-cols-[1fr_auto]"
                >
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${toneStyles[item.tone].bg}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className={`text-[11px] font-bold uppercase tracking-wide ${toneStyles[item.tone].text}`}>
                        {item.eyebrow}
                      </p>
                      <p className="mt-1 truncate font-semibold text-navy-900">{item.title}</p>
                      <p className="mt-1 truncate text-sm text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-xs font-semibold text-gray-400">{timeAgo(item.date)}</span>
                    <FaArrowRight
                      className="text-xs text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gold-500"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-8 text-center">
              <FaHistory className="mx-auto text-2xl text-gray-300" aria-hidden="true" />
              <p className="mt-3 font-semibold text-navy-900">No activity yet</p>
              <p className="mt-1 text-sm text-gray-500">New edits, messages, and audit events will appear here.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="pwi-admin-card rounded-2xl p-5">
            <SectionHeader icon={FaBolt} eyebrow="Shortcuts" title="Fast Actions" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.link}
                    className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gold-300 hover:bg-gold-50/40"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${toneStyles[action.tone].gradient} text-white shadow-md`}
                    >
                      <Icon className="text-sm" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy-900">{action.label}</span>
                      <span className="block truncate text-sm text-gray-500">{action.desc}</span>
                    </span>
                    <FaArrowRight
                      className="text-xs text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gold-500"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pwi-admin-card rounded-2xl p-5">
            <SectionHeader icon={FaStar} eyebrow="Audit actions" title="30-Day Mix" />
            {auditBars.length > 0 ? (
              <div className="space-y-4">
                {auditBars.map(([action, count], index) => {
                  const tones: Tone[] = ['emerald', 'blue', 'amber', 'violet', 'rose'];
                  const tone = tones[index] ?? 'navy';
                  return (
                    <div key={action}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold capitalize text-navy-900">
                          {action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-500">{formatNumber(count)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barSize(count, auditMax)}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className={`h-full rounded-full ${toneStyles[tone].bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
                <p className="font-semibold text-navy-900">No audit activity yet</p>
                <p className="mt-1 text-sm text-gray-500">Admin actions will chart here as the team works.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
