import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaEdit,
  FaEnvelope,
  FaFilter,
  FaKey,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUserCheck,
  FaUserClock,
  FaUserShield,
  FaUserSlash,
  FaUsersCog,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import { AdminTableSkeleton } from '../../components/ui/Skeleton';

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    total: number;
    active: number;
    invited: number;
    inactive: number;
    roles: Record<User['role'], number>;
  };
}

const roleColors: Record<User['role'], string> = {
  superadmin: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
  admin: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  editor: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  viewer: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

const roleGradients: Record<User['role'], string> = {
  superadmin: 'from-purple-500 to-violet-700',
  admin: 'from-blue-500 to-indigo-600',
  editor: 'from-emerald-500 to-teal-600',
  viewer: 'from-gray-400 to-gray-500',
};

const statusColors: Record<User['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  inactive: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200',
  invited: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

const emptyInvite = {
  name: '',
  email: '',
  role: 'editor' as User['role'],
};

const emptyEdit = {
  name: '',
  role: 'editor' as User['role'],
  status: 'active' as User['status'],
};

const emptySummary: UsersResponse['summary'] = {
  total: 0,
  active: 0,
  invited: 0,
  inactive: 0,
  roles: {
    superadmin: 0,
    admin: 0,
    editor: 0,
    viewer: 0,
  },
};

function formatDate(dateString?: string) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRole(role: User['role']) {
  return role === 'superadmin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStatus(status: User['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusIcon(status: User['status']) {
  if (status === 'active') return FaUserCheck;
  if (status === 'invited') return FaUserClock;
  return FaUserSlash;
}

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UsersResponse['summary']>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [newPassword, setNewPassword] = useState('');

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const currentUserId = currentUser?._id || (currentUser as { id?: string } | null)?.id;
  const hasFilters = Boolean(search.trim() || roleFilter || statusFilter);

  const fetchUsers = useCallback(
    async (nextPage: number) => {
      try {
        setLoading(true);
        const response = await api.get<UsersResponse>('/auth/users', {
          params: {
            page: nextPage,
            limit,
            search: search.trim() || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
          },
        });

        setUsers(response.data.users);
        setSummary(response.data.summary);
        setPage(response.data.pagination.page);
        setLimit(response.data.pagination.limit);
        setTotal(response.data.pagination.total);
        setTotalPages(Math.max(response.data.pagination.pages, 1));
      } catch {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    },
    [limit, roleFilter, search, statusFilter]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => fetchUsers(page), search.trim() ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [fetchUsers, page, search]);

  const resetToFirstPage = () => setPage(1);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/users/invite', inviteForm);
      toast.success('User invited successfully');
      setShowInviteModal(false);
      setInviteForm(emptyInvite);
      setPage(1);
      fetchUsers(1);
    } catch {
      toast.error('Failed to invite user');
    }
  };

  const handleEditOpen = (user: User) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/auth/users/${editingId}`, editForm);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingId(null);
      fetchUsers(page);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted');
      fetchUsers(page);
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleResetOpen = (id: string) => {
    setEditingId(id);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/auth/users/${editingId}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setEditingId(null);
      setNewPassword('');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const statCards = [
    {
      label: 'Total Users',
      value: summary.total,
      icon: FaUsersCog,
      gradient: 'from-violet-500 to-purple-700',
      color: 'text-navy-900',
    },
    {
      label: 'Active',
      value: summary.active,
      icon: FaUserCheck,
      gradient: 'from-emerald-500 to-teal-600',
      color: 'text-emerald-600',
    },
    {
      label: 'Invited',
      value: summary.invited,
      icon: FaUserClock,
      gradient: 'from-amber-500 to-orange-600',
      color: 'text-amber-600',
    },
    {
      label: 'Inactive',
      value: summary.inactive,
      icon: FaUserSlash,
      gradient: 'from-gray-400 to-gray-500',
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Access control
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
              User Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Invite team members, assign roles, reset credentials, and keep administrative access easy to audit.
            </p>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Role mix</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Object.entries(summary.roles).map(([role, count]) => (
                <div key={role} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="font-serif text-2xl font-bold">{count}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/45">
                    {formatRole(role as User['role'])}
                  </p>
                </div>
              ))}
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="pwi-admin-card rounded-2xl p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_190px_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Search</span>
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
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Role</span>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
            >
              <option value="">All roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Status</span>
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
              <option value="invited">Invited</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-950/10 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gold-300 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaFilter className="text-xs" />
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setInviteForm(emptyInvite);
                setShowInviteModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800"
            >
              <FaPlus className="text-gold-300" />
              Invite
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <AdminTableSkeleton rows={limit} columns={6} />
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card rounded-2xl p-12 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            <FaUsersCog className="text-2xl text-gray-400" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900">
            {hasFilters ? 'No users match these filters' : 'No team members yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? 'Clear the filters or try a different search.'
              : 'Invite team members and assign roles to control platform access.'}
          </p>
        </motion.div>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pwi-admin-card overflow-hidden rounded-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">User</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Last Login</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, index) => {
                  const isCurrentUser = user._id === currentUserId;
                  const gradient = roleGradients[user.role] || roleGradients.viewer;
                  const StatusIcon = statusIcon(user.status);
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.03, 0.35) }}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-sm`}
                          >
                            <span className="text-sm font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-navy-900">{user.name}</p>
                              {isCurrentUser && (
                                <span className="rounded-md bg-gold-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gold-600">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${roleColors[user.role]}`}
                        >
                          <FaUserShield className="text-[10px]" />
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${statusColors[user.status]}`}
                        >
                          <StatusIcon className="text-[10px]" />
                          {formatStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(user.lastLogin)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => handleEditOpen(user)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                              title="Edit user"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleResetOpen(user._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 transition-colors hover:bg-amber-100"
                            title="Reset password"
                          >
                            <FaKey className="text-sm" />
                          </button>
                          {isSuperAdmin && !isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user._id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                              title="Delete user"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
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
            itemLabel="users"
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            disabled={loading}
          />
        </motion.section>
      )}

      {showInviteModal && (
        <UserModal title="Invite User" onClose={() => setShowInviteModal(false)}>
          <form onSubmit={handleInvite} className="space-y-5">
            <TextField
              label="Name"
              value={inviteForm.name}
              onChange={(value) => setInviteForm({ ...inviteForm, name: value })}
              placeholder="Full name"
            />
            <TextField
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(value) => setInviteForm({ ...inviteForm, email: value })}
              placeholder="user@example.com"
            />
            <SelectField
              label="Role"
              value={inviteForm.role}
              onChange={(value) => setInviteForm({ ...inviteForm, role: value as User['role'] })}
              options={[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' },
                ...(isSuperAdmin ? [{ value: 'superadmin', label: 'Super Admin' }] : []),
              ]}
            />
            <ModalActions
              onCancel={() => setShowInviteModal(false)}
              submitLabel="Send Invite"
              submitIcon={<FaEnvelope />}
            />
          </form>
        </UserModal>
      )}

      {showEditModal && (
        <UserModal title="Edit User" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSave} className="space-y-5">
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(value) => setEditForm({ ...editForm, name: value })}
              placeholder="Full name"
            />
            <SelectField
              label="Role"
              value={editForm.role}
              onChange={(value) => setEditForm({ ...editForm, role: value as User['role'] })}
              options={[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' },
                ...(isSuperAdmin ? [{ value: 'superadmin', label: 'Super Admin' }] : []),
              ]}
            />
            <SelectField
              label="Status"
              value={editForm.status}
              onChange={(value) => setEditForm({ ...editForm, status: value as User['status'] })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'invited', label: 'Invited' },
              ]}
            />
            <ModalActions onCancel={() => setShowEditModal(false)} submitLabel="Save Changes" />
          </form>
        </UserModal>
      )}

      {showResetModal && (
        <UserModal title="Reset Password" onClose={() => setShowResetModal(false)}>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimum 6 characters"
              minLength={6}
            />
            <ModalActions
              onCancel={() => setShowResetModal(false)}
              submitLabel="Reset Password"
              submitIcon={<FaKey />}
            />
          </form>
        </UserModal>
      )}
    </div>
  );
}

function UserModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pwi-admin-card mb-8 max-h-[85vh] w-[95vw] overflow-y-auto rounded-2xl shadow-2xl sm:w-full sm:max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-navy-950/10 p-5">
          <h2 className="font-serif text-xl font-bold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-navy-900"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy-900">{label}</span>
      <input
        type={type}
        value={value}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15"
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-navy-900">{label}</span>
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

function ModalActions({
  onCancel,
  submitLabel,
  submitIcon,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitIcon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-navy-950/10 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-navy-950/10 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-navy-900"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800"
      >
        {submitIcon}
        {submitLabel}
      </button>
    </div>
  );
}
