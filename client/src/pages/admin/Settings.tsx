import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaCog,
  FaSearch,
  FaShareAlt,
  FaPalette,
  FaSave,
  FaLock,
  FaBell,
  FaDesktop,
  FaEdit,
  FaShieldAlt,
  FaCheckCircle,
  FaImage,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Setting } from '../../types';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

type TabId = 'profile' | 'password' | 'general' | 'seo' | 'social' | 'appearance' | 'preferences';

const AVATAR_ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

interface TabConfig {
  id: TabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingField {
  key: string;
  label: string;
  description: string;
  type?: 'color' | 'email' | 'image' | 'text' | 'url';
}

const tabs: TabConfig[] = [
  { id: 'profile', label: 'Profile', description: 'Identity and photo', icon: FaUser },
  { id: 'password', label: 'Password', description: 'Security credentials', icon: FaLock },
  { id: 'general', label: 'General', description: 'Public site basics', icon: FaCog },
  { id: 'seo', label: 'SEO', description: 'Search and sharing defaults', icon: FaSearch },
  { id: 'social', label: 'Social Media', description: 'Official public channels', icon: FaShareAlt },
  { id: 'appearance', label: 'Appearance', description: 'Brand colors and visual assets', icon: FaPalette },
  { id: 'preferences', label: 'Preferences', description: 'Admin workflow defaults', icon: FaBell },
];

// Setting field definitions
const settingFields: Record<string, SettingField[]> = {
  general: [
    { key: 'site_name', label: 'Site Name', description: 'The name of your website displayed in the browser tab and header' },
    { key: 'site_description', label: 'Site Description', description: 'A brief description of your website for search engines' },
    { key: 'contact_email', label: 'Contact Email', description: 'Primary contact email displayed on the website', type: 'email' },
    { key: 'founder_name', label: 'Founder Name', description: 'The name of the organization founder' },
  ],
  seo: [
    { key: 'meta_title', label: 'Meta Title', description: 'Default page title for search engine results (50-60 characters recommended)' },
    { key: 'meta_description', label: 'Meta Description', description: 'Default meta description for search engines (150-160 characters recommended)' },
    { key: 'og_image_url', label: 'Open Graph Image', description: 'Default sharing image for social cards (1200x630px recommended)', type: 'image' },
  ],
  social: [
    { key: 'twitter_url', label: 'Twitter / X', description: 'Your Twitter or X profile URL', type: 'url' },
    { key: 'instagram_url', label: 'Instagram', description: 'Your Instagram profile URL', type: 'url' },
    { key: 'linkedin_url', label: 'LinkedIn', description: 'Your LinkedIn page URL', type: 'url' },
    { key: 'youtube_url', label: 'YouTube', description: 'Your YouTube channel URL', type: 'url' },
    { key: 'facebook_url', label: 'Facebook', description: 'Your Facebook page URL', type: 'url' },
  ],
  appearance: [
    { key: 'primary_color', label: 'Primary Color', description: 'Main brand color used across the site', type: 'color' },
    { key: 'accent_color', label: 'Accent Color', description: 'Secondary accent color for highlights and CTAs', type: 'color' },
    { key: 'logo_url', label: 'Site Logo', description: 'Primary logo image used across the site (SVG or PNG recommended)', type: 'image' },
    { key: 'favicon_url', label: 'Favicon', description: 'Small browser icon for tabs and bookmarks (32x32px recommended)', type: 'image' },
  ],
};

// Preference sections configuration
interface PrefToggle {
  kind: 'toggle';
  key: string;
  label: string;
  description: string;
}

interface PrefDropdown {
  kind: 'dropdown';
  key: string;
  label: string;
  description: string;
  options: { value: string; label: string }[];
}

interface PrefText {
  kind: 'text';
  key: string;
  label: string;
  description: string;
  placeholder: string;
}

type PrefField = PrefToggle | PrefDropdown | PrefText;

interface PrefSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  fields: PrefField[];
}

