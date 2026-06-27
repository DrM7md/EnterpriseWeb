/** سمات الواجهة المتاحة. تُطبَّق عبر السمة data-theme على <html>. */
export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** خطوط الواجهة المتاحة (كلها تدعم العربية). */
export const FONT_FAMILIES = ['plex', 'cairo', 'tajawal', 'system'] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

const FONT_STACKS: Record<FontFamily, string> = {
  plex: '"IBM Plex Sans Arabic", sans-serif',
  cairo: '"Cairo", sans-serif',
  tajawal: '"Tajawal", sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

/** أحجام الخط (تُطبَّق كحجم جذر؛ كل المقاسات بوحدة rem فتتناسب). */
export const FONT_SIZES = ['sm', 'md', 'lg'] as const;
export type FontSize = (typeof FONT_SIZES)[number];

const ROOT_SIZES: Record<FontSize, string> = { sm: '14px', md: '16px', lg: '18px' };

/** يضبط سمة المستند (data-theme) لتفعيل متغيّرات الألوان المناسبة في CSS. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/** يضبط خط الواجهة عبر متغيّر --app-font الذي يستهلكه body. */
export function applyFontFamily(font: FontFamily) {
  document.documentElement.style.setProperty('--app-font', FONT_STACKS[font]);
}

/** يضبط حجم خط الجذر — كل المقاسات بوحدة rem تتناسب معه. */
export function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = ROOT_SIZES[size];
}
