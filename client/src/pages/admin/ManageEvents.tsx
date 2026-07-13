import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaDesktop,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaImage,
  FaLink,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaStar,
  FaTimes,
  FaTrash,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Event as AdminEvent } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

const emptyEvent = {
  title: '',
  description: '',
  image: '',
  date: '',
  endDate: '',
  location: '',
  type: 'virtual' as AdminEvent['type'],
  registrationLink: '',
  recordingLink: '',
  featured: false,
  active: true,
};

interface EventsResponse {
  events: AdminEvent[];
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
    upcoming: number;
    past: number;
    featured: number;
    withImages: number;
    types: {
      virtual: number;
      inPerson: number;
      hybrid: number;
    };
  };
}

const emptySummary: EventsResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
  upcoming: 0,
  past: 0,
  featured: 0,
  withImages: 0,
  types: {
    virtual: 0,
    inPerson: 0,
    hybrid: 0,
  },
};

const typeBadgeStyles: Record<
  AdminEvent['type'],
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  virtual: {
    label: 'Virtual',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: <FaVideo className="text-[10px]" />,
  },
  'in-person': {
    label: 'In-Person',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: <FaUsers className="text-[10px]" />,
  },
  hybrid: {
    label: 'Hybrid',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: <FaDesktop className="text-[10px]" />,
  },
};

function toInputDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function eventTiming(dateString: string) {
  return new Date(dateString) >= new Date() ? 'Upcoming' : 'Past';
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [summary, setSummary] = useState<EventsResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [timingFilter, setTimingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEvent);

  const hasFilters = Boolean(
    search.trim() || timingFilter || typeFilter || statusFilter || featuredFilter
  );
  const activeRate = summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;

  const fetchEvents = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const response = await api.get<EventsResponse>('/events', {
          params: {
            page: nextPage,
            limit,
            search: search.trim() || undefined,
            timing: timingFilter || undefined,
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            featured: featuredFilter || undefined,
          },
        });

        setEvents(response.data.events);
        setSummary(response.data.summary);
        setPage(response.data.pagination.page);
        setLimit(response.data.pagination.limit);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.pages, 1));
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    },
    [featuredFilter, limit, search, statusFilter, timingFilter, typeFilter]
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => fetchEvents(page),
      search.trim() ? 250 : 0
    );
    return () => window.clearTimeout(timeout);
  }, [fetchEvents, page, search]);

  const resetToFirstPage = () => setPage(1);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyEvent });
    setEditingId(null);
    setShowForm(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setTimingFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setFeaturedFilter('');
    setPage(1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...form,
      endDate: form.endDate || undefined,
      registrationLink: form.registrationLink || '',
      recordingLink: form.recordingLink || '',
    };

    try {
      const isEditing = Boolean(editingId);
      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/events', payload);
        toast.success('Event created');
      }

      resetForm();
      if (isEditing) {
        fetchEvents(page);
      } else {
        setPage(1);
        fetchEvents(1);
      }
    } catch {
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: AdminEvent) => {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      image: event.image || '',
      date: toInputDate(event.date),
      endDate: toInputDate(event.endDate),
      location: event.location,
      type: event.type || 'virtual',
      registrationLink: event.registrationLink || '',
      recordingLink: event.recordingLink || '',
      featured: event.featured,
      active: event.active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');

      const nextPage = events.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchEvents(nextPage);
      }
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const statCards = [
    {
      label: 'Total Events',
      value: summary.total,
      icon: FaCalendarAlt,
      gradient: 'from-amber-500 to-orange-600',
      color: 'text-navy-900',
    },
    {
      label: 'Upcoming',
      value: summary.upcoming,
      icon: FaClock,
      gradient: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-600',
    },
    {
      label: 'Featured',
      value: summary.featured,
      icon: FaStar,
      gradient: 'from-gold-400 to-amber-600',
      color: 'text-gold-600',
    },
    {
      label: 'With Images',
      value: summary.withImages,
      icon: FaImage,
      gradient: 'from-blue-500 to-indigo-700',
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Event command
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
              Events
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Plan sessions, manage registration links, publish recordings, and keep the public event calendar current.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-300"
            >
              <FaPlus className="text-xs" />
              New Event
            </button>
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Calendar health
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-serif text-5xl font-bold">{activeRate}%</p>
              <p className="pb-2 text-sm text-gray-300">active</p>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gold-300 transition-all"
                style={{ width: `${activeRate}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-serif text-2xl font-bold">{summary.types.virtual}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                  Virtual
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-serif text-2xl font-bold">{summary.types.inPerson}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                  In-person
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-serif text-2xl font-bold">{summary.types.hybrid}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                  Hybrid
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
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_160px_160px_160px_170px_auto] xl:items-end">
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
                placeholder="Title, location, or description..."
                className="w-full rounded-xl border border-navy-950/10 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
              />
            </span>
          </label>

          <SelectFilter
            label="Timing"
            value={timingFilter}
            onChange={(value) => {
              setTimingFilter(value);
              resetToFirstPage();
            }}
            options={[
              { value: '', label: 'All timing' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />

          <SelectFilter
            label="Type"
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              resetToFirstPage();
            }}
            options={[
              { value: '', label: 'All types' },
              { value: 'virtual', label: 'Virtual' },
              { value: 'in-person', label: 'In-Person' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
          />

          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              resetToFirstPage();
            }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <SelectFilter
            label="Featured"
            value={featuredFilter}
            onChange={(value) => {
              setFeaturedFilter(value);
              resetToFirstPage();
            }}
            options={[
              { value: '', label: 'All events' },
              { value: 'featured', label: 'Featured' },
              { value: 'standard', label: 'Standard' },
            ]}
          />

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
        <AdminCardGridSkeleton count={limit} />
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            {hasFilters ? (
              <FaSearch className="text-2xl text-gray-400" />
            ) : (
              <FaCalendarAlt className="text-2xl text-gray-400" />
            )}
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900">
            {hasFilters ? 'No events match these filters' : 'No events yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? 'Clear the filters or try a broader search.'
              : 'Create your first event to start building the public calendar.'}
          </p>
          {!hasFilters && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800"
            >
              <FaPlus className="text-gold-300" />
              Create First Event
            </button>
          )}
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
                  Schedule records
                </p>
                <h2 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Event Calendar
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaCheckCircle className="text-emerald-500" />
                  {summary.active} active
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaClock className="text-gray-400" />
                  {summary.past} past
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Event
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Schedule
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Type
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Links
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event, index) => {
                  const badge = typeBadgeStyles[event.type] || typeBadgeStyles.virtual;
                  const isUpcoming = new Date(event.date) >= new Date();
                  return (
                    <motion.tr
                      key={event._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.03, 0.35) }}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="h-14 w-20 shrink-0 rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy-800 to-navy-950 shadow-sm">
                              <FaCalendarAlt className="text-lg text-gold-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-navy-900">{event.title}</p>
                              {event.featured && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-gold-400/15 px-2 py-1 text-[10px] font-bold uppercase text-gold-700">
                                  <FaStar className="text-[9px]" />
                                  Featured
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-1 line-clamp-1 max-w-lg text-xs leading-5 text-gray-500">
                                {event.description}
                              </p>
                            )}
                            {event.location && (
                              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-400">
                                <FaMapMarkerAlt className="text-rose-400" />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-navy-900">
                            {formatDateTime(event.date)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {event.endDate ? `Ends ${formatDate(event.endDate)}` : eventTiming(event.date)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              event.active
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                            }`}
                          >
                            {event.active ? (
                              <FaEye className="text-[10px]" />
                            ) : (
                              <FaEyeSlash className="text-[10px]" />
                            )}
                            {event.active ? 'Active' : 'Inactive'}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              isUpcoming
                                ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                : 'border border-gray-200 bg-white text-gray-500'
                            }`}
                          >
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {event.registrationLink ? (
                            <a
                              href={event.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                              <FaLink className="text-[10px]" />
                              Register
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400">
                              No registration
                            </span>
                          )}
                          {event.recordingLink && (
                            <a
                              href={event.recordingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-gold-700 transition-colors hover:bg-gold-400/25"
                            >
                              <FaVideo className="text-[10px]" />
                              Recording
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(event)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                            title="Edit event"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                            title="Delete event"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
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
            itemLabel="events"
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            disabled={loading}
          />
        </motion.section>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 pt-12 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="pwi-admin-card mb-8 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950">
                    <FaCalendarAlt className="text-sm text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-900">
                      {editingId ? 'Edit Event' : 'New Event'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {editingId ? 'Update schedule, links, and publication state.' : 'Create a session for the public calendar.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Close event form"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <TextField
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Annual Leadership Summit"
                  required
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-navy-900">
                    Description
                  </span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full resize-none rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
                    placeholder="Describe the event..."
                  />
                </label>

                <ImageUploadField
                  label="Event Image"
                  description="Upload the image used when this event appears on public pages."
                  value={form.image}
                  onChange={(url) => setForm((current) => ({ ...current, image: url }))}
                  previewShape="wide"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Start Date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <TextField
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Accra, Ghana or Online"
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-navy-900">Type</span>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
                    >
                      <option value="virtual">Virtual</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Registration Link"
                    name="registrationLink"
                    value={form.registrationLink}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <TextField
                    label="Recording Link"
                    name="recordingLink"
                    value={form.recordingLink}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <CheckboxCard
                    label="Featured"
                    description="Highlight this event in admin and public event surfaces."
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    icon={<FaStar className="text-gold-500" />}
                  />
                  <CheckboxCard
                    label="Active"
                    description="Allow this event to appear on public event surfaces."
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    icon={<FaEye className="text-emerald-500" />}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800"
                  >
                    <FaCalendarAlt className="text-xs text-gold-300" />
                    {editingId ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SelectFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

function SelectFilter({ label, value, onChange, options }: SelectFilterProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy-900">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
        placeholder={placeholder}
      />
    </label>
  );
}

interface CheckboxCardProps {
  label: string;
  description: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

function CheckboxCard({
  label,
  description,
  name,
  checked,
  onChange,
  icon,
}: CheckboxCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
        checked
          ? 'border-gold-300 bg-gold-400/10'
          : 'border-navy-950/10 bg-white hover:border-gold-200'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
      />
      <span className="flex min-w-0 gap-3">
        <span className="mt-0.5">{icon}</span>
        <span>
          <span className="block text-sm font-bold text-navy-900">{label}</span>
          <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
        </span>
      </span>
    </label>
  );
}
