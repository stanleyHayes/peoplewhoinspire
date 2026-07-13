import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaEye,
  FaCheck,
  FaReply,
  FaInbox,
  FaEnvelopeOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
  FaCalendarAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ContactMessage } from '../../types';
import { AdminCardGridSkeleton } from '../../components/ui/Skeleton';

export default function ManageContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const r = await api.get('/contacts');
      setMessages(r.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleView = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await api.put(`/contacts/${msg._id}`, { read: true });
        fetchMessages();
      } catch {
        /* empty */
      }
    }
  };

  const handleMarkReplied = async (id: string) => {
    try {
      await api.put(`/contacts/${id}`, { replied: true });
      toast.success('Marked as replied');
      fetchMessages();
      setSelected(null);
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Deleted');
      fetchMessages();
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error('Failed');
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const readCount = messages.filter((m) => m.read && !m.replied).length;
  const repliedCount = messages.filter((m) => m.replied).length;

  const filtered = messages.filter((msg) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !msg.read) ||
      (filter === 'read' && msg.read && !msg.replied) ||
      (filter === 'replied' && msg.replied);
    const matchesSearch =
      !search ||
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-3xl font-serif font-bold text-navy-800"
          >
            Messages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-1"
          >
            Manage contact form submissions
          </motion.p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <button
          onClick={() => setFilter('all')}
          className={`pwi-admin-card rounded-lg p-5 flex items-center gap-4 transition-all cursor-pointer ${
            filter === 'all'
              ? 'ring-2 ring-navy-800 shadow-lg'
              : 'ring-1 ring-gray-100 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
            <FaEnvelope className="text-white text-lg" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-navy-800">{messages.length}</p>
            <p className="text-xs text-gray-500 font-medium">Total</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`pwi-admin-card rounded-lg p-5 flex items-center gap-4 transition-all cursor-pointer ${
            filter === 'unread'
              ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10'
              : 'ring-1 ring-gray-100 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <FaExclamationCircle className="text-white text-lg" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            <p className="text-xs text-gray-500 font-medium">Unread</p>
          </div>
          {unreadCount > 0 && (
            <span className="ml-auto w-3 h-3 rounded-full bg-blue-500 animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => setFilter('read')}
          className={`pwi-admin-card rounded-lg p-5 flex items-center gap-4 transition-all cursor-pointer ${
            filter === 'read'
              ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/10'
              : 'ring-1 ring-gray-100 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <FaEnvelopeOpen className="text-white text-lg" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-amber-600">{readCount}</p>
            <p className="text-xs text-gray-500 font-medium">Awaiting Reply</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('replied')}
          className={`pwi-admin-card rounded-lg p-5 flex items-center gap-4 transition-all cursor-pointer ${
            filter === 'replied'
              ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'ring-1 ring-gray-100 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
            <FaCheckCircle className="text-white text-lg" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-emerald-600">{repliedCount}</p>
            <p className="text-xs text-gray-500 font-medium">Replied</p>
          </div>
        </button>
      </motion.div>

      {/* Search */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or subject..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-gold-400 focus:shadow-lg focus:shadow-gold-400/10 transition-all"
            />
          </div>
        </motion.div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="pwi-admin-card rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-navy-800 to-navy-900 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-gold-400 font-bold text-sm">
                      {selected.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-white">
                      {selected.name}
                    </h2>
                    <p className="text-gray-400 text-xs">{selected.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Subject */}
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Subject
                  </label>
                  <p className="font-semibold text-navy-800 text-lg mt-1">
                    {selected.subject}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Message
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-xs" />
                    {new Date(selected.createdAt).toLocaleString()}
                  </span>
                  {selected.replied && (
                    <span className="flex items-center gap-1.5 text-emerald-500">
                      <FaCheckCircle className="text-xs" />
                      Replied
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-800 to-navy-900 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <FaReply /> Reply via Email
                  </a>
                  {!selected.replied && (
                    <button
                      onClick={() => handleMarkReplied(selected._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 ring-1 ring-emerald-200 cursor-pointer transition-all"
                    >
                      <FaCheck /> Mark Replied
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(selected._id);
                    }}
                    className="ml-auto p-2.5 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <AdminCardGridSkeleton count={6} columnsClass="grid-cols-1 lg:grid-cols-2" />
      ) : messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 pwi-admin-card rounded-2xl"
        >
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="relative w-28 h-28 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/30">
              <FaInbox className="text-white text-4xl" />
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-navy-800 mb-3">
            Your Inbox is Empty
          </h3>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
            When visitors submit the contact form on your website, their messages will appear
            here. You'll be able to read, reply, and manage all inquiries.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaEye className="text-blue-500 text-sm" />
              </div>
              <span className="text-sm">Read & manage</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaReply className="text-green-500 text-sm" />
              </div>
              <span className="text-sm">Reply directly</span>
            </div>
          </div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 pwi-admin-card rounded-2xl"
        >
          <FaSearch className="text-gray-300 text-3xl mx-auto mb-3" />
          <p className="text-gray-400">No messages match your current filter</p>
          <button
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
            className="mt-3 text-sm text-gold-500 hover:text-gold-600 font-medium cursor-pointer"
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          {filtered.map((msg, index) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleView(msg)}
              className={`group flex items-start gap-4 p-5 rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                !msg.read
                  ? 'bg-white ring-2 ring-blue-200 shadow-sm shadow-blue-500/10'
                  : 'bg-white ring-1 ring-gray-100 hover:ring-gray-200'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  !msg.read
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : msg.replied
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}
              >
                <span className="text-white font-bold text-sm">
                  {msg.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-semibold truncate ${
                      !msg.read ? 'text-navy-800' : 'text-gray-700'
                    }`}
                  >
                    {msg.name}
                  </span>
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p
                  className={`text-sm truncate mb-1 ${
                    !msg.read ? 'font-semibold text-navy-800' : 'text-gray-600'
                  }`}
                >
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{msg.message}</p>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                <div className="flex items-center gap-1.5">
                  {!msg.read && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-semibold">
                      NEW
                    </span>
                  )}
                  {msg.replied && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                      <FaCheckCircle className="text-[8px]" /> Replied
                    </span>
                  )}
                  {msg.read && !msg.replied && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Delete on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(msg._id);
                }}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
              >
                <FaTrash className="text-sm" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
