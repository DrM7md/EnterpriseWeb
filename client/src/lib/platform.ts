/** كشف نظام التشغيل لعرض الاختصار المناسب (⌘ على ماك، Ctrl على ويندوز/لينكس). */
export const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** تسمية اختصار لوحة الأوامر حسب المنصّة. */
export const commandShortcut = isMac ? '⌘K' : 'Ctrl+K';
