import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, type Theme } from '../lib/theme';

/** نمط فتح نماذج الإضافة/التعديل: لوح جانبي أو نافذة منبثقة. */
export type AddPattern = 'drawer' | 'modal';

/**
 * تفضيلات الواجهة (client-state) — في Zustand لا في TanStack Query (فصل صارم).
 * تُحفظ في localStorage لتبقى بين الجلسات. السمة تُطبَّق على المستند عند كل تغيير.
 */
interface PreferencesState {
  theme: Theme;
  addPattern: AddPattern;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAddPattern: (pattern: AddPattern) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      addPattern: 'drawer',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setAddPattern: (addPattern) => set({ addPattern }),
    }),
    {
      name: 'ews-preferences',
      // عند استرجاع الحالة من localStorage نُعيد تطبيق السمة المحفوظة.
      onRehydrateStorage: () => (state) => state && applyTheme(state.theme),
    },
  ),
);
