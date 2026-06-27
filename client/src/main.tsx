import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers';
import App from './App.tsx';
import './lib/i18n';
import { usePreferencesStore } from './store/preferencesStore';
import './index.css';

// نطبّق التفضيلات المحفوظة (السمة + الخط + الحجم) قبل أوّل رسم لتفادي الوميض.
usePreferencesStore.getState().apply();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
