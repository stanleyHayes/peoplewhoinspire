import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaHandshake,
  FaExternalLinkAlt,
  FaGlobe,
  FaCheckCircle,
  FaTimesCircle,
  FaGripVertical,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Partner } from '../../types';
import ImageUploadField from '../../components/admin/ImageUploadField';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

const emptyPartner = { name: '', logo: '', website: '', description: '', order: 0, active: true };

interface PartnersResponse {
  partners: Partner[];
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
  };
}

const emptySummary: PartnersResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
};

const cardColors = [
  {
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/20',
    ring: 'ring-pink-200',
    avatarBg: 'from-pink-500 to-rose-600',
  },
  {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
    ring: 'ring-blue-200',
    avatarBg: 'from-blue-500 to-indigo-600',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-200',
    avatarBg: 'from-emerald-500 to-teal-600',
  },
  {
    gradient: 'from-purple-500 to-violet-600',
    glow: 'shadow-purple-500/20',
    ring: 'ring-purple-200',
    avatarBg: 'from-purple-500 to-violet-600',
  },
  {
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-200',
    avatarBg: 'from-amber-500 to-orange-600',
  },
  {
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/20',
    ring: 'ring-cyan-200',
    avatarBg: 'from-cyan-500 to-blue-500',
  },
  {
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-violet-500/20',
    ring: 'ring-violet-200',
    avatarBg: 'from-violet-500 to-purple-700',
  },
  {
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/20',
    ring: 'ring-rose-200',
    avatarBg: 'from-rose-500 to-pink-600',
  },
];

export default function ManagePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [summary, setSummary] = useState<PartnersResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPartner);

  const fetchPartners = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      const response = await api.get<PartnersResponse>('/partners', {
        params: {
          page: nextPage,
          limit,
        },
      });

      setPartners(response.data.partners);
      setSummary(response.data.summary);
      setPage(response.data.pagination.page);
      setLimit(response.data.pagination.limit);
      setTotal(response.data.pagination.total);
      setTotalPages(Math.max(response.data.pagination.pages, 1));
    } catch {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPartners(page);
  }, [fetchPartners, page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editingId) {
        await api.put(`/partners/${editingId}`, payload);
        toast.success('Updated');
      } else {
        await api.post('/partners', payload);
        toast.success('Created');
      }
      resetForm();
      if (editingId) {
        fetchPartners(page);
      } else {
        setPage(1);
        fetchPartners(1);
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingId(partner._id);
    setForm({
      name: partner.name,
      logo: partner.logo || '',
      website: partner.website || '',
      description: partner.description || '',
      order: partner.order,
      active: partner.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await api.delete(`/partners/${id}`);
      toast.success('Deleted');
      const nextPage = partners.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchPartners(nextPage);
      }
    } catch {
      toast.error('Failed');
    }
  };

  const resetForm = () => {
    setForm(emptyPartner);
    setEditingId(null);
    setShowForm(false);
  };

  const activeCount = summary.active;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-800">Partners</h1>
          <p className="text-gray-500 mt-1">Manage partner organizations</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-navy-800/25 transition-all cursor-pointer"
        >
          <FaPlus /> Add Partner
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="pwi-admin-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <FaHandshake className="text-white text-sm" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-800">{summary.total}</p>
              <p className="text-gray-400 text-xs font-medium">Total Partners</p>
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
              <p className="text-2xl font-bold text-navy-800">{summary.inactive}</p>
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
              className="pwi-admin-card rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto mb-8"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
                    <FaHandshake className="text-gold-400 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-navy-800">
                      {editingId ? 'Edit Partner' : 'New Partner'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {editingId ? 'Update partner details' : 'Add a new partner organization'}
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
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Partner Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all"
                    placeholder="e.g. Acme Corporation"
                  />
                </div>

                <ImageUploadField
                  label="Partner Logo"
                  description="Upload the partner logo displayed on the public partners section."
                  value={form.logo}
                  onChange={(url) => setForm((prev) => ({ ...prev, logo: url }))}
                  previewShape="logo"
                />

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Website
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all resize-none"
                    placeholder="Brief description of the partner..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex items-end pb-1">
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
                  </div>
                </div>

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
                    {editingId ? 'Update Partner' : 'Add Partner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partners Display */}
      {loading ? (
        <AdminCardGridSkeleton count={limit} />
      ) : partners.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 pwi-admin-card rounded-2xl"
        >
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center mx-auto mb-5">
            <FaHandshake className="text-gold-400 text-2xl" />
          </div>
          <h3 className="font-serif text-xl font-bold text-navy-800 mb-2">No Partners Yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Start building your partner network. Add your first partner to get started.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer"
          >
            <FaPlus /> Add First Partner
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {partners.map((partner, index) => {
              const colors = cardColors[index % cardColors.length];
              const initial = partner.name.charAt(0).toUpperCase();
              return (
                <motion.div
                  key={partner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`group relative pwi-admin-card rounded-2xl overflow-hidden ring-1 ${colors.ring} hover:shadow-xl ${colors.glow} hover:-translate-y-1 transition-all duration-300`}
                >
                  {/* Gradient top strip */}
                  <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

                  {/* Content */}
                  <div className="p-6">
                    {/* Top row: avatar + badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {partner.logo ? (
                          <div className="w-14 h-14 rounded-full border border-gray-100 bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
                            <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.avatarBg} flex items-center justify-center shrink-0 shadow-lg ${colors.glow}`}
                          >
                            <span className="text-white text-xl font-bold">{initial}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif text-lg font-bold text-navy-800">
                            {partner.name}
                          </h3>
                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                              partner.active
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                            }`}
                          >
                            {partner.active ? (
                              <FaCheckCircle className="text-[10px]" />
                            ) : (
                              <FaTimesCircle className="text-[10px]" />
                            )}
                            {partner.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Order badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-gray-500 text-xs font-medium">
                        <FaGripVertical className="text-[10px]" /> #{partner.order}
                      </span>
                    </div>

                    {/* Description */}
                    {partner.description && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {partner.description}
                      </p>
                    )}

                    {/* Website link */}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-600 text-sm font-medium mb-4 transition-colors"
                      >
                        <FaGlobe className="text-xs" />
                        <span className="truncate max-w-[200px]">{partner.website}</span>
                        <FaExternalLinkAlt className="text-[10px] opacity-60" />
                      </a>
                    )}

                    {/* Actions - visible on hover */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner._id)}
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

            {/* Add new partner card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: partners.length * 0.06 }}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex flex-col items-center justify-center min-h-[280px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-gold-400 hover:bg-gold-400/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-gold-400/20 flex items-center justify-center mb-4 transition-all duration-300">
                <FaPlus className="text-gray-400 group-hover:text-gold-500 text-lg transition-colors" />
              </div>
              <span className="text-gray-400 group-hover:text-navy-800 font-medium transition-colors">
                Add New Partner
              </span>
            </motion.button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl pwi-admin-card">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              itemLabel="partners"
              onPageChange={setPage}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
              }}
              disabled={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}
