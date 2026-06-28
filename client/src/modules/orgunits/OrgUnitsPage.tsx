import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CornerDownLeft, ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VirtualList } from '../../components/VirtualList';
import { useAuthStore } from '../../store/authStore';
import { useOrgUnitUiStore } from '../../store/orgUnitUiStore';
import { cn } from '../../lib/cn';
import { translateApiError } from '../../lib/apiError';
import { genOrgUnitCode, useCreateOrgUnit, useDeleteOrgUnit, useOrgUnitTree } from './orgunits.api';
import { OrgUnitDrawer } from './OrgUnitDrawer';
import type { OrgUnitListItem } from './orgunits.types';

/** صف إضافة سريعة افتراضي يُحقن داخل الشجرة (لا يفتح مودال). */
interface QuickRow { kind: 'quick'; parentId: number | null; level: number }
type Row = OrgUnitListItem | QuickRow;
const isQuick = (r: Row): r is QuickRow => 'kind' in r;

export function OrgUnitsPage() {
  const { t } = useTranslation();
  const can = useAuthStore((s) => s.hasPermission);
  const { data, isLoading, isError } = useOrgUnitTree();
  const del = useDeleteOrgUnit();
  const collapsed = useOrgUnitUiStore((s) => s.collapsed);
  const toggleCollapse = useOrgUnitUiStore((s) => s.toggle);
  const expand = useOrgUnitUiStore((s) => s.expand);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<OrgUnitListItem | null>(null);
  const [quick, setQuick] = useState<{ parentId: number | null } | null>(null);

  const units = data ?? [];
  const collapsedSet = new Set(collapsed);
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (u: OrgUnitListItem) => { setEditing(u); setDrawerOpen(true); };
  const onDelete = async (u: OrgUnitListItem) => {
    if (!confirm(t('orgUnits.confirmDelete', { name: u.name }))) return;
    try { await del.mutateAsync(u.id); }
    catch (e) { alert(translateApiError(e)); }
  };
  // الإضافة تحت وحدة مطويّة ⇒ نفتحها أولًا كي يظهر الصف الجديد.
  const openQuick = (parentId: number | null) => {
    if (parentId !== null) expand(parentId);
    setQuick({ parentId });
  };

  // 1) إخفاء أحفاد الوحدات المطويّة (المرور قبل-ترتيبي: نتخطّى أيّ مستوى أعمق من المطويّة).
  const visible: OrgUnitListItem[] = [];
  let hideLevel: number | null = null;
  for (const u of units) {
    if (hideLevel !== null && u.level > hideLevel) continue;
    hideLevel = null;
    visible.push(u);
    if (collapsedSet.has(u.id)) hideLevel = u.level;
  }

  // 2) حقن صف الإضافة السريعة في نهاية شجرة الأمّ المرئية.
  const rows: Row[] = [];
  let i = 0;
  while (i < visible.length) {
    const u = visible[i];
    rows.push(u);
    i += 1;
    if (quick?.parentId === u.id) {
      while (i < visible.length && visible[i].level > u.level) { rows.push(visible[i]); i += 1; }
      rows.push({ kind: 'quick', parentId: u.id, level: u.level + 1 });
    }
  }
  if (quick?.parentId === null) rows.push({ kind: 'quick', parentId: null, level: 0 });

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight">{t('orgUnits.title')}</h1>
          <p className="mt-0.5 text-[0.8125rem] text-muted">{t('orgUnits.subtitle')}</p>
        </div>
        {can('org-units.create') && (
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => setQuick({ parentId: null })}><Plus size={16} /> {t('orgUnits.quickRoot')}</Button>
            <Button onClick={openCreate}>{t('orgUnits.new')}</Button>
          </div>
        )}
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        {isLoading && <p className="px-3.5 py-7 text-center text-muted">{t('common.loading')}</p>}
        {isError && <p className="px-3.5 py-7 text-center text-danger">{t('common.loadError')}</p>}
        {!isLoading && !isError && rows.length === 0 && <p className="px-3.5 py-7 text-center text-muted">{t('common.empty')}</p>}
        {!isLoading && !isError && rows.length > 0 && (
          <VirtualList
            items={rows}
            getKey={(r) => (isQuick(r) ? `quick-${r.parentId ?? 'root'}` : r.id)}
            rowHeight={45}
            maxHeight={Math.min(rows.length * 45, 600)}
            renderRow={(r) =>
              isQuick(r) ? (
                <QuickAdd parentId={r.parentId} level={r.level} units={units} onClose={() => setQuick(null)} />
              ) : (
                <div className="flex h-[45px] items-center gap-3 border-b border-border px-3.5 text-sm hover:bg-hover/50"
                  style={{ paddingInlineStart: `${r.level * 26 + 14}px` }}>
                  {r.childCount > 0 ? (
                    <button onClick={() => toggleCollapse(r.id)} className="flex min-w-0 flex-1 items-center gap-2 truncate text-start"
                      title={collapsedSet.has(r.id) ? t('orgUnits.expand') : t('orgUnits.collapse')}>
                      <ChevronDown size={15} className={cn('shrink-0 text-muted transition-transform', collapsedSet.has(r.id) && '-rotate-90 rtl:rotate-90')} />
                      <span className="truncate font-medium">{r.name}</span>
                      <code className="rounded-md bg-[var(--code-bg)] px-1.5 py-0.5 text-[0.6875rem] text-muted">{r.code}</code>
                      <span className="rounded-full bg-hover px-1.5 text-[0.625rem] text-muted">{r.childCount}</span>
                      {!r.isActive && <Badge variant="danger">{t('common.inactive')}</Badge>}
                    </button>
                  ) : (
                    <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                      {r.level > 0 && <CornerDownLeft size={13} className="shrink-0 text-muted/60 -scale-x-100" />}
                      <span className="truncate font-medium">{r.name}</span>
                      <code className="rounded-md bg-[var(--code-bg)] px-1.5 py-0.5 text-[0.6875rem] text-muted">{r.code}</code>
                      {!r.isActive && <Badge variant="danger">{t('common.inactive')}</Badge>}
                    </span>
                  )}
                  <span className="whitespace-nowrap text-xs text-muted max-md:hidden">{t('orgUnits.childUser', { children: r.childCount, users: r.userCount })}</span>
                  <span className="flex gap-1">
                    {can('org-units.create') && (
                      <Button variant="subtle" size="icon-sm" className="text-muted hover:text-accent" title={t('orgUnits.addChild')} aria-label={t('orgUnits.addChild')} onClick={() => openQuick(r.id)}><Plus size={15} /></Button>
                    )}
                    {can('org-units.update') && (
                      <Button variant="subtle" size="icon-sm" title={t('common.edit')} aria-label={t('common.edit')} onClick={() => openEdit(r)}><Pencil size={15} /></Button>
                    )}
                    {can('org-units.delete') && r.childCount === 0 && r.code !== 'ROOT' && (
                      <Button variant="subtle" size="icon-sm" className="text-muted hover:text-danger" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => onDelete(r)}><Trash2 size={15} /></Button>
                    )}
                  </span>
                </div>
              )
            }
          />
        )}
      </div>

      <OrgUnitDrawer open={drawerOpen} editing={editing} units={units} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}

