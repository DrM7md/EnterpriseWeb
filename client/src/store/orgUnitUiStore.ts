import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * حالة عرض شجرة الوحدات (client-state) — أيّ الوحدات مطويّة.
 * تُحفظ في localStorage لتبقى الحالة عند التنقّل بين الصفحات وإعادة التحميل.
 * نخزّن مصفوفة معرّفات (لا Set) كي تُسلسَل في JSON.
 */
interface OrgUnitUiState {
  collapsed: number[];
  toggle: (id: number) => void;
  expand: (id: number) => void;
}

export const useOrgUnitUiStore = create<OrgUnitUiState>()(
  persist(
    (set) => ({
      collapsed: [],
      toggle: (id) =>
        set((s) => ({ collapsed: s.collapsed.includes(id) ? s.collapsed.filter((x) => x !== id) : [...s.collapsed, id] })),
      expand: (id) => set((s) => (s.collapsed.includes(id) ? { collapsed: s.collapsed.filter((x) => x !== id) } : s)),
    }),
    { name: 'ews-orgunit-ui' },
  ),
);
