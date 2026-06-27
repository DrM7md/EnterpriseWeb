import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Command, Languages, LogOut, Moon, PanelLeft, Sun } from 'lucide-react';
import { authService } from '../modules/auth/auth.service';
import { useModules } from '../modules/modules/modules.api';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { Button } from '../components/ui/Button';
import { CommandPalette } from '../components/CommandPalette';
import { commandShortcut } from '../lib/platform';
import { cn } from '../lib/cn';
import { NAV_TREE, type NavNode } from './nav.config';

export function AppShell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);
  const theme = usePreferencesStore((s) => s.theme);
  const toggleTheme = usePreferencesStore((s) => s.toggleTheme);
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar);
  const { data: modules } = useModules();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const enabled = new Set((modules ?? []).filter((m) => m.isEnabled).map((m) => m.key));
  const visible = (n: NavNode) => !n.moduleKey || enabled.has(n.moduleKey);
  const tree = NAV_TREE.filter(visible).map((n) => ({ ...n, children: n.children?.filter(visible) }));

  const onLogout = async () => {
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    clear();
    navigate('/login', { replace: true });
  };
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  const isActive = (to?: string) => Boolean(to) && location.pathname.startsWith(to!);

  return (
    <div className={cn('grid min-h-screen transition-[grid-template-columns]', collapsed ? 'grid-cols-[64px_1fr]' : 'grid-cols-[232px_1fr]', 'max-md:grid-cols-1')}>
      <aside className="flex flex-col gap-1 overflow-hidden border-e border-border bg-panel p-3 max-md:hidden">
        <div className={cn('mb-4 flex items-center px-1', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <span className="flex items-center gap-2 text-lg font-bold">
              <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent">🏛️</span>
              {t('appName')}
            </span>
          )}
          <Button variant="subtle" size="icon-sm" onClick={toggleSidebar} aria-label={t('nav.collapse')} title={t('nav.collapse')}>
            <PanelLeft size={16} className="rtl:-scale-x-100" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1">
          {tree.map((node) =>
            node.children?.length
              ? <Group key={node.key} node={node} collapsed={collapsed} t={t}
                  open={expanded.has(node.key) || node.children.some((c) => isActive(c.to))}
                  onToggle={() => {
                    if (collapsed) { toggleSidebar(); return; }
                    setExpanded((p) => {
                      const n = new Set(p);
                      if (n.has(node.key)) n.delete(node.key); else n.add(node.key);
                      return n;
                    });
                  }}
                  childActive={(to) => isActive(to)} />
              : <Leaf key={node.key} node={node} collapsed={collapsed} t={t} />,
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-border px-7 py-3 max-md:px-4">
          <span className="truncate text-[0.8125rem] text-muted">{user?.fullName} · {user?.roles.join('، ')}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => globalThis.dispatchEvent(new CustomEvent('cmdk:open'))}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-1.5 text-[0.8125rem] text-muted transition-colors hover:border-accent hover:text-fg max-md:hidden">
              <Command size={14} /> {t('palette.open')}
              <kbd className="rounded border border-border px-1.5 text-[0.6875rem]">{commandShortcut}</kbd>
            </button>
            <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label={t('common.toggleTheme')} title={t('common.toggleTheme')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleLang}><Languages size={15} /> {t('common.language')}</Button>
            <Button variant="subtle" size="sm" onClick={onLogout}><LogOut size={15} /> {t('common.logout')}</Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-7 max-md:p-4"><Outlet /></main>
      </div>
      <CommandPalette />
    </div>
  );
}

const leafClass = (active: boolean, collapsed: boolean) =>
  cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
    collapsed && 'justify-center px-0',
    active ? 'bg-accent text-accent-fg font-medium' : 'text-muted hover:bg-hover hover:text-fg');

function Leaf({ node, collapsed, t }: { readonly node: NavNode; readonly collapsed: boolean; readonly t: (k: string) => string }) {
  const Icon = node.icon;
  return (
    <NavLink to={node.to!} title={collapsed ? t(node.labelKey) : undefined}
      className={({ isActive }) => leafClass(isActive, collapsed)}>
      <Icon size={17} strokeWidth={2} /> {!collapsed && t(node.labelKey)}
    </NavLink>
  );
}

function Group({ node, collapsed, open, onToggle, childActive, t }: {
  readonly node: NavNode; readonly collapsed: boolean; readonly open: boolean;
  readonly onToggle: () => void; readonly childActive: (to?: string) => boolean; readonly t: (k: string) => string;
}) {
  const Icon = node.icon;
  const hasActive = node.children!.some((c) => childActive(c.to));
  return (
    <div>
      <button onClick={onToggle} title={collapsed ? t(node.labelKey) : undefined}
        className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          collapsed && 'justify-center px-0',
          hasActive ? 'text-fg' : 'text-muted hover:bg-hover hover:text-fg')}>
        <Icon size={17} strokeWidth={2} />
        {!collapsed && <><span className="flex-1 text-start">{t(node.labelKey)}</span>
          <ChevronDown size={15} className={cn('transition-transform', open && 'rotate-180')} /></>}
      </button>
      {!collapsed && open && (
        <div className="mt-1 flex flex-col gap-1 border-s border-border ms-5 ps-2">
          {node.children!.map((c) => {
            const CIcon = c.icon;
            return (
              <NavLink key={c.key} to={c.to!} className={({ isActive }) =>
                cn('flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[0.8125rem] transition-colors',
                  isActive ? 'bg-accent text-accent-fg font-medium' : 'text-muted hover:bg-hover hover:text-fg')}>
                <CIcon size={15} /> {t(c.labelKey)}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
