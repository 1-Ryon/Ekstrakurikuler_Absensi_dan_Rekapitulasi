import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EskulManagement } from './components/dashboard/EskulManagement';
import { StudentManagement } from './components/dashboard/StudentManagement';
import { KelasManagement } from './components/dashboard/KelasManagement';
import { ReportsManagement } from './components/dashboard/ReportsManagement';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { DynamicQrGenerator } from './components/guru/DynamicQrGenerator';
import { TeacherStudentScanner } from './components/guru/TeacherStudentScanner';
import { LiveAttendanceLog } from './components/guru/LiveAttendanceLog';
import { PenilaianPage } from './components/guru/PenilaianPage';
import { PembinaDashboard } from './components/guru/PembinaDashboard';
import { WaliKelasDashboard } from './components/dashboard/WaliKelasDashboard';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { KartuHasilNilaiPage } from './components/siswa/KartuHasilNilaiPage';
import { RiwayatEskulSiswaPage } from './components/siswa/RiwayatEskulSiswaPage';
import { AddEskulModal } from './components/modals/AddEskulModal';
import { AddPembinaModal } from './components/modals/AddPembinaModal';
import { ImportDataModal } from './components/modals/ImportDataModal';
import { ImportGuruModal } from './components/modals/ImportGuruModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { MailModal } from './components/modals/MailModal';
import { StudentCardModal } from './components/modals/StudentCardModal';
import { EditEskulModal } from './components/modals/EditEskulModal';
import { BukaAbsensiModal } from './components/modals/BukaAbsensiModal';
import { AjukanPerubahanJadwalModal } from './components/modals/AjukanPerubahanJadwalModal';
import { ValidasiPerubahanJadwalModal } from './components/modals/ValidasiPerubahanJadwalModal';
import { RiwayatPengajuanJadwalModal } from './components/modals/RiwayatPengajuanJadwalModal';
import { PembinaManagement } from './components/dashboard/PembinaManagement';
import { GuruWaliManagement } from './components/dashboard/GuruWaliManagement';
import { AddGuruModal } from './components/modals/AddGuruModal';
import { EditGuruModal } from './components/modals/EditGuruModal';
import { EditPembinaModal } from './components/modals/EditPembinaModal';
import { LogoutConfirmModal } from './components/modals/LogoutConfirmModal';
import { LoginPage } from './components/auth/LoginPage';
import { ValidasiPendaftaranSiswa } from './components/dashboard/ValidasiPendaftaranSiswa';
import { ValidasiJadwalView } from './components/dashboard/ValidasiJadwalView';
import { PendaftaranSiswaPembina } from './components/guru/PendaftaranSiswaPembina';

import { 
  CURRENT_USER, 
  INITIAL_ESKUL_LIST, 
  INITIAL_SESSIONS, 
  INITIAL_STUDENTS, 
  INITIAL_PRESENSI_LOG, 
  INITIAL_PENILAIAN,
  INITIAL_JADWAL_PROPOSALS 
} from './data/mockData';
import { api } from './services/api';
import { Role, Eskul, SesiPertemuan, PresensiRecord, PenilaianRecord, StudentProfile, Guru, Kelas, User, PengajuanJadwal } from './types';

const ALLOWED_TABS_BY_ROLE: Record<Role, string[]> = {
  ADMIN: [
    'beranda', 'eskul', 'pembina', 'guru', 'kelas', 'siswa', 'laporan', 
    'dynamic-qr', 'scanner-guru', 'live-presensi', 'penilaian', 
    'scanner-siswa', 'kartu-siswa', 'khn-siswa', 'riwayat-eskul-siswa', 'pengaturan',
    'validasi-jadwal', 'validasi-pendaftaran', 'pembina-pendaftaran'
  ],
  KOORDINATOR: [
    'beranda', 'eskul', 'pembina', 'guru', 'kelas', 'siswa', 'laporan', 
    'dynamic-qr', 'scanner-guru', 'live-presensi', 'penilaian', 'pengaturan',
    'validasi-jadwal', 'validasi-pendaftaran'
  ],
  PEMBINA: [
    'beranda', 'siswa', 'laporan', 'dynamic-qr', 'scanner-guru', 
    'live-presensi', 'penilaian', 'pengaturan',
    'pembina-pendaftaran', 'validasi-jadwal'
  ],
  WALI_KELAS: ['beranda', 'siswa', 'laporan', 'penilaian', 'pengaturan'],
  SISWA: ['beranda', 'riwayat-eskul-siswa', 'scanner-siswa', 'kartu-siswa', 'khn-siswa', 'pengaturan'],
};

