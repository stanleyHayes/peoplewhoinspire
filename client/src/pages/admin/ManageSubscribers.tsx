import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBullhorn,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaEnvelope,
  FaFilter,
  FaPaperPlane,
  FaSearch,
  FaTimesCircle,
  FaTrash,
  FaUserFriends,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Subscriber } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/ui/Skeleton';

interface SubscribersResponse {
  subscribers: Subscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
    recent30Days: number;
  };
}

const emptySummary: SubscribersResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
  recent30Days: 0,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitial(subscriber: Subscriber) {
  return (subscriber.name || subscriber.email || '?').charAt(0).toUpperCase();
}

export default function ManageSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [summary, setSummary] = useState<SubscribersResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const hasFilters = Boolean(search.trim() || statusFilter);
  const activeRate = summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;
  const inactiveRate = summary.total > 0 ? 100 - activeRate : 0;

  const fetchSubscribers = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const response = await api.get<SubscribersResponse>('/subscribers', {
          params: {
            page: nextPage,
            limit,
            search: search.trim() || undefined,
            status: statusFilter || undefined,
          },
        });

        setSubscribers(response.data.subscribers);
        setSummary(response.data.summary);
        setPage(response.data.pagination.page);
        setLimit(response.data.pagination.limit);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.pages, 1));
      } catch {
        toast.error('Failed to load subscribers');
      } finally {
        setLoading(false);
      }
    },
    [limit, search, statusFilter]
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => fetchSubscribers(page),
      search.trim() ? 250 : 0
    );
    return () => window.clearTimeout(timeout);
  }, [fetchSubscribers, page, search]);

  const resetToFirstPage = () => setPage(1);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this subscriber?')) return;

    try {
      await api.delete(`/subscribers/${id}`);
      toast.success('Subscriber removed');

      const nextPage = subscribers.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchSubscribers(nextPage);
      }
    } catch {
      toast.error('Failed to remove subscriber');
    }
  };

  const statCards = [
    {
      label: 'Total Audience',
      value: summary.total,
      icon: FaUserFriends,
      gradient: 'from-violet-500 to-indigo-700',
      color: 'text-navy-900',
    },
    {
      label: 'Subscribed',
      value: summary.active,
      icon: FaCheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-600',
    },
    {
      label: 'Unsubscribed',
      value: summary.inactive,
      icon: FaTimesCircle,
      gradient: 'from-gray-400 to-gray-500',
      color: 'text-gray-500',
    },
    {
      label: 'New 30 Days',
      value: summary.recent30Days,
      icon: FaChartLine,
      gradient: 'from-gold-400 to-amber-600',
      color: 'text-gold-600',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Audience desk
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
              Subscribers
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Track newsletter growth, keep the list clean, and move quickly from subscriber records to campaign follow-up.
            </p>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              List health
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-serif text-5xl font-bold">{activeRate}%</p>
              <p className="pb-2 text-sm text-gray-300">subscribed</p>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gold-300 transition-all"
                style={{ width: `${activeRate}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-serif text-2xl font-bold">{summary.active}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/45">
                  Active
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-serif text-2xl font-bold">{summary.inactive}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/45">
                  Inactive
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
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
                  <p className={`font-serif text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {card.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="pwi-admin-card rounded-2xl p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_210px_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Search
            </span>
            <span className="relative block">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetToFirstPage();
                }}
                placeholder="Name or email..."
                className="w-full rounded-xl border border-navy-950/10 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              <option value="">All subscribers</option>
              <option value="active">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
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
        <AdminTableSkeleton rows={limit} columns={6} />
      ) : subscribers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            {hasFilters ? (
              <FaSearch className="text-2xl text-gray-400" />
            ) : (
              <FaPaperPlane className="text-2xl text-gray-400" />
            )}
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900">
            {hasFilters ? 'No subscribers match these filters' : 'No subscribers yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? 'Clear the filters or try a different search to widen the audience view.'
              : 'When visitors join the newsletter from the public site, they will appear here.'}
          </p>
        </motion.div>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card overflow-hidden rounded-2xl"
        >
          <div className="border-b border-navy-950/10 bg-gray-50/70 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Subscriber records
                </p>
                <h2 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Audience List
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaBullhorn className="text-gold-500" />
                  {summary.recent30Days} new this month
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaTimesCircle className="text-gray-400" />
                  {inactiveRate}% inactive
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Subscriber
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Joined
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Signal
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map((subscriber, index) => (
                  <motion.tr
                    key={subscriber._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.03, 0.35) }}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-700 text-sm font-bold text-white shadow-sm">
                          {getInitial(subscriber)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-900">
                            {subscriber.name || 'Anonymous subscriber'}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {subscriber.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          subscriber.subscribed
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                        }`}
                      >
                        {subscriber.subscribed ? (
                          <FaCheckCircle className="text-[10px]" />
                        ) : (
                          <FaTimesCircle className="text-[10px]" />
                        )}
                        {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-[10px] text-gray-400" />
                        {formatDate(subscriber.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          subscriber.subscribed
                            ? 'border border-gold-300/40 bg-gold-400/10 text-gold-700'
                            : 'border border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        {subscriber.subscribed ? 'Campaign ready' : 'Needs cleanup'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                          title="Email subscriber"
                        >
                          <FaEnvelope className="text-sm" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(subscriber._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                          title="Delete subscriber"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            itemLabel="subscribers"
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
