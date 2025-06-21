
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './utils/logger'

// Register service worker for offline capability
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.info('Service Worker registered successfully', {
          scope: registration.scope
        });
      })
      .catch((error) => {
        logger.error('Service Worker registration failed', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
