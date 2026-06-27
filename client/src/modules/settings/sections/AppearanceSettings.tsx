import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { FONT_FAMILIES, FONT_SIZES, THEMES } from '../../../lib/theme';
import type { AddPattern } from '../../../store/preferencesStore';
import { SettingsSection } from '../SettingsSection';
import { Select } from '../../../components/ui/Input';
import { cn } from '../../../lib/cn';

const ADD_PATTERNS: AddPattern[] = ['drawer', 'modal'];

function Segmented<T extends string>({ options, value, onChange, label, render }: {
  readonly options: readonly T[];
  readonly value: T;
  readonly onChange: (v: T) => void;
  readonly label: string;
  readonly render: (v: T) => string;
}) {
  return (
    <fieldset aria-label={label} className="inline-flex shrink-0 overflow-hidden rounded-[var(--radius)] border border-border p-0">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'px-4 py-2 text-[0.8125rem] transition-colors border-s border-border first:border-s-0',
            value === opt ? 'bg-accent text-accent-fg' : 'bg-panel text-muted hover:text-fg',
          )}
        >
          {render(opt)}
        </button>
      ))}
    </fieldset>
  );
}

function Row({ title, desc, children }: { readonly title: string; readonly desc: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-border py-4 last:border-0">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{desc}</p>
      </div>
      {children}
    </div>
  );
}

/** إعدادات الواجهة: السمة · الخط · حجم الخط · نمط الإضافة. */
export function AppearanceSettings() {
  const { t } = useTranslation();
  const p = usePreferencesStore();

  return (
    <SettingsSection titleKey="settings.sections.appearance.title" descKey="settings.sections.appearance.desc">
      <div className="rounded-xl border border-border px-5">
        <Row title={t('settings.appearance.theme')} desc={t('settings.appearance.themeDesc')}>
          <Segmented options={THEMES} value={p.theme} onChange={p.setTheme} label={t('settings.appearance.theme')}
            render={(th) => t(`settings.appearance.themeOption.${th}`)} />
        </Row>

        <Row title={t('settings.appearance.font')} desc={t('settings.appearance.fontDesc')}>
          <Select
            className="w-44"
            value={p.fontFamily}
            onChange={(e) => p.setFontFamily(e.target.value as (typeof FONT_FAMILIES)[number])}
            aria-label={t('settings.appearance.font')}
          >
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{t(`settings.appearance.fontOption.${f}`)}</option>)}
          </Select>
        </Row>

        <Row title={t('settings.appearance.fontSize')} desc={t('settings.appearance.fontSizeDesc')}>
          <Segmented options={FONT_SIZES} value={p.fontSize} onChange={p.setFontSize} label={t('settings.appearance.fontSize')}
            render={(s) => t(`settings.appearance.fontSizeOption.${s}`)} />
        </Row>

        <Row title={t('settings.appearance.addPattern')} desc={t('settings.appearance.addPatternDesc')}>
          <Segmented options={ADD_PATTERNS} value={p.addPattern} onChange={p.setAddPattern} label={t('settings.appearance.addPattern')}
            render={(x) => t(`settings.appearance.addPatternOption.${x}`)} />
        </Row>
      </div>
    </SettingsSection>
  );
}