const preferenceSections: PrefSection[] = [
  {
    title: 'Notifications',
    description: 'Control how and when you receive email notifications',
    icon: FaBell,
    iconColor: 'from-amber-500 to-orange-500',
    fields: [
      { kind: 'toggle', key: 'pref_notify_contact', label: 'New contact messages', description: 'Receive an email when someone submits a contact form' },
      { kind: 'toggle', key: 'pref_notify_subscriber', label: 'New subscribers', description: 'Receive an email when someone subscribes to the newsletter' },
      { kind: 'toggle', key: 'pref_notify_digest', label: 'Weekly activity digest', description: 'Receive a weekly summary of site activity every Monday' },
    ],
  },
  {
    title: 'Display',
    description: 'Customize your admin panel experience',
    icon: FaDesktop,
    iconColor: 'from-blue-500 to-indigo-500',
    fields: [
      {
        kind: 'dropdown',
        key: 'pref_default_page',
        label: 'Default page after login',
        description: 'Choose which admin page loads first when you sign in',
        options: [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'posts', label: 'Posts' },
          { value: 'messages', label: 'Messages' },
        ],
      },
      {
        kind: 'dropdown',
        key: 'pref_items_per_page',
        label: 'Items per page in tables',
        description: 'Number of rows displayed in data tables',
        options: [
          { value: '10', label: '10' },
          { value: '25', label: '25' },
          { value: '50', label: '50' },
          { value: '100', label: '100' },
        ],
      },
      { kind: 'toggle', key: 'pref_welcome_banner', label: 'Show welcome banner', description: 'Display the welcome banner on the dashboard' },
    ],
  },
  {
    title: 'Editor',
    description: 'Configure defaults for the post editor',
    icon: FaEdit,
    iconColor: 'from-emerald-500 to-teal-500',
    fields: [
      {
        kind: 'dropdown',
        key: 'pref_default_post_status',
        label: 'Default post status',
        description: 'Initial status when creating a new post',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ],
      },
      {
        kind: 'dropdown',
        key: 'pref_autosave_interval',
        label: 'Auto-save drafts',
        description: 'Automatically save draft content at a regular interval',
        options: [
          { value: '0', label: 'Off' },
          { value: '1', label: 'Every 1 minute' },
          { value: '5', label: 'Every 5 minutes' },
          { value: '10', label: 'Every 10 minutes' },
        ],
      },
      { kind: 'text', key: 'pref_default_category', label: 'Default post category', description: 'Category applied to new posts by default', placeholder: 'e.g. General, Inspiration' },
    ],
  },
  {
    title: 'Security',
    description: 'Manage session and password policies',
    icon: FaShieldAlt,
    iconColor: 'from-red-500 to-rose-500',
    fields: [
      {
        kind: 'dropdown',
        key: 'pref_session_timeout',
        label: 'Session timeout',
        description: 'Automatically log out after a period of inactivity',
        options: [
          { value: '1h', label: '1 hour' },
          { value: '4h', label: '4 hours' },
          { value: '8h', label: '8 hours' },
          { value: '24h', label: '24 hours' },
          { value: '7d', label: '7 days' },
        ],
      },
      {
        kind: 'dropdown',
        key: 'pref_password_rotation',
        label: 'Require password change',
        description: 'Force a password change after the specified number of days',
        options: [
          { value: 'never', label: 'Never' },
          { value: '30', label: 'Every 30 days' },
          { value: '60', label: 'Every 60 days' },
          { value: '90', label: 'Every 90 days' },
        ],
      },
    ],
  },
];

function SettingsPanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5" aria-hidden="true">
      <div className="flex items-start gap-4 border-b border-navy-950/10 bg-[#fbfaf6] p-5">
        <Skeleton className="h-12 w-12 shrink-0" />
        <div className="w-full max-w-md">
          <Skeleton className="mb-3 h-3 w-28" />
          <Skeleton className="h-7 w-64 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 p-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-lg border border-navy-950/10 bg-[#fbfaf6] p-4">
            <Skeleton className="mb-3 h-4 w-36" />
            <SkeletonText lines={2} />
            <Skeleton className="mt-4 h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings');
      const settingsMap: Record<string, string> = {};
      const data = response.data;

      if (Array.isArray(data)) {
        // Flat array of Setting objects
        (data as Setting[]).forEach((s) => {
          settingsMap[s.key] = s.value;
        });
      } else if (data && typeof data === 'object') {
        // Grouped format: { general: { key: value }, social: { key: value }, ... }
        for (const group of Object.values(data) as Record<string, string>[]) {
          for (const [key, value] of Object.entries(group)) {
            settingsMap[key] = typeof value === 'string' ? value : String(value ?? '');
          }
        }
      }

      setSettings(settingsMap);
      setOriginalSettings(settingsMap);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const changedEntries: Array<{ key: string; value: string; group: string }> = [];

      // Determine the group for a settings key
      const getGroup = (key: string): string => {
        if (key.startsWith('meta_') || key.startsWith('og_')) return 'seo';
        if (['twitter', 'instagram', 'linkedin', 'youtube', 'facebook'].some((s) => key.startsWith(s))) return 'social';
        if (key.startsWith('primary_color') || key.startsWith('accent_color') || key.startsWith('logo') || key.startsWith('favicon')) return 'appearance';
        if (key.startsWith('pref_')) return 'general';
        return 'general';
      };

      Object.keys(settings).forEach((key) => {
        if (settings[key] !== originalSettings[key]) {
          changedEntries.push({ key, value: settings[key], group: getGroup(key) });
        }
      });
      // Also include any new keys
      Object.keys(settings).forEach((key) => {
        if (!(key in originalSettings) && settings[key]) {
          changedEntries.push({ key, value: settings[key], group: getGroup(key) });
        }
      });

      if (changedEntries.length === 0) {
        toast('No changes to save');
        setSaving(false);
        return;
      }

      await api.put('/settings', changedEntries);
      setOriginalSettings({ ...settings });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (avatarUploading) {
      toast('Please wait for the profile photo to finish uploading');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: profileName, avatar: profileAvatar });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordVal !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPasswordVal.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await updatePassword({ currentPassword, newPassword: newPasswordVal });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPasswordVal('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-navy-950/10 bg-white px-4 py-3 text-sm text-navy-900 shadow-sm shadow-navy-950/[0.02] outline-none transition-all placeholder:text-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15';
  const changedCount = Object.keys(settings).filter((key) => settings[key] !== originalSettings[key]).length;
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveTabIcon = activeTabConfig.icon;
  const imageSettingsConfigured = ['og_image_url', 'logo_url', 'favicon_url'].filter((key) => settings[key]).length;
  const socialLinksConfigured = ['twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url', 'facebook_url'].filter(
    (key) => settings[key]
  ).length;
  const renderImageSettingField = (field: SettingField) => {
    return (
      <ImageUploadField
        label={field.label}
        description={field.description}
        value={settings[field.key] || ''}
        onChange={(url) => handleSettingChange(field.key, url)}
        disabled={saving}
        previewShape={field.key === 'favicon_url' ? 'square' : field.key === 'logo_url' ? 'logo' : 'wide'}
        layout="stacked"
      />
    );
  };

  const renderSettingField = (field: SettingField, idx: number) => (
    <motion.div
      key={field.key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={field.type === 'image' ? '' : 'rounded-lg border border-navy-950/10 bg-white p-4 shadow-sm shadow-navy-950/[0.02]'}
    >
      {field.type === 'image' ? (
        renderImageSettingField(field)
      ) : (
        <>
          <label className="block text-sm font-semibold text-navy-900">{field.label}</label>
          <p className="mt-1 text-xs leading-5 text-gray-500">{field.description}</p>
          <div className="mt-3">
            {field.type === 'color' ? (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings[field.key] || '#000000'}
                  onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  className="h-12 w-14 cursor-pointer rounded-xl border border-navy-950/10 bg-white p-1"
                />
                <input
                  type="text"
                  value={settings[field.key] || ''}
                  onChange={(e) => handleSettingChange(field.key, e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="#000000"
                />
              </div>
            ) : (
              <input
                type={field.type === 'email' ? 'email' : 'text'}
                value={settings[field.key] || ''}
                onChange={(e) => handleSettingChange(field.key, e.target.value)}
                className={inputClass}
                placeholder={
                  field.type === 'url'
                    ? 'https://...'
                    : field.type === 'email'
                      ? 'email@example.com'
                      : `Enter ${field.label.toLowerCase()}`
                }
              />
            )}
          </div>
        </>
      )}
    </motion.div>
  );

  const renderProfileTab = () => (
    <motion.form
        onSubmit={handleSaveProfile}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5"
      >
        <div className="border-b border-navy-950/10 bg-[#fbfaf6] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Account Identity</p>
          <h3 className="mt-1 font-serif text-xl font-bold text-navy-950">Profile Details</h3>
        </div>

        <div className="grid gap-5 p-5 2xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <div className="rounded-lg border border-navy-950/10 bg-[#fbfaf6] p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-300">
                <FaUser />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-950">
                  {profileName || user?.name || 'Admin'}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <ImageUploadField
              label="Profile Photo"
              value={profileAvatar}
              onChange={setProfileAvatar}
              uploadPath="/upload/avatar"
              accept={AVATAR_ACCEPTED_TYPES}
              previewShape="circle"
              disabled={saving}
              onUploadingChange={setAvatarUploading}
              buttonLabel="Choose Photo"
              description="Upload the profile image shown on your admin account."
              helperText="JPG, PNG, WebP, or GIF. Maximum file size: 5MB."
              layout="stacked"
            />
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">Email</label>
                <input
                  value={user?.email || ''}
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
                  title={user?.email || ''}
                />
              </div>
            </div>

            <div className="rounded-lg border border-navy-950/10 bg-[#fbfaf6] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FaCheckCircle />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">Profile saves to your admin account</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    The selected image uploads first, then the secure image URL is saved with your profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-navy-950/10 bg-white p-4 shadow-sm shadow-navy-950/[0.02] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-gray-500">
                {avatarUploading
                  ? <Skeleton className="h-4 w-72 max-w-full" />
                  : 'Save after updating your name or profile photo.'}
              </p>
              <button
                type="submit"
                disabled={saving || avatarUploading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Skeleton tone="dark" className="h-5 w-28" />
                ) : (
                  <>
                    <FaSave />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
    </motion.form>
  );

  const renderPasswordTab = () => (
    <motion.form
      onSubmit={handleChangePassword}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5"
    >
      <div className="flex flex-col gap-4 border-b border-navy-950/10 bg-[#fbfaf6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-300">
            <FaLock />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Security</p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-navy-950">Change Password</h3>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          <FaShieldAlt className="text-red-500" />
          Protected account
        </span>
      </div>

      <div className="grid items-start gap-5 p-5 lg:grid-cols-[minmax(0,560px)_minmax(260px,1fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-navy-900">Current Password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="Enter current password"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-navy-900">New Password</span>
            <input
              type="password"
              value={newPasswordVal}
              onChange={(e) => setNewPasswordVal(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              placeholder="Minimum 6 characters"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-navy-900">Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              placeholder="Repeat new password"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <Skeleton tone="dark" className="h-5 w-36" />
            ) : (
              <>
                <FaLock />
                Change Password
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-navy-950/10 bg-[#fbfaf6] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FaShieldAlt />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy-900">Keep account access separate</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Password updates live here now, away from profile photo and identity edits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );

  const renderSettingsTab = (group: string) => {
    const fields = settingFields[group] || [];
    const tab = tabs.find((item) => item.id === group);
    const TabIcon = tab?.icon || FaCog;

    if (loadingSettings) {
      return <SettingsPanelSkeleton rows={fields.length || 4} />;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5"
      >
        <div className="flex flex-col gap-4 border-b border-navy-950/10 bg-[#fbfaf6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-300">
              <TabIcon />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">{tab?.label}</p>
              <h3 className="mt-1 font-serif text-2xl font-bold text-navy-950">{tab?.description}</h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            <FaCheckCircle className="text-emerald-500" />
            {fields.length} fields
          </span>
        </div>

        <div className="grid gap-4 p-5">
          {fields.map((field, idx) => renderSettingField(field, idx))}
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-950/10 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {changedCount > 0 ? `${changedCount} unsaved setting${changedCount === 1 ? '' : 's'}` : 'All settings are saved'}
          </p>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Skeleton tone="dark" className="h-5 w-32" />
            ) : (
              <>
                <FaSave />
                Save Settings
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderPreferencesTab = () => {
    if (loadingSettings) {
      return <SettingsPanelSkeleton rows={6} />;
    }

    const isToggleOn = (key: string) => settings[key] === 'true';

    const handleToggle = (key: string) => {
      const current = settings[key] === 'true';
      handleSettingChange(key, current ? 'false' : 'true');
    };

    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {preferenceSections.map((section, sectionIdx) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.06 }}
                className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5"
              >
                <div className="flex items-start gap-4 border-b border-navy-950/10 bg-[#fbfaf6] p-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${section.iconColor}`}
                  >
                    <SectionIcon className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-950">{section.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{section.description}</p>
                  </div>
                </div>

                <div className="divide-y divide-navy-950/10">
                  {section.fields.map((field, fieldIdx) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIdx * 0.06 + fieldIdx * 0.03 }}
                      className="p-5"
                    >
                      {field.kind === 'toggle' && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <label className="block text-sm font-semibold text-navy-900">{field.label}</label>
                            <p className="mt-1 text-xs leading-5 text-gray-500">{field.description}</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={isToggleOn(field.key)}
                              onChange={() => handleToggle(field.key)}
                              className="peer sr-only"
                            />
                            <div className="h-7 w-12 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500" />
                            <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                          </label>
                        </div>
                      )}

                      {field.kind === 'dropdown' && (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-navy-900">{field.label}</label>
                          <p className="mb-3 text-xs leading-5 text-gray-500">{field.description}</p>
                          <select
                            value={settings[field.key] || field.options[0]?.value || ''}
                            onChange={(e) => handleSettingChange(field.key, e.target.value)}
                            className={`${inputClass} cursor-pointer appearance-none`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.75rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.25em 1.25em',
                              paddingRight: '2.5rem',
                            }}
                          >
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {field.kind === 'text' && (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-navy-900">{field.label}</label>
                          <p className="mb-3 text-xs leading-5 text-gray-500">{field.description}</p>
                          <input
                            type="text"
                            value={settings[field.key] || ''}
                            onChange={(e) => handleSettingChange(field.key, e.target.value)}
                            className={inputClass}
                            placeholder={field.placeholder}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-navy-950/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {changedCount > 0 ? `${changedCount} unsaved preference change${changedCount === 1 ? '' : 's'}` : 'Preferences are saved'}
          </p>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,26,46,0.6)] transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Skeleton tone="dark" className="h-5 w-36" />
            ) : (
              <>
                <FaSave />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-6 text-white md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Admin settings</p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">
              Control the account, brand, and publishing defaults from one place.
            </h1>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <FaUser className="text-gold-300" />
                {user?.role || 'admin'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <FaCheckCircle className="text-emerald-300" />
                {changedCount > 0 ? `${changedCount} pending` : 'Saved'}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sections', value: tabs.length, icon: FaCog },
                { label: 'Image Assets', value: `${imageSettingsConfigured}/3`, icon: FaImage },
                { label: 'Social Links', value: `${socialLinksConfigured}/5`, icon: FaShareAlt },
                { label: 'Unsaved', value: changedCount, icon: FaSave },
              ].map((item) => {
                const StatIcon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <StatIcon className="text-gold-300" />
                    <p className="mt-4 font-serif text-2xl font-bold">{item.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/45">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <nav className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm shadow-navy-950/5">
            <div className="border-b border-navy-950/10 bg-[#fbfaf6] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Setting Groups</p>
            </div>
            <div className="grid gap-1 p-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-navy-950 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-navy-950'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? 'bg-gold-400 text-navy-950' : 'bg-[#fbfaf6] text-gold-600'
                      }`}
                    >
                      <Icon className="text-sm" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{tab.label}</span>
                      <span className={`mt-0.5 block text-xs leading-5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-navy-950/10 bg-white p-4 shadow-sm shadow-navy-950/5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-navy-950">
                <ActiveTabIcon />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">{activeTabConfig.label}</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-950">{activeTabConfig.description}</h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-navy-950/10 bg-[#fbfaf6] px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              <FaCheckCircle className={changedCount > 0 ? 'text-gold-500' : 'text-emerald-500'} />
              {changedCount > 0 ? `${changedCount} pending` : 'Synced'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'password' && renderPasswordTab()}
              {activeTab === 'preferences' && renderPreferencesTab()}
              {activeTab !== 'profile' &&
                activeTab !== 'password' &&
                activeTab !== 'preferences' &&
                renderSettingsTab(activeTab)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