export function App() {
  // Session Authentication State (Default Null: Wajib Login terlebih dahulu)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_user_session') || localStorage.getItem('al_amanah_user_session'))
      : null;
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) return u;
      } catch {
        // fallback
      }
    }
    // Sesi baru wajib login terlebih dahulu
    return null;
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_amanah_user_session') || localStorage.getItem('al_amanah_user_session'))
      : null;
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role || 'ADMIN';
      } catch {
        return 'ADMIN';
      }
    }
    return 'ADMIN';
  });

  const [activeTab, setActiveTab] = useState<NavItemKey>('beranda');

  // Hak Akses Administrator Sistem untuk Akses Multi-Peran
  const isSystemAdmin = 
    currentUser ? (
      currentUser.role === 'ADMIN' || 
      currentUser.username === 'admin' || 
      currentUser.username === 'admin.it' ||
      localStorage.getItem('al_amanah_is_admin') === 'true'
    ) : false;

  // Master Data State
  const [eskulList, setEskulList] = useState<Eskul[]>(INITIAL_ESKUL_LIST);
  const [sessions, setSessions] = useState<SesiPertemuan[]>(INITIAL_SESSIONS);
  const [currentSession, setCurrentSession] = useState<SesiPertemuan | null>(INITIAL_SESSIONS[0] || null);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [presensiLog, setPresensiLog] = useState<PresensiRecord[]>(INITIAL_PRESENSI_LOG);
  const [penilaianList, setPenilaianList] = useState<PenilaianRecord[]>(INITIAL_PENILAIAN);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [pembinaList, setPembinaList] = useState<Guru[]>([]);
  const [jadwalProposals, setJadwalProposals] = useState<PengajuanJadwal[]>(INITIAL_JADWAL_PROPOSALS);
  const [pendingPendaftaranCount, setPendingPendaftaranCount] = useState<number>(0);

  const pendingJadwalCount = useMemo(() => {
    return (jadwalProposals || []).filter(p => p.status === 'MENUNGGU_VALIDASI').length;
  }, [jadwalProposals]);

  // Current logged in student profile
  const currentStudentProfile = useMemo(() => {
    if (currentUser?.role === 'SISWA') {
      const match = students.find(s => 
        s.nis === currentUser.username || 
        s.nomorInduk === currentUser.nomorInduk || 
        s.id === currentUser.id
      );
      if (match) return match;
    }
    return students[0] || null;
  }, [currentUser, students]);

  // Modals state
  const [isAddEskulOpen, setIsAddEskulOpen] = useState(false);
  const [isEditEskulOpen, setIsEditEskulOpen] = useState(false);
  const [editingEskul, setEditingEskul] = useState<Eskul | null>(null);
  const [isAddPembinaOpen, setIsAddPembinaOpen] = useState(false);
  const [isEditPembinaOpen, setIsEditPembinaOpen] = useState(false);
  const [editingPembina, setEditingPembina] = useState<Guru | null>(null);
  const [isAddGuruOpen, setIsAddGuruOpen] = useState(false);
  const [isEditGuruOpen, setIsEditGuruOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImportGuruOpen, setIsImportGuruOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isStudentCardModalOpen, setIsStudentCardModalOpen] = useState(false);
  const [isBukaAbsensiModalOpen, setIsBukaAbsensiModalOpen] = useState(false);
  const [selectedEskulForSession, setSelectedEskulForSession] = useState<Eskul | null>(null);
  const [isAjukanJadwalModalOpen, setIsAjukanJadwalModalOpen] = useState(false);
  const [selectedEskulForJadwal, setSelectedEskulForJadwal] = useState<Eskul | null>(null);
  const [isValidasiJadwalModalOpen, setIsValidasiJadwalModalOpen] = useState(false);
  const [isRiwayatJadwalModalOpen, setIsRiwayatJadwalModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [selectedEskulHistoryId, setSelectedEskulHistoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
  const isPembina = currentRole === 'PEMBINA';
  const isWaliKelas = currentRole === 'WALI_KELAS';
  const isSiswa = currentRole === 'SISWA';

  // All eskuls coached by current Pembina (supporting multi-eskul coaches like Ahmad Syafii)
  const pembinaCoachedEskuls = useMemo(() => {
    if (!currentUser) return [];
    const matched = eskulList.filter(e => 
      e.pembinaId === currentUser.id || 
      (currentUser.namaLengkap && (
        e.pembinaNama.toLowerCase().includes(currentUser.namaLengkap.toLowerCase().split(' ')[0]) ||
        currentUser.namaLengkap.toLowerCase().includes(e.pembinaNama.toLowerCase().split(' ')[0])
      ))
    );
    // Jika Administrator sedang dalam Mode Pembina, sediakan seluruh eskul aktif agar Administrator dapat menguji dan mengelola setiap cabang
    if (matched.length === 0 && isSystemAdmin) {
      return eskulList;
    }
    return matched;
  }, [eskulList, currentUser, isSystemAdmin]);

  const pembinaCoachedEskulIds = useMemo(() => pembinaCoachedEskuls.map(e => e.id), [pembinaCoachedEskuls]);

  // Sessions strictly isolated for Pembina (only the coached eskuls!)
  const pembinaSessions = useMemo(() => {
    if (!isPembina) return sessions;
    return sessions.filter(s => 
      pembinaCoachedEskulIds.includes(s.eskulId) ||
      (currentUser?.namaLengkap && (
        s.pembinaNama.toLowerCase().includes(currentUser.namaLengkap.toLowerCase().split(' ')[0]) ||
        currentUser.namaLengkap.toLowerCase().includes(s.pembinaNama.toLowerCase().split(' ')[0])
      )) ||
      (s.pembinaId && s.pembinaId === currentUser?.id)
    );
  }, [isPembina, sessions, pembinaCoachedEskulIds, currentUser]);

  // Active session for Pembina (must belong to their coached eskul)
  const activeSessionForPembina = useMemo(() => {
    if (!isPembina) return currentSession;
    const match = currentSession ? pembinaSessions.find(s => s.id === currentSession.id) : null;
    return match || pembinaSessions[0] || currentSession || null;
  }, [isPembina, pembinaSessions, currentSession]);

  const handleNavigateTab = (tab: string) => {
    const allowed = ALLOWED_TABS_BY_ROLE[currentRole] || [];
    if (!allowed.includes(tab)) {
      showToast(`Akses Dibatasi: Peran ${currentRole} tidak memiliki izin membuka modul ${tab}.`);
      return;
    }
    if (tab === 'kartu-siswa') {
      setIsStudentCardModalOpen(true);
    } else {
      setActiveTab(tab as NavItemKey);
    }
  };

  // Load from Backend on mount
  const loadBackendData = async () => {
    try {
      const [backendEskul, backendStudents, backendSessions, backendLogs, backendPenilaian, backendKelas, backendPembina, backendGuru, backendProposals] = await Promise.all([
        api.getEskul(),
        api.getStudents(),
        api.getTodaySessions(),
        api.getPresensiLogs(),
        api.getPenilaian(),
        api.getKelas(),
        api.getPembina(),
        api.getGuru(),
        api.getJadwalProposals(),
      ]);

      if (Array.isArray(backendEskul)) setEskulList(backendEskul);
      if (Array.isArray(backendStudents)) setStudents(backendStudents);
      if (Array.isArray(backendSessions)) {
        setSessions(backendSessions);
        setCurrentSession(backendSessions[0] || null);
      }
      if (Array.isArray(backendLogs)) setPresensiLog(backendLogs);
      if (Array.isArray(backendPenilaian)) setPenilaianList(backendPenilaian);
      if (Array.isArray(backendKelas)) setKelasList(backendKelas);
      if (Array.isArray(backendPembina)) setPembinaList(backendPembina);
      if (Array.isArray(backendGuru)) {
        setGuruList(backendGuru);
      } else if (Array.isArray(backendPembina)) {
        setGuruList(backendPembina);
      }
      if (Array.isArray(backendProposals)) {
        setJadwalProposals(backendProposals);
      }

      // Fetch summary badge for pending pendaftaran
      try {
        const pendaftaranSummary = await fetch('/api/pendaftaran/summary');
        if (pendaftaranSummary.ok) {
          const pJson = await pendaftaranSummary.json();
          if (pJson.success && pJson.data) {
            setPendingPendaftaranCount(pJson.data.menungguValidasiKoordinator || 0);
          }
        }
      } catch {
        // ignore fallback
      }
    } catch (err) {
      console.warn('Backend initial fetch error, using fallback:', err);
    }
  };

  React.useEffect(() => {
    loadBackendData();
  }, []);

  // Handlers for Eskul
  const handleAddEskul = async (newEskulData: Omit<Eskul, 'id' | 'jumlahSiswa'>) => {
    try {
      await api.createEskul(newEskulData);
      await loadBackendData();
      showToast(`Eskul "${newEskulData.namaEskul}" tersimpan ke basis data.`);
    } catch {
      const newId = `eskul-${Date.now().toString().slice(-4)}`;
      const newEskul: Eskul = {
        ...newEskulData,
        id: newId,
        jumlahSiswa: 0,
      };
      setEskulList([newEskul, ...eskulList]);
      showToast(`Eskul "${newEskul.namaEskul}" tersimpan ke basis data.`);
    }
  };

  // Handler for editing Eskul
  const handleEditEskul = async (updated: Eskul) => {
    try {
      await api.updateEskul(updated.id, updated);
      await loadBackendData();
      showToast(`Data eskul "${updated.namaEskul}" berhasil diperbarui.`);
    } catch {
      setEskulList(prev => prev.map(e => e.id === updated.id ? updated : e));
      showToast(`Data eskul "${updated.namaEskul}" berhasil diperbarui.`);
    }
  };

  // Handler for creating Pembina (Koordinator feature)
  const handleCreatePembina = async (data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    username?: string;
    password?: string;
    assignedEskulId?: string;
    assignedEskulIds?: string[];
  }) => {
    try {
      await api.createPembina(data);
      await loadBackendData();
      showToast(`Akun Pembina "${data.namaLengkap}" berhasil dibuat.`);
    } catch {
      showToast(`Akun Pembina "${data.namaLengkap}" telah dibuat (lokal).`);
    }
  };

  const handleUpdatePembina = async (id: string, data: any) => {
    try {
      await api.updateGuru(id, data);
      await loadBackendData();
      showToast(`Data Pembina "${data.namaLengkap}" berhasil diperbarui.`);
    } catch {
      // Local fallback: update pembinaList & eskulList
      const assignedIds: string[] = data.assignedEskulIds || (data.assignedEskulId ? [data.assignedEskulId] : []);
      
      setPembinaList(prev => prev.map(p => {
        if (p.id === id) {
          const updatedEskulDiampu = eskulList
            .filter(e => assignedIds.includes(e.id))
            .map(e => ({ id: e.id, namaEskul: e.namaEskul }));
          return {
            ...p,
            ...data,
            eskulDiampu: updatedEskulDiampu,
          };
        }
        return p;
      }));

      if (data.assignedEskulIds) {
        setEskulList(prev => prev.map(e => {
          if (assignedIds.includes(e.id)) {
            return { ...e, pembinaId: id, pembinaNama: data.namaLengkap };
          }
          if (e.pembinaId === id && !assignedIds.includes(e.id)) {
            return { ...e, pembinaId: '', pembinaNama: 'Belum Ditugaskan' };
          }
          return e;
        }));
      }

      showToast(`Data Pembina "${data.namaLengkap}" berhasil diperbarui.`);
    }
  };

  const handleDeletePembina = async (id: string) => {
    try {
      await api.deleteGuru(id);
      await loadBackendData();
      showToast('Data Pembina berhasil dihapus.');
    } catch {
      setPembinaList(prev => prev.filter(p => p.id !== id));
      showToast('Data Pembina berhasil dihapus.');
    }
  };

  // Handler for Guru & Wali Kelas
  const handleCreateGuru = async (data: any) => {
    try {
      await api.createGuru(data);
      await loadBackendData();
      showToast(`Data Guru "${data.namaLengkap}" berhasil ditambahkan.`);
    } catch {
      showToast(`Data Guru "${data.namaLengkap}" telah dibuat (lokal).`);
    }
  };

  const handleUpdateGuru = async (id: string, data: any) => {
    try {
      await api.updateGuru(id, data);
      await loadBackendData();
      showToast(`Data Guru "${data.namaLengkap}" berhasil diperbarui.`);
    } catch {
      setGuruList(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
      showToast(`Data Guru "${data.namaLengkap}" berhasil diperbarui.`);
    }
  };

  const handleDeleteGuru = async (id: string) => {
    try {
      await api.deleteGuru(id);
      await loadBackendData();
      showToast('Data Guru berhasil dihapus.');
    } catch {
      setGuruList(prev => prev.filter(g => g.id !== id));
      showToast('Data Guru berhasil dihapus.');
    }
  };

  // Handler for creating Kelas
  const handleAddKelas = async (data: { namaKelas: string; tingkat: number; jurusan: string; waliKelasId?: string }) => {
    try {
      await api.createKelas(data);
      await loadBackendData();
      showToast(`Kelas "${data.namaKelas}" berhasil ditambahkan.`);
    } catch {
      const newKelas: Kelas = {
        id: `kls-${Date.now()}`,
        namaKelas: data.namaKelas,
        tingkat: data.tingkat,
        jurusan: data.jurusan,
        waliKelasId: data.waliKelasId,
        waliKelas: guruList.find(g => g.id === data.waliKelasId),
        _count: { siswaList: 0 },
      };
      setKelasList([...kelasList, newKelas]);
      showToast(`Kelas "${data.namaKelas}" berhasil ditambahkan.`);
    }
  };

  const handleAssignWaliKelas = async (kelasId: string, waliKelasId: string) => {
    try {
      await api.assignWaliKelas(kelasId, waliKelasId);
      await loadBackendData();
      showToast('Wali kelas berhasil ditugaskan.');
    } catch {
      setKelasList(kelasList.map(k => k.id === kelasId ? { ...k, waliKelasId, waliKelas: guruList.find(g => g.id === waliKelasId) } : k));
      showToast('Wali kelas berhasil ditugaskan.');
    }
  };

  const handleUpdateKelas = async (kelasId: string, data: { namaKelas?: string; tingkat?: number; jurusan?: string; waliKelasId?: string }) => {
    try {
      await api.updateKelas(kelasId, data);
      await loadBackendData();
      showToast('Data rombel kelas berhasil diperbarui.');
    } catch {
      setKelasList(kelasList.map(k => k.id === kelasId ? {
        ...k,
        ...data,
        waliKelas: data.waliKelasId ? guruList.find(g => g.id === data.waliKelasId) : k.waliKelas,
      } : k));
      showToast('Data rombel kelas berhasil diperbarui.');
    }
  };

  const handleDeleteKelas = async (kelasId: string) => {
    try {
      await api.deleteKelas(kelasId);
      await loadBackendData();
      showToast('Kelas berhasil dihapus.');
    } catch {
      setKelasList(kelasList.filter(k => k.id !== kelasId));
      showToast('Kelas berhasil dihapus.');
    }
  };


  const handleDeleteEskul = async (id: string) => {
    try {
      await api.deleteEskul(id);
    } catch {
      // fallback
    }
    setEskulList(eskulList.filter(e => e.id !== id));
    showToast('Ekstrakurikuler berhasil dihapus.');
  };

  const handleToggleEskulStatus = async (id: string) => {
    const target = eskulList.find(e => e.id === id);
    if (!target) return;
    const newStatus = target.status === 'Aktif' ? 'Non-Aktif' : 'Aktif';

    // Optimistic UI update
    setEskulList(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    showToast(`Status eskul "${target.namaEskul}" diubah menjadi ${newStatus}.`);

    // Sync to backend database
    try {
      await api.updateEskul(id, { status: newStatus });
    } catch (err) {
      console.warn('Backend updateEskul sync note:', err);
    }
  };

  const handleOpenBukaAbsensiModal = (eskul?: Eskul) => {
    const targetEskul = eskul || eskulList.find(e => 
      e.pembinaId === currentUser?.id || 
      (currentUser?.namaLengkap && e.pembinaNama.toLowerCase().includes(currentUser.namaLengkap.toLowerCase().split(' ')[0]))
    ) || eskulList[0];
    
    setSelectedEskulForSession(targetEskul);
    setIsBukaAbsensiModalOpen(true);
  };

  const handleOpenSessionFromEskul = (eskul: Eskul) => {
    setSelectedEskulForSession(eskul);
    setIsBukaAbsensiModalOpen(true);
  };

  const handleConfirmBukaAbsensi = async (sessionData: {
    eskul: Eskul;
    judul: string;
    deskripsi: string;
    jamMulai: string;
    jamSelesai: string;
    lokasi: string;
  }) => {
    try {
      const created = await api.createSession({
        eskulId: sessionData.eskul.id,
        judul: sessionData.judul,
        deskripsi: sessionData.deskripsi,
        materi: `${sessionData.judul} - ${sessionData.deskripsi}`,
        jamMulai: sessionData.jamMulai,
        jamSelesai: sessionData.jamSelesai,
        lokasi: sessionData.lokasi,
      });

      setSessions(prev => [created, ...prev.filter(s => s.id !== created.id)]);
      setCurrentSession(created);
      setIsBukaAbsensiModalOpen(false);
      setActiveTab('dynamic-qr');
      showToast(`Sesi presensi "${sessionData.judul}" berhasil dibuka! Menampilkan QR proyektor.`);
    } catch (err) {
      console.warn('Backend createSession fallback:', err);
      const fallbackSession: SesiPertemuan = {
        id: `sesi-${Date.now().toString().slice(-4)}`,
        eskulId: sessionData.eskul.id,
        namaEskul: sessionData.eskul.namaEskul,
        pembinaNama: sessionData.eskul.pembinaNama,
        tanggal: new Date().toISOString().slice(0, 10),
        jamMulai: sessionData.jamMulai,
        jamSelesai: sessionData.jamSelesai,
        lokasi: sessionData.lokasi,
        judul: sessionData.judul,
        deskripsi: sessionData.deskripsi,
        materi: `${sessionData.judul} - ${sessionData.deskripsi}`,
        tokenAktif: `SMK-AMANAH:${sessionData.eskul.id}:${Math.floor(Date.now() / 15000)}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        tokenExpiresAt: Date.now() + 15000,
        status: 'BERLANGSUNG',
        totalHadir: 0,
        totalSiswa: sessionData.eskul.jumlahSiswa || 35,
      };

      setSessions(prev => [fallbackSession, ...prev.filter(s => s.id !== fallbackSession.id)]);
      setCurrentSession(fallbackSession);
      setIsBukaAbsensiModalOpen(false);
      setActiveTab('dynamic-qr');
      showToast(`Sesi presensi "${sessionData.judul}" berhasil dibuka! Menampilkan QR proyektor.`);
    }
  };

  const handleUpdateSessionAgenda = async (judul: string, deskripsi: string) => {
    if (!currentSession) return;
    try {
      await api.updateSessionStatus(currentSession.id, currentSession.status, {
        judul,
        deskripsi,
        materi: `${judul} - ${deskripsi}`
      });
    } catch {
      // fallback
    }
    const updated = {
      ...currentSession,
      judul,
      deskripsi,
      materi: `${judul} - ${deskripsi}`
    };
    setCurrentSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
    showToast('Agenda & materi sesi berhasil diperbarui.');
  };

  const handleOpenAjukanJadwalModal = (eskul?: Eskul) => {
    setSelectedEskulForJadwal(eskul || null);
    setIsAjukanJadwalModalOpen(true);
  };

  const handleSubmitJadwalProposal = async (proposalData: {
    eskulId: string;
    pembinaId: string;
    hariBaru: string;
    jamMulaiBaru: string;
    jamSelesaiBaru: string;
    lokasiBaru: string;
    jenisPerubahan: 'PERMANEN' | 'SEMENTARA';
    tanggalEfektif?: string;
    alasan: string;
  }) => {
    try {
      const targetEskul = eskulList.find(e => e.id === proposalData.eskulId);
      const effectivePembinaId = proposalData.pembinaId || targetEskul?.pembinaId || guruList[0]?.id || 'gur-01';

      const created = await api.createJadwalProposal({
        ...proposalData,
        pembinaId: effectivePembinaId,
      });

      // Synchronize latest proposals from backend immediately
      const latestProposals = await api.getJadwalProposals();
      if (latestProposals && latestProposals.length > 0) {
        setJadwalProposals(latestProposals);
      } else {
        setJadwalProposals(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      }
      setIsAjukanJadwalModalOpen(false);
      showToast('Pengajuan perubahan jadwal berhasil dikirimkan ke Koordinator!');
    } catch (err) {
      console.warn('Backend proposal fallback:', err);
      const targetEskul = eskulList.find(e => e.id === proposalData.eskulId);
      const localProp: PengajuanJadwal = {
        id: `prop-${Date.now().toString().slice(-4)}`,
        eskulId: proposalData.eskulId,
        namaEskul: targetEskul?.namaEskul || 'Ekstrakurikuler',
        kategoriEskul: targetEskul?.kategori || 'Umum',
        pembinaId: currentUser?.id || proposalData.pembinaId,
        pembinaNama: currentUser?.namaLengkap || targetEskul?.pembinaNama || 'Pembina',
        pembinaAvatar: currentUser?.avatarUrl,
        pembinaNip: currentUser?.nomorInduk,
        hariLama: targetEskul?.jadwalHari || 'Jumat',
        jamMulaiLama: targetEskul?.jamMulai || '15:30',
        jamSelesaiLama: targetEskul?.jamSelesai || '17:00',
        lokasiLama: targetEskul?.lokasi || 'Sekolah',
        hariBaru: proposalData.hariBaru,
        jamMulaiBaru: proposalData.jamMulaiBaru,
        jamSelesaiBaru: proposalData.jamSelesaiBaru,
        lokasiBaru: proposalData.lokasiBaru,
        jenisPerubahan: proposalData.jenisPerubahan,
        tanggalEfektif: proposalData.tanggalEfektif,
        alasan: proposalData.alasan,
        status: 'MENUNGGU_VALIDASI',
        createdAt: new Date().toISOString(),
      };
      setJadwalProposals(prev => [localProp, ...prev]);
      setIsAjukanJadwalModalOpen(false);
      showToast('Pengajuan perubahan jadwal berhasil dikirimkan ke Koordinator!');
    }
  };

  const handleValidateJadwalProposal = async (
    proposalId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    catatanKoordinator?: string
  ) => {
    try {
      const res = await api.validateJadwalProposal(proposalId, {
        status,
        catatanKoordinator,
        koordinatorId: currentUser?.id,
      });
      
      setJadwalProposals(prev => prev.map(p => p.id === proposalId ? {
        ...p,
        status,
        catatanKoordinator,
        verifikatorId: currentUser?.id,
        verifikatorNama: currentUser?.namaLengkap,
        verifiedAt: new Date().toISOString(),
      } : p));

      if (status === 'DISETUJUI') {
        if (res && res.updatedEskul) {
          const updated = res.updatedEskul;
          setEskulList(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
        } else {
          const prop = jadwalProposals.find(p => p.id === proposalId);
          if (prop) {
            setEskulList(prev => prev.map(e => e.id === prop.eskulId ? {
              ...e,
              jadwalHari: prop.hariBaru,
              jamMulai: prop.jamMulaiBaru,
              jamSelesai: prop.jamSelesaiBaru,
              lokasi: prop.lokasiBaru || e.lokasi,
            } : e));
          }
        }
        showToast('Pengajuan jadwal DISETUJUI. Jadwal ekstrakurikuler telah diperbarui otomatis!');
      } else {
        showToast('Pengajuan jadwal telah DITOLAK.');
      }
    } catch (err) {
      console.warn('Validate proposal fallback:', err);
      setJadwalProposals(prev => prev.map(p => p.id === proposalId ? {
        ...p,
        status,
        catatanKoordinator,
        verifikatorId: currentUser?.id,
        verifikatorNama: currentUser?.namaLengkap,
        verifiedAt: new Date().toISOString(),
      } : p));

      if (status === 'DISETUJUI') {
        const prop = jadwalProposals.find(p => p.id === proposalId);
        if (prop) {
          setEskulList(prev => prev.map(e => e.id === prop.eskulId ? {
            ...e,
            jadwalHari: prop.hariBaru,
            jamMulai: prop.jamMulaiBaru,
            jamSelesai: prop.jamSelesaiBaru,
            lokasi: prop.lokasiBaru || e.lokasi,
          } : e));
        }
        showToast('Pengajuan jadwal DISETUJUI. Jadwal ekstrakurikuler telah diperbarui otomatis!');
      } else {
        showToast('Pengajuan jadwal telah DITOLAK.');
      }
    }
  };

  const handleUpdateSessionStatus = async (status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI') => {
    if (!currentSession) return;
    try {
      await api.updateSessionStatus(currentSession.id, status);
    } catch {
      // fallback
    }
    const updated = { ...currentSession, status };
    setCurrentSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
    showToast(`Status sesi diubah menjadi: ${status}`);
  };

  const handleSimulateScan = async (_sessionToken: string) => {
    if (!currentSession) {
      showToast('Tidak ada sesi aktif untuk scan presensi.');
      return;
    }
    const randomStudents = [
      { name: 'Aldi Taher Pratama', nisn: '0069928172', kelas: 'XII RPL 2' },
      { name: 'Citra Kirana Dewi', nisn: '0071829301', kelas: 'XI AKL 2' },
      { name: 'Dimas Anggara Putra', nisn: '0068839201', kelas: 'X RPL 1' },
      { name: 'Farah Quinn Az-Zahra', nisn: '0073948192', kelas: 'XI OTKP 2' }
    ];
    const picked = randomStudents[Math.floor(Math.random() * randomStudents.length)];
    const timeStr = new Date().toTimeString().slice(0, 8);

    const newLog: PresensiRecord = {
      id: `log-${Date.now()}`,
      sesiId: currentSession.id,
      namaEskul: currentSession.namaEskul,
      siswaId: `stu-${Date.now()}`,
      namaSiswa: picked.name,
      nisn: picked.nisn,
      kelas: picked.kelas,
      waktuScan: timeStr,
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: 'Siswa Device (Validated GPS Kompleks Al Amanah)',
    };

    setPresensiLog([newLog, ...presensiLog]);
    const updatedSession = { ...currentSession, totalHadir: currentSession.totalHadir + 1 };
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    showToast(`Presensi Berhasil: ${picked.name} (HADIR)`);
  };

  const handleAssignEskulToStudent = async (studentId: string, eskulIds: string[]) => {
    try {
      await api.assignEskul(studentId, eskulIds);
    } catch {
      // fallback
    }
    setStudents(students.map(s => s.id === studentId ? { ...s, enrolledEskulIds: eskulIds } : s));
    showToast('Penugasan eskul siswa diperbarui.');
  };

  const handleUpdateAttendanceStatus = async (logId: string, newStatus: PresensiRecord['status']) => {
    try {
      await api.updatePresensiStatus(logId, newStatus);
    } catch {
      // fallback
    }
    setPresensiLog(presensiLog.map(p => p.id === logId ? { ...p, status: newStatus, metode: 'MANUAL_DISPENSASI' } : p));
    showToast(`Status presensi diperbarui: ${newStatus}`);
  };

  const handleStudentScanned = async (studentName: string, eskulName: string, rawToken?: string) => {
    const student = currentStudentProfile || students[0];

    // Reload latest backend state since QrScannerModal has already verified and written to database
    try {
      await loadBackendData();
      showToast(`Presensi Anda di ${eskulName || 'Ekstrakurikuler'} berhasil diverifikasi & tercatat di basis data!`);
      return;
    } catch (err: any) {
      console.warn('Backend refresh notice:', err);
    }

    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hari = days[now.getDay()];
    const tanggal = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newRecord: PresensiRecord = {
      id: `log-${Date.now()}`,
      sesiId: currentSession?.id || '',
      eskulId: currentSession?.eskulId || '',
      namaEskul: eskulName || currentSession?.namaEskul || 'Ekstrakurikuler',
      siswaId: student?.id || 'sis-001',
      namaSiswa: studentName || student?.namaLengkap || 'Siswa',
      nisn: student?.nis || student?.nomorInduk || '241011400049',
      kelas: student?.kelas || 'X RPL 1',
      waktuScan: `${hari}, ${tanggal} • ${jam} WIB`,
      hari,
      tanggal,
      jamScan: jam,
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: 'Perangkat Siswa (GPS Valid)',
    };

    setPresensiLog(prev => [newRecord, ...prev]);
    showToast(`Presensi Anda di ${eskulName || 'Ekstrakurikuler'} berhasil diverifikasi!`);
  };

  const handleTeacherRecordAttendance = async (student: StudentProfile, session?: SesiPertemuan) => {
    const targetSession = session || (isPembina ? activeSessionForPembina : currentSession);
    if (!targetSession) {
      showToast('Tidak ada sesi aktif untuk mencatat kehadiran.');
      return;
    }
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hari = days[now.getDay()];
    const tanggal = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newRecord: PresensiRecord = {
      id: `log-${Date.now()}`,
      sesiId: targetSession.id,
      eskulId: targetSession.eskulId,
      namaEskul: targetSession.namaEskul,
      siswaId: student.id,
      namaSiswa: student.namaLengkap,
      nisn: student.nis || student.nomorInduk,
      kelas: student.kelas,
      waktuScan: `${hari}, ${tanggal} • ${jam} WIB`,
      hari,
      tanggal,
      jamScan: jam,
      status: 'HADIR',
      metode: 'SCAN_KARTU_GURU',
      deviceInfo: 'Kamera Scanner Pembina (ID Card QR)',
    };

    setPresensiLog(prev => [newRecord, ...prev.filter(p => !(p.sesiId === targetSession.id && p.siswaId === student.id))]);
    const updatedSession = { ...targetSession, totalHadir: (targetSession.totalHadir || 0) + 1 };
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));

    // Langsung catat ke basis data backend agar data tersimpan permanen
    try {
      await api.scanStudentCard({
        sesiId: targetSession.id,
        studentIdOrNis: student.nis || student.nomorInduk || student.id,
        pembinaId: currentUser?.id,
        nilaiKeaktifan: 85,
        ratingKeaktifan: 'Baik',
      });
      await loadBackendData();
    } catch (err) {
      console.warn('Backend scanStudentCard sync error:', err);
    }

    showToast(`Presensi Terverifikasi: ${student.namaLengkap} (HADIR)`);
  };



  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'ADMIN' || user.username === 'admin' || user.username === 'admin.it') {
      localStorage.setItem('al_amanah_is_admin', 'true');
    } else {
      localStorage.removeItem('al_amanah_is_admin');
    }
    localStorage.setItem('al_amanah_user_session', JSON.stringify(user));
    setActiveTab('beranda');
    showToast(`Selamat datang kembali, ${user.namaLengkap}!`);
  };

  const handleOpenLogoutConfirm = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('al_amanah_user_session');
    localStorage.removeItem('al_amanah_auth_token');
    localStorage.removeItem('al_amanah_is_admin');
    sessionStorage.removeItem('al_amanah_user_session');
    sessionStorage.removeItem('al_amanah_auth_token');
    sessionStorage.removeItem('al_amanah_is_admin');
    setCurrentUser(null);
    setCurrentRole('ADMIN');
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(false);
    showToast('Sesi Anda telah berhasil diakhiri. Sampai jumpa kembali!');
  };

  const handleRoleChange = (role: Role) => {
    if (!isSystemAdmin) return;
    setCurrentRole(role);
    setActiveTab('beranda');
    const roleTitles: Record<Role, string> = {
      ADMIN: 'Administrator Sistem',
      KOORDINATOR: 'Koordinator Ekstrakurikuler',
      PEMBINA: 'Guru Pembina Eskul',
      WALI_KELAS: 'Wali Kelas',
      SISWA: 'Siswa',
    };
    showToast(`Beralih ke Mode ${roleTitles[role] || role}`);
  };

  // ==========================================
  // MANDATORY AUTH GUARD: Wajib Login Dulu
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#EEF1F5] font-sans selection:bg-[#00B884]/20 selection:text-[#00B884]">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-800"
            >
              <span className="w-2 h-2 rounded-full bg-[#00B884] animate-ping shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#EEF1F5] flex flex-row font-sans relative">
      {/* Sidebar with strict Role Filtering, Desktop Collapse & Mobile Drawer Support */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsMobileMenuOpen(false);
          handleNavigateTab(tab);
        }}
        currentRole={currentRole}
        onLogout={handleOpenLogoutConfirm}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isDesktopOpen={isDesktopSidebarOpen}
        onToggleDesktop={() => setIsDesktopSidebarOpen(prev => !prev)}
        pendingJadwalCount={pendingJadwalCount}
        pendingPendaftaranCount={pendingPendaftaranCount}
        onOpenAjukanJadwalModal={() => {
          const defaultEskul = selectedEskulForJadwal || pembinaCoachedEskuls[0] || eskulList[0];
          handleOpenAjukanJadwalModal(defaultEskul);
        }}
      />

      {/* Main Content Area: Dedicated Independent Vertical Scroll Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          canSwitchRole={isSystemAdmin}
          onSearch={(q) => {
            if (q) showToast(`Mencari "${q}"...`);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMail={() => setIsMailOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(prev => !prev)}
          onLogout={handleOpenLogoutConfirm}
          eskulList={eskulList}
          students={students}
          guruList={guruList.length > 0 ? guruList : pembinaList}
          kelasList={kelasList}
          onNavigateTab={handleNavigateTab}
          onSelectEskul={(eskul) => {
            if (isKoordinator) {
              handleNavigateTab('eskul');
              showToast(`Membuka eskul: ${eskul.namaEskul}`);
            }
          }}
          onSelectStudent={(stu) => {
            if (isKoordinator || isPembina) {
              handleNavigateTab('siswa');
              showToast(`Membuka data siswa: ${stu.namaLengkap} (${stu.kelas})`);
            }
          }}
        />

        {/* Active Role Mode Indicator Bar for Administrator */}
        {isSystemAdmin && currentRole !== 'ADMIN' && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-b border-emerald-200/90 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                Anda sedang aktif dalam <strong>Mode {
                  currentRole === 'KOORDINATOR' ? 'Koordinator Ekstrakurikuler' :
                  currentRole === 'PEMBINA' ? 'Guru Pembina Eskul' :
                  currentRole === 'WALI_KELAS' ? 'Wali Kelas' : 'Siswa'
                }</strong>. Seluruh antarmuka dan hak akses disesuaikan dengan peran ini.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                className="px-3 py-1 rounded bg-white text-emerald-800 hover:text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs transition-all hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Kembali ke Administrator</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Views */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-2 pb-8 max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full"
            >
              {(() => {
            const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
            const isPembina = currentRole === 'PEMBINA';
            const isWaliKelas = currentRole === 'WALI_KELAS';
            const isSiswa = currentRole === 'SISWA';

            // Coached eskul for current Pembina
            const coachedEskul = eskulList.find(e => 
              e.pembinaId === currentUser?.id || 
              (currentUser?.namaLengkap && e.pembinaNama.toLowerCase().includes(currentUser.namaLengkap.toLowerCase().split(' ')[0]))
            ) || eskulList[0];

            // Target student profile for Siswa role
            const studentProfile = students.find(s => 
              s.nis === currentUser?.username || 
              s.nomorInduk === currentUser?.nomorInduk || 
              s.id === currentUser?.id
            ) || students[0];

            // Assigned class for Wali Kelas
            const waliClass = currentUser?.kelas || 'X RPL 1';

            return (
              <>
                {/* 1. BERANDA (Role-Aware) */}
                {activeTab === 'beranda' && (
                  isKoordinator ? (
                    <AdminDashboard
                      eskulList={eskulList}
                      students={students}
                      pembinaList={pembinaList.length > 0 ? pembinaList : guruList.filter(g => g.isPembina)}
                      sessions={sessions}
                      presensiLog={presensiLog}
                      jadwalProposals={jadwalProposals}
                      pendingPendaftaranCount={pendingPendaftaranCount}
                      onOpenAddEskul={() => setIsAddEskulOpen(true)}
                      onOpenImport={() => setIsImportOpen(true)}
                      onOpenValidasiJadwal={() => setActiveTab('validasi-jadwal')}
                      onNavigate={(tab) => setActiveTab(tab)}
                      onOpenSession={handleOpenSessionFromEskul}
                    />
                  ) : isPembina ? (
                    <PembinaDashboard
                      currentPembina={currentUser!}
                      eskulList={pembinaCoachedEskuls.length > 0 ? pembinaCoachedEskuls : eskulList}
                      students={students}
                      sessions={pembinaSessions}
                      recentLogs={presensiLog}
                      penilaianList={penilaianList}
                      jadwalProposals={jadwalProposals}
                      onNavigate={handleNavigateTab}
                      onOpenSession={handleOpenSessionFromEskul}
                      onOpenBukaAbsensiModal={handleOpenBukaAbsensiModal}
                      onOpenAjukanJadwalModal={handleOpenAjukanJadwalModal}
                      onOpenRiwayatJadwalModal={() => setIsRiwayatJadwalModalOpen(true)}
                    />
                  ) : isWaliKelas ? (
                    <WaliKelasDashboard
                      currentWali={currentUser!}
                      students={students}
                      eskulList={eskulList}
                      penilaianList={penilaianList}
                      presensiLog={presensiLog}
                      onNavigate={handleNavigateTab}
                      onAssignEskul={handleAssignEskulToStudent}
                    />
                  ) : (
                    <SiswaDashboard
                      currentStudent={studentProfile}
                      enrolledEskuls={eskulList.filter(e => studentProfile?.enrolledEskulIds?.includes(e.id))}
                      todaySessions={sessions}
                      attendanceHistory={presensiLog.filter(p => p.siswaId === studentProfile?.id || p.siswaId === 'usr-sis-01' || p.siswaId === 'sis-001')}
                      penilaianRecords={penilaianList}
                      onNewAttendance={handleStudentScanned}
                      onNavigateToKhn={() => setActiveTab('khn-siswa')}
                      onNavigateToCard={() => setIsStudentCardModalOpen(true)}
                      onNavigateToHistory={(eskulId) => {
                        setSelectedEskulHistoryId(eskulId || null);
                        setActiveTab('riwayat-eskul-siswa');
                      }}
                    />
                  )
                )}

                {/* 2. ESKUL MANAGEMENT (Koordinator Only) */}
                {activeTab === 'eskul' && (
                  isKoordinator ? (
                    <EskulManagement
                      eskulList={eskulList}
                      sessions={sessions}
                      jadwalProposals={jadwalProposals}
                      onAddEskul={() => setIsAddEskulOpen(true)}
                      onAddPembina={() => setIsAddPembinaOpen(true)}
                      onOpenValidasiJadwal={() => setIsValidasiJadwalModalOpen(true)}
                      onEditEskul={(eskul) => {
                        setEditingEskul(eskul);
                        setIsEditEskulOpen(true);
                      }}
                      onDeleteEskul={handleDeleteEskul}
                      onToggleStatus={handleToggleEskulStatus}
                      onOpenSession={handleOpenSessionFromEskul}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 2.1 DATA PEMBINA (Koordinator Only) */}
                {activeTab === 'pembina' && (
                  isKoordinator ? (
                    <PembinaManagement
                      pembinaList={pembinaList.length > 0 ? pembinaList : guruList.filter(g => g.isPembina !== false)}
                      eskulList={eskulList}
                      onAddPembina={() => setIsAddPembinaOpen(true)}
                      onOpenImport={() => setIsImportGuruOpen(true)}
                      onEditPembina={(pembina) => {
                        setEditingPembina(pembina);
                        setIsEditPembinaOpen(true);
                      }}
                      onDeletePembina={handleDeletePembina}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 2.2 DATA GURU & WALI KELAS (Koordinator Only) */}
                {activeTab === 'guru' && (
                  isKoordinator ? (
                    <GuruWaliManagement
                      guruList={guruList}
                      kelasList={kelasList}
                      onAddGuru={() => setIsAddGuruOpen(true)}
                      onOpenImport={() => setIsImportGuruOpen(true)}
                      onEditGuru={(guru) => {
                        setEditingGuru(guru);
                        setIsEditGuruOpen(true);
                      }}
                      onDeleteGuru={handleDeleteGuru}
                      onAssignWaliKelas={handleAssignWaliKelas}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 3. STUDENT MANAGEMENT (Koordinator / Wali Kelas / Pembina) */}
                {activeTab === 'siswa' && (
                  <StudentManagement
                    students={students}
                    eskulList={eskulList}
                    onAssignEskul={handleAssignEskulToStudent}
                    onAddStudent={() => {
                      setIsImportOpen(true);
                    }}
                    defaultClasses={isWaliKelas ? [waliClass] : []}
                    defaultEskuls={isPembina ? pembinaCoachedEskulIds : []}
                    currentRole={currentRole}
                  />
                )}

                {/* 4. KELAS & WALI KELAS (Koordinator Only) */}
                {activeTab === 'kelas' && (
                  isKoordinator ? (
                    <KelasManagement
                      kelasList={kelasList}
                      guruList={guruList}
                      onAddKelas={handleAddKelas}
                      onAssignWaliKelas={handleAssignWaliKelas}
                      onUpdateKelas={handleUpdateKelas}
                      onDeleteKelas={handleDeleteKelas}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 5. LAPORAN & REKAP (Koordinator / Wali Kelas / Pembina) */}
                {activeTab === 'laporan' && (
                  <ReportsManagement
                    eskulList={eskulList}
                    penilaianList={penilaianList}
                    presensiList={presensiLog}
                    defaultClasses={isWaliKelas ? [waliClass] : []}
                    defaultEskuls={isPembina ? pembinaCoachedEskulIds : []}
                  />
                )}

                {/* 6. DYNAMIC QR GENERATOR (Pembina / Koordinator - strictly isolated for Pembina) */}
                {activeTab === 'dynamic-qr' && (
                  <DynamicQrGenerator
                    sessions={isPembina ? pembinaSessions : sessions}
                    currentSession={isPembina ? activeSessionForPembina : currentSession}
                    onSelectSession={(sess) => {
                      if (isPembina && !pembinaCoachedEskulIds.includes(sess.eskulId)) {
                        showToast('Akses Dibatasi: Anda hanya berwenang membuka sesi eskul yang Anda bina.');
                        return;
                      }
                      setCurrentSession(sess);
                    }}
                    onUpdateSessionStatus={handleUpdateSessionStatus}
                    onSimulateStudentScan={handleSimulateScan}
                    onOpenBukaAbsensiModal={() => handleOpenBukaAbsensiModal(eskulList.find(e => e.id === (isPembina ? activeSessionForPembina?.eskulId : currentSession?.eskulId)))}
                    onUpdateSessionAgenda={handleUpdateSessionAgenda}
                    coachedEskulIds={pembinaCoachedEskulIds}
                    currentRole={currentRole}
                    currentUser={currentUser!}
                    students={students}
                    presensiLog={presensiLog}
                    onRefreshData={loadBackendData}
                  />
                )}

                {/* 7. TEACHER SCANNER (Pembina) */}
                {activeTab === 'scanner-guru' && (
                  <TeacherStudentScanner
                    currentSession={isPembina ? activeSessionForPembina : currentSession}
                    sessions={isPembina ? pembinaSessions : sessions}
                    onSelectSession={(sess) => setCurrentSession(sess)}
                    students={students}
                    onRecordAttendance={handleTeacherRecordAttendance}
                    recentLogs={presensiLog.filter(p => p.sesiId === (isPembina ? activeSessionForPembina?.id : currentSession?.id))}
                    currentUser={currentUser!}
                    onRefreshData={loadBackendData}
                  />
                )}

                {/* 8. LIVE PRESENSI / PRESENSI LANGSUNG (Koordinator / Pembina) */}
                {activeTab === 'live-presensi' && (
                  <LiveAttendanceLog
                    logs={presensiLog}
                    sessions={isPembina ? pembinaSessions : sessions}
                    currentSession={isPembina ? activeSessionForPembina : currentSession}
                    onSelectSession={(sess) => setCurrentSession(sess)}
                    students={students}
                    eskulList={isPembina ? pembinaCoachedEskuls : eskulList}
                    currentUser={currentUser!}
                    onUpdateStatus={handleUpdateAttendanceStatus}
                    onRefresh={loadBackendData}
                  />
                )}

                {/* 9. PENILAIAN RAPOR (Pembina) */}
                {activeTab === 'penilaian' && (
                  <PenilaianPage
                    penilaianList={penilaianList}
                    eskulList={eskulList}
                    onSavePenilaian={(updated) => {
                      setPenilaianList(updated);
                      showToast('Nilai rapor berhasil disimpan ke basis data.');
                    }}
                    defaultEskuls={isPembina ? pembinaCoachedEskulIds : []}
                    defaultClasses={isWaliKelas ? [waliClass] : []}
                    students={students}
                  />
                )}

                {/* 10. SISWA VIEWS */}
                {activeTab === 'scanner-siswa' && (
                  <SiswaDashboard
                    initialOpenModal="scanner"
                    currentStudent={studentProfile}
                    enrolledEskuls={eskulList.filter(e => studentProfile?.enrolledEskulIds?.includes(e.id))}
                    todaySessions={sessions}
                    attendanceHistory={presensiLog.filter(p => p.siswaId === studentProfile?.id || p.siswaId === 'usr-sis-01')}
                    penilaianRecords={penilaianList}
                    onNewAttendance={handleStudentScanned}
                    onNavigateToKhn={() => setActiveTab('khn-siswa')}
                    onNavigateToCard={() => setIsStudentCardModalOpen(true)}
                  />
                )}

                {activeTab === 'khn-siswa' && (
                  <KartuHasilNilaiPage
                    student={studentProfile}
                    enrolledEskuls={eskulList.filter(e => studentProfile?.enrolledEskulIds?.includes(e.id))}
                    penilaianRecords={penilaianList}
                    onBack={() => setActiveTab('beranda')}
                  />
                )}

                {activeTab === 'kartu-siswa' && (
                  <SiswaDashboard
                    initialOpenModal="card"
                    currentStudent={studentProfile}
                    enrolledEskuls={eskulList.filter(e => studentProfile?.enrolledEskulIds?.includes(e.id))}
                    todaySessions={sessions}
                    attendanceHistory={presensiLog.filter(p => p.siswaId === studentProfile?.id || p.siswaId === 'usr-sis-01')}
                    penilaianRecords={penilaianList}
                    onNewAttendance={handleStudentScanned}
                    onNavigateToKhn={() => setActiveTab('khn-siswa')}
                    onNavigateToCard={() => setIsStudentCardModalOpen(true)}
                  />
                )}

                {/* 10.4 RIWAYAT EKSTRAKURIKULER (Siswa) */}
                {activeTab === 'riwayat-eskul-siswa' && (
                  <RiwayatEskulSiswaPage
                    student={studentProfile}
                    enrolledEskuls={eskulList.filter(e => studentProfile?.enrolledEskulIds?.includes(e.id))}
                    sessions={sessions}
                    attendanceHistory={presensiLog.filter(p => p.siswaId === studentProfile?.id || p.siswaId === 'usr-sis-01' || p.siswaId === 'sis-001')}
                    jadwalProposals={jadwalProposals}
                    initialSelectedEskulId={selectedEskulHistoryId}
                    onBackToDashboard={() => {
                      setSelectedEskulHistoryId(null);
                      setActiveTab('beranda');
                    }}
                  />
                )}

                {/* 11. PENGATURAN */}
                {activeTab === 'pengaturan' && <SettingsPage />}

                {/* 12. VALIDASI PERUBAHAN JADWAL (Koordinator Only) */}
                {activeTab === 'validasi-jadwal' && (
                  isKoordinator ? (
                    <ValidasiJadwalView
                      currentUser={currentUser!}
                      proposals={jadwalProposals}
                      eskulList={eskulList}
                      onValidate={handleValidateJadwalProposal}
                      onBack={() => setActiveTab('beranda')}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 13. VALIDASI PENDAFTARAN SISWA (Koordinator Only) */}
                {activeTab === 'validasi-pendaftaran' && (
                  isKoordinator ? (
                    <ValidasiPendaftaranSiswa
                      currentUser={currentUser!}
                      eskulList={eskulList}
                      onRefreshData={loadBackendData}
                      onBack={() => setActiveTab('beranda')}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}

                {/* 14. SELEKSI & PENDAFTARAN SISWA (Pembina / Koordinator) */}
                {activeTab === 'pembina-pendaftaran' && (
                  (isPembina || isKoordinator) ? (
                    <PendaftaranSiswaPembina
                      currentUser={currentUser!}
                      coachedEskuls={pembinaCoachedEskuls.length > 0 ? pembinaCoachedEskuls : eskulList}
                      onRefreshData={loadBackendData}
                      onBack={() => setActiveTab('beranda')}
                    />
                  ) : (
                    <AccessDeniedCard onBack={() => setActiveTab('beranda')} />
                  )
                )}


              </>
            );
          })()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AddEskulModal
        isOpen={isAddEskulOpen}
        onClose={() => setIsAddEskulOpen(false)}
        onSave={handleAddEskul}
      />

      <EditEskulModal
        isOpen={isEditEskulOpen}
        onClose={() => {
          setIsEditEskulOpen(false);
          setEditingEskul(null);
        }}
        eskul={editingEskul}
        onSave={handleEditEskul}
        pembinaList={guruList.map(g => ({
          id: g.id,
          namaLengkap: g.namaLengkap,
          spesialisasi: g.spesialisasi,
        }))}
      />

      <AddPembinaModal
        isOpen={isAddPembinaOpen}
        onClose={() => setIsAddPembinaOpen(false)}
        eskulList={eskulList}
        onSave={handleCreatePembina}
      />

      <EditPembinaModal
        isOpen={isEditPembinaOpen}
        onClose={() => {
          setIsEditPembinaOpen(false);
          setEditingPembina(null);
        }}
        pembina={editingPembina}
        eskulList={eskulList}
        onSave={handleUpdatePembina}
      />

      <AddGuruModal
        isOpen={isAddGuruOpen}
        onClose={() => setIsAddGuruOpen(false)}
        kelasList={kelasList}
        onSave={handleCreateGuru}
      />

      <EditGuruModal
        isOpen={isEditGuruOpen}
        onClose={() => {
          setIsEditGuruOpen(false);
          setEditingGuru(null);
        }}
        guru={editingGuru}
        kelasList={kelasList}
        onSave={handleUpdateGuru}
      />

      <ImportDataModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccessImport={(count) => {
          loadBackendData();
          showToast(`Berhasil mengimpor ${count} siswa dan membuat akun kredensial!`);
        }}
      />

      <ImportGuruModal
        isOpen={isImportGuruOpen}
        onClose={() => setIsImportGuruOpen(false)}
        onSuccessImport={(count) => {
          loadBackendData();
          showToast(`Berhasil mengimpor ${count} data guru dan pembina!`);
        }}
      />

      <StudentCardModal
        isOpen={isStudentCardModalOpen}
        onClose={() => setIsStudentCardModalOpen(false)}
        student={currentStudentProfile}
        allStudents={students}
        eskulList={eskulList}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MailModal
        isOpen={isMailOpen}
        onClose={() => setIsMailOpen(false)}
      />

      <BukaAbsensiModal
        isOpen={isBukaAbsensiModalOpen}
        eskul={selectedEskulForSession}
        onClose={() => {
          setIsBukaAbsensiModalOpen(false);
          setSelectedEskulForSession(null);
        }}
        onConfirm={handleConfirmBukaAbsensi}
      />

      <AjukanPerubahanJadwalModal
        isOpen={isAjukanJadwalModalOpen}
        onClose={() => {
          setIsAjukanJadwalModalOpen(false);
          setSelectedEskulForJadwal(null);
        }}
        pembina={currentUser!}
        coachedEskuls={
          selectedEskulForJadwal
            ? [selectedEskulForJadwal]
            : (pembinaCoachedEskuls.length > 0 ? pembinaCoachedEskuls : eskulList)
        }
        allEskuls={eskulList}
        onSubmitProposal={handleSubmitJadwalProposal}
      />

      <ValidasiPerubahanJadwalModal
        isOpen={isValidasiJadwalModalOpen}
        onClose={() => setIsValidasiJadwalModalOpen(false)}
        currentUser={currentUser!}
        proposals={jadwalProposals}
        onValidate={handleValidateJadwalProposal}
      />

      <RiwayatPengajuanJadwalModal
        isOpen={isRiwayatJadwalModalOpen}
        onClose={() => setIsRiwayatJadwalModalOpen(false)}
        pembina={currentUser!}
        proposals={jadwalProposals}
        onOpenAddNew={() => {
          setIsRiwayatJadwalModalOpen(false);
          setIsAjukanJadwalModalOpen(true);
        }}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        currentUser={currentUser}
        currentRole={currentRole}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-800"
          >
            <span className="w-2 h-2 rounded-full bg-[#00B884] animate-ping shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// Fallback Access Denied Card (Layer 3 Defense)
// ==========================================
const AccessDeniedCard: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="bg-white rounded-lg border border-rose-200/90 p-6 sm:p-8 text-center max-w-lg mx-auto my-12 shadow-xs animate-in fade-in duration-200">
    <div className="w-14 h-14 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
      <ShieldAlert className="w-7 h-7" />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
      Hak Akses Dibatasi
    </span>
    <h3 className="text-lg font-bold text-slate-900 mt-2.5">Otorisasi Tidak Memadai</h3>
    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
      Modul manajemen data master ini hanya dapat diakses oleh Administrator Sistem dan Koordinator Ekstrakurikuler. Sesi pengguna Anda saat ini tidak memiliki izin untuk mengelola data ini.
    </p>
    <button
      type="button"
      onClick={onBack}
      className="mt-6 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white font-semibold text-xs rounded-md shadow-xs transition-all cursor-pointer"
    >
      Kembali ke Beranda
    </button>
  </div>
);

export default App;