/** صف إدخال سريع: اكتب الاسم واضغط Enter لإضافة وحدة فرعية فورًا، يبقى مفتوحًا لإضافة المزيد بسرعة. */
function QuickAdd({ parentId, level, units, onClose }: {
  readonly parentId: number | null; readonly level: number;
  readonly units: OrgUnitListItem[]; readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateOrgUnit();
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const code = genOrgUnitCode(parentId, units);

  const submit = async () => {
    const value = name.trim();
    if (!value || create.isPending) return;
    try {
      await create.mutateAsync({ name: value, parentId, units });
      setName('');
      inputRef.current?.focus(); // يبقى مفتوحًا لإضافة الوحدة التالية بسرعة.
    } catch { /* الخطأ يظهر أدناه؛ نُبقي القيمة لإعادة المحاولة. */ }
  };

  return (
    <div className="flex h-[45px] items-center gap-2 border-b border-border bg-accent/5 px-3.5"
      style={{ paddingInlineStart: `${level * 26 + 14}px` }}>
      <CornerDownLeft size={13} className="shrink-0 text-accent/70 -scale-x-100" />
      <input
        ref={inputRef}
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onClose();
        }}
        placeholder={t('orgUnits.quickPlaceholder')}
        className="h-8 min-w-0 flex-1 rounded-md border border-border bg-bg px-2.5 text-sm text-fg transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
      />
      <code className="rounded-md bg-[var(--code-bg)] px-1.5 py-0.5 text-[0.6875rem] text-muted max-md:hidden">{code}</code>
      <Button size="icon-sm" title={t('common.add')} aria-label={t('common.add')} disabled={!name.trim() || create.isPending} onClick={submit}><Check size={15} /></Button>
      <Button variant="subtle" size="icon-sm" title={t('common.cancel')} aria-label={t('common.cancel')} onClick={onClose}><X size={15} /></Button>
    </div>
  );
}
