import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaComments,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaImage,
  FaPlus,
  FaQuoteLeft,
  FaSearch,
  FaStar,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Testimonial } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

const emptyTestimonial = {
  name: '',
  role: '',
  organization: '',
  image: '',
  quote: '',
  rating: 5,
  featured: false,
  active: true,
};

interface TestimonialsResponse {
  testimonials: Testimonial[];
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
    featured: number;
    homepageReady: number;
    withImages: number;
    averageRating: number;
  };
}

const emptySummary: TestimonialsResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
  featured: 0,
  homepageReady: 0,
  withImages: 0,
  averageRating: 0,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRating(value: number) {
  return value.toFixed(1).replace('.0', '');
}

export default function ManageTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [summary, setSummary] = useState<TestimonialsResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTestimonial);
  const [hoverRating, setHoverRating] = useState(0);

  const hasFilters = Boolean(
    search.trim() || statusFilter || featuredFilter || ratingFilter
  );
  const activeRate = summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;
  const imageRate = summary.total > 0 ? Math.round((summary.withImages / summary.total) * 100) : 0;

  const fetchTestimonials = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const response = await api.get<TestimonialsResponse>('/testimonials', {
          params: {
            page: nextPage,
            limit,
            search: search.trim() || undefined,
            status: statusFilter || undefined,
            featured: featuredFilter || undefined,
            rating: ratingFilter || undefined,
          },
        });

        setTestimonials(response.data.testimonials);
        setSummary(response.data.summary);
        setPage(response.data.pagination.page);
        setLimit(response.data.pagination.limit);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.pages, 1));
      } catch {
        toast.error('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    },
    [featuredFilter, limit, ratingFilter, search, statusFilter]
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => fetchTestimonials(page),
      search.trim() ? 250 : 0
    );
    return () => window.clearTimeout(timeout);
  }, [fetchTestimonials, page, search]);

  const resetToFirstPage = () => setPage(1);

  const resetForm = () => {
    setForm({ ...emptyTestimonial });
    setEditingId(null);
    setShowForm(false);
    setHoverRating(0);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setFeaturedFilter('');
    setRatingFilter('');
    setPage(1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const isEditing = Boolean(editingId);
      if (editingId) {
        await api.put(`/testimonials/${editingId}`, form);
        toast.success('Testimonial updated');
      } else {
        await api.post('/testimonials', form);
        toast.success('Testimonial created');
      }

      resetForm();
      if (isEditing) {
        fetchTestimonials(page);
      } else {
        setPage(1);
        fetchTestimonials(1);
      }
    } catch {
      toast.error('Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial._id);
    setForm({
      name: testimonial.name,
      role: testimonial.role,
      organization: testimonial.organization,
      image: testimonial.image || '',
      quote: testimonial.quote,
      rating: testimonial.rating,
      featured: testimonial.featured,
      active: testimonial.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;

    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted');

      const nextPage = testimonials.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchTestimonials(nextPage);
      }
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const statCards = [
    {
      label: 'Total Proof',
      value: summary.total,
      icon: FaComments,
      gradient: 'from-cyan-500 to-blue-600',
      color: 'text-navy-900',
    },
    {
      label: 'Featured',
      value: summary.featured,
      icon: FaStar,
      gradient: 'from-gold-400 to-amber-600',
      color: 'text-gold-600',
    },
    {
      label: 'Average Rating',
      value: formatRating(summary.averageRating),
      icon: FaStar,
      gradient: 'from-purple-500 to-violet-700',
      color: 'text-purple-600',
    },
    {
      label: 'With Photos',
      value: summary.withImages,
      icon: FaImage,
      gradient: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Proof library
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
              Testimonials
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Curate community proof, manage featured quotes, and keep homepage-ready endorsements sharp.
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
              Add Testimonial
            </button>
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Homepage ready
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-serif text-5xl font-bold">{summary.homepageReady}</p>
              <p className="pb-2 text-sm text-gray-300">featured and active</p>
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span>Active coverage</span>
                  <span>{activeRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gold-300" style={{ width: `${activeRate}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span>Photo coverage</span>
                  <span>{imageRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${imageRate}%` }} />
                </div>
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
                  <p className={`font-serif text-3xl font-bold ${card.color}`}>{card.value}</p>
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
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_170px_180px_150px_auto] xl:items-end">
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
                placeholder="Name, organization, or quote..."
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
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Featured
            </span>
            <select
              value={featuredFilter}
              onChange={(event) => {
                setFeaturedFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              <option value="">All testimonials</option>
              <option value="featured">Featured</option>
              <option value="standard">Standard</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Rating
            </span>
            <select
              value={ratingFilter}
              onChange={(event) => {
                setRatingFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
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
        <AdminCardGridSkeleton count={limit} />
      ) : testimonials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            {hasFilters ? (
              <FaSearch className="text-2xl text-gray-400" />
            ) : (
              <FaQuoteLeft className="text-2xl text-gray-400" />
            )}
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900">
            {hasFilters ? 'No testimonials match these filters' : 'No testimonials yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? 'Clear the filters or try a broader search.'
              : 'Add real testimonials from your community before featuring them on the public site.'}
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
              Add First Testimonial
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
                  Editorial records
                </p>
                <h2 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Testimonial Library
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaCheckCircle className="text-emerald-500" />
                  {summary.active} active
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2">
                  <FaTimesCircle className="text-gray-400" />
                  {summary.inactive} inactive
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Person
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Quote
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Rating
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Published
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testimonials.map((testimonial, index) => (
                  <motion.tr
                    key={testimonial._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.03, 0.35) }}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-700 text-xs font-bold text-white shadow-sm">
                            {getInitials(testimonial.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-900">
                            {testimonial.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {testimonial.role}
                            {testimonial.organization ? `, ${testimonial.organization}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-md px-5 py-4">
                      <div className="flex gap-3">
                        <FaQuoteLeft className="mt-1 shrink-0 text-sm text-gold-400" />
                        <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                          {testimonial.quote}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, starIndex) =>
                          starIndex < testimonial.rating ? (
                            <FaStar key={starIndex} className="text-sm text-gold-400" />
                          ) : (
                            <FaRegStar key={starIndex} className="text-sm text-gray-300" />
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          testimonial.active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                        }`}
                      >
                        {testimonial.active ? (
                          <FaEye className="text-[10px]" />
                        ) : (
                          <FaEyeSlash className="text-[10px]" />
                        )}
                        {testimonial.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            testimonial.featured
                              ? 'bg-gold-400/15 text-gold-700 ring-1 ring-gold-300/50'
                              : 'bg-white text-gray-500 ring-1 ring-gray-200'
                          }`}
                        >
                          <FaStar className="text-[10px]" />
                          {testimonial.featured ? 'Featured' : 'Standard'}
                        </span>
                        <p className="text-xs font-semibold text-gray-400">
                          Added {formatDate(testimonial.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(testimonial)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                          title="Edit testimonial"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(testimonial._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                          title="Delete testimonial"
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
            itemLabel="testimonials"
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
                    <FaQuoteLeft className="text-sm text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-900">
                      {editingId ? 'Edit Testimonial' : 'New Testimonial'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {editingId ? 'Update quote details and publication state.' : 'Add a real endorsement to the proof library.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Close testimonial form"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                  />
                  <TextField
                    label="Role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="Founder, Fellow, Speaker"
                    required
                  />
                </div>

                <TextField
                  label="Organization"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Organization or community"
                />

                <ImageUploadField
                  label="Person Photo"
                  description="Upload an optional photo for this testimonial."
                  value={form.image}
                  onChange={(url) => setForm((current) => ({ ...current, image: url }))}
                  previewShape="circle"
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-navy-900">Quote</span>
                  <textarea
                    name="quote"
                    value={form.quote}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
                    placeholder="Write the testimonial quote..."
                  />
                </label>

                <div>
                  <span className="mb-2 block text-sm font-semibold text-navy-900">Rating</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="rounded-lg p-1 transition-transform hover:scale-110"
                      >
                        {star <= (hoverRating || form.rating) ? (
                          <FaStar className="text-2xl text-gold-400 drop-shadow-sm" />
                        ) : (
                          <FaRegStar className="text-2xl text-gray-300" />
                        )}
                      </button>
                    ))}
                    <span className="ml-1 text-sm font-semibold text-gray-500">
                      {hoverRating || form.rating} / 5
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <CheckboxCard
                    label="Featured"
                    description="Eligible for homepage and highlighted proof sections."
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    icon={<FaStar className="text-gold-500" />}
                  />
                  <CheckboxCard
                    label="Active"
                    description="Visible to public testimonial surfaces."
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
                    <FaQuoteLeft className="text-xs text-gold-300" />
                    {editingId ? 'Update Testimonial' : 'Add Testimonial'}
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

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy-900">{label}</span>
      <input
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
