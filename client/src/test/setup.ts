import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((el) => el.remove());
});

// framer-motion's useInView / animations rely on IntersectionObserver, which
// jsdom does not implement. A no-op stand-in that reports "in view" keeps
// scroll-triggered components testable.
class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: number[] = [];
  constructor(private readonly callback?: IntersectionObserverCallback) {}
  observe = (element: Element) => {
    this.callback?.(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  };
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = () => [];
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Deterministic matchMedia (defaults to "no reduced motion").
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}));
