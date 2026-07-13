import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCog,
  FaComments,
  FaEdit,
  FaFilter,
  FaHandshake,
  FaHistory,
  FaKey,
  FaNewspaper,
  FaPlus,
  FaProjectDiagram,
  FaShieldAlt,
  FaSignInAlt,
  FaTrash,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { AuditLog } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/ui/Skeleton';

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const actionConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  login: { label: 'Login', color: 'text-blue-700', bg: 'bg-blue-100', icon: FaSignInAlt },
  create: { label: 'Create', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: FaPlus },
  update: { label: 'Update', color: 'text-amber-700', bg: 'bg-amber-100', icon: FaEdit },
  delete: { label: 'Delete', color: 'text-red-700', bg: 'bg-red-100', icon: FaTrash },
  invite: { label: 'Invite', color: 'text-purple-700', bg: 'bg-purple-100', icon: FaUserPlus },
  password_change: { label: 'Password', color: 'text-orange-700', bg: 'bg-orange-100', icon: FaKey },
  settings_update: { label: 'Settings', color: 'text-cyan-700', bg: 'bg-cyan-100', icon: FaCog },
  logout: { label: 'Logout', color: 'text-gray-700', bg: 'bg-gray-100', icon: FaSignInAlt },
};

const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  auth: FaShieldAlt,
  post: FaNewspaper,
  program: FaProjectDiagram,
  user: FaUsers,
  team: FaUsers,
  event: FaCalendarAlt,
  partner: FaHandshake,
  testimonial: FaComments,
  settings: FaCog,
};

const actionOptions = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'invite', label: 'Invite' },
  { value: 'password_change', label: 'Password Change' },
  { value: 'settings_update', label: 'Settings Update' },
];

const resourceOptions = [
  { value: '', label: 'All resources' },
  { value: 'auth', label: 'Authentication' },
  { value: 'post', label: 'Blog Posts' },
  { value: 'program', label: 'Programs' },
  { value: 'user', label: 'Users' },
  { value: 'team', label: 'Team' },
  { value: 'event', label: 'Events' },
  { value: 'partner', label: 'Partners' },
  { value: 'testimonial', label: 'Testimonials' },
  { value: 'settings', label: 'Settings' },
];

const statCards = [
  { key: 'login', label: 'Logins', gradient: 'from-blue-500 to-blue-600' },
  { key: 'create', label: 'Creates', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'update', label: 'Updates', gradient: 'from-amber-500 to-orange-600' },
  { key: 'delete', label: 'Deletes', gradient: 'from-red-500 to-rose-600' },
];

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatResource(resource: string) {
  return resource.charAt(0).toUpperCase() + resource.slice(1).replace(/_/g, ' ');
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');

  const hasFilters = Boolean(filterAction || filterResource);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get<Record<string, number>>('/audit-logs/stats');
      setStats(response.data);
    } catch {
      // Stats are not critical for reading the log.
    }
  }, []);

  const fetchLogs = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const response = await api.get<AuditLogsResponse>('/audit-logs', {
          params: {
            page: nextPage,
            limit,
            action: filterAction || undefined,
            resource: filterResource || undefined,
          },
        });

        setLogs(response.data.logs);
        setPage(response.data.pagination.page);
        setLimit(response.data.pagination.limit);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.pages, 1));
      } catch {
        toast.error('Failed to load audit logs. Try logging out and back in.');
      } finally {
        setLoading(false);
      }
    },
    [filterAction, filterResource, limit]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const handleClearFilters = () => {
    setFilterAction('');
    setFilterResource('');
    setPage(1);
  };

  const total30d = Object.values(stats).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              System trace
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">Audit Logs</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Review administrative actions, authentication events, content edits, and permission-sensitive changes.
            </p>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Last 30 days
            </p>
            <p className="mt-3 font-serif text-5xl font-bold">{total30d}</p>
            <p className="mt-2 text-sm text-gray-300">tracked admin actions</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const config = actionConfig[card.key];
          const Icon = config.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="pwi-admin-card rounded-lg p-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}
                >
                  <Icon className="text-lg text-white" />
                </div>
                <div>
                  <p className="font-serif text-3xl font-bold text-navy-900">{stats[card.key] || 0}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label} (30d)</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="pwi-admin-card rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Action</span>
            <select
              value={filterAction}
              onChange={(event) => {
                setFilterAction(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Resource</span>
            <select
              value={filterResource}
              onChange={(event) => {
                setFilterResource(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              {resourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-950/10 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gold-300 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaFilter className="text-xs" />
            Clear
          </button>
        </div>
      </section>

      {loading ? (
        <AdminTableSkeleton rows={limit} columns={5} />
      ) : logs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pwi-admin-card rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            <FaHistory className="text-2xl text-gray-400" />
          </div>
          <h3 className="mb-1 font-serif text-lg font-bold text-navy-900">No audit logs found</h3>
          <p className="text-sm text-gray-500">
            {hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Activity will appear here once actions are performed.'}
          </p>
        </motion.div>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card overflow-hidden rounded-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Actor</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Action</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Resource</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Description</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log, index) => {
                  const config = actionConfig[log.action] || {
                    label: log.action,
                    color: 'text-gray-700',
                    bg: 'bg-gray-100',
                    icon: FaHistory,
                  };
                  const ActionIcon = config.icon;
                  const ResourceIcon = resourceIcons[log.resource] || FaHistory;
                  const initial = log.userName ? log.userName.charAt(0).toUpperCase() : '?';

                  return (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.03, 0.35) }}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-700 text-sm font-semibold text-white shadow-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy-900">{log.userName}</p>
                            <p className="text-xs text-gray-400">{timeAgo(log.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.color}`}
                        >
                          <ActionIcon className="text-[10px]" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
                          <ResourceIcon className="text-[10px] text-gold-500" />
                          {formatResource(log.resource)}
                        </span>
                      </td>
                      <td className="max-w-md px-5 py-4">
                        <p className="truncate text-sm text-gray-600">{log.description}</p>
                      </td>
                      <td className="px-5 py-4 text-right text-xs font-semibold text-gray-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            itemLabel="audit logs"
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            disabled={loading}
          />
        </motion.section>
      )}
    </div>
  );
}
