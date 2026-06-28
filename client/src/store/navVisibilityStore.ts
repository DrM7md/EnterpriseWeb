import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * إخفاء عناصر القائمة الجانبية (client-state) — تحكّم إداري بالواجهة.
 * يُحفظ في localStorage. العنصر المخفيّ يُزال من القائمة، وأي وصول مباشر لمساره
 * يعرض صفحة «لا تملك صلاحية الوصول». نخزّن مفاتيح NavNode (لا Set) كي تُسلسَل JSON.
 */
interface NavVisibilityState {
  hidden: string[];
  toggle: (key: string) => void;
  isHidden: (key: string) => boolean;
}

export const useNavVisibilityStore = create<NavVisibilityState>()(
  persist(
    (set, get) => ({
      hidden: [],
      toggle: (key) =>
        set((s) => ({ hidden: s.hidden.includes(key) ? s.hidden.filter((k) => k !== key) : [...s.hidden, key] })),
      isHidden: (key) => get().hidden.includes(key),
    }),
    { name: 'ews-nav-visibility' },
  ),
);
