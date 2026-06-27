/** سمات الواجهة المتاحة. تُطبَّق عبر السمة data-theme على <html>. */
export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** يضبط سمة المستند (data-theme) لتفعيل متغيّرات الألوان المناسبة في CSS. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}
