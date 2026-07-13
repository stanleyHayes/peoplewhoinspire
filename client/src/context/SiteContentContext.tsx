import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api from '../services/api';
import { IMAGES } from '../data/siteContent';
import { SOCIAL } from '../config/site';

/**
 * CMS-editable static site content.
 *
 * Admins can override the editorial hero/banner images and the social profile
 * links from /admin/site-content without redeploying. Overrides live in the
 * database and are served to visitors via the public-safe
 * GET /api/settings/public endpoint:
 *
 *   - page images → one `siteImages` document (group `appearance`) holding a
 *     map of { [imageKey]: cloudinaryUrl }
 *   - social links → individual documents in the `social` group, keyed as
 *     `instagram_url`, `facebook_url`, ... (the same keys the Settings page
 *     already edits — see SOCIAL_SETTING_KEYS below)
 *
 * Empty-string overrides mean "fall back to the code default".
 */

export type SiteImageKey = keyof typeof IMAGES;
export type SiteImages = Record<SiteImageKey, string>;
/** Mutable version of the `as const` SOCIAL config. */
export type SiteSocial = { -readonly [K in keyof typeof SOCIAL]: string };

/** Maps each SOCIAL config key to its database setting key (group `social`). */
// eslint-disable-next-line react-refresh/only-export-components
export const SOCIAL_SETTING_KEYS: Record<keyof SiteSocial, string> = {
  instagram: 'instagram_url',
  instagramHandle: 'instagram_handle',
  facebook: 'facebook_url',
  twitter: 'twitter_url',
  linkedin: 'linkedin_url',
  youtube: 'youtube_url',
};

interface PublicSettingsPayload {
  siteImages?: Partial<Record<SiteImageKey, string>>;
  /** Raw `social` group keyed by database setting key (e.g. `instagram_url`). */
  social?: Record<string, string>;
}

interface SiteContentContextValue {
  /** Editorial images: admin overrides merged over the bundled defaults. */
  images: SiteImages;
  /** Social profile links: admin overrides merged over the bundled defaults. */
  social: SiteSocial;
  /** True while the first fetch is in flight. */
  loading: boolean;
  /** Re-fetch overrides (used by the admin editor after saving). */
  refresh: () => Promise<void>;
}

function mergeImages(overrides?: Partial<Record<SiteImageKey, string>>): SiteImages {
  const merged = { ...IMAGES } as SiteImages;
  if (overrides) {
    for (const key of Object.keys(IMAGES) as SiteImageKey[]) {
      const value = overrides[key];
      if (typeof value === 'string' && value.trim()) {
        merged[key] = value.trim();
      }
    }
  }
  return merged;
}

function mergeSocial(raw?: Record<string, string>): SiteSocial {
  const merged = { ...SOCIAL } as SiteSocial;
  if (raw) {
    for (const configKey of Object.keys(SOCIAL) as (keyof SiteSocial)[]) {
      const value = raw[SOCIAL_SETTING_KEYS[configKey]];
      if (typeof value === 'string' && value.trim()) {
        merged[configKey] = value.trim();
      }
    }
  }
  return merged;
}

const defaultValue: SiteContentContextValue = {
  images: mergeImages(),
  social: mergeSocial(),
  loading: false,
  refresh: async () => {},
};

const SiteContentContext = createContext<SiteContentContextValue>(defaultValue);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<SiteImages>(defaultValue.images);
  const [social, setSocial] = useState<SiteSocial>(defaultValue.social);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api.get<PublicSettingsPayload>('/settings/public');
      const payload = response.data || {};
      setImages(mergeImages(payload.siteImages));
      setSocial(mergeSocial(payload.social));
    } catch {
      // The public site must never break because the settings API is down —
      // keep the bundled defaults.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SiteContentContextValue>(
    () => ({ images, social, loading, refresh }),
    [images, social, loading, refresh],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteContent() {
  return useContext(SiteContentContext);
}
