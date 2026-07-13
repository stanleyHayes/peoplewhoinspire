import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top of the page on every route (pathname)
 * change. In-page hash links (e.g. /page#section) are left for the browser
 * to resolve so anchor navigation keeps working.
 *
 * Render once, inside the router (see App.tsx).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
