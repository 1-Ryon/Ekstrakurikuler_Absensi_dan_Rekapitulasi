import { Eskul, SesiPertemuan, PresensiRecord, PenilaianRecord, StudentProfile } from '../types';
import { 
  INITIAL_ESKUL_LIST, 
  INITIAL_SESSIONS, 
  INITIAL_STUDENTS, 
  INITIAL_PRESENSI_LOG, 
  INITIAL_PENILAIAN 
} from '../data/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper for fetch with timeout
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API] Fallback to local state for ${url}:`, err);
    if (fallbackData !== undefined) return fallbackData;
    throw err;
  }
}

export const api = {
  // Eskul
  getEskul: () => fetchWithFallback<Eskul[]>('/eskul', undefined, INITIAL_ESKUL_LIST),
  createEskul: (eskul: Omit<Eskul, 'id' | 'jumlahSiswa'>) =>
    fetchWithFallback<Eskul>('/eskul', {
      method: 'POST',
      body: JSON.stringify(eskul),
    }),
  deleteEskul: (id: string) =>
    fetchWithFallback<{ success: boolean }>(`/eskul/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: () => fetchWithFallback<StudentProfile[]>('/students', undefined, INITIAL_STUDENTS),
  assignEskul: (studentId: string, eskulIds: string[]) =>
    fetchWithFallback<{ success: boolean }>('/students/assign', {
      method: 'POST',
      body: JSON.stringify({ studentId, eskulIds }),
    }),
  importStudents: (rows: Array<{ namaLengkap: string; nomorInduk: string; kelas: string }>) =>
    fetchWithFallback<{ success: boolean; count: number }>('/students/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),

  // Sessions & Dynamic QR
  getTodaySessions: () => fetchWithFallback<SesiPertemuan[]>('/sessions/today', undefined, INITIAL_SESSIONS),
  generateDynamicToken: (sessionId: string) =>
    fetchWithFallback<{ success: boolean; token: string; expiresAt: number }>(`/sessions/${sessionId}/token`, {
      method: 'POST',
    }),
  updateSessionStatus: (sessionId: string, status: string) =>
    fetchWithFallback<SesiPertemuan>(`/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Presensi & Scan
  getPresensiLogs: () => fetchWithFallback<PresensiRecord[]>('/presensi', undefined, INITIAL_PRESENSI_LOG),
  scanPresensi: (qrToken: string, siswaId: string, deviceInfo?: string) =>
    fetchWithFallback<{ success: boolean; message: string; data: { namaSiswa: string; namaEskul: string } }>('/presensi/scan', {
      method: 'POST',
      body: JSON.stringify({ qrToken, siswaId, deviceInfo }),
    }),
  updatePresensiStatus: (id: string, status: string) =>
    fetchWithFallback<PresensiRecord>(`/presensi/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Penilaian Rapor
  getPenilaian: () => fetchWithFallback<PenilaianRecord[]>('/penilaian', undefined, INITIAL_PENILAIAN),
  savePenilaian: (items: PenilaianRecord[]) =>
    fetchWithFallback<{ success: boolean }>('/penilaian', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};
