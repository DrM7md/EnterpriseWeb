import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers';
import App from './App.tsx';
import './lib/i18n';
import { applyTheme } from './lib/theme';
import { usePreferencesStore } from './store/preferencesStore';
import './index.css';

// نطبّق السمة المحفوظة قبل أوّل رسم لتفادي وميض السمة.
applyTheme(usePreferencesStore.getState().theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
