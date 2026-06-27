import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Languages, LogOut, Moon, Settings, ShieldCheck, Sun, Users, Search, type LucideIcon,
} from 'lucide-react';
import { useModules } from '../modules/modules/modules.api';
import { usePreferencesStore } from '../store/preferencesStore';
import { useAuthStore } from '../store/authStore';
import { authService } from '../modules/auth/auth.service';
import { commandShortcut } from '../lib/platform';

const NAV_ICONS: Record<string, { icon: LucideIcon; to: string; labelKey: string }> = {
  users: { icon: Users, to: '/users', labelKey: 'nav.users' },
  roles: { icon: ShieldCheck, to: '/roles', labelKey: 'nav.roles' },
  'org-units': { icon: Building2, to: '/org-units', labelKey: 'nav.orgUnits' },
};

/** لوحة الأوامر (⌘K / Ctrl+K) — تنقّل وإجراءات سريعة (نمط Linear). */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: modules } = useModules();
  const theme = usePreferencesStore((s) => s.theme);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    globalThis.addEventListener('keydown', onKey);
    globalThis.addEventListener('cmdk:open', onOpen);
    return () => {
      globalThis.removeEventListener('keydown', onKey);
      globalThis.removeEventListener('cmdk:open', onOpen);
    };
  }, []);

  const run = (fn: () => void) => { setOpen(false); fn(); };
  const onLogout = async () => {
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    clear();
    navigate('/login', { replace: true });
  };

  const navItems = (modules ?? []).filter((m) => m.isEnabled && NAV_ICONS[m.key]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--overlay)] pt-[14vh]" onClick={() => setOpen(false)}>
      <Command
        label={t('palette.title')}
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-[92vw] overflow-hidden rounded-xl border border-border bg-panel shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search size={16} className="text-muted" />
          <Command.Input autoFocus placeholder={t('palette.placeholder')}
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted" />
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">{t('palette.empty')}</Command.Empty>

          <Command.Group heading={t('palette.navigate')} className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted">
            {navItems.map((m) => {
              const Icon = NAV_ICONS[m.key].icon;
              return (
                <Item key={m.key} onSelect={() => run(() => navigate(NAV_ICONS[m.key].to))}>
                  <Icon size={16} /> {t(NAV_ICONS[m.key].labelKey)}
                </Item>
              );
            })}
            <Item onSelect={() => run(() => navigate('/settings'))}><Settings size={16} /> {t('nav.settings')}</Item>
          </Command.Group>

          <Command.Group heading={t('palette.actions')} className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted">
            <Item onSelect={() => run(toggleTheme)}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {t('common.toggleTheme')}
            </Item>
            <Item onSelect={() => run(() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar'))}>
              <Languages size={16} /> {t('common.language')}
            </Item>
            <Item onSelect={() => run(onLogout)}><LogOut size={16} /> {t('common.logout')}</Item>
          </Command.Group>
        </Command.List>
        <div className="border-t border-border px-4 py-2 text-[0.6875rem] text-muted">{commandShortcut}</div>
      </Command>
    </div>
  );
}

function Item({ children, onSelect }: { readonly children: React.ReactNode; readonly onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg aria-selected:bg-accent aria-selected:text-accent-fg"
    >
      {children}
    </Command.Item>
  );
}
