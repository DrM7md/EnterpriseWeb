import { apiClient } from '../../lib/apiClient';

export interface UploadResult {
  fileKey: string;
  fileName: string;
  size: number;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB لكل دفعة

/**
 * يرفع ملفًا على دفعات: init → chunks → complete، مع تقرير التقدّم (0..1).
 * يتجنّب إرسال ملف ضخم في طلب واحد.
 */
export async function chunkedUpload(file: File, onProgress?: (ratio: number) => void): Promise<UploadResult> {
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

  const { data: init } = await apiClient.post<{ uploadId: string }>('/uploads/init', {
    fileName: file.name,
    totalChunks,
  });

  for (let i = 0; i < totalChunks; i++) {
    const slice = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    await apiClient.put(`/uploads/${init.uploadId}/chunks/${i}`, slice, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    onProgress?.((i + 1) / totalChunks);
  }

  const { data } = await apiClient.post<UploadResult>(`/uploads/${init.uploadId}/complete`);
  return data;
}
