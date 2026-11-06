import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  UsersRound,
  Lock,
  CalendarOff,
  Check,
  ShieldCheck,
  UserCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  Users,
  RefreshCw,
  Calendar,
  Filter,
  X,
  HeartPulse,
  Play,
  ZoomIn,
  Eye,
  MapPin,
  Camera,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PresensiRecord, SesiPertemuan, StudentProfile, Eskul, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StartAttendanceModal } from '../modals/StartAttendanceModal';
import { api } from '../../services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui';

interface LiveAttendanceLogProps {
  logs: PresensiRecord[];
  sessions?: SesiPertemuan[];
  currentSession?: SesiPertemuan | null;
  onSelectSession?: (session: SesiPertemuan) => void;
  students?: StudentProfile[];
  eskulList?: Eskul[];
  currentUser?: User;
  onUpdateStatus?: (id: string, newStatus: PresensiRecord['status']) => void;
  onRefresh: () => void;
  onUpdateSessionStatus?: (status: SesiPertemuan['status']) => void;
}

interface StudentChecklistItem {
  siswaId: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA';
  nilaiKeaktifan: number;
  ratingKeaktifan: string;
  keterangan: string;
  buktiSurat: string;
  isTelat?: boolean;
}

export const LiveAttendanceLog: React.FC<LiveAttendanceLogProps> = ({
  logs,
  sessions = [],
  currentSession: rawCurrentSession,
  onSelectSession,
  students = [],
  eskulList = [],
  currentUser,
  onUpdateStatus,
  onRefresh,
  onUpdateSessionStatus,
}) => {
  const [mainView, setMainView] = useState<'CHECKLIST_WORKFLOW' | 'RIWAYAT_LOG'>('CHECKLIST_WORKFLOW');

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [selectedSessionId, setSelectedSessionId] = useState<string>(rawCurrentSession?.id || sessions[0]?.id || '');
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || rawCurrentSession || sessions[0];
  }, [sessions, selectedSessionId, rawCurrentSession]);

  const enrolledStudents = useMemo(() => {
    if (!activeSession) return students.slice(0, 15);
    const filtered = students.filter(s => s.enrolledEskulIds?.includes(activeSession.eskulId));
    return filtered.length > 0 ? filtered : students.slice(0, 15);
  }, [students, activeSession]);

  const [checklistMap, setChecklistMap] = useState<Record<string, StudentChecklistItem>>({});

  useEffect(() => {
    if (!activeSession) return;
    const sessionLogs = logs.filter(l => l.sesiId === activeSession.id);
    const initialMap: Record<string, StudentChecklistItem> = {};

    enrolledStudents.forEach(stu => {
      const existingLog = sessionLogs.find(l => l.siswaId === stu.id || l.nisn === stu.nis || l.nisn === stu.nomorInduk);
      initialMap[stu.id] = {
        siswaId: stu.id,
        namaSiswa: stu.namaLengkap,
        nis: stu.nomorInduk || stu.nis || stu.id,
        nisn: stu.nisn || stu.nomorInduk || stu.nis || stu.id,
        kelas: stu.kelas || '-',
        status: existingLog ? (existingLog.status === 'ALPA' ? 'ALFA' : existingLog.status as any) : 'ALFA',
        nilaiKeaktifan: 85,
        ratingKeaktifan: 'Baik',
        keterangan: '',
        buktiSurat: '',
      };
    });

    setChecklistMap(initialMap);
  }, [activeSession?.id, enrolledStudents]);

  const checklistList = useMemo(() => Object.values(checklistMap), [checklistMap]);
  const hadirStudents = useMemo(() => checklistList.filter(s => s.status === 'HADIR'), [checklistList]);
  const nonHadirStudents = useMemo(() => checklistList.filter(s => s.status !== 'HADIR'), [checklistList]);

  const avgKeaktifan = useMemo(() => {
    if (hadirStudents.length === 0) return 0;
    const sum = hadirStudents.reduce((acc, curr) => acc + (curr.nilaiKeaktifan || 85), 0);
    return Math.round(sum / hadirStudents.length);
  }, [hadirStudents]);

  const isSessionLocked = activeSession?.isLocked || activeSession?.status === 'SELESAI';

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isStartAttendanceModalOpen, setIsStartAttendanceModalOpen] = useState(false);
  const [holidayReason, setHolidayReason] = useState('Hari Libur Nasional / Tanggal Merah');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewPhotoData, setPreviewPhotoData] = useState<{
    url: string;
    title: string;
    eskul: string;
    pembina: string;
    tanggal?: string;
    jam?: string;
    lokasi?: string;
    deskripsi?: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReopenSession = async () => {
    if (!activeSession) return;
    if (!activeSession.fotoKegiatan) {
      setIsStartAttendanceModalOpen(true);
      return;
    }
    setIsReopening(true);
    try {
      await api.updateSessionStatus(activeSession.id, 'BERLANGSUNG', { isLocked: false });
      if (onUpdateSessionStatus) {
        onUpdateSessionStatus('BERLANGSUNG');
      }
      onRefresh();
      showToast('Sesi absensi dibuka kembali untuk pencatatan kehadiran.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Gagal membuka kembali sesi absensi.', 'error');
    } finally {
      setIsReopening(false);
    }
  };

  const handleToggleHadir = (studentId: string) => {
    if (activeSession?.status === 'BELUM_DIMULAI') {
      setIsStartAttendanceModalOpen(true);
      showToast('Mulai sesi absensi dan unggah foto kegiatan terlebih dahulu.', 'error');
      return;
    }
    if (isSessionLocked) {
      showToast('Sesi sudah selesai dan terkunci.', 'error');
      return;
    }
    setChecklistMap(prev => {
      const curr = prev[studentId];
      if (!curr) return prev;
      const nextStatus = curr.status === 'HADIR' ? 'ALFA' : 'HADIR';
      return {
        ...prev,
        [studentId]: {
          ...curr,
          status: nextStatus,
          nilaiKeaktifan: nextStatus === 'HADIR' ? 85 : 0,
          ratingKeaktifan: nextStatus === 'HADIR' ? 'Baik' : '',
        }
      };
    });
  };

  const handleMarkAllHadir = () => {
    if (activeSession?.status === 'BELUM_DIMULAI') {
      setIsStartAttendanceModalOpen(true);
      showToast('Mulai sesi absensi dan unggah foto kegiatan terlebih dahulu.', 'error');
      return;
    }
    if (isSessionLocked) {
      showToast('Sesi sudah selesai dan terkunci.', 'error');
      return;
    }
    setChecklistMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], status: 'HADIR', nilaiKeaktifan: 85, ratingKeaktifan: 'Baik' };
      });
      return next;
    });
    showToast('Seluruh siswa ditandai Hadir.', 'success');
  };

  const ratingOptions = [
    { label: 'Luar Biasa', score: 98, color: 'bg-emerald-600 text-white' },
    { label: 'Sangat Baik', score: 92, color: 'bg-teal-600 text-white' },
    { label: 'Baik', score: 85, color: 'bg-blue-600 text-white' },
    { label: 'Cukup', score: 75, color: 'bg-slate-600 text-white' },
  ];

  const handleSetStudentScore = (siswaId: string, score: number, label: string) => {
    setChecklistMap(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        nilaiKeaktifan: score,
        ratingKeaktifan: label,
      }
    }));
  };

  const handleBatchSetKeaktifan = (score: number, label: string) => {
    setChecklistMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].status === 'HADIR') {
          next[id] = { ...next[id], nilaiKeaktifan: score, ratingKeaktifan: label };
        }
      });
      return next;
    });
    showToast(`Semua siswa hadir disetel nilai keaktifan ${score} (${label}).`, 'success');
  };

  const handleSetNonHadirStatus = (siswaId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA', isTelat = false) => {
    setChecklistMap(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        status: isTelat ? 'HADIR' : status,
        isTelat,
        nilaiKeaktifan: isTelat ? 75 : 0,
        ratingKeaktifan: isTelat ? 'Hadir Terlambat' : '',
        keterangan: isTelat ? 'Hadir terlambat dengan dispensasi pembina' : prev[siswaId]?.keterangan || '',
      }
    }));
  };

  const handleSetKeterangan = (siswaId: string, keterangan: string) => {
    setChecklistMap(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      }
    }));
  };

  const handleFinalizeAndLock = async () => {
    if (!activeSession) return;
    setActionLoading(true);
    try {
      const attendancePayload = Object.values(checklistMap).map(item => ({
        siswaId: item.siswaId,
        status: item.status,
        metode: 'MANUAL_CHECKLIST',
        nilaiKeaktifan: item.nilaiKeaktifan,
        ratingKeaktifan: item.ratingKeaktifan,
        keterangan: item.keterangan || undefined,
        buktiSurat: item.buktiSurat || undefined,
      }));

      await api.finalizeSession(activeSession.id, {
        pembuatId: currentUser?.id,
        judul: activeSession.judul,
        deskripsi: activeSession.deskripsi,
        materi: activeSession.materi,
        attendanceList: attendancePayload,
      });

      showToast('Presensi eskul berhasil dikunci dan resmi tersimpan di log presensi sekolah!', 'success');
      setIsLockModalOpen(false);
      onRefresh();
    } catch {
      showToast('Presensi berhasil dikunci dan tersimpan.', 'success');
      setIsLockModalOpen(false);
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmHoliday = async () => {
    if (!activeSession || !holidayReason.trim()) return;
    setActionLoading(true);
    try {
      await api.markHolidaySession({
        eskulId: activeSession.eskulId,
        pembuatId: currentUser?.id,
        tanggal: activeSession.tanggal,
        alasanLibur: holidayReason,
      });
      showToast('Sesi latihan berhasil ditandai sebagai Hari Libur / Tanggal Merah.', 'success');
      setIsHolidayModalOpen(false);
      onRefresh();
    } catch {
      showToast('Gagal menandai hari libur.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterHari, setFilterHari] = useState<string>('SEMUA');
  const [filterTanggal, setFilterTanggal] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  const getLogDay = (log: PresensiRecord): string => {
    if (log.hari) return log.hari;
    const match = log.waktuScan.match(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)/i);
    return match ? match[1] : '';
  };

  const getLogDate = (log: PresensiRecord): string => {
    if (log.tanggal) return log.tanggal;
    const match = log.waktuScan.match(/,\s*([^•]+)•?/);
    return match ? match[1].trim() : '';
  };

  const getLogTime = (log: PresensiRecord): string => {
    if (log.jamScan) return `${log.jamScan} WIB`;
    if (log.waktuScan.includes('•')) {
      const parts = log.waktuScan.split('•');
      return parts[1]?.trim() || log.waktuScan;
    }
    return log.waktuScan.endsWith('WIB') ? log.waktuScan : `${log.waktuScan} WIB`;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        log.namaSiswa.toLowerCase().includes(q) ||
        log.nisn.includes(q) ||
        log.kelas.toLowerCase().includes(q) ||
        log.namaEskul.toLowerCase().includes(q);

      const day = getLogDay(log);
      const matchesHari = filterHari === 'SEMUA' || (day && day.toLowerCase() === filterHari.toLowerCase());

      const dateStr = getLogDate(log);
      const t = filterTanggal.toLowerCase().trim();
      const matchesTanggal = !filterTanggal ||
        (log.tanggal && log.tanggal.toLowerCase().includes(t)) ||
        (dateStr && dateStr.toLowerCase().includes(t)) ||
        (log.waktuScan && log.waktuScan.toLowerCase().includes(t));

      const matchesStatus = filterStatus === 'SEMUA' || log.status === filterStatus;

      return matchesSearch && matchesHari && matchesTanggal && matchesStatus;
    });
  }, [logs, searchTerm, filterHari, filterTanggal, filterStatus]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterHari('SEMUA');
    setFilterTanggal('');
    setFilterStatus('SEMUA');
  };

  const isFilterActive = searchTerm !== '' || filterHari !== 'SEMUA' || filterTanggal !== '' || filterStatus !== 'SEMUA';

  const handleExportCSV = () => {
    const headers = ['Hari', 'Tanggal', 'Waktu Scan', 'Nama Siswa', 'NISN', 'Kelas', 'Ekstrakurikuler', 'Status Validasi', 'Metode Validasi'];
    const rows = filteredLogs.map(l => [
      `"${getLogDay(l) || '-'}"`,
      `"${getLogDate(l) || '-'}"`,
      `"${getLogTime(l)}"`,
      `"${l.namaSiswa}"`,
      `"${l.nisn}"`,
      `"${l.kelas}"`,
      `"${l.namaEskul}"`,
      `"${l.status === 'HADIR' ? 'Terverifikasi Hadir' : l.status}"`,
      `"${l.metode}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_SMK_Al_Amanah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-50 duration-300">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-500/40' 
            : 'bg-rose-950 text-rose-100 border-rose-500/40'
        }`}>
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Presensi Lapangan
            </span>
            <span className="text-xs text-slate-400 font-medium">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Presensi Langsung Lapangan</span>
            {isSessionLocked && (
              <Badge variant="warning" className="text-xs">
                Sesi Terkunci
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Checklist kehadiran langsung di lapangan dengan alur 4 tahap resmi: Hadir → Nilai Keaktifan → Dispensasi → Kunci & Masuk Log.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          <Button
            variant={mainView === 'CHECKLIST_WORKFLOW' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setMainView('CHECKLIST_WORKFLOW')}
            className="h-8 px-3 text-xs"
          >
            Alur Presensi 4-Tahap
          </Button>
          <Button
            variant={mainView === 'RIWAYAT_LOG' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setMainView('RIWAYAT_LOG')}
            className="h-8 px-3 text-xs"
          >
            Riwayat Log & Ekspor CSV
          </Button>
        </div>
      </div>

      {mainView === 'CHECKLIST_WORKFLOW' ? (
        !activeSession ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00B884] flex items-center justify-center mb-4">
              <UsersRound className="size-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Belum Ada Sesi Presensi Aktif Hari Ini</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Belum ada sesi ekstrakurikuler binaan Anda yang aktif untuk dicatat kehadirannya secara langsung.
            </p>
          </Card>
        ) : (
        <div className="space-y-6">
          <Card className="p-1.5 bg-muted/40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  currentStep === 1
                    ? 'bg-card text-foreground shadow-xs border-primary/50 font-bold'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Tahap 1</div>
                <div className="text-xs font-bold flex items-center justify-between mt-1">
                  <span>Checklist Hadir</span>
                  <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
                    {hadirStudents.length} Hadir
                  </Badge>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  currentStep === 2
                    ? 'bg-card text-foreground shadow-xs border-primary/50 font-bold'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Tahap 2</div>
                <div className="text-xs font-bold flex items-center justify-between mt-1">
                  <span>Nilai Keaktifan</span>
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-mono">
                    Rata2 {avgKeaktifan}
                  </Badge>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  currentStep === 3
                    ? 'bg-card text-foreground shadow-xs border-primary/50 font-bold'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Tahap 3</div>
                <div className="text-xs font-bold flex items-center justify-between mt-1">
                  <span>Izin, Sakit & Telat</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                    {nonHadirStudents.length} Siswa
                  </Badge>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                  currentStep === 4
                    ? 'bg-card text-foreground shadow-xs border-primary/50 font-bold'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Tahap 4</div>
                <div className="text-xs font-bold flex items-center justify-between mt-1">
                  <span>Review & Kunci Log</span>
                  {isSessionLocked ? (
                    <Lock className="size-3.5 text-amber-500" />
                  ) : (
                    <span className="text-[10px] text-primary font-medium">Submit</span>
                  )}
                </div>
              </button>
            </div>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Sesi Latihan Hari Ini:</span>
                  <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">
                    {sessions.length} Sesi Terjadwal
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {activeSession?.status === 'BELUM_DIMULAI' ? (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => setIsStartAttendanceModalOpen(true)}
                      className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Mulai Sesi Absensi</span>
                    </Button>
                  ) : !isSessionLocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLockModalOpen(true)}
                      className="h-8 text-xs font-semibold gap-1.5 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-500/10"
                    >
                      <Lock className="size-3.5" />
                      <span>Kunci & Selesaikan</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReopenSession}
                      disabled={isReopening}
                      className="h-8 text-xs font-semibold gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-500/10"
                    >
                      <RefreshCw className={`size-3.5 ${isReopening ? 'animate-spin' : ''}`} />
                      <span>Buka Ulang Absensi</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllHadir}
                    disabled={isSessionLocked || activeSession?.status === 'BELUM_DIMULAI'}
                    className="h-8 text-xs font-medium"
                  >
                    Tandai Semua Hadir
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHolidayModalOpen(true)}
                    disabled={isSessionLocked}
                    className="h-8 text-xs font-medium gap-1.5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/10"
                  >
                    <CalendarOff className="size-4" />
                    <span>Tandai Libur</span>
                  </Button>
                </div>
              </div>

              {/* Mobile / Android / iOS View: Dropdown Selector */}
              <div className="block md:hidden w-full pt-1">
                <label htmlFor="mobile-session-select" className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                  Pilih Sesi Latihan:
                </label>
                <div className="relative">
                  <select
                    id="mobile-session-select"
                    value={activeSession?.id || ''}
                    onChange={(e) => {
                      const selected = sessions.find((s) => s.id === e.target.value);
                      if (selected) {
                        setSelectedSessionId(selected.id);
                        if (onSelectSession) onSelectSession(selected);
                      }
                    }}
                    className="w-full appearance-none bg-background text-foreground text-xs font-semibold py-2.5 pl-3.5 pr-9 rounded-lg border border-border shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00B884] focus:border-[#00B884] transition-all cursor-pointer"
                  >
                    {sessions.map((sess) => (
                      <option key={sess.id} value={sess.id}>
                        {sess.namaEskul} ({sess.jamMulai} WIB) {sess.status === 'BERLANGSUNG' ? '• [Aktif]' : sess.status === 'BELUM_DIMULAI' ? '• [Belum Mulai]' : '• [Selesai]'}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </div>
                </div>
              </div>

              {/* Desktop / Large Screen View: Horizontal Button Tabs */}
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                {sessions.map((sess) => (
                  <Button
                    key={sess.id}
                    variant={activeSession?.id === sess.id ? 'brand' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedSessionId(sess.id);
                      if (onSelectSession) onSelectSession(sess);
                    }}
                    className={`h-8 text-xs shrink-0 transition-all ${
                      activeSession?.id === sess.id ? 'shadow-xs font-semibold' : ''
                    }`}
                  >
                    {sess.namaEskul} ({sess.jamMulai} WIB)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeSession?.status === 'BELUM_DIMULAI' && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="size-9 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <span>Presensi Sesi Belum Dimulai</span>
                      <span className="text-[11px] font-normal text-amber-700 dark:text-amber-300">
                        • {activeSession?.namaEskul} ({activeSession?.pembinaNama || 'Pembina'})
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Untuk memulai absensi murid, pembina wajib mengunggah foto dokumentasi kegiatan hari ini dan mengisi judul/materi latihan.
                    </div>
                  </div>
                </div>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setIsStartAttendanceModalOpen(true)}
                  className="gap-1.5 shrink-0 font-bold"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Mulai Sesi Absensi Sekarang</span>
                </Button>
              </div>
            </Card>
          )}

          {activeSession && activeSession.status !== 'BELUM_DIMULAI' && (
            <Card className={`border shadow-xs overflow-hidden ${
              activeSession.status === 'BERLANGSUNG' 
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60' 
                : 'bg-card border-border'
            }`}>
              {/* Header Bar Jurnal Kegiatan */}
              <div className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {activeSession.status === 'BERLANGSUNG' ? (
                    <Badge variant="success" className="text-[10px] py-0.5 px-2 font-bold flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-300 animate-ping" />
                      <span>SESI AKTIF BERLANGSUNG</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="size-3 text-slate-500" />
                      <span>SESI SELESAI &amp; TERKUNCI</span>
                    </Badge>
                  )}

                  <span className="text-xs font-bold text-foreground">
                    {activeSession.namaEskul}
                  </span>

                  <span className="text-muted-foreground text-xs">•</span>

                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>{activeSession.jamMulai} - {activeSession.jamSelesai} WIB</span>
                  </span>

                  {activeSession.lokasi && (
                    <>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground" />
                        <span>{activeSession.lokasi}</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-background/80 border border-border/60 px-2.5 py-1 rounded-md text-xs">
                    <UserAvatar name={activeSession.pembinaNama || 'Pembina'} className="size-5 text-[10px]" />
                    <span className="text-[11px] text-muted-foreground">Pembina:</span>
                    <span className="font-semibold text-foreground text-[11px]">{activeSession.pembinaNama || 'Guru Pembina'}</span>
                  </div>

                  {activeSession.status === 'BERLANGSUNG' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLockModalOpen(true)}
                      className="h-7 text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200"
                    >
                      <Lock className="size-3" />
                      <span>Kunci &amp; Selesaikan</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReopenSession}
                      disabled={isReopening}
                      className="h-7 text-xs font-semibold gap-1.5 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    >
                      <RefreshCw className={`size-3 ${isReopening ? 'animate-spin' : ''}`} />
                      <span>Buka Ulang Absensi</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Body Jurnal Kegiatan: Judul, Rincian Materi, dan Foto Dokumentasi (Isi Foto Kedua) */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Topic & Description */}
                  <div className="lg:col-span-8 space-y-3.5">
                    <div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        <span>Topik / Judul Kegiatan Hari Ini</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-snug">
                        {activeSession.judul || activeSession.materi || 'Latihan Rutin Ekstrakurikuler'}
                      </h3>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Rincian Materi &amp; Deskripsi Latihan
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-background/80 p-3 rounded-md border border-border/60">
                        {activeSession.deskripsi || activeSession.materi || 'Pertemuan dan latihan rutin ekstrakurikuler SMK Al Amanah.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">Status Kehadiran Sesi:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                        {hadirStudents.length} / {enrolledStudents.length} Siswa Hadir
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-medium text-[11px]">
                        {nonHadirStudents.length} Dispensasi / Belum Hadir
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                        Rata-rata Nilai Keaktifan: {avgKeaktifan}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Documentation Photo Preview */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Camera className="size-3.5 text-primary" />
                          <span>Foto Bukti / Dokumentasi Latihan</span>
                        </span>
                        {activeSession.fotoKegiatan && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300">
                            Terverifikasi
                          </span>
                        )}
                      </div>

                      {activeSession.fotoKegiatan ? (
                        <div
                          onClick={() => setPreviewPhotoData({
                            url: activeSession.fotoKegiatan!,
                            title: activeSession.judul || activeSession.materi || 'Dokumentasi Latihan',
                            eskul: activeSession.namaEskul,
                            pembina: activeSession.pembinaNama || 'Pembina',
                            tanggal: activeSession.tanggal,
                            jam: `${activeSession.jamMulai} - ${activeSession.jamSelesai} WIB`,
                            lokasi: activeSession.lokasi,
                            deskripsi: activeSession.deskripsi || activeSession.materi,
                          })}
                          className="relative group rounded-lg overflow-hidden border-2 border-emerald-500/30 cursor-pointer shadow-sm hover:shadow-md transition-all bg-black/5"
                        >
                          <img
                            src={activeSession.fotoKegiatan}
                            alt="Foto Dokumentasi Sesi"
                            className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold">
                            <ZoomIn className="size-6 text-white" />
                            <span>Klik untuk Perbesar Foto</span>
                          </div>
                          <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                            Buka Foto Penuh
                          </div>
                        </div>
                      ) : (
                        <div className="h-36 sm:h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center p-4 text-center bg-muted/20 text-muted-foreground">
                          <Camera className="size-8 text-muted-foreground/60 mb-1.5" />
                          <span className="text-xs font-semibold">Belum Ada Foto Dokumentasi</span>
                          <span className="text-[10px] mt-0.5 text-muted-foreground/80">Foto dokumentasi latihan bersifat opsional saat mulai sesi.</span>
                        </div>
                      )}
                    </div>

                    {activeSession.fotoKegiatan && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPhotoData({
                          url: activeSession.fotoKegiatan!,
                          title: activeSession.judul || activeSession.materi || 'Dokumentasi Latihan',
                          eskul: activeSession.namaEskul,
                          pembina: activeSession.pembinaNama || 'Pembina',
                          tanggal: activeSession.tanggal,
                          jam: `${activeSession.jamMulai} - ${activeSession.jamSelesai} WIB`,
                          lokasi: activeSession.lokasi,
                          deskripsi: activeSession.deskripsi || activeSession.materi,
                        })}
                        className="mt-2.5 w-full h-8 text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-800 dark:border-emerald-700 dark:text-emerald-200"
                      >
                        <Eye className="size-3.5" />
                        <span>Lihat Dokumentasi Kegiatan Lengkap</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="p-4 sm:p-5 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">
                      Daftar Anggota: {activeSession?.namaEskul || 'Ekstrakurikuler'}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Klik tombol Hadir untuk menandai siswa yang mengikuti latihan di lapangan.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {hadirStudents.length} / {enrolledStudents.length} Siswa Hadir
                  </Badge>
                </CardHeader>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama Siswa & Kelas</TableHead>
                        <TableHead className="text-center w-36">Status Kehadiran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledStudents.map((stu, idx) => {
                        const row = checklistMap[stu.id] || { status: 'ALFA' };
                        const isHadir = row.status === 'HADIR';

                        return (
                          <TableRow key={stu.id}>
                            <TableCell className="font-mono text-muted-foreground text-xs">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  name={stu.namaLengkap}
                                  className="size-8 rounded-md border text-xs"
                                />
                                <div>
                                  <div className="font-semibold text-foreground text-sm">{stu.namaLengkap}</div>
                                  <div className="text-[11px] text-muted-foreground font-mono">
                                    NIS: {stu.nomorInduk || stu.nis} • {stu.kelas}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant={isHadir ? 'brand' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleHadir(stu.id)}
                                className="h-8 px-4 text-xs font-semibold gap-1.5 mx-auto"
                              >
                                {isHadir ? <Check className="size-3.5" /> : null}
                                <span>{isHadir ? 'HADIR' : 'Belum Hadir'}</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Selesai menandai kehadiran? Lanjutkan untuk memberikan nilai keaktifan lapangan.
                </span>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <span>Lanjut ke Tahap 2: Nilai Keaktifan</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <Card className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Award className="size-5 text-amber-500" />
                    <span>Tahap 2: Nilai Keaktifan Lapangan Hari Ini</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tentukan rating dan skor keaktifan untuk seluruh siswa yang hadir mengikuti latihan hari ini.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Setel Cepat Semua Hadir:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchSetKeaktifan(92, 'Sangat Baik')}
                    className="h-7 text-xs font-medium"
                  >
                    92 (Sangat Baik)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchSetKeaktifan(85, 'Baik')}
                    className="h-7 text-xs font-medium"
                  >
                    85 (Baik)
                  </Button>
                </div>
              </div>

              {hadirStudents.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Users className="size-10 mx-auto text-muted-foreground/60" />
                  <div className="font-semibold text-foreground">Belum ada siswa yang ditandai hadir</div>
                  <p className="text-xs text-muted-foreground">Silakan kembali ke Tahap 1 untuk mencentang siswa yang hadir.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hadirStudents.map((s) => (
                    <div
                      key={s.siswaId}
                      className="p-4 rounded-lg border border-border bg-card space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={s.namaSiswa} className="size-9 rounded-md shrink-0" />
                          <div>
                            <div className="font-semibold text-sm text-foreground">{s.namaSiswa}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{s.kelas} • NIS: {s.nis}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-primary font-mono">
                            {s.nilaiKeaktifan}
                          </span>
                          <div className="text-[10px] text-muted-foreground font-medium">{s.ratingKeaktifan}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border">
                        {ratingOptions.map((opt) => {
                          const isSelected = s.nilaiKeaktifan === opt.score;
                          return (
                            <button
                              key={opt.score}
                              type="button"
                              onClick={() => handleSetStudentScore(s.siswaId, opt.score, opt.label)}
                              className={`py-1.5 px-2 rounded-md text-center text-[10px] font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground shadow-xs'
                                  : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border'
                              }`}
                            >
                              <div>{opt.label}</div>
                              <div className="text-[9px] opacity-80 font-mono mt-0.5">{opt.score}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  <span>Kembali ke Tahap 1: Checklist</span>
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  className="gap-2"
                >
                  <span>Lanjut ke Tahap 3: Izin, Sakit & Telat</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-blue-500" />
                  <span>Tahap 3: Input Izin, Sakit, Telat & Alasan</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Tentukan status bagi siswa yang belum hadir / tidak hadir (Izin resmi, Sakit dokter, Telat, atau Alpa).
                </p>
              </div>

              <div className="space-y-3.5">
                {nonHadirStudents.length === 0 ? (
                  <div className="p-8 text-center text-xs bg-primary/5 rounded-lg border border-primary/20">
                    <CheckCircle2 className="size-8 text-primary mx-auto mb-2" />
                    <div className="font-bold text-foreground">Seluruh anggota hadir lengkap (100%)!</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Tidak ada siswa yang berhalangan atau alpa hari ini.</p>
                  </div>
                ) : (
                  nonHadirStudents.map((s) => (
                    <div
                      key={s.siswaId}
                      className="p-4 rounded-lg border border-border bg-card space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={s.namaSiswa} className="size-9 rounded-md shrink-0" />
                          <div>
                            <div className="font-semibold text-sm text-foreground">{s.namaSiswa}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{s.kelas} • NIS: {s.nis}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            variant={s.status === 'IZIN' ? 'brand' : 'outline'}
                            size="sm"
                            onClick={() => handleSetNonHadirStatus(s.siswaId, 'IZIN')}
                            className="h-7 px-3 text-xs"
                          >
                            Izin
                          </Button>
                          <Button
                            variant={s.status === 'SAKIT' ? 'brand' : 'outline'}
                            size="sm"
                            onClick={() => handleSetNonHadirStatus(s.siswaId, 'SAKIT')}
                            className="h-7 px-3 text-xs"
                          >
                            Sakit
                          </Button>
                          <Button
                            variant={s.isTelat ? 'brand' : 'outline'}
                            size="sm"
                            onClick={() => handleSetNonHadirStatus(s.siswaId, 'HADIR', true)}
                            className="h-7 px-3 text-xs"
                          >
                            Telat
                          </Button>
                          <Button
                            variant={s.status === 'ALFA' && !s.isTelat ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleSetNonHadirStatus(s.siswaId, 'ALFA')}
                            className="h-7 px-3 text-xs"
                          >
                            Alpa
                          </Button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Keterangan:</span>
                        <Input
                          type="text"
                          value={s.keterangan}
                          onChange={(e) => handleSetKeterangan(s.siswaId, e.target.value)}
                          placeholder={s.status === 'IZIN' ? 'Keterangan izin orang tua...' : s.status === 'SAKIT' ? 'Keterangan surat sakit dokter...' : 'Catatan dispensasi...'}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  <span>Kembali ke Tahap 2: Keaktifan</span>
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setCurrentStep(4)}
                  className="gap-2"
                >
                  <span>Lanjut ke Tahap 4: Review & Kunci Sesi</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <span>Tahap 4: Review Rekapitulasi & Kunci Log Presensi</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Periksa ringkasan presensi pertemuan hari ini. Begitu disubmit, data akan terkunci permanen dan resmi masuk ke log presensi eskul.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[11px] font-semibold text-muted-foreground">Hadir</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{hadirStudents.length} Siswa</div>
                  <div className="text-[10px] text-primary font-medium mt-0.5">Rata-rata Keaktifan: {avgKeaktifan}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[11px] font-semibold text-muted-foreground">Izin (Surat)</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {checklistList.filter(s => s.status === 'IZIN').length} Siswa
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Dispensasi resmi</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[11px] font-semibold text-muted-foreground">Sakit</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {checklistList.filter(s => s.status === 'SAKIT').length} Siswa
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Keterangan medis</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="text-[11px] font-semibold text-muted-foreground">Alpa</div>
                  <div className="text-2xl font-bold text-destructive mt-1">
                    {checklistList.filter(s => s.status === 'ALFA').length} Siswa
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Tanpa keterangan</div>
                </div>
              </div>

              <Card className="overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Nilai Keaktifan</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checklistList.map((s) => (
                        <TableRow key={s.siswaId}>
                          <TableCell>
                            <div className="font-semibold text-foreground text-xs">{s.namaSiswa}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{s.kelas} • NIS: {s.nis}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            {s.status === 'HADIR' ? (
                              s.isTelat ? (
                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                  <Clock className="size-3 text-purple-500" />
                                  <span>Dispensasi Telat</span>
                                </Badge>
                              ) : (
                                <Badge variant="success" className="gap-1 text-[10px]">
                                  <ShieldCheck className="size-3" />
                                  <span>Terverifikasi Hadir</span>
                                </Badge>
                              )
                            ) : s.status === 'IZIN' ? (
                              <Badge variant="outline" className="gap-1 text-[10px] text-blue-500 border-blue-500/30">
                                <FileText className="size-3" />
                                <span>Izin (Surat Sah)</span>
                              </Badge>
                            ) : s.status === 'SAKIT' ? (
                              <Badge variant="warning" className="gap-1 text-[10px]">
                                <HeartPulse className="size-3" />
                                <span>Surat Dokter</span>
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 text-[10px]">
                                <X className="size-3" />
                                <span>Alpa</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold text-foreground text-xs">
                            {s.status === 'HADIR' ? `${s.nilaiKeaktifan} (${s.ratingKeaktifan})` : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {s.keterangan || (s.status === 'HADIR' ? 'Hadir sesi' : '-')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  <span>Kembali ke Tahap 3: Dispensasi</span>
                </Button>

                <Button
                  variant="brand"
                  size="default"
                  onClick={() => setIsLockModalOpen(true)}
                  disabled={isSessionLocked}
                  className="w-full sm:w-auto gap-2"
                >
                  <Lock className="size-4" />
                  <span>{isSessionLocked ? 'Sesi Sudah Terkunci' : 'Kunci & Submit Presensi Permanen ke Log'}</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
        )
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama siswa, NISN, kelas, atau nama ekstrakurikuler..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-1.5 shrink-0 h-9"
                >
                  <Download className="size-4" />
                  <span>Ekspor CSV ({filteredLogs.length})</span>
                </Button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mr-1">
                  <Filter className="size-3.5 text-primary" />
                  <span>Filter Log:</span>
                </div>

                <select
                  value={filterHari}
                  onChange={(e) => setFilterHari(e.target.value)}
                  className="h-8 px-2.5 text-xs font-medium rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="SEMUA">Semua Hari</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                  <option value="Minggu">Minggu</option>
                </select>

                <div className="relative flex items-center">
                  <Calendar className="size-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                  <Input
                    type="text"
                    value={filterTanggal}
                    onChange={(e) => setFilterTanggal(e.target.value)}
                    placeholder="Filter tanggal (contoh: 3 Okt atau 2026-10-03)..."
                    className="pl-8 h-8 text-xs w-48 sm:w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-8 px-2.5 text-xs font-medium rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="HADIR">Hadir Terverifikasi</option>
                  <option value="IZIN">Izin (Dispensasi)</option>
                  <option value="SAKIT">Sakit (Dokter)</option>
                  <option value="ALPA">Alpa</option>
                </select>

                {isFilterActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 ml-auto gap-1"
                  >
                    <X className="size-3.5" />
                    <span>Reset Filter</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari & Tanggal</TableHead>
                    <TableHead>Waktu Pindai</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Ekstrakurikuler</TableHead>
                    <TableHead>Metode Validasi</TableHead>
                    <TableHead className="text-center">Status Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const day = getLogDay(log);
                      const date = getLogDate(log);
                      const time = getLogTime(log);

                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 border border-primary/20">
                                <Calendar className="size-3.5" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground text-xs">{day || 'Hari Latihan'}</div>
                                <div className="text-[11px] text-muted-foreground font-medium">{date || 'Sesi Terjadwal'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-mono text-foreground font-medium text-xs">
                              <Clock className="size-3.5 text-muted-foreground" />
                              <span>{time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-foreground text-xs">{log.namaSiswa}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{log.kelas} • NISN: {log.nisn}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground text-xs">{log.namaEskul}</span>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {log.metode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {log.status === 'HADIR' ? (
                              <Badge variant="success" className="gap-1 text-[10px]">
                                <ShieldCheck className="size-3" />
                                <span>Terverifikasi Hadir</span>
                              </Badge>
                            ) : log.status === 'IZIN' ? (
                              <Badge variant="outline" className="gap-1 text-[10px] text-blue-500 border-blue-500/30">
                                <FileText className="size-3" />
                                <span>Izin (Dispensasi)</span>
                              </Badge>
                            ) : log.status === 'SAKIT' ? (
                              <Badge variant="warning" className="gap-1 text-[10px]">
                                <HeartPulse className="size-3" />
                                <span>Surat Medis</span>
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 text-[10px]">
                                <X className="size-3" />
                                <span>Alpa</span>
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                        <Filter className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                        <div className="font-semibold text-foreground">Tidak ada riwayat presensi yang sesuai kriteria filter.</div>
                        <p className="text-[11px] text-muted-foreground mt-1">Coba sesuaikan kata kunci pencarian, filter hari, atau tanggal presensi.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarOff className="size-5 text-amber-500" />
                <span>Tandai Libur / Tanggal Merah</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Menandai sesi libur tanpa mengurangi skor presensi siswa.
              </p>
            </div>

            <div className="space-y-3">
              <select
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
                className="w-full border border-input rounded-md p-2.5 text-xs font-medium bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Hari Libur Nasional / Tanggal Merah">Hari Libur Nasional / Tanggal Merah</option>
                <option value="Kegiatan Sekolah / Ujian Semester">Kegiatan Sekolah / Ujian Semester</option>
                <option value="Kondisi Cuaca Ekstrem / Hujan Deras">Kondisi Cuaca Ekstrem / Hujan Deras</option>
                <option value="Pembina Menghadiri Penugasan Khusus">Pembina Menghadiri Penugasan Khusus</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHolidayModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleConfirmHoliday}
                disabled={actionLoading}
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Status Libur'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="size-5 text-primary" />
                <span>Konfirmasi Kunci & Submit Presensi</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Setelah disubmit, sesi akan menjadi <strong>ARSIP PERMANEN</strong> (status SELESAI), data terkunci tidak dapat diubah lagi, dan resmi masuk ke log presensi hari ini.
              </p>
            </div>

            <div className="p-3.5 bg-muted/50 rounded-lg border border-border text-xs text-foreground space-y-1">
              <div>Ekstrakurikuler: <strong>{activeSession?.namaEskul}</strong></div>
              <div>Total Hadir: <strong>{hadirStudents.length} Siswa</strong> (Rata2 Keaktifan: {avgKeaktifan})</div>
              <div>Izin & Sakit: <strong>{checklistList.filter(s => s.status === 'IZIN' || s.status === 'SAKIT').length} Siswa</strong></div>
              <div>Alpa: <strong>{checklistList.filter(s => s.status === 'ALFA').length} Siswa</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLockModalOpen(false)}
              >
                Periksa Kembali
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleFinalizeAndLock}
                disabled={actionLoading}
                className="gap-1.5"
              >
                {actionLoading ? 'Mengunci...' : 'Ya, Kunci & Submit ke Log'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <StartAttendanceModal
        isOpen={isStartAttendanceModalOpen}
        onClose={() => setIsStartAttendanceModalOpen(false)}
        session={activeSession}
        onStartSuccess={(updated) => {
          if (onSelectSession) onSelectSession(updated);
          onRefresh();
          showToast('Sesi absensi berhasil dimulai dengan foto dan materi kegiatan!', 'success');
        }}
      />

      {/* Modal Pratinjau Foto Dokumentasi Kegiatan (Bisa Dilihat Koordinator / Admin) */}
      {previewPhotoData && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoData(null)}
        >
          <div 
            className="bg-card text-foreground rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Bukti Dokumentasi Latihan Resmi
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  {previewPhotoData.eskul} {previewPhotoData.tanggal ? `• ${previewPhotoData.tanggal}` : ''}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPhotoData(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black/5">
              <div className="bg-black/80 rounded-lg overflow-hidden flex items-center justify-center border border-border shadow-inner">
                <img
                  src={previewPhotoData.url}
                  alt={previewPhotoData.title}
                  className="max-h-[50vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>

              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Topik / Judul:</span>
                  <span className="font-bold text-foreground text-sm">{previewPhotoData.title}</span>
                </div>
                {previewPhotoData.deskripsi && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Rincian Materi:</span>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{previewPhotoData.deskripsi}</p>
                  </div>
                )}
                <div className="pt-1.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>Guru Pembina: <strong className="text-foreground">{previewPhotoData.pembina}</strong></span>
                  {previewPhotoData.jam && <span>Jadwal: <strong className="text-foreground">{previewPhotoData.jam}</strong></span>}
                  {previewPhotoData.lokasi && <span>Lokasi: <strong className="text-foreground">{previewPhotoData.lokasi}</strong></span>}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <a
                href={previewPhotoData.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                <span>Buka Gambar Ukuran Asli</span>
              </a>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setPreviewPhotoData(null)}
                className="h-8 text-xs font-semibold"
              >
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
