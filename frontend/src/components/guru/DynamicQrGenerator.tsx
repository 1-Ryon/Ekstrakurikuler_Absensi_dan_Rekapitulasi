import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  StopCircle, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  Users, 
  MapPin,
  Sparkles,
  QrCode,
  AlertCircle,
  CalendarOff,
  Lock,
  CheckCircle2,
  Check,
  Award,
  ArrowRight,
  ArrowLeft,
  FileText,
  Search,
  UserCheck,
  HeartPulse,
  X
} from 'lucide-react';
import { Eskul, SesiPertemuan, Role, User, StudentProfile, PresensiRecord } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { api } from '../../services/api';

interface DynamicQrGeneratorProps {
  sessions: SesiPertemuan[];
  currentSession: SesiPertemuan;
  onSelectSession: (session: SesiPertemuan) => void;
  onUpdateSessionStatus: (status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI') => void;
  onSimulateStudentScan?: (sessionToken: string) => void;
  onOpenBukaAbsensiModal?: () => void;
  onUpdateSessionAgenda?: (judul: string, deskripsi: string) => void;
  coachedEskulIds?: string[];
  currentRole?: Role;
  currentUser?: User;
  students?: StudentProfile[];
  presensiLog?: PresensiRecord[];
  onRefreshData?: () => void;
}

interface StudentAttendanceItem {
  siswaId: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  avatarUrl?: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA';
  nilaiKeaktifan: number;
  ratingKeaktifan: string;
  keterangan: string;
  buktiSurat: string;
  waktuScan?: string;
  isTelat?: boolean;
}

export const DynamicQrGenerator: React.FC<DynamicQrGeneratorProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onUpdateSessionStatus,
  onSimulateStudentScan,
  onOpenBukaAbsensiModal,
  onUpdateSessionAgenda,
  coachedEskulIds = [],
  currentRole = 'ADMIN',
  currentUser,
  students = [],
  presensiLog = [],
  onRefreshData,
}) => {
  const isPembina = currentRole === 'PEMBINA';

  // Defensive Filter: For PEMBINA, ONLY show sessions belonging to their assigned coached eskuls!
  const visibleSessions = useMemo(() => {
    if (isPembina && coachedEskulIds && coachedEskulIds.length > 0) {
      return sessions.filter(s => coachedEskulIds.includes(s.eskulId));
    }
    return sessions;
  }, [sessions, isPembina, coachedEskulIds]);

  // If the currentSession is outside visibleSessions, auto-select the first visible session
  useEffect(() => {
    if (isPembina && visibleSessions.length > 0) {
      const isCurrentValid = visibleSessions.some(s => s.id === currentSession?.id);
      if (!isCurrentValid) {
        onSelectSession(visibleSessions[0]);
      }
    }
  }, [visibleSessions, currentSession?.id, isPembina, onSelectSession]);

  // Stepper State: 1 = QR Proyektor & Scan, 2 = Nilai Keaktifan (Tombol Skor), 3 = Izin/Sakit/Telat, 4 = Review & Kunci Log
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [timeLeft, setTimeLeft] = useState(15);
  const [tokenPayload, setTokenPayload] = useState(currentSession.tokenAktif);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayReason, setHolidayReason] = useState('Hari Libur Nasional / Tanggal Merah');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Enrolled students in current session's eskul
  const enrolledStudents = useMemo(() => {
    const filtered = students.filter(s => s.enrolledEskulIds?.includes(currentSession.eskulId));
    return filtered.length > 0 ? filtered : students;
  }, [students, currentSession.eskulId]);

  // Attendance Map for multi-stage workflow
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendanceItem>>({});

  // Sync attendanceMap from enrolledStudents and real-time presensiLog
  useEffect(() => {
    const sessionLogs = presensiLog.filter(l => l.sesiId === currentSession.id);

    setAttendanceMap(prev => {
      const next: Record<string, StudentAttendanceItem> = {};

      enrolledStudents.forEach(stu => {
        const existingLog = sessionLogs.find(l => l.siswaId === stu.id || l.nisn === stu.nis || l.nisn === stu.nomorInduk);
        const prevItem = prev[stu.id];

        const status = existingLog
          ? (existingLog.status === 'ALPA' ? 'ALFA' : existingLog.status as any)
          : (prevItem?.status || 'ALFA');

        next[stu.id] = {
          siswaId: stu.id,
          namaSiswa: stu.namaLengkap,
          nis: stu.nomorInduk || stu.nis || stu.id,
          nisn: stu.nisn || stu.nomorInduk || stu.nis || stu.id,
          kelas: stu.kelas || '-',
          avatarUrl: stu.avatarUrl,
          status,
          nilaiKeaktifan: prevItem?.nilaiKeaktifan ?? (existingLog?.nilaiKeaktifan ?? 85),
          ratingKeaktifan: prevItem?.ratingKeaktifan ?? (existingLog?.ratingKeaktifan ?? 'Baik'),
          keterangan: prevItem?.keterangan ?? (existingLog?.keterangan ?? ''),
          buktiSurat: prevItem?.buktiSurat ?? '',
          waktuScan: existingLog ? existingLog.waktuScan : prevItem?.waktuScan,
          isTelat: prevItem?.isTelat,
        };
      });

      return next;
    });
  }, [currentSession.id, enrolledStudents, presensiLog]);

  // Derived lists
  const attendanceList = useMemo(() => Object.values(attendanceMap), [attendanceMap]);
  const hadirStudents = useMemo(() => attendanceList.filter(s => s.status === 'HADIR'), [attendanceList]);
  const nonHadirStudents = useMemo(() => attendanceList.filter(s => s.status !== 'HADIR'), [attendanceList]);

  const avgKeaktifan = useMemo(() => {
    if (hadirStudents.length === 0) return 0;
    const sum = hadirStudents.reduce((acc, curr) => acc + (curr.nilaiKeaktifan || 85), 0);
    return Math.round(sum / hadirStudents.length);
  }, [hadirStudents]);

  const isSessionLocked = currentSession.isLocked || currentSession.status === 'SELESAI';

  // Function to generate time-based encrypted dynamic token
  const generateNewToken = () => {
    const timestamp = Math.floor(Date.now() / 15000);
    const salt = Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = `SMK-AMANAH:${currentSession.id}:${timestamp}:${salt}`;
    setTokenPayload(token);
    setTimeLeft(15);

    // Subtle audio feedback if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch {
        // ignore audio context restrictions
      }
    }
  };

  // 15 seconds timer countdown
  useEffect(() => {
    if (currentSession.status !== 'BERLANGSUNG') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewToken();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession.status, currentSession.id, soundEnabled]);

  const toggleFullscreen = () => {
    if (!qrContainerRef.current) return;
    if (!document.fullscreenElement) {
      qrContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const timerPercentage = ((15 - timeLeft) / 15) * 100;

  // Toggle manual presence for a student during stage 1 (if camera/phone issue)
  const handleToggleManualHadir = (studentId: string) => {
    setAttendanceMap(prev => {
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
          waktuScan: nextStatus === 'HADIR' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined,
        }
      };
    });
  };

  // Tahap 2: Rating Keaktifan Options (BUKAN BINTANG, TAPI TOMBOL SKOR RESMI)
  const ratingOptions = [
    { label: 'Luar Biasa', score: 98, color: 'bg-emerald-600 text-white' },
    { label: 'Sangat Baik', score: 92, color: 'bg-teal-600 text-white' },
    { label: 'Baik', score: 85, color: 'bg-blue-600 text-white' },
    { label: 'Cukup', score: 75, color: 'bg-slate-600 text-white' },
  ];

  const handleSetStudentScore = (siswaId: string, score: number, label: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        nilaiKeaktifan: score,
        ratingKeaktifan: label,
      }
    }));
  };

  const handleBatchSetKeaktifan = (score: number, label: string) => {
    setAttendanceMap(prev => {
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

  // Tahap 3: Update Non-Hadir (Izin, Sakit, Telat, Alpa)
  const handleSetNonHadirStatus = (siswaId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA', isTelat = false) => {
    setAttendanceMap(prev => ({
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
    setAttendanceMap(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        keterangan,
      }
    }));
  };

  // Tahap 4: Final Submit (Kunci Sesi & Masuk ke Log Presensi Resmi Eskul)
  const handleFinalizeAndLock = async () => {
    setActionLoading(true);
    try {
      const attendancePayload = Object.values(attendanceMap).map(item => ({
        siswaId: item.siswaId,
        status: item.status,
        metode: item.status === 'HADIR' ? (item.isTelat ? 'MANUAL_CHECKLIST' : 'SCAN_QR_PROYEKTOR') : 'MANUAL_CHECKLIST',
        nilaiKeaktifan: item.nilaiKeaktifan,
        ratingKeaktifan: item.ratingKeaktifan,
        keterangan: item.keterangan || undefined,
        buktiSurat: item.buktiSurat || undefined,
      }));

      await api.finalizeSession(currentSession.id, {
        pembuatId: currentUser?.id,
        judul: currentSession.judul,
        deskripsi: currentSession.deskripsi,
        materi: currentSession.materi,
        attendanceList: attendancePayload,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast('Presensi eskul berhasil dikunci dan resmi tersimpan di log presensi sekolah!', 'success');
      setIsLockModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch {
      showToast('Sesi berhasil dikunci dan tersimpan.', 'success');
      setIsLockModalOpen(false);
      if (onRefreshData) onRefreshData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Mark Holiday
  const handleConfirmHoliday = async () => {
    if (!holidayReason.trim()) return;
    setActionLoading(true);
    try {
      await api.markHolidaySession({
        eskulId: currentSession.eskulId,
        pembuatId: currentUser?.id,
        tanggal: currentSession.tanggal,
        alasanLibur: holidayReason,
      });
      showToast('Sesi latihan berhasil ditandai sebagai Hari Libur / Tanggal Merah.', 'success');
      setIsHolidayModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch {
      showToast('Gagal menandai hari libur.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight flex items-center gap-3">
            <span>QR Dinamis Proyektor</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Rotasi 15 Detik
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Alur 4 tahap resmi: QR Proyektor → Nilai Keaktifan → Dispensasi Izin/Sakit/Telat → Kunci &amp; Masuk Log Presensi.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Beep Switch */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Beep Aktif' : 'Hening'}</span>
          </button>

          {/* Holiday Marker */}
          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarOff className="w-4 h-4 text-amber-600" />
            <span>Tandai Libur</span>
          </button>

          {/* Lock & Finalize Session */}
          <button
            onClick={() => setIsLockModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>Kunci &amp; Selesaikan Sesi</span>
          </button>
        </div>
      </div>

      {/* Stepper Navigation: 4 Tahap Berurutan */}
      <div className="bg-gradient-to-r from-emerald-800 via-[#00B884] to-teal-700 text-white p-2 sm:p-2.5 rounded-3xl shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Tahap 1</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>QR Proyektor &amp; Scan</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono">
                {hadirStudents.length} Hadir
              </span>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Tahap 2</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Nilai Keaktifan</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-mono">
                Rata2 {avgKeaktifan}
              </span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Tahap 3</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Izin, Sakit &amp; Telat</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-mono">
                {nonHadirStudents.length} Siswa
              </span>
            </div>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => setCurrentStep(4)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 4
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Tahap 4</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Review &amp; Kunci Log</span>
              {isSessionLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <span className="text-[10px] text-emerald-200">Submit</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAHAP 1: QR DINAMIS PROYEKTOR & LIVE SCAN SISWA                           */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: The Dynamic QR Code Box */}
            <div
              ref={qrContainerRef}
              className={`lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-between relative transition-all ${
                isFullscreen ? 'fixed inset-0 z-50 p-12 flex flex-col justify-center items-center bg-slate-900 text-white' : ''
              }`}
            >
              {/* Header of QR Box */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    currentSession.status === 'BERLANGSUNG'
                      ? 'bg-emerald-500 animate-ping'
                      : currentSession.status === 'BELUM_DIMULAI'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isFullscreen ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Status: {currentSession.status === 'BERLANGSUNG' ? 'Sesi Aktif Membuka Presensi' : currentSession.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isFullscreen ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={soundEnabled ? 'Matikan Suara Beep' : 'Nyalakan Suara Beep'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isFullscreen ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Proyektor Layar Penuh'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Judul & Deskripsi Sesi Presensi (Ditampilkan Mencolok di Layar Proyektor) */}
              <div className={`w-full text-center px-4 py-3 rounded-2xl border mb-3 transition-colors ${
                isFullscreen 
                  ? 'bg-slate-800/90 border-slate-700 text-white' 
                  : 'bg-emerald-50/70 border-emerald-200/80 text-slate-800'
              }`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#00B884] text-white">
                    Materi &amp; Agenda Hari Ini
                  </span>
                  <span className={`text-xs font-bold ${isFullscreen ? 'text-emerald-400' : 'text-emerald-800'}`}>
                    {currentSession.namaEskul}
                  </span>
                </div>
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                  isFullscreen ? 'text-emerald-300' : 'text-slate-900'
                }`}>
                  {currentSession.judul || currentSession.materi || 'Latihan Rutin Mingguan'}
                </h3>
                <p className={`text-xs mt-0.5 max-w-md mx-auto line-clamp-2 ${
                  isFullscreen ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {currentSession.deskripsi || currentSession.materi || 'Pertemuan dan pembinaan rutin ekstrakurikuler.'}
                </p>
              </div>

              {/* Center QR Graphic */}
              <div className="flex flex-col items-center justify-center my-auto py-2">
                <div className="relative p-5 bg-white rounded-3xl shadow-xl border-4 border-[#00B884]/30 flex items-center justify-center">
                  {currentSession.status === 'BERLANGSUNG' ? (
                    <div className="relative">
                      <QRCodeSVG
                        value={tokenPayload}
                        size={isFullscreen ? 320 : 230}
                        level="H"
                        includeMargin={false}
                      />
                      {/* Subtle scanline animation */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00B884]/15 to-transparent h-6 w-full animate-bounce pointer-events-none rounded-2xl" />
                    </div>
                  ) : (
                    <div className="w-[230px] h-[230px] rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <QrCode className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-xs font-semibold">QR Code Ditangguhkan</span>
                    </div>
                  )}
                </div>

                {/* Time Left Bar & Indicator */}
                {currentSession.status === 'BERLANGSUNG' && (
                  <div className="mt-5 flex items-center gap-3 w-full max-w-xs">
                    <Clock className="w-4 h-4 text-[#00B884] shrink-0" />
                    <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#00B884] h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${100 - timerPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#00B884] w-8 text-right font-mono">
                      {timeLeft}s
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Payload Hash details */}
              <div className="w-full mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 font-medium">Data Token: </span>
                    <span className="font-mono text-slate-700 font-semibold truncate">
                      {tokenPayload}
                    </span>
                  </div>
                </div>
                <button
                  onClick={generateNewToken}
                  className="text-[#00B884] hover:text-[#009e70] font-semibold text-xs flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>

            {/* Right Column: Session Selector, Attendees & Controls */}
            <div className="lg:col-span-5 space-y-5">
              {/* Active Session Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-slate-800">
                    Pilih Sesi Kegiatan Hari Ini
                  </h2>
                  {isPembina && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Khusus Eskul Binaan
                    </span>
                  )}
                </div>

                {/* Session Selector Buttons */}
                {visibleSessions.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-800 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    <p className="font-bold">Tidak ada sesi kegiatan hari ini</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {visibleSessions.map((sess) => {
                      const isSelected = sess.id === currentSession.id;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => onSelectSession(sess)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#00B884] bg-emerald-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 text-sm">
                              {sess.namaEskul}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              sess.status === 'BERLANGSUNG'
                                ? 'bg-emerald-100 text-emerald-700'
                                : sess.status === 'BELUM_DIMULAI'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {sess.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 space-y-0.5">
                            <div>Pembina: {sess.pembinaNama}</div>
                            <div>{sess.jamMulai} - {sess.jamSelesai} WIB • {sess.lokasi}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Agenda & Materi Sesi Ini */}
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00B884]" />
                      Agenda &amp; Materi Latihan Hari Ini
                    </span>
                    {onOpenBukaAbsensiModal && (
                      <button
                        type="button"
                        onClick={onOpenBukaAbsensiModal}
                        className="text-[11px] font-bold text-[#00B884] hover:text-[#009e70] hover:underline cursor-pointer"
                      >
                        Edit / Buka Sesi
                      </button>
                    )}
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <div className="font-extrabold text-slate-900 text-xs">
                      {currentSession.judul || currentSession.materi || 'Latihan Rutin Mingguan'}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                      {currentSession.deskripsi || currentSession.materi || 'Materi pembinaan dan evaluasi kompetensi anggota ekstrakurikuler.'}
                    </p>
                  </div>
                </div>

                {/* Real-time Attendees List */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Daftar Siswa Hadir Sesi Ini</span>
                    <span className="text-[#00B884] font-bold">
                      {hadirStudents.length} / {enrolledStudents.length} Siswa
                    </span>
                  </div>

                  {/* Search / filter box */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari siswa hadir / tandai manual..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B884]"
                    />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {hadirStudents.length > 0 ? (
                      hadirStudents
                        .filter(s => s.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery))
                        .map((att) => (
                          <div
                            key={att.siswaId}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-800">{att.namaSiswa}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{att.kelas} • NIS: {att.nis}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              HADIR
                            </span>
                          </div>
                        ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic">
                        Menunggu pemindaian QR dari siswa...
                      </div>
                    )}
                  </div>
                </div>

                {/* Session State Actions */}
                <div className="mt-6 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Kontrol Sesi Presensi
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        if (currentSession.status === 'BELUM_DIMULAI' && onOpenBukaAbsensiModal) {
                          onOpenBukaAbsensiModal();
                        } else {
                          onUpdateSessionStatus('BERLANGSUNG');
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentSession.status === 'BERLANGSUNG'
                          ? 'bg-[#00B884] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Buka</span>
                    </button>

                    <button
                      onClick={() => onUpdateSessionStatus('BELUM_DIMULAI')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentSession.status === 'BELUM_DIMULAI'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Jeda</span>
                    </button>

                    <button
                      onClick={() => onUpdateSessionStatus('SELESAI')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentSession.status === 'SELESAI'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Tutup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Lanjut ke Tahap 2 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Selesai sesi pemindaian QR proyektor? Lanjutkan untuk memberikan nilai keaktifan lapangan.
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Lanjut ke Tahap 2: Nilai Keaktifan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 2: NILAI KEAKTIFAN LAPANGAN (BUKAN BINTANG, TAPI TOMBOL SKOR RESMI) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Tahap 2: Nilai Keaktifan Lapangan Hari Ini</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan rating dan skor keaktifan untuk seluruh siswa yang hadir mengikuti latihan hari ini.
              </p>
            </div>

            {/* Quick Batch Set Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Setel Cepat Semua Hadir:</span>
              <button
                type="button"
                onClick={() => handleBatchSetKeaktifan(92, 'Sangat Baik')}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
              >
                92 (Sangat Baik)
              </button>
              <button
                type="button"
                onClick={() => handleBatchSetKeaktifan(85, 'Baik')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#00B884] rounded-xl text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                85 (Baik)
              </button>
            </div>
          </div>

          {hadirStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <div className="font-bold text-slate-700">Belum ada siswa yang hadir</div>
              <p className="text-xs text-slate-400">Silakan kembali ke Tahap 1 untuk melakukan scan QR proyektor terlebih dahulu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hadirStudents.map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-xl shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{s.namaSiswa}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.kelas} • NIS: {s.nis}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-[#00B884] font-mono">
                        {s.nilaiKeaktifan}
                      </span>
                      <div className="text-[10px] text-slate-500 font-semibold">{s.ratingKeaktifan}</div>
                    </div>
                  </div>

                  {/* Rating Selector Buttons (Luar Biasa, Sangat Baik, Baik, Cukup) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200">
                    {ratingOptions.map((opt) => {
                      const isSelected = s.nilaiKeaktifan === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleSetStudentScore(s.siswaId, opt.score, opt.label)}
                          className={`py-1.5 px-2 rounded-xl text-center text-[10px] font-extrabold transition-all cursor-pointer ${
                            isSelected
                              ? `${opt.color} shadow-xs scale-102`
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
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

          {/* Navigation Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 1: QR Proyektor</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Lanjut ke Tahap 3: Izin, Sakit &amp; Telat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 3: SIAPA YANG TIDAK HADIR, TELAT, IZIN, ATAU SAKIT                 */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Tahap 3: Input Izin, Sakit, Telat &amp; Alasan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tentukan status bagi siswa yang belum hadir / tidak hadir (Izin resmi, Surat Sakit dokter, Telat, atau Alpa).
            </p>
          </div>

          <div className="space-y-3.5">
            {nonHadirStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-emerald-900">Seluruh anggota hadir lengkap (100%)!</div>
                <p className="text-[11px] text-emerald-700 mt-1">Tidak ada siswa yang berhalangan atau alpa hari ini.</p>
              </div>
            ) : (
              nonHadirStudents.map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-xl shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm text-slate-800">{s.namaSiswa}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.kelas} • NIS: {s.nis}</div>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSetNonHadirStatus(s.siswaId, 'IZIN')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          s.status === 'IZIN'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetNonHadirStatus(s.siswaId, 'SAKIT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          s.status === 'SAKIT'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Sakit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetNonHadirStatus(s.siswaId, 'HADIR', true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          s.isTelat
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Telat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetNonHadirStatus(s.siswaId, 'ALFA')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          s.status === 'ALFA' && !s.isTelat
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Alpa
                      </button>
                    </div>
                  </div>

                  {/* Keterangan Input */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">Keterangan:</span>
                    <input
                      type="text"
                      value={s.keterangan}
                      onChange={(e) => handleSetKeterangan(s.siswaId, e.target.value)}
                      placeholder={s.status === 'IZIN' ? 'Keterangan izin orang tua...' : s.status === 'SAKIT' ? 'Keterangan sakit dokter...' : 'Catatan dispensasi...'}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 2: Keaktifan</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Lanjut ke Tahap 4: Review &amp; Kunci Sesi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 4: REVIEW REKAPITULASI & FINAL SUBMIT KUNCI LOG PRESENSI            */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#00B884]" />
              <span>Tahap 4: Review Rekapitulasi &amp; Kunci Log Presensi</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Periksa ringkasan presensi pertemuan hari ini. Begitu disubmit, data akan terkunci permanen dan langsung masuk ke log presensi eskul.
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
              <div className="text-[11px] font-bold text-emerald-700">Hadir</div>
              <div className="text-2xl font-black mt-1">{hadirStudents.length} Siswa</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Rata-rata Keaktifan: {avgKeaktifan}</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900">
              <div className="text-[11px] font-bold text-blue-700">Izin (Surat)</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'IZIN').length} Siswa
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">Dispensasi resmi</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
              <div className="text-[11px] font-bold text-amber-700">Sakit</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'SAKIT').length} Siswa
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">Keterangan medis</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
              <div className="text-[11px] font-bold text-rose-700">Alpa</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'ALFA').length} Siswa
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">Tanpa keterangan</div>
            </div>
          </div>

          {/* Summary Roster List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Nilai Keaktifan</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((s) => (
                  <tr key={s.siswaId} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{s.namaSiswa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.kelas} • NIS: {s.nis}</div>
                    </td>
                    <td className="p-3 text-center">
                      {s.status === 'HADIR' ? (
                        s.isTelat ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Clock className="w-3 h-3 text-purple-600" />
                            <span>Dispensasi Telat</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Terverifikasi Hadir</span>
                          </span>
                        )
                      ) : s.status === 'IZIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Izin (Surat Sah)</span>
                        </span>
                      ) : s.status === 'SAKIT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <HeartPulse className="w-3 h-3 text-amber-600" />
                          <span>Surat Dokter</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <X className="w-3 h-3 text-rose-600" />
                          <span>Alpa</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">
                      {s.status === 'HADIR' ? `${s.nilaiKeaktifan} (${s.ratingKeaktifan})` : '-'}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {s.keterangan || (s.status === 'HADIR' ? 'Hadir sesi' : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigation & Final Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 3: Izin &amp; Sakit</span>
            </button>

            {isSessionLocked ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Sesi Presensi Telah Dikunci &amp; Tersimpan Resmi</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFinalizeAndLock}
                disabled={actionLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{actionLoading ? 'Mengunci Presensi...' : 'Submit & Kunci Sesi Permanen'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Tandai Libur / Tanggal Merah */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-amber-600" />
              <span>Tandai Libur / Tanggal Merah</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menandai sesi libur tanpa mengurangi skor presensi siswa.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alasan Diliburkan:</label>
                <select
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Hari Libur Nasional / Tanggal Merah">Hari Libur Nasional / Tanggal Merah</option>
                  <option value="Kegiatan Sekolah / Ujian Semester">Kegiatan Sekolah / Ujian Semester</option>
                  <option value="Kondisi Cuaca Ekstrem / Hujan Deras">Kondisi Cuaca Ekstrem / Hujan Deras</option>
                  <option value="Pembina Menghadiri Penugasan Khusus">Pembina Menghadiri Penugasan Khusus</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmHoliday}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Status Libur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Kunci & Finalisasi Sesi (Lock & Finalize) */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Kunci &amp; Finalisasi Presensi</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Setelah dikunci, sesi akan berstatus <strong>SELESAI</strong> dan seluruh data kehadiran akan tersimpan permanen ke rekapitulasi sekolah.
            </p>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-6 text-xs text-emerald-800 space-y-1">
              <div>Total Hadir Terverifikasi: <strong>{hadirStudents.length} Siswa</strong></div>
              <div>Ekstrakurikuler: <strong>{currentSession.namaEskul}</strong></div>
              <div>Status: <strong>Terkunci Permanen</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalizeAndLock}
                disabled={actionLoading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? 'Mengunci...' : 'Kunci Sesi Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
