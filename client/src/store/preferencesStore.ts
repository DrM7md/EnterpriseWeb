import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyFontFamily, applyFontSize, applyTheme, type FontFamily, type FontSize, type Theme } from '../lib/theme';

/** نمط فتح نماذج الإضافة/التعديل: لوح جانبي أو نافذة منبثقة. */
export type AddPattern = 'drawer' | 'modal';

/**
 * تفضيلات الواجهة (client-state) — في Zustand لا في TanStack Query (فصل صارم).
 * تُحفظ في localStorage لتبقى بين الجلسات. تُطبَّق على المستند عند كل تغيير.
 */
interface PreferencesState {
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  addPattern: AddPattern;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setAddPattern: (pattern: AddPattern) => void;
  toggleSidebar: () => void;
  /** يطبّق كل التفضيلات على المستند (يُستدعى عند الإقلاع). */
  apply: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      fontFamily: 'plex',
      fontSize: 'md',
      addPattern: 'drawer',
      sidebarCollapsed: false,
      setTheme: (theme) => { applyTheme(theme); set({ theme }); },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setFontFamily: (fontFamily) => { applyFontFamily(fontFamily); set({ fontFamily }); },
      setFontSize: (fontSize) => { applyFontSize(fontSize); set({ fontSize }); },
      setAddPattern: (addPattern) => set({ addPattern }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      apply: () => {
        const s = get();
        applyTheme(s.theme);
        applyFontFamily(s.fontFamily);
        applyFontSize(s.fontSize);
      },
    }),
    {
      name: 'ews-preferences',
      // عند استرجاع الحالة من localStorage نُعيد تطبيق كل التفضيلات.
      onRehydrateStorage: () => (state) => state?.apply(),
    },
  ),
);
