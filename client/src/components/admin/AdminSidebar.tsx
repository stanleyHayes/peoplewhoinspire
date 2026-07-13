import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FaHome,
  FaNewspaper,
  FaProjectDiagram,
  FaUsers,
  FaCalendarAlt,
  FaHandshake,
  FaComments,
  FaEnvelope,
  FaUserFriends,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUsersCog,
  FaCog,
  FaHistory,
  FaChevronLeft,
  FaChevronDown,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { PWIMonogram } from '../ui/PWILogo';

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-500/20 text-purple-300',
  admin: 'bg-blue-500/20 text-blue-300',
  editor: 'bg-green-500/20 text-green-300',
  viewer: 'bg-gray-500/20 text-gray-300',
};

interface NavItem {
  icon: IconType;
  label: string;
  path: string;
  helper: string;
}

interface NavGroup {
  id: string;
  title: string;
  eyebrow: string;
  icon: IconType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    title: 'Overview',
    eyebrow: 'Start',
    icon: FaTachometerAlt,
    items: [
      {
        icon: FaTachometerAlt,
        label: 'Dashboard',
        path: '/admin/dashboard',
        helper: 'Platform snapshot',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content Studio',
    eyebrow: 'Publish',
    icon: FaNewspaper,
    items: [
      { icon: FaNewspaper, label: 'Blog Posts', path: '/admin/posts', helper: 'Stories and notes' },
      {
        icon: FaProjectDiagram,
        label: 'Programs',
        path: '/admin/programs',
        helper: 'Pathways and offers',
      },
      { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', helper: 'Sessions and dates' },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    eyebrow: 'People',
    icon: FaUsers,
    items: [
      { icon: FaUsers, label: 'Team', path: '/admin/team', helper: 'People and roles' },
      { icon: FaHandshake, label: 'Partners', path: '/admin/partners', helper: 'Alliances' },
      {
        icon: FaComments,
        label: 'Testimonials',
        path: '/admin/testimonials',
        helper: 'Community proof',
      },
      {
        icon: FaUserFriends,
        label: 'Subscribers',
        path: '/admin/subscribers',
        helper: 'Audience list',
      },
      { icon: FaEnvelope, label: 'Messages', path: '/admin/contacts', helper: 'Inbox' },
    ],
  },
  {
    id: 'system',
    title: 'System',
    eyebrow: 'Admin',
    icon: FaShieldAlt,
    items: [
      { icon: FaUsersCog, label: 'Users', path: '/admin/users', helper: 'Access control' },
      { icon: FaCog, label: 'Settings', path: '/admin/settings', helper: 'Preferences' },
      { icon: FaHistory, label: 'Audit Logs', path: '/admin/audit-logs', helper: 'Activity trail' },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function isActivePath(currentPath: string, itemPath: string) {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function Tooltip({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 min-w-40 -translate-y-1/2 rounded-xl border border-white/10 bg-navy-800 px-3 py-2 text-left shadow-xl opacity-0 transition-opacity group-hover:opacity-100">
      <p className="text-xs font-semibold text-white">{label}</p>
      {helper && <p className="mt-0.5 text-[11px] text-gray-400">{helper}</p>}
    </div>
  );
}

function NavItemLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="group relative">
      <Link
        to={item.path}
        onClick={onClick}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
          isActive
            ? 'bg-gold-400 text-navy-950 shadow-[0_10px_24px_-10px_rgba(212,168,67,0.8)]'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        } ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <item.icon className="shrink-0 text-base" aria-hidden="true" />
        <span
          className={`min-w-0 transition-all duration-300 ${
            collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'
          }`}
        >
          <span className="block truncate font-semibold">{item.label}</span>
          <span
            className={`block truncate text-[11px] ${
              isActive ? 'text-navy-950/65' : 'text-gray-500'
            }`}
          >
            {item.helper}
          </span>
        </span>
      </Link>
      {collapsed && <Tooltip label={item.label} helper={item.helper} />}
    </div>
  );
}

function NavGroupSection({
  group,
  open,
  collapsed,
  currentPath,
  onToggle,
  onItemClick,
}: {
  group: NavGroup;
  open: boolean;
  collapsed: boolean;
  currentPath: string;
  onToggle: () => void;
  onItemClick?: () => void;
}) {
  const groupActive = group.items.some((item) => isActivePath(currentPath, item.path));
  const Icon = group.icon;

  if (collapsed) {
    return (
      <div className="space-y-1 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
        <div className="group relative flex justify-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              groupActive ? 'bg-white/10 text-gold-300' : 'text-gray-500'
            }`}
          >
            <Icon aria-hidden="true" />
          </div>
          <Tooltip label={group.title} helper={group.eyebrow} />
        </div>
        {group.items.map((item) => (
          <NavItemLink
            key={item.path}
            item={item}
            isActive={isActivePath(currentPath, item.path)}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
          groupActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-300">
          <Icon aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300/80">
            {group.eyebrow}
          </span>
          <span className="block truncate text-sm font-semibold">{group.title}</span>
        </span>
        <FaChevronDown
          className={`text-xs transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="relative ml-7 mt-2 space-y-1 pl-5">
            <span className="absolute bottom-5 left-0 top-0 w-px bg-white/[0.12]" aria-hidden="true" />
            {group.items.map((item) => {
              const active = isActivePath(currentPath, item.path);
              return (
                <li key={item.path} className="relative">
                  <span
                    className={`absolute left-[-1.25rem] top-1/2 h-px w-5 ${
                      active ? 'bg-gold-400' : 'bg-white/15'
                    }`}
                    aria-hidden="true"
                  />
                  <NavItemLink
                    item={item}
                    isActive={active}
                    collapsed={collapsed}
                    onClick={onItemClick}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    navGroups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.id] = true;
      return acc;
    }, {}),
  );

  const activeGroupId = useMemo(
    () =>
      navGroups.find((group) =>
        group.items.some((item) => isActivePath(location.pathname, item.path)),
      )?.id,
    [location.pathname],
  );

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((current) =>
      current[activeGroupId] ? current : { ...current, [activeGroupId]: true },
    );
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const renderSidebar = (forceExpanded = false) => {
    const effectiveCollapsed = collapsed && !forceExpanded;

    return (
      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden shadow-2xl shadow-navy-950/20 transition-all duration-300 ${
          effectiveCollapsed ? 'w-[78px]' : 'w-72'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% -10%, rgba(212,168,67,0.12), transparent 40%),' +
            'linear-gradient(180deg, #15152b 0%, #0f0f1a 55%, #08080d 100%)',
        }}
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold-400 via-gold-300 to-navy-500" />
        <div className="border-b border-white/10 p-4">
          <Link
            to="/admin/dashboard"
            onClick={onMobileClose}
            className={`flex items-center gap-3 ${effectiveCollapsed ? 'justify-center' : ''}`}
          >
            <PWIMonogram size={40} className="shrink-0" />
            <div
              className={`min-w-0 transition-all duration-300 ${
                effectiveCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'
              }`}
            >
              <span className="block truncate font-serif text-lg font-bold leading-none text-white">
                PWI Admin
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gold-300/80">
                Management portal
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <NavGroupSection
              key={group.id}
              group={group}
              open={openGroups[group.id]}
              collapsed={effectiveCollapsed}
              currentPath={location.pathname}
              onToggle={() => toggleGroup(group.id)}
              onItemClick={onMobileClose}
            />
          ))}
        </nav>

        <div className="space-y-1.5 border-t border-white/10 p-3">
          <div className="group relative">
            <Link
              to="/"
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white ${
                effectiveCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <FaHome className="shrink-0 text-sm" aria-hidden="true" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  effectiveCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                View Site
              </span>
            </Link>
            {effectiveCollapsed && <Tooltip label="View Site" />}
          </div>

          <div
            className={`rounded-xl border border-white/10 bg-white/[0.04] p-2 ${
              effectiveCollapsed ? 'flex justify-center border-transparent bg-transparent p-0' : ''
            }`}
          >
            {effectiveCollapsed ? (
              <div className="group relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/20 text-xs font-bold text-gold-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <Tooltip label={user?.name || 'User'} helper={user?.email} />
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-xs font-bold text-gold-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                    {user?.role && (
                      <span
                        className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none ${roleColors[user.role] || 'bg-gray-500/20 text-gray-300'}`}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{user?.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="group relative">
            <button
              type="button"
              onClick={logout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300 ${
                effectiveCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <FaSignOutAlt className="shrink-0 text-sm" aria-hidden="true" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  effectiveCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                Sign Out
              </span>
            </button>
            {effectiveCollapsed && <Tooltip label="Sign Out" />}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="hidden w-full items-center justify-center rounded-lg py-1.5 text-gray-400 transition-all hover:bg-white/10 hover:text-white md:flex"
            title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div
              className={`transition-transform duration-300 ${
                effectiveCollapsed ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <FaChevronLeft className="text-sm" aria-hidden="true" />
            </div>
          </button>
        </div>
      </aside>
    );
  };

  return (
    <>
      <div className="hidden md:block">{renderSidebar(false)}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative z-50">{renderSidebar(true)}</div>
        </div>
      )}
    </>
  );
}
