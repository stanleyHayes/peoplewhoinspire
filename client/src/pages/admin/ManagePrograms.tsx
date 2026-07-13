import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaProjectDiagram,
  FaGripVertical,
  FaCheckCircle,
  FaTimesCircle,
  FaLayerGroup,
  FaListUl,
  FaStar,
  FaEye,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Program } from '../../types';
import ImageUploadField from '../../components/admin/ImageUploadField';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

const emptyProgram = {
  title: '',
  slug: '',
  description: '',
  longDescription: '',
  image: '',
  icon: 'FaGraduationCap',
  features: '',
  order: 0,
  active: true,
};

interface ProgramsResponse {
  programs: Program[];
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
    withImages: number;
  };
}

const emptySummary: ProgramsResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
  featured: 0,
  withImages: 0,
};

const gradientOptions = [
  { name: 'Ocean Blue', value: 'from-blue-500 to-indigo-600', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { name: 'Emerald', value: 'from-emerald-500 to-teal-600', bg: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { name: 'Sunset', value: 'from-orange-500 to-red-500', bg: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { name: 'Purple', value: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { name: 'Cyan', value: 'from-cyan-500 to-blue-500', bg: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
  { name: 'Amber', value: 'from-amber-500 to-orange-600', bg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { name: 'Rose', value: 'from-rose-500 to-pink-600', bg: 'bg-gradient-to-br from-rose-500 to-pink-600' },
  { name: 'Violet', value: 'from-violet-500 to-purple-700', bg: 'bg-gradient-to-br from-violet-500 to-purple-700' },
];

const cardColors = [
  {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
    lightBg: 'bg-blue-50',
    ring: 'ring-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-500',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-500',
  },
  {
    gradient: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/20',
    lightBg: 'bg-orange-50',
    ring: 'ring-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-orange-500/10',
    iconText: 'text-orange-500',
  },
  {
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/20',
    lightBg: 'bg-purple-50',
    ring: 'ring-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-500',
  },
  {
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/20',
    lightBg: 'bg-cyan-50',
    ring: 'ring-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700',
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-500',
  },
  {
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    lightBg: 'bg-amber-50',
    ring: 'ring-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-500',
  },
  {
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/20',
    lightBg: 'bg-rose-50',
    ring: 'ring-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    iconBg: 'bg-rose-500/10',
    iconText: 'text-rose-500',
  },
  {
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-violet-500/20',
    lightBg: 'bg-violet-50',
    ring: 'ring-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-500',
  },
];

export default function ManageProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [summary, setSummary] = useState<ProgramsResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProgram);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const fetchPrograms = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      const response = await api.get<ProgramsResponse>('/programs', {
        params: {
          page: nextPage,
          limit,
        },
      });

      setPrograms(response.data.programs);
      setSummary(response.data.summary);
      setPage(response.data.pagination.page);
      setLimit(response.data.pagination.limit);
      setTotal(response.data.pagination.total);
      setTotalPages(Math.max(response.data.pagination.pages, 1));
    } catch {
      toast.error('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPrograms(page);
  }, [fetchPrograms, page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !editingId
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          }
        : {}),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        features: form.features.split('\n').filter(Boolean),
        order: Number(form.order),
      };
      if (editingId) {
        await api.put(`/programs/${editingId}`, payload);
        toast.success('Program updated');
      } else {
        await api.post('/programs', payload);
        toast.success('Program created');
      }
      resetForm();
      if (editingId) {
        fetchPrograms(page);
      } else {
        setPage(1);
        fetchPrograms(1);
      }
    } catch {
      toast.error('Failed to save program');
    }
  };

  const handleEdit = (program: Program) => {
    setEditingId(program._id);
    setForm({
      title: program.title,
      slug: program.slug,
      description: program.description,
      longDescription: program.longDescription,
      image: program.image || '',
      icon: program.icon,
      features: program.features.join('\n'),
      order: program.order,
      active: program.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${id}`);
      toast.success('Program deleted');
      const nextPage = programs.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchPrograms(nextPage);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setForm(emptyProgram);
    setEditingId(null);
    setShowForm(false);
  };

  const activeCount = summary.active;
  const paginationControls = (
    <div className="mt-6 overflow-hidden rounded-2xl pwi-admin-card">
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        itemLabel="programs"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        disabled={loading}
      />
    </div>
  );

  return (
    <div>
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-800">Programs</h1>
          <p className="text-gray-500 mt-1">Manage PWI programs and offerings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-navy-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FaLayerGroup className="text-sm" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-navy-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FaListUl className="text-sm" />
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-navy-800/25 transition-all cursor-pointer"
          >
            <FaPlus /> New Program
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="pwi-admin-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
              <FaProjectDiagram className="text-gold-400 text-sm" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-800">{summary.total}</p>
              <p className="text-gray-400 text-xs font-medium">Total Programs</p>
            </div>
          </div>
        </div>
        <div className="pwi-admin-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-800">{activeCount}</p>
              <p className="text-gray-400 text-xs font-medium">Active</p>
            </div>
          </div>
        </div>
        <div className="pwi-admin-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
              <FaTimesCircle className="text-white text-sm" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-800">
                {summary.inactive}
              </p>
              <p className="text-gray-400 text-xs font-medium">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="pwi-admin-card rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto mb-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
                    <FaProjectDiagram className="text-gold-400 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-navy-800">
                      {editingId ? 'Edit Program' : 'New Program'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {editingId ? 'Update program details' : 'Create a new program offering'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                      Program Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all"
                      placeholder="e.g. Leadership Masterclass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">Slug</label>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all font-mono text-sm"
                      placeholder="leadership-masterclass"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all resize-none"
                    placeholder="A brief overview of the program..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    name="longDescription"
                    value={form.longDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all resize-none"
                    placeholder="Detailed program description..."
                  />
                </div>

                <ImageUploadField
                  label="Program Image"
                  description="Upload the visual used to represent this program across the site."
                  value={form.image}
                  onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                  previewShape="wide"
                />

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Key Features{' '}
                    <span className="text-gray-400 font-normal">(one per line)</span>
                  </label>
                  <textarea
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all resize-none font-mono text-sm"
                    placeholder={"Weekly live sessions\nInteractive Q&A\nNetworking opportunities"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                      Icon Name
                    </label>
                    <select
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 transition-all cursor-pointer"
                    >
                      <option value="FaGraduationCap">Graduation Cap</option>
                      <option value="FaComments">Conversations</option>
                      <option value="FaChalkboardTeacher">Masterclass</option>
                      <option value="FaHandshake">Fellowship</option>
                      <option value="FaUsers">Community</option>
                      <option value="FaLightbulb">Innovation</option>
                      <option value="FaRocket">Launch</option>
                      <option value="FaGlobe">Global</option>
                      <option value="FaAward">Award</option>
                      <option value="FaBriefcase">Career</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                      Display Order
                    </label>
                    <input
                      name="order"
                      type="number"
                      value={form.order}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 transition-all"
                    />
                  </div>
                </div>

                {/* Color preview */}
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-2">
                    Card Color Preview
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {gradientOptions.map((opt) => (
                      <div
                        key={opt.name}
                        className={`w-10 h-10 rounded-lg ${opt.bg} cursor-pointer ring-2 ring-transparent hover:ring-navy-800/30 transition-all`}
                        title={opt.name}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                        form.active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 translate-y-0.5 ${
                          form.active ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-navy-800">
                    {form.active ? 'Active' : 'Inactive'}
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-navy-800/25 transition-all cursor-pointer"
                  >
                    {editingId ? 'Update Program' : 'Create Program'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Programs Display */}
      {loading ? (
        <AdminCardGridSkeleton count={limit} />
      ) : programs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 pwi-admin-card rounded-2xl"
        >
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center mx-auto mb-5">
            <FaProjectDiagram className="text-gold-400 text-2xl" />
          </div>
          <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">No Programs Yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Start building your program offerings. Create your first program to get started.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer"
          >
            <FaPlus /> Create First Program
          </button>
        </motion.div>
      ) : viewMode === 'cards' ? (
        /* Card View */
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program, index) => {
              const colors = cardColors[index % cardColors.length];
              const featureCount = program.features?.length || 0;
              return (
                <motion.div
                  key={program._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`group relative pwi-admin-card rounded-2xl overflow-hidden ring-1 ${colors.ring} hover:shadow-xl ${colors.glow} hover:-translate-y-1 transition-all duration-300`}
                >
                  {/* Gradient header */}
                  <div
                    className={`h-32 bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute bottom-4 left-6 w-12 h-12 bg-white/10 rounded-full" />
                    <div className="absolute top-4 right-1/3 w-8 h-8 bg-white/5 rounded-full" />

                    {/* Order badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                        <FaGripVertical className="text-[10px]" /> #{program.order}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          program.active
                            ? 'bg-white/20 backdrop-blur-sm text-white'
                            : 'bg-black/20 backdrop-blur-sm text-white/80'
                        }`}
                      >
                        {program.active ? (
                          <FaCheckCircle className="text-[10px]" />
                        ) : (
                          <FaTimesCircle className="text-[10px]" />
                        )}
                        {program.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Large icon */}
                    <div className="absolute bottom-0 right-6 translate-y-1/2">
                      <div className="w-16 h-16 rounded-lg bg-white shadow-lg flex items-center justify-center">
                        <FaProjectDiagram className={`text-2xl ${colors.iconText}`} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-5">
                    <h3 className="font-serif text-lg font-bold text-navy-800 mb-2 pr-14">
                      {program.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {program.description || 'No description provided'}
                    </p>

                    {/* Features preview */}
                    {featureCount > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaStar className={`text-xs ${colors.iconText}`} />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Key Features
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {program.features.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${colors.badge}`}
                            >
                              {f.length > 25 ? f.slice(0, 25) + '...' : f}
                            </span>
                          ))}
                          {featureCount > 3 && (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                              +{featureCount - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <a
                        href={`/programs`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gold-500 transition-colors"
                      >
                        <FaEye />
                        <span>View on site</span>
                      </a>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(program)}
                          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(program._id)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add new program card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: programs.length * 0.06 }}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-gold-400 hover:bg-gold-400/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 group-hover:bg-gold-400/20 flex items-center justify-center mb-4 transition-all duration-300">
                <FaPlus className="text-gray-400 group-hover:text-gold-500 text-lg transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-navy-800 font-medium transition-colors">
                Add New Program
              </span>
            </motion.button>
          </div>
          {paginationControls}
        </>
      ) : (
        /* List View */
        <>
          <div className="pwi-admin-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {programs.map((program, index) => {
                    const colors = cardColors[index % cardColors.length];
                    return (
                      <motion.tr
                        key={program._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.04 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shrink-0 shadow-sm`}
                            >
                              <FaProjectDiagram className="text-white text-sm" />
                            </div>
                            <div>
                              <div className="font-semibold text-navy-800">{program.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                                {program.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colors.badge}`}>
                            <FaStar className="text-[10px]" />
                            {program.features?.length || 0} features
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              program.active
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                            }`}
                          >
                            {program.active ? (
                              <FaCheckCircle className="text-[10px]" />
                            ) : (
                              <FaTimesCircle className="text-[10px]" />
                            )}
                            {program.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500 font-mono">
                            <FaGripVertical className="text-gray-300 text-xs" />
                            {program.order}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <a
                              href="/programs"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                              title="View on site"
                            >
                              <FaEye className="text-sm" />
                            </a>
                            <button
                              onClick={() => handleEdit(program)}
                              className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(program._id)}
                              className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
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
          </div>
          {paginationControls}
        </>
      )}
    </div>
  );
}
