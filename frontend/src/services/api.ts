import { Eskul, SesiPertemuan, PresensiRecord, PenilaianRecord, StudentProfile, Guru, Kelas, PengajuanJadwal } from '../types';
import { 
  INITIAL_ESKUL_LIST, 
  INITIAL_SESSIONS, 
  INITIAL_STUDENTS, 
  INITIAL_PRESENSI_LOG, 
  INITIAL_PENILAIAN,
  INITIAL_JADWAL_PROPOSALS
} from '../data/mockData';

const API_BASE_URL = '/api';

// Helper for fetch with timeout and automatic authorization context
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const userSession = typeof window !== 'undefined' ? localStorage.getItem('al_amanah_user_session') : null;
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('al_amanah_auth_token') : null;
    let userRole = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        userRole = parsed?.role || '';
      } catch {
        // ignore parse error
      }
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(userRole ? { 'X-User-Role': userRole } : {}),
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
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
  // Stats
  getDashboardStats: () => fetchWithFallback<any>('/stats/dashboard', undefined, null),

  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login gagal, periksa username dan password.');
    }
    return data;
  },

  // Eskul
  getEskul: () => fetchWithFallback<Eskul[]>('/eskul', undefined, INITIAL_ESKUL_LIST),
  createEskul: (eskul: Omit<Eskul, 'id' | 'jumlahSiswa'>) =>
    fetchWithFallback<Eskul>('/eskul', {
      method: 'POST',
      body: JSON.stringify(eskul),
    }),
  updateEskul: (id: string, eskul: Partial<Eskul>) =>
    fetchWithFallback<Eskul>(`/eskul/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eskul),
    }),
  deleteEskul: (id: string) =>
    fetchWithFallback<{ success: boolean }>(`/eskul/${id}`, { method: 'DELETE' }),

  // Pembina
  getPembina: () => fetchWithFallback<Guru[]>('/pembina', undefined, []),
  createPembina: (data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    username?: string;
    password?: string;
    assignedEskulId?: string;
    assignedEskulIds?: string[];
  }) =>
    fetchWithFallback<{ success: boolean; message: string; data: any }>('/pembina', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Guru & Wali Kelas
  getGuru: (params?: { isWaliKelas?: boolean; isPembina?: boolean }) => {
    let query = '';
    if (params?.isWaliKelas) query = '?isWaliKelas=true';
    if (params?.isPembina) query = '?isPembina=true';
    return fetchWithFallback<Guru[]>(`/guru${query}`, undefined, []);
  },
  createGuru: (data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    jenisKelamin?: string;
    username?: string;
    password?: string;
    role?: string;
    isPembina?: boolean;
    isWaliKelas?: boolean;
    assignedKelasId?: string;
    assignedEskulId?: string;
    assignedEskulIds?: string[];
  }) =>
    fetchWithFallback<{ success: boolean; message: string; data: any }>('/guru', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGuru: (id: string, data: Partial<Guru> & { password?: string; assignedKelasId?: string; assignedEskulId?: string; assignedEskulIds?: string[] }) =>
    fetchWithFallback<{ success: boolean; message: string; data: any }>(`/guru/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGuru: (id: string) =>
    fetchWithFallback<{ success: boolean; message: string }>(`/guru/${id}`, {
      method: 'DELETE',
    }),
  importGuru: (rows: Array<{
    namaLengkap: string;
    nip?: string;
    jenisKelamin?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    role?: string;
    kelas?: string;
  }>) =>
    fetchWithFallback<{ success: boolean; count: number; summary?: any[] }>('/guru/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),

  // Kelas & Wali Kelas
  getKelas: () => fetchWithFallback<Kelas[]>('/kelas', undefined, []),
  createKelas: (data: { namaKelas: string; tingkat?: number; jurusan?: string; waliKelasId?: string }) =>
    fetchWithFallback<Kelas>('/kelas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateKelas: (id: string, data: { namaKelas?: string; tingkat?: number; jurusan?: string; waliKelasId?: string }) =>
    fetchWithFallback<Kelas>(`/kelas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteKelas: (id: string) =>
    fetchWithFallback<{ success: boolean; message: string }>(`/kelas/${id}`, {
      method: 'DELETE',
    }),
  assignWaliKelas: (kelasId: string, waliKelasId: string) =>
    fetchWithFallback<{ success: boolean; data: Kelas }>(`/kelas/${kelasId}/walikelas`, {
      method: 'PATCH',
      body: JSON.stringify({ waliKelasId }),
    }),

  // Students & Import (NIS + Template Password al_amanah_<last 3 digits>)
  getStudents: () => fetchWithFallback<StudentProfile[]>('/students', undefined, INITIAL_STUDENTS),
  assignEskul: (studentId: string, eskulIds: string[]) =>
    fetchWithFallback<{ success: boolean }>('/students/assign', {
      method: 'POST',
      body: JSON.stringify({ studentId, eskulIds }),
    }),
  importStudents: (rows: Array<{ nis: string; nisn?: string; namaLengkap: string; kelas: string; jenisKelamin?: string; noHp?: string }>) =>
    fetchWithFallback<{ success: boolean; count: number; sampleCredentials?: any[] }>('/students/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),

  // Sessions & Dynamic QR
  getTodaySessions: () => fetchWithFallback<SesiPertemuan[]>('/sessions/today', undefined, INITIAL_SESSIONS),
  createSession: (data: {
    eskulId: string;
    pembuatId?: string;
    tanggal?: string;
    jamMulai?: string;
    jamSelesai?: string;
    lokasi?: string;
    judul: string;
    deskripsi: string;
    materi?: string;
  }) =>
    fetchWithFallback<SesiPertemuan>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateDynamicToken: (sessionId: string) =>
    fetchWithFallback<{ success: boolean; token: string; expiresAt: number }>(`/sessions/${sessionId}/token`, {
      method: 'POST',
    }),
  updateSessionStatus: (sessionId: string, status: string, additionalData?: { judul?: string; deskripsi?: string; materi?: string }) =>
    fetchWithFallback<SesiPertemuan>(`/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(additionalData || {}) }),
    }),

  // Permohonan Perubahan Jadwal (Pembina & Koordinator)
  getJadwalProposals: (params?: { pembinaId?: string; status?: string; eskulId?: string }) => {
    const query = new URLSearchParams();
    if (params?.pembinaId) query.append('pembinaId', params.pembinaId);
    if (params?.status) query.append('status', params.status);
    if (params?.eskulId) query.append('eskulId', params.eskulId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithFallback<PengajuanJadwal[]>(`/jadwal-proposals${qs}`, undefined, INITIAL_JADWAL_PROPOSALS);
  },
  createJadwalProposal: (data: {
    eskulId: string;
    pembinaId: string;
    hariBaru: string;
    jamMulaiBaru: string;
    jamSelesaiBaru: string;
    lokasiBaru?: string;
    jenisPerubahan?: 'PERMANEN' | 'SEMENTARA';
    tanggalEfektif?: string;
    alasan: string;
  }) =>
    fetchWithFallback<PengajuanJadwal>('/jadwal-proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  validateJadwalProposal: (
    id: string,
    data: {
      status: 'DISETUJUI' | 'DITOLAK';
      catatanKoordinator?: string;
      koordinatorId?: string;
    }
  ) =>
    fetchWithFallback<{ success: boolean; message: string; data: PengajuanJadwal; updatedEskul?: Eskul }>(
      `/jadwal-proposals/${id}/validate`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  // Presensi & Scan
  getPresensiLogs: () => fetchWithFallback<PresensiRecord[]>('/presensi', undefined, INITIAL_PRESENSI_LOG),
  scanPresensi: (qrToken: string, siswaId: string, deviceInfo?: string, metode?: string) =>
    fetchWithFallback<{ success: boolean; message: string; data: { namaSiswa: string; namaEskul: string } }>('/presensi/scan', {
      method: 'POST',
      body: JSON.stringify({ qrToken, siswaId, deviceInfo, metode }),
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
