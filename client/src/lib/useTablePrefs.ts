import { useState } from 'react';

export type TableView = 'table' | 'cards';

interface TablePrefs {
  view: TableView;
  hidden: string[];
}

const keyOf = (id: string) => `ews-table-${id}`;

function read(id: string, defaultView: TableView): TablePrefs {
  try {
    const raw = localStorage.getItem(keyOf(id));
    const parsed = raw ? (JSON.parse(raw) as Partial<TablePrefs>) : {};
    return { view: parsed.view ?? defaultView, hidden: parsed.hidden ?? [] };
  } catch {
    return { view: defaultView, hidden: [] };
  }
}

/**
 * تفضيلات الجدول (طريقة العرض + الأعمدة المخفية) محفوظة في localStorage لكل جدول.
 * تُسترجَع تلقائيًا — فيبقى آخر اختيار للمستخدم بين الجلسات.
 */
export function useTablePrefs(id: string, defaultView: TableView = 'table') {
  const [prefs, setPrefs] = useState<TablePrefs>(() => read(id, defaultView));

  const persist = (next: TablePrefs) => {
    setPrefs(next);
    localStorage.setItem(keyOf(id), JSON.stringify(next));
  };

  return {
    view: prefs.view,
    hidden: new Set(prefs.hidden),
    setView: (view: TableView) => persist({ ...prefs, view }),
    toggleColumn: (colKey: string) => {
      const hidden = prefs.hidden.includes(colKey)
        ? prefs.hidden.filter((k) => k !== colKey)
        : [...prefs.hidden, colKey];
      persist({ ...prefs, hidden });
    },
  };
}
