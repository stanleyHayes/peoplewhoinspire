import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Dismiss the boot splash screen once the app has mounted (with a brief
// minimum display time so it never flashes), then remove it from the DOM.
const splash = document.getElementById('pwi-splash');
if (splash) {
  window.setTimeout(() => {
    splash.classList.add('pwi-splash-hidden');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    // Fallback removal in case transitionend never fires.
    window.setTimeout(() => splash.remove(), 900);
  }, 700);
}
