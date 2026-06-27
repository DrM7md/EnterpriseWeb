import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, CheckCircle2 } from 'lucide-react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '../../../components/ui/Button';
import { chunkedUpload, type UploadResult } from '../../uploads/uploads.service';

/** تجربة الرفع على دفعات (chunked upload) مع شريط تقدّم. */
export function UploadsSettings() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setError(null); setDone(null); setProgress(0);
    try {
      const result = await chunkedUpload(file, (r) => setProgress(Math.round(r * 100)));
      setDone(result);
    } catch {
      setError(t('settings.uploads.failed'));
    } finally {
      setProgress(null);
    }
  };

  return (
    <SettingsSection titleKey="settings.sections.uploads.title" descKey="settings.sections.uploads.desc">
      <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
        <input ref={inputRef} type="file" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />

        <Button variant="ghost" className="w-fit" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> {progress !== null ? t('settings.uploads.uploading') : t('settings.uploads.pick')}
        </Button>

        {progress !== null && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-hover">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {done && (
          <p className="flex items-center gap-2 text-[0.8125rem] text-[var(--ok-fg)]">
            <CheckCircle2 size={16} /> {t('settings.uploads.done', { name: done.fileName, size: (done.size / 1024).toFixed(1) })}
          </p>
        )}
        {error && <p className="text-[0.8125rem] text-danger">{error}</p>}
      </div>
    </SettingsSection>
  );
}
