import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaNewspaper,
  FaStar,
  FaThLarge,
  FaList,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaPencilAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Post } from '../../types';
import ImageUploadField from '../../components/admin/ImageUploadField';
import MarkdownEditor from '../../components/ui/MarkdownEditor';
import { AdminCardGridSkeleton, AdminTableSkeleton } from '../../components/ui/Skeleton';

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  tags: '',
  published: false,
  featured: false,
};

const cardGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
];

const categoryColors: Record<string, string> = {
  Leadership: 'bg-blue-100 text-blue-700 border-blue-200',
  Technology: 'bg-violet-100 text-violet-700 border-violet-200',
  Impact: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Innovation: 'bg-amber-100 text-amber-700 border-amber-200',
  Culture: 'bg-rose-100 text-rose-700 border-rose-200',
  Science: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const tagColors = [
  'bg-sky-100 text-sky-700',
  'bg-pink-100 text-pink-700',
  'bg-lime-100 text-lime-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-yellow-100 text-yellow-700',
];

function getCategoryColor(category: string) {
  return categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [fetchError, setFetchError] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
      setFetchError(false);
    } catch {
      setPosts([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {}),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        content,
        image: form.coverImage,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await api.put(`/posts/${editingId}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/posts', payload);
        toast.success('Post created');
      }
      resetForm();
      fetchPosts();
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post._id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || post.image || '',
      category: post.category,
      tags: post.tags.join(', '),
      published: post.published,
      featured: post.featured,
    });
    setContent(post.content);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const resetForm = () => {
    setForm(emptyPost);
    setContent('');
    setEditingId(null);
    setShowForm(false);
  };

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-3xl font-serif font-bold text-navy-800"
          >
            Blog Posts
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-1"
          >
            Manage blog posts and articles
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] text-white rounded-lg font-semibold shadow-lg shadow-navy-800/25 hover:shadow-xl hover:shadow-navy-800/30 transition-all cursor-pointer"
        >
          <FaPlus className="text-[#d4a843]" /> New Post
        </motion.button>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {/* Total Posts */}
        <div className="pwi-admin-card rounded-lg p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FaNewspaper className="text-white text-lg" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Posts</p>
            <p className="text-2xl font-bold text-navy-800">{posts.length}</p>
          </div>
        </div>

        {/* Published */}
        <div className="pwi-admin-card rounded-lg p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <FaCheckCircle className="text-white text-lg" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Published</p>
            <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
          </div>
        </div>

        {/* Drafts */}
        <div className="pwi-admin-card rounded-lg p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <FaPencilAlt className="text-white text-lg" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Drafts</p>
            <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
          </div>
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-end mb-6"
      >
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] text-white shadow-md'
                : 'text-gray-500 hover:text-navy-800'
            }`}
          >
            <FaThLarge className="text-xs" /> Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] text-white shadow-md'
                : 'text-gray-500 hover:text-navy-800'
            }`}
          >
            <FaList className="text-xs" /> Table
          </button>
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-12"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pwi-admin-card rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto mb-8 border border-gray-100"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    {editingId ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {editingId ? 'Update your blog post details' : 'Fill in the details for your new post'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-4 focus:ring-[#d4a843]/10 transition-all placeholder:text-gray-400"
                      placeholder="Post title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">Slug</label>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-4 focus:ring-[#d4a843]/10 transition-all font-mono text-sm placeholder:text-gray-400"
                      placeholder="post-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-4 focus:ring-[#d4a843]/10 transition-all resize-none placeholder:text-gray-400"
                    placeholder="Brief excerpt..."
                  />
                </div>

                <ImageUploadField
                  label="Cover Image"
                  description="Upload the image shown on blog cards, featured stories, and the article page."
                  value={form.coverImage}
                  onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
                  disabled={false}
                  previewShape="wide"
                />

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Content</label>
                  <MarkdownEditor value={content} onChange={setContent} />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Supports Markdown — use the toolbar, then switch to Preview to see the rendered article.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">Category</label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-4 focus:ring-[#d4a843]/10 transition-all placeholder:text-gray-400"
                      placeholder="Leadership"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1.5">Tags (comma-separated)</label>
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d4a843] focus:ring-4 focus:ring-[#d4a843]/10 transition-all placeholder:text-gray-400"
                      placeholder="leadership, impact, growth"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="published"
                        checked={form.published}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                    </div>
                    <span className="text-sm font-medium text-navy-800 group-hover:text-[#d4a843] transition-colors">
                      Published
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#d4a843] transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                    </div>
                    <span className="text-sm font-medium text-navy-800 group-hover:text-[#d4a843] transition-colors">
                      Featured
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] text-white rounded-lg font-semibold shadow-lg shadow-navy-800/25 hover:shadow-xl hover:shadow-navy-800/30 transition-all cursor-pointer"
                  >
                    {editingId ? 'Update' : 'Create'} Post
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        viewMode === 'table' ? <AdminTableSkeleton rows={6} columns={5} /> : <AdminCardGridSkeleton count={6} />
      ) : posts.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 pwi-admin-card rounded-2xl shadow-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] flex items-center justify-center shadow-lg shadow-navy-800/30">
            <FaNewspaper className="text-[#d4a843] text-3xl" />
          </div>
          <h3 className="text-xl font-serif font-bold text-navy-800 mb-2">No Posts Yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {fetchError
              ? 'Posts are unavailable right now. You can still draft a new story once the API is back online.'
              : 'Get started by creating your first blog post. Share stories that inspire.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] text-white rounded-lg font-semibold shadow-lg cursor-pointer"
          >
            <FaPlus className="text-[#d4a843]" /> Create First Post
          </motion.button>
        </motion.div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="pwi-admin-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Gradient Top Strip */}
              <div className={`h-1.5 bg-gradient-to-r ${cardGradients[index % cardGradients.length]}`} />

              <div className="p-5 flex flex-col flex-1">
                {/* Top Row: Status + Featured */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      post.published
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {post.published ? <FaEye className="text-[10px]" /> : <FaEyeSlash className="text-[10px]" />}
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  {post.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                      <FaStar className="text-[10px]" /> Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-serif font-bold text-navy-800 mb-1 line-clamp-2 group-hover:text-[#d4a843] transition-colors">
                  {post.title}
                </h3>

                {/* Slug */}
                <p className="text-xs font-mono text-gray-400 mb-3">/{post.slug}</p>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                )}

                {/* Category Badge */}
                {post.category && (
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(post.category)}`}
                    >
                      {post.category}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag, tagIdx) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${tagColors[tagIdx % tagColors.length]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.author && (
                      <span className="inline-flex items-center gap-1">
                        <FaUser className="text-[10px]" />
                        {post.author}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(post)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FaEdit className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(post._id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FaTrash className="text-sm" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add New Post Dashed Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: posts.length * 0.05 }}
            whileHover={{ y: -4, borderColor: '#d4a843' }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center py-16 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#1a1a2e] group-hover:to-[#2d2d5e] flex items-center justify-center mb-4 transition-all duration-300">
              <FaPlus className="text-gray-400 group-hover:text-[#d4a843] text-xl transition-colors duration-300" />
            </div>
            <p className="text-gray-400 group-hover:text-navy-800 font-semibold transition-colors duration-300">
              Add New Post
            </p>
            <p className="text-gray-300 group-hover:text-gray-500 text-sm mt-1 transition-colors duration-300">
              Click to create
            </p>
          </motion.button>
        </motion.div>
      ) : (
        /* Table View */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post, index) => (
                  <motion.tr
                    key={post._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1 h-10 rounded-full bg-gradient-to-b ${cardGradients[index % cardGradients.length]}`}
                        />
                        <div>
                          <div className="font-serif font-semibold text-navy-800 flex items-center gap-2">
                            {post.title}
                            {post.featured && <FaStar className="text-amber-400 text-xs" />}
                          </div>
                          <div className="text-xs font-mono text-gray-400 mt-0.5">/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(post.category)}`}
                        >
                          {post.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {post.tags.slice(0, 3).map((tag, tagIdx) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${tagColors[tagIdx % tagColors.length]}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          post.published
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {post.published ? <FaEye className="text-[10px]" /> : <FaEyeSlash className="text-[10px]" />}
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-[10px] text-gray-400" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(post)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(post._id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
