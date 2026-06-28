import { useTranslation } from 'react-i18next';
import { useNavVisibilityStore } from '../../../store/navVisibilityStore';
import { HIDEABLE_NODES } from '../../../layouts/nav.config';
import { SettingsSection } from '../SettingsSection';
import { cn } from '../../../lib/cn';

/** مفتاح تبديل (ظاهر/مخفي). */
function Toggle({ on, onChange, label }: { readonly on: boolean; readonly onChange: () => void; readonly label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-accent' : 'bg-border')}
    >
      <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', on ? 'start-[1.375rem]' : 'start-0.5')} />
    </button>
  );
}

/** إعدادات القائمة الجانبية: إخفاء/إظهار أي عنصر (حتى لو يملك المستخدم صلاحيته). */
export function SidebarSettings() {
  const { t } = useTranslation();
  const hidden = useNavVisibilityStore((s) => s.hidden);
  const toggle = useNavVisibilityStore((s) => s.toggle);
  const hiddenSet = new Set(hidden);

  return (
    <SettingsSection titleKey="settings.sections.sidebar.title" descKey="settings.sections.sidebar.desc">
      <div className="rounded-xl border border-border px-5">
        {HIDEABLE_NODES.map((n) => {
          const Icon = n.icon;
          const visible = !hiddenSet.has(n.key);
          return (
            <div key={n.key} className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0"
              style={{ paddingInlineStart: n.parentKey ? '1.5rem' : 0 }}>
              <span className={cn('flex items-center gap-2.5 text-sm', !visible && 'text-muted')}>
                <Icon size={17} className="shrink-0 text-muted" />
                {t(n.labelKey)}
                {!visible && <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[0.6875rem] text-danger">{t('settings.sidebar.hiddenTag')}</span>}
              </span>
              <Toggle on={visible} onChange={() => toggle(n.key)} label={t(n.labelKey)} />
            </div>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-muted">{t('settings.sidebar.note')}</p>
    </SettingsSection>
  );
}
