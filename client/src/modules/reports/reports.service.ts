import { apiClient } from '../../lib/apiClient';

export interface ReportStatus {
  id: number;
  type: string;
  format: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  rowCount: number | null;
  fileName: string | null;
  error: string | null;
}

export const reportsService = {
  async enqueueUsersExport(format: 'xlsx' | 'pdf', search?: string): Promise<number> {
    const { data } = await apiClient.post<{ id: number }>('/users/export/async', null, { params: { format, search } });
    return data.id;
  },
  async status(id: number): Promise<ReportStatus> {
    const { data } = await apiClient.get<ReportStatus>(`/reports/${id}`);
    return data;
  },
  async download(id: number): Promise<void> {
    const response = await apiClient.get(`/reports/${id}/download`, { responseType: 'blob' });
    const disposition = response.headers['content-disposition'] as string | undefined;
    const fileName = /filename="?([^"]+)"?/.exec(disposition ?? '')?.[1] ?? `report-${id}`;
    const url = URL.createObjectURL(response.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/** يجدول التصدير، يستطلع الحالة حتى الجاهزية، ثم ينزّل تلقائيًا. */
export async function runAsyncUsersExport(
  format: 'xlsx' | 'pdf',
  search: string | undefined,
  onState: (state: 'queued' | 'done' | 'failed') => void,
): Promise<void> {
  try {
    const id = await reportsService.enqueueUsersExport(format, search);
    onState('queued');
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const s = await reportsService.status(id);
      if (s.status === 'Completed') {
        await reportsService.download(id);
        onState('done');
        return;
      }
      if (s.status === 'Failed') break;
    }
    onState('failed');
  } catch {
    onState('failed');
  }
}
