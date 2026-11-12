import { 
  Eskul, 
  SesiPertemuan, 
  PresensiRecord, 
  PenilaianRecord, 
  StudentProfile, 
  Guru, 
  Kelas, 
  PengajuanJadwal,
  PendaftaranEskul,
  PrestasiLombaRecord
} from '../types';
import { 
  INITIAL_ESKUL_LIST, 
  INITIAL_SESSIONS, 
  INITIAL_STUDENTS, 
  INITIAL_PRESENSI_LOG, 
  INITIAL_PENILAIAN,
  INITIAL_JADWAL_PROPOSALS
} from '../data/mockData';

const API_BASE_URL = '/api';

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const userSession = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_user_session') || localStorage.getItem('al_amanah_user_session'))
      : null;
    const authToken = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_auth_token') || localStorage.getItem('al_amanah_auth_token'))
      : null;
    let userRole = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        userRole = parsed?.role || '';
      } catch {
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

    if (!res.ok) {
      let errorMsg = `HTTP error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) errorMsg = errJson.message;
      } catch {
      }
      throw new Error(errorMsg);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API] Fallback to local state for ${url}:`, err);
    if (fallbackData !== undefined) return fallbackData;
    throw err;
  }
}

export const api = {
  getDashboardStats: () => fetchWithFallback<any>('/stats/dashboard', undefined, null),

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
  getMe: async () => {
    const authToken = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_auth_token') || localStorage.getItem('al_amanah_auth_token'))
      : null;
    if (!authToken) throw new Error('Tidak ada token autentikasi.');
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Sesi kedaluwarsa.');
    return data.user;
  },
  updateProfile: async (data: { email?: string; noHp?: string }) => {
    const authToken = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_auth_token') || localStorage.getItem('al_amanah_auth_token'))
      : null;
    if (!authToken) throw new Error('Tidak ada token autentikasi.');
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.message || 'Gagal memperbarui profil kontak.');
    return result;
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const authToken = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_auth_token') || localStorage.getItem('al_amanah_auth_token'))
      : null;
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengunggah berkas.');
    return data;
  },

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

  getStudents: () => fetchWithFallback<StudentProfile[]>('/students', undefined, INITIAL_STUDENTS),
  createStudent: (data: {
    nis?: string;
    nisn?: string;
    namaLengkap?: string;
    kelasId?: string;
    kelas?: string;
    jenisKelamin?: string;
    noHp?: string;
    email?: string;
    eskulIds?: string[];
    students?: Array<{
      nis: string;
      nisn?: string;
      namaLengkap: string;
      kelasId?: string;
      kelas?: string;
      jenisKelamin?: string;
      noHp?: string;
      email?: string;
      eskulIds?: string[];
    }>;
  }) =>
    fetchWithFallback<{ success: boolean; data?: any; count?: number; message: string; defaultPassword?: string }>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  assignEskul: (studentId: string, eskulIds: string[]) =>
    fetchWithFallback<{ success: boolean }>('/students/assign', {
      method: 'POST',
      body: JSON.stringify({ studentId, eskulIds }),
    }),
  importStudents: (rows: Array<{ nis: string; nisn?: string; namaLengkap: string; kelas: string; jenisKelamin?: string; noHp?: string; email?: string }>) =>
    fetchWithFallback<{ success: boolean; count: number; sampleCredentials?: any[] }>('/students/import', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),
  updateStudent: (studentId: string, data: any) =>
    fetchWithFallback<{ success: boolean; data: any }>(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  batchUpdateStudentClass: (studentIds: string[], targetKelasId: string) =>
    fetchWithFallback<{ success: boolean; count: number; message: string }>('/students/batch-update-class', {
      method: 'POST',
      body: JSON.stringify({ studentIds, targetKelasId }),
    }),

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
    fotoKegiatan?: string;
  }) =>
    fetchWithFallback<SesiPertemuan>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateDynamicToken: (sessionId: string) =>
    fetchWithFallback<{ success: boolean; token: string; expiresAt: number }>(`/sessions/${sessionId}/token`, {
      method: 'POST',
    }),
  updateSessionStatus: (sessionId: string, status: string, additionalData?: { judul?: string; deskripsi?: string; materi?: string; fotoKegiatan?: string; isLocked?: boolean }) =>
    fetchWithFallback<SesiPertemuan>(`/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(additionalData || {}) }),
    }),
  startAttendanceSession: (sessionId: string, data: { judul: string; deskripsi: string; materi?: string; fotoKegiatan?: string }) =>
    fetchWithFallback<{ success: boolean; message: string; data: SesiPertemuan }>(`/sessions/${sessionId}/start-attendance`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

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

  getPresensiLogs: () => fetchWithFallback<PresensiRecord[]>('/presensi', undefined, INITIAL_PRESENSI_LOG),
  scanPresensi: (qrToken: string, siswaId: string, deviceInfo?: string, metode?: string, lat?: number, lng?: number) =>
    fetchWithFallback<{ success: boolean; message: string; data: { namaSiswa: string; namaEskul: string } }>('/presensi/scan', {
      method: 'POST',
      body: JSON.stringify({ qrToken, siswaId, deviceInfo, metode, lat, lng }),
    }),
  updatePresensiStatus: (id: string, status: string) =>
    fetchWithFallback<PresensiRecord>(`/presensi/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  scanStudentCard: (data: {
    sesiId: string;
    studentIdOrNis: string;
    pembinaId?: string;
    nilaiKeaktifan?: number;
    ratingKeaktifan?: string;
  }) =>
    fetchWithFallback<{ success: boolean; isDuplicate?: boolean; message: string; data?: any }>('/presensi/scan-student-card', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  finalizeSession: (id: string, data: {
    pembuatId?: string;
    judul?: string;
    deskripsi?: string;
    materi?: string;
    attendanceList: Array<{
      siswaId: string;
      status: string;
      metode?: string;
      nilaiKeaktifan?: number;
      ratingKeaktifan?: string;
      keterangan?: string;
      buktiSurat?: string;
    }>;
  }) =>
    fetchWithFallback<{ success: boolean; message: string; data?: any }>(`/sessions/${id}/finalize`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        kehadiran: data.attendanceList,
      }),
    }),
  markHolidaySession: (data: {
    eskulId: string;
    pembuatId?: string;
    tanggal?: string;
    alasanLibur: string;
  }) =>
    fetchWithFallback<{ success: boolean; message: string; data?: any }>('/sessions/mark-holiday', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPenilaian: () => fetchWithFallback<PenilaianRecord[]>('/penilaian', undefined, INITIAL_PENILAIAN),
  savePenilaian: (items: PenilaianRecord[]) =>
    fetchWithFallback<{ success: boolean; message?: string; data?: any }>('/penilaian', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getPendaftaran: (params?: { eskulId?: string; status?: string; siswaId?: string }) => {
    const query = new URLSearchParams();
    if (params?.eskulId) query.append('eskulId', params.eskulId);
    if (params?.status) query.append('status', params.status);
    if (params?.siswaId) query.append('siswaId', params.siswaId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithFallback<PendaftaranEskul[]>(`/pendaftaran${qs}`, undefined, []);
  },
  daftarEskul: (data: { eskulId: string; siswaId: string; alasanDaftar?: string }) =>
    fetchWithFallback<{ success: boolean; isAlreadyRegistered?: boolean; message: string; data?: any }>('/pendaftaran', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  seleksiPendaftaran: (pendaftaranIds: string[], status: 'DITERIMA_PEMBINA' | 'DITOLAK', catatanPembina?: string) =>
    fetchWithFallback<{ success: boolean; message: string; count: number }>('/pendaftaran/seleksi-pembina', {
      method: 'PATCH',
      body: JSON.stringify({ pendaftaranIds, status, catatanPembina }),
    }),
  ajukanPendaftaran: (eskulId: string, pendaftaranIds?: string[], catatanPembina?: string) =>
    fetchWithFallback<{ success: boolean; message: string; count: number }>('/pendaftaran/ajukan-koordinator', {
      method: 'POST',
      body: JSON.stringify({ eskulId, pendaftaranIds, catatanPembina }),
    }),
  validasiPendaftaran: (
    pendaftaranIds: string[], 
    aksi: 'SETUJUI' | 'TOLAK', 
    catatanKoordinator?: string, 
    koordinatorId?: string
  ) =>
    fetchWithFallback<{ success: boolean; message: string; count: number }>('/pendaftaran/validasi-koordinator', {
      method: 'POST',
      body: JSON.stringify({ pendaftaranIds, aksi, catatanKoordinator, koordinatorId }),
    }),

  getPrestasi: (params?: { eskulId?: string; siswaId?: string }) => {
    const query = new URLSearchParams();
    if (params?.eskulId) query.append('eskulId', params.eskulId);
    if (params?.siswaId) query.append('siswaId', params.siswaId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithFallback<PrestasiLombaRecord[]>(`/prestasi${qs}`, undefined, []);
  },
  createPrestasi: (data: {
    eskulId: string;
    siswaId: string;
    namaLomba: string;
    penyelenggara?: string;
    tingkat?: string;
    peringkat?: string;
    tanggal?: string;
    buktiSertifikat?: string;
    keterangan?: string;
  }) =>
    fetchWithFallback<{ success: boolean; message: string; data: PrestasiLombaRecord }>('/prestasi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deletePrestasi: (id: string) =>
    fetchWithFallback<{ success: boolean; message: string; data?: any }>(`/prestasi/${id}`, {
      method: 'DELETE',
    }),
  kickMember: (eskulId: string, siswaId: string, alasan?: string) =>
    fetchWithFallback<{ success: boolean; message: string; data?: any }>(`/eskul/${eskulId}/kick-member`, {
      method: 'POST',
      body: JSON.stringify({ siswaId, alasan }),
    }),

  getSettings: async () => {
    const savedGeofence = typeof window !== 'undefined' ? localStorage.getItem('al_amanah_geofence_active') : null;
    const defaultGeofence = savedGeofence !== null ? savedGeofence === 'true' : false;

    const res = await fetchWithFallback<{
      schoolName: string;
      schoolLatitude: number;
      schoolLongitude: number;
      geofenceRadius: number;
      isGeofenceActive: boolean;
      qrExpirySeconds: number;
      kehadiranWeight: number;
      keaktifanWeight: number;
      kinerjaWeight: number;
    }>('/settings', { cache: 'no-store' }, {
      schoolName: 'SMK AL AMANAH KOTA TANGERANG SELATAN',
      schoolLatitude: -6.34215,
      schoolLongitude: 106.71124,
      geofenceRadius: 150,
      isGeofenceActive: defaultGeofence,
      qrExpirySeconds: 15,
      kehadiranWeight: 40,
      keaktifanWeight: 30,
      kinerjaWeight: 30,
    });

    if (res && res.isGeofenceActive !== undefined && typeof window !== 'undefined') {
      const boolVal = res.isGeofenceActive === true || String(res.isGeofenceActive) === 'true';
      localStorage.setItem('al_amanah_geofence_active', String(boolVal));
      res.isGeofenceActive = boolVal;
    }
    return res;
  },
  updateSettings: async (settings: any) => {
    if (settings && settings.isGeofenceActive !== undefined && typeof window !== 'undefined') {
      const boolVal = settings.isGeofenceActive === true || String(settings.isGeofenceActive) === 'true';
      localStorage.setItem('al_amanah_geofence_active', String(boolVal));
    }
    return fetchWithFallback<{ success: boolean; message: string; data: any }>('/settings', {
      method: 'PUT',
      headers: { 'Cache-Control': 'no-cache' },
      body: JSON.stringify(settings),
    });
  },
};
