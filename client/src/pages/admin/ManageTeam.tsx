import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUsers,
  FaLinkedin,
  FaTwitter,
  FaUserCheck,
  FaUserSlash,
  FaCrown,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { TeamMember } from '../../types';
import ImageUploadField from '../../components/admin/ImageUploadField';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

const emptyMember = { name: '', role: '', bio: '', image: '', linkedin: '', twitter: '', order: 0, active: true };

interface TeamResponse {
  members: TeamMember[];
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

const emptySummary: TeamResponse['summary'] = {
  total: 0,
  active: 0,
  inactive: 0,
};

const BANNER_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-cyan-500 to-cyan-700',
];

const AVATAR_GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
];

const SHADOW_COLORS = [
  'hover:shadow-blue-300/50',
  'hover:shadow-emerald-300/50',
  'hover:shadow-purple-300/50',
  'hover:shadow-orange-300/50',
  'hover:shadow-pink-300/50',
  'hover:shadow-cyan-300/50',
];

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function ManageTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [summary, setSummary] = useState<TeamResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMember);

  const fetchMembers = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      const response = await api.get<TeamResponse>('/team', {
        params: {
          page: nextPage,
          limit,
        },
      });

      setMembers(response.data.members);
      setSummary(response.data.summary);
      setPage(response.data.pagination.page);
      setLimit(response.data.pagination.limit);
      setTotal(response.data.pagination.total);
      setTotalPages(Math.max(response.data.pagination.pages, 1));
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMembers(page);
  }, [fetchMembers, page]);

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
        await api.put(`/team/${editingId}`, payload);
        toast.success('Member updated');
      } else {
        await api.post('/team', payload);
        toast.success('Member added');
      }
      resetForm();
      if (editingId) {
        fetchMembers(page);
      } else {
        setPage(1);
        fetchMembers(1);
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member._id);
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image || '',
      linkedin: member.linkedin || '',
      twitter: member.twitter || '',
      order: member.order,
      active: member.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await api.delete(`/team/${id}`);
      toast.success('Deleted');
      const nextPage = members.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        fetchMembers(nextPage);
      }
    } catch {
      toast.error('Failed');
    }
  };

  const resetForm = () => {
    setForm(emptyMember);
    setEditingId(null);
    setShowForm(false);
  };

  const activeCount = summary.active;
  const inactiveCount = summary.inactive;

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#1a1a2e] tracking-tight">
            Team Members
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">Manage the people behind PWI</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#d4a843] to-amber-500 text-[#1a1a2e] rounded-lg font-semibold shadow-lg shadow-amber-200/40 hover:shadow-xl hover:shadow-amber-300/50 transition-all cursor-pointer"
        >
          <FaPlus className="text-sm" /> Add Member
        </motion.button>
      </motion.div>

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        <div className="pwi-admin-card rounded-lg p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <FaUsers className="text-[#d4a843] text-sm sm:text-lg" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">{summary.total}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Members</p>
          </div>
        </div>

        <div className="pwi-admin-card rounded-lg p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <FaUserCheck className="text-white text-sm sm:text-lg" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">{activeCount}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
          </div>
        </div>

        <div className="pwi-admin-card rounded-lg p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-200/50">
            <FaUserSlash className="text-white text-sm sm:text-lg" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-rose-700">{inactiveCount}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Inactive</p>
          </div>
        </div>
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-16"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
          >
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pwi-admin-card rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto mb-8 border border-gray-100"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#1a1a2e] to-indigo-900 px-7 py-5 flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                  {editingId ? 'Edit' : 'Add'} Team Member
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={resetForm}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all bg-gray-50/50"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Role</label>
                    <input
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all bg-gray-50/50"
                      placeholder="e.g. Co-Founder"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all resize-none bg-gray-50/50"
                    placeholder="Short biography..."
                  />
                </div>

                <ImageUploadField
                  label="Headshot"
                  description="Upload the team member photo used on public team cards."
                  value={form.image}
                  onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                  previewShape="circle"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                      <FaLinkedin className="inline mr-1.5 text-blue-600" />
                      LinkedIn URL
                    </label>
                    <input
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all bg-gray-50/50"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                      <FaTwitter className="inline mr-1.5 text-sky-500" />
                      Twitter URL
                    </label>
                    <input
                      name="twitter"
                      value={form.twitter}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all bg-gray-50/50"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Display Order</label>
                    <input
                      name="order"
                      type="number"
                      value={form.order}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/20 transition-all bg-gray-50/50"
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="relative flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-5" />
                      <span className="text-sm font-semibold text-[#1a1a2e]">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#d4a843] to-amber-500 text-[#1a1a2e] rounded-lg font-semibold shadow-lg shadow-amber-200/40 cursor-pointer"
                  >
                    {editingId ? 'Update Member' : 'Add Member'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      {loading ? (
        <AdminCardGridSkeleton count={limit} />
      ) : members.length === 0 ? (
        /* ── Empty State ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-24 pwi-admin-card rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-indigo-800 flex items-center justify-center shadow-xl shadow-indigo-200/40">
            <FaCrown className="text-[#d4a843] text-3xl" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1a1a2e] mb-2">No team members yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Start building your team by adding the first member.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4a843] to-amber-500 text-[#1a1a2e] rounded-lg font-semibold shadow-lg shadow-amber-200/40 cursor-pointer"
          >
            <FaPlus className="text-sm" /> Add First Member
          </motion.button>
        </motion.div>
      ) : (
        /* ── Cards Grid ── */
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {members.map((member, i) => {
              const colorIdx = i % BANNER_GRADIENTS.length;
              return (
                <motion.div
                  key={member._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6 }}
                  className={`group relative pwi-admin-card rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-xl ${SHADOW_COLORS[colorIdx]}`}
                >
                  {/* Gradient banner */}
                  <div className={`h-24 bg-gradient-to-r ${BANNER_GRADIENTS[colorIdx]} relative`}>
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(member)}
                        className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center cursor-pointer"
                      >
                        <FaEdit size={13} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(member._id)}
                        className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-red-400/60 flex items-center justify-center cursor-pointer"
                      >
                        <FaTrash size={12} />
                      </motion.button>
                    </div>

                    {/* Active badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                          member.active
                            ? 'bg-emerald-500/20 text-emerald-100'
                            : 'bg-white/15 text-white/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.active ? 'bg-emerald-300' : 'bg-white/50'
                          }`}
                        />
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Avatar overlapping the banner */}
                  <div className="flex justify-center -mt-10 relative z-10">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div
                        className={`w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${AVATAR_GRADIENTS[colorIdx]} flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-xl tracking-wide">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-6 pt-4 pb-6 text-center">
                    <h3 className="text-lg font-serif font-bold text-[#1a1a2e] leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-[#d4a843] text-sm font-semibold mt-0.5">{member.role}</p>
                    {member.bio && (
                      <p className="text-gray-500 text-sm mt-3 line-clamp-3 leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {/* Social links */}
                    {(member.linkedin || member.twitter) && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                          >
                            <FaLinkedin size={15} />
                          </a>
                        )}
                        {member.twitter && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-100 flex items-center justify-center transition-colors"
                          >
                            <FaTwitter size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* ── Add Member Card ── */}
            <motion.button
              custom={members.length}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, borderColor: '#d4a843' }}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="group flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#d4a843]/20 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaPlus className="text-[#d4a843] text-xl" />
              </div>
              <span className="text-gray-500 font-semibold group-hover:text-[#1a1a2e] transition-colors">
                Add Member
              </span>
              <span className="text-gray-400 text-xs mt-1">Click to create</span>
            </motion.button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl pwi-admin-card">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              itemLabel="team members"
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
