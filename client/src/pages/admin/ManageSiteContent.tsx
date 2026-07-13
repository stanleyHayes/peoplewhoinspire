import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaImages, FaLink, FaSave, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { Skeleton } from '../../components/ui/Skeleton';
import { IMAGES } from '../../data/siteContent';
import {
  SOCIAL_SETTING_KEYS,
  useSiteContent,
  type SiteImageKey,
  type SiteSocial,
} from '../../context/SiteContentContext';
import {
  SITE_IMAGE_FIELDS,
  SOCIAL_LINK_FIELDS,
} from '../../config/editableContent';

type ImageOverrides = Partial<Record<SiteImageKey, string>>;
type SocialValues = Record<keyof SiteSocial, string>;

interface PublicSettingsPayload {
  siteImages?: ImageOverrides;
  social?: Record<string, string>;
}

const IMAGE_KEYS = Object.keys(IMAGES) as SiteImageKey[];

const emptySocialValues = (): SocialValues =>
  Object.keys(SOCIAL_SETTING_KEYS).reduce((acc, key) => {
    acc[key as keyof SiteSocial] = '';
    return acc;
  }, {} as SocialValues);

export default function ManageSiteContent() {
  const { refresh: refreshSiteContent } = useSiteContent();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
  const [socialValues, setSocialValues] = useState<SocialValues>(emptySocialValues);
  const [savedSnapshot, setSavedSnapshot] = useState('');

  const snapshot = useMemo(
    () => JSON.stringify({ imageOverrides, socialValues }),
    [imageOverrides, socialValues],
  );
  const isDirty = snapshot !== savedSnapshot;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PublicSettingsPayload>('/settings/public');
      const payload = response.data || {};
      const nextImages: ImageOverrides = {};
      for (const key of IMAGE_KEYS) {
        const value = payload.siteImages?.[key];
        if (typeof value === 'string' && value.trim()) {
          nextImages[key] = value.trim();
        }
      }
      const nextSocial = emptySocialValues();
      for (const field of SOCIAL_LINK_FIELDS) {
        const raw = payload.social?.[SOCIAL_SETTING_KEYS[field.key]];
        nextSocial[field.key] = typeof raw === 'string' ? raw : '';
      }
      setImageOverrides(nextImages);
      setSocialValues(nextSocial);
      setSavedSnapshot(JSON.stringify({ imageOverrides: nextImages, socialValues: nextSocial }));
    } catch {
      toast.error('Failed to load site content settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = [
        { key: 'siteImages', value: imageOverrides, group: 'appearance' },
        ...SOCIAL_LINK_FIELDS.map((field) => ({
          key: SOCIAL_SETTING_KEYS[field.key],
          value: socialValues[field.key]?.trim() || '',
          group: 'social',
        })),
      ];
      await api.put('/settings', entries);
      setSavedSnapshot(snapshot);
      await refreshSiteContent();
      toast.success('Site content updated — changes are live');
    } catch {
      toast.error('Failed to save site content');
    } finally {
      setSaving(false);
    }
  };

  const customizedCount = IMAGE_KEYS.filter((key) => imageOverrides[key]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-white/10 pwi-panel-dark shadow-xl shadow-navy-950/10">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-5 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              CMS · No redeploy needed
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">Site Content</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Swap the hero and banner photography on every public page and keep the official
              social links current. Changes publish instantly for visitors.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving || loading}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              {saving ? 'Saving…' : 'Save & publish'}
            </button>
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] p-5 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Customized images
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-serif text-5xl font-bold">{customizedCount}</p>
              <p className="pb-2 text-sm text-gray-400">of {IMAGE_KEYS.length}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-400">
              Remaining images use the bundled defaults. Reset any image to fall back.
            </p>
            {isDirty && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold text-gold-300">
                Unsaved changes
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Page images */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
            <FaImages />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-navy-950">Page hero & banner images</h2>
            <p className="text-sm text-gray-500">
              Upload a replacement for any page. Leave untouched to keep the default photo.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {SITE_IMAGE_FIELDS.map((field) => {
              const override = imageOverrides[field.key];
              return (
                <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">{field.label}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">{field.placement}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        override
                          ? 'bg-gold-400/20 text-gold-700'
                          : 'bg-gray-200/70 text-gray-500'
                      }`}
                    >
                      {override && <FaCheckCircle className="text-[10px]" />}
                      {override ? 'Custom' : 'Default'}
                    </span>
                  </div>
                  <ImageUploadField
                    label=""
                    layout="stacked"
                    value={override || IMAGES[field.key]}
                    onChange={(url) =>
                      setImageOverrides((prev) => ({ ...prev, [field.key]: url }))
                    }
                    description={field.description}
                    helperText="Wide landscape photo recommended (at least 1600×900)."
                    removeLabel="Reset to default"
                    buttonLabel={override ? 'Replace image' : 'Upload custom image'}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Social links */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
            <FaLink />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-navy-950">Social profile links</h2>
            <p className="text-sm text-gray-500">
              Used in the footer, contact page, navbar, and search-engine metadata. Leave a field
              blank to keep the default.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {SOCIAL_LINK_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-semibold text-navy-800">
                  {field.label}
                </span>
                <input
                  type="text"
                  value={socialValues[field.key]}
                  onChange={(event) =>
                    setSocialValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                />
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Sticky save footer for long page */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSave className="text-xs" />
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
      </div>
    </div>
  );
}
