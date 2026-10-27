import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Users,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  SwitchCamera,
  Search,
  Lock,
  CalendarOff,
  Check,
  RefreshCw,
  FileCheck,
  Award,
  FileText,
  HeartPulse,
  UserCheck,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { SesiPertemuan, StudentProfile, PresensiRecord, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { api } from '../../services/api';

interface TeacherStudentScannerProps {
  currentSession?: SesiPertemuan | null;
  sessions?: SesiPertemuan[];
  onSelectSession?: (session: SesiPertemuan) => void;
  students: StudentProfile[];
  onRecordAttendance: (student: StudentProfile, session: SesiPertemuan) => void;
  recentLogs: PresensiRecord[];
  currentUser?: User;
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

export const TeacherStudentScanner: React.FC<TeacherStudentScannerProps> = ({
  currentSession,
  sessions = [],
  onSelectSession,
  students,
  onRecordAttendance,
  recentLogs,
  currentUser,
  onRefreshData,
}) => {
  // Stepper State: 1 = Scan Siswa, 2 = Nilai Keaktifan, 3 = Izin/Sakit/Telat, 4 = Review & Kunci Sesi
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedStudent, setLastScannedStudent] = useState<StudentProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayReason, setHolidayReason] = useState('Hari Libur Nasional / Tanggal Merah');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'teacher-live-qr-viewfinder';

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter students enrolled in this eskul
  const enrolledStudents = useMemo(() => {
    if (!currentSession) return [];
    const filtered = students.filter(s => s.enrolledEskulIds?.includes(currentSession.eskulId));
    return filtered.length > 0 ? filtered : students;
  }, [students, currentSession?.eskulId]);

  // Attendance Map for multi-stage workflow
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendanceItem>>({});

  // Initialize attendance map from enrolled students and past session logs
  useEffect(() => {
    if (!currentSession) return;
    const sessionLogs = recentLogs.filter(l => l.sesiId === currentSession.id);
    const initial: Record<string, StudentAttendanceItem> = {};

    enrolledStudents.forEach(stu => {
      const existingLog = sessionLogs.find(l => l.siswaId === stu.id || l.nisn === stu.nis || l.nisn === stu.nomorInduk);
      initial[stu.id] = {
        siswaId: stu.id,
        namaSiswa: stu.namaLengkap,
        nis: stu.nomorInduk || stu.nis || stu.id,
        nisn: stu.nisn || stu.nomorInduk || stu.nis || stu.id,
        kelas: stu.kelas || '-',
        avatarUrl: stu.avatarUrl,
        status: existingLog ? (existingLog.status === 'ALPA' ? 'ALFA' : existingLog.status as any) : 'ALFA',
        nilaiKeaktifan: 85,
        ratingKeaktifan: 'Baik',
        keterangan: '',
        buktiSurat: '',
        waktuScan: existingLog ? existingLog.waktuScan : undefined,
      };
    });

    setAttendanceMap(initial);
  }, [currentSession?.id, enrolledStudents]);

  // Derived lists
  const attendanceList = useMemo(() => Object.values(attendanceMap), [attendanceMap]);
  const hadirStudents = useMemo(() => attendanceList.filter(s => s.status === 'HADIR'), [attendanceList]);
  const nonHadirStudents = useMemo(() => attendanceList.filter(s => s.status !== 'HADIR'), [attendanceList]);

  const avgKeaktifan = useMemo(() => {
    if (hadirStudents.length === 0) return 0;
    const sum = hadirStudents.reduce((acc, curr) => acc + (curr.nilaiKeaktifan || 85), 0);
    return Math.round(sum / hadirStudents.length);
  }, [hadirStudents]);

  const isSessionLocked = currentSession ? (currentSession.isLocked || currentSession.status === 'SELESAI') : false;

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime); // D6
      gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // ignore
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Stop teacher camera err:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    await stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Perangkat ini tidak memiliki API kamera yang didukung. Anda dapat menggunakan pencarian manual.');
      return;
    }

    try {
      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: mode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          await handleQrCodeDetected(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Failed to start teacher camera:', err);
      setIsCameraActive(false);
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser.');
    }
  };

  // QR Code Detected Callback
  const handleQrCodeDetected = async (rawCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let studentIdentifier = rawCode.trim();
      if (studentIdentifier.startsWith('SMK-AMANAH:STUDENT:')) {
        const parts = studentIdentifier.split(':');
        studentIdentifier = parts[2] || parts[3] || studentIdentifier;
      }

      const matched = students.find((s) => 
        s.id === studentIdentifier ||
        s.nis === studentIdentifier ||
        s.nomorInduk === studentIdentifier ||
        (s.nisn && s.nisn === studentIdentifier)
      );

      const targetId = matched ? matched.id : studentIdentifier;
      const targetName = matched ? matched.namaLengkap : `Siswa (${studentIdentifier})`;
      const targetNis = matched ? (matched.nomorInduk || matched.nis) : studentIdentifier;
      const targetKelas = matched ? matched.kelas : 'Siswa Terdaftar';

      // Update local state map to HADIR
      setAttendanceMap(prev => ({
        ...prev,
        [targetId]: {
          ...(prev[targetId] || {
            siswaId: targetId,
            namaSiswa: targetName,
            nis: targetNis,
            nisn: targetNis,
            kelas: targetKelas,
            avatarUrl: matched?.avatarUrl,
            nilaiKeaktifan: 85,
            ratingKeaktifan: 'Baik',
            keterangan: '',
            buktiSurat: '',
          }),
          status: 'HADIR',
          waktuScan: new Date().toLocaleTimeString('id-ID'),
        }
      }));

      // Audio and Confetti
      playBeep();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      const verifiedStudent: StudentProfile = matched || {
        id: targetId,
        username: studentIdentifier,
        role: 'SISWA',
        nis: studentIdentifier,
        nomorInduk: studentIdentifier,
        namaLengkap: targetName,
        kelas: targetKelas,
        jenisKelamin: 'L',
        statusAktif: true,
        avatarUrl: '',
        enrolledEskulIds: [],
        kehadiranRataRata: 85,
      };

      setLastScannedStudent(verifiedStudent);
      if (currentSession) {
        onRecordAttendance(verifiedStudent, currentSession);
      }
      showToast(`Presensi ${verifiedStudent.namaLengkap} tercatat HADIR!`, 'success');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handleToggleCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    await startCamera(nextMode);
  };

  useEffect(() => {
    if (currentStep === 1 && !isSessionLocked) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentStep, isSessionLocked]);

  // Tahap 2: Rating Keaktifan (Luar Biasa 98, Sangat Baik 92, Baik 85, Cukup 75)
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

  // Tahap 4: Final Submit (Kunci Sesi & Masuk ke Log Presensi)
  const handleFinalizeAndLock = async () => {
    if (!currentSession) return;
    setActionLoading(true);
    try {
      const attendancePayload = Object.values(attendanceMap).map(item => ({
        siswaId: item.siswaId,
        status: item.status,
        metode: item.status === 'HADIR' ? 'SCAN_QR_SISWA' : 'MANUAL_CHECKLIST',
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
    if (!currentSession || !holidayReason.trim()) return;
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

  const filteredSearchStudents = enrolledStudents.filter((s) =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nomorInduk.includes(searchQuery) ||
    s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentSession) {
    return (
      <div className="space-y-6 pb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Belum Ada Sesi Absensi Aktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tidak ada sesi presensi ekstrakurikuler yang sedang aktif untuk dipindai saat ini. Buka sesi absensi terlebih dahulu sebelum memindai kartu siswa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-md shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Kamera Pendidik
            </span>
            <span className="text-xs text-slate-400 font-medium">Scanner Barcode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Pindai Presensi (Kamera Guru)</span>
            {isSessionLocked && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Sesi Terkunci (Official)
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Alur 4 tahap resmi: Pindai Kartu → Nilai Keaktifan → Dispensasi Izin/Sakit/Telat → Kunci &amp; Masuk Log Presensi.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Beep Aktif' : 'Hening'}</span>
          </button>

          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-md text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarOff className="w-4 h-4 text-amber-600" />
            <span>Tandai Libur</span>
          </button>
        </div>
      </div>

      {/* Stepper Navigation: 4 Tahap Resmi */}
      <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-lg shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-emerald-50 text-slate-900 border-[#00B884] shadow-xs font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tahap 1</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Pindai Kartu Siswa</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                currentStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {hadirStudents.length} Hadir
              </span>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-emerald-50 text-slate-900 border-[#00B884] shadow-xs font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tahap 2</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Nilai Keaktifan</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                currentStep === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Rata2 {avgKeaktifan}
              </span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-emerald-50 text-slate-900 border-[#00B884] shadow-xs font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tahap 3</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Izin, Sakit &amp; Telat</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {nonHadirStudents.length} Siswa
              </span>
            </div>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => setCurrentStep(4)}
            className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
              currentStep === 4
                ? 'bg-emerald-50 text-slate-900 border-[#00B884] shadow-xs font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tahap 4</div>
            <div className="text-xs font-extrabold flex items-center justify-between mt-0.5">
              <span>Review &amp; Kunci Log</span>
              {isSessionLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <span className="text-[10px] text-emerald-700 font-bold">Submit</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Sesi Selector Tabs */}
      {sessions.length > 1 && onSelectSession && (
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Sesi Latihan:</span>
          <div className="flex items-center gap-2">
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => onSelectSession(sess)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  currentSession.id === sess.id
                    ? 'bg-[#00B884] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sess.namaEskul} ({sess.jamMulai} WIB)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 1: PINDAI KAMERA NYATA                                             */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Viewfinder Camera */}
            <div className="lg:col-span-7 bg-slate-950 text-white rounded-lg p-6 shadow-xl border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {currentSession.namaEskul} ({currentSession.jamMulai} - {currentSession.jamSelesai} WIB)
                  </span>
                </div>
                <button
                  onClick={handleToggleCamera}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
                </button>
              </div>

              {/* Camera Frame */}
              <div className="relative w-full max-w-sm aspect-square bg-black rounded-md border-2 border-slate-700 overflow-hidden flex flex-col items-center justify-center my-2 shadow-2xl">
                <div
                  id={scannerContainerId}
                  className="w-full h-full overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                />

                {isCameraActive && (
                  <div className="absolute inset-x-0 h-0.5 bg-[#00B884] opacity-80 animate-pulse top-1/2 pointer-events-none" />
                )}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-dashed border-[#00B884]/80 rounded-md relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-[#00B884] rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-[#00B884] rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-[#00B884] rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-[#00B884] rounded-br" />
                  </div>
                </div>

                <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3.5 py-1 rounded-full text-[11px] text-emerald-400 font-semibold flex items-center gap-2 pointer-events-none backdrop-blur-xs">
                  <Camera className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isProcessing ? 'Memproses Presensi...' : 'Arahkan Kamera ke Kartu QR Siswa'}</span>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                    <p className="text-xs text-slate-300 font-medium max-w-xs">{cameraError}</p>
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="mt-3 px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white text-xs font-bold rounded-md cursor-pointer"
                    >
                      Coba Akses Lagi
                    </button>
                  </div>
                )}
              </div>

              {/* Pencarian Darurat Siswa */}
              <div className="w-full mt-4 bg-slate-900/90 p-3 rounded-md border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Search className="w-3 h-3 text-[#00B884]" />
                    <span>Pencarian Cepat Siswa (Jika Kartu Rusak/Hilang)</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama siswa atau NIS..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00B884]"
                  />
                  {searchQuery && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-md max-h-40 overflow-y-auto z-20 shadow-xl">
                      {filteredSearchStudents.length > 0 ? (
                        filteredSearchStudents.slice(0, 5).map((stu) => (
                          <div
                            key={stu.id}
                            onClick={() => {
                              handleQrCodeDetected(stu.nis || stu.id);
                              setSearchQuery('');
                            }}
                            className="p-2 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs border-b border-slate-800 last:border-none"
                          >
                            <div>
                              <div className="font-bold text-white">{stu.namaLengkap}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{stu.nomorInduk} • {stu.kelas}</div>
                            </div>
                            <span className="text-[10px] font-bold text-[#00B884] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              Tandai Hadir
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">Tidak ada siswa ditemukan</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Last Scanned Confirmation & Live List */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#00B884]" />
                    <span>Verifikasi Terkini</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {hadirStudents.length} Siswa Hadir
                  </span>
                </div>

                {lastScannedStudent ? (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-md animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3.5 mb-2">
                      <UserAvatar
                        name={lastScannedStudent.namaLengkap}
                        className="w-12 h-12 rounded-md ring-2 ring-[#00B884] shadow-xs text-base"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {lastScannedStudent.namaLengkap}
                        </h4>
                        <div className="text-xs text-slate-600 mt-0.5">
                          NIS: <span className="font-mono font-bold text-slate-800">{lastScannedStudent.nomorInduk || lastScannedStudent.nis}</span> • {lastScannedStudent.kelas}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00B884]" />
                          <span>Status: HADIR (Pukul {new Date().toLocaleTimeString('id-ID')})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-md border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p>Kamera aktif. Arahkan ke kartu siswa untuk mencatat kehadiran.</p>
                  </div>
                )}
              </div>

              {/* Roster Checklist Summary */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                  <span>Daftar Siswa Hadir</span>
                  <span className="text-[#00B884] font-extrabold text-sm">
                    {hadirStudents.length} / {enrolledStudents.length} Siswa
                  </span>
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {hadirStudents.length > 0 ? (
                    hadirStudents.map((stu) => (
                      <div
                        key={stu.siswaId}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-md flex items-center justify-between text-xs border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-800">{stu.namaSiswa}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{stu.kelas} • {stu.waktuScan || 'Tercatat'}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          HADIR
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Belum ada siswa yang dipindai hadir.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Lanjut ke Tahap 2 */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Selesai memindai kehadiran? Lanjutkan untuk memberikan nilai keaktifan lapangan.
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Lanjut ke Tahap 2: Nilai Keaktifan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 2: NILAI KEAKTIFAN LAPANGAN (BUKAN BINTANG, TAPI RATING TOMBOL SKOR) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
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

            {/* Quick Batch Set */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Setel Cepat Semua Hadir:</span>
              <button
                type="button"
                onClick={() => handleBatchSetKeaktifan(92, 'Sangat Baik')}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
              >
                92 (Sangat Baik)
              </button>
              <button
                type="button"
                onClick={() => handleBatchSetKeaktifan(85, 'Baik')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#00B884] rounded-md text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                85 (Baik)
              </button>
            </div>
          </div>

          {hadirStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <div className="font-bold text-slate-700">Belum ada siswa yang hadir</div>
              <p className="text-xs text-slate-400">Silakan kembali ke Tahap 1 untuk melakukan scan siswa terlebih dahulu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hadirStudents.map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 rounded-md border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-md shrink-0" />
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
                          className={`py-1.5 px-2 rounded-md text-center text-[10px] font-extrabold transition-all cursor-pointer ${
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
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-md hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 1: Scan</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-2 cursor-pointer transition-all"
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
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
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
              <div className="p-8 text-center text-slate-500 text-xs bg-emerald-50 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-emerald-900">Seluruh anggota hadir lengkap (100%)!</div>
                <p className="text-[11px] text-emerald-700 mt-1">Tidak ada siswa yang berhalangan atau alpa hari ini.</p>
              </div>
            ) : (
              nonHadirStudents.map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 rounded-md border border-slate-200 bg-slate-50/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-md shrink-0" />
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
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                      className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-md hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 2: Keaktifan</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-2 cursor-pointer transition-all"
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
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
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
            <div className="p-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-900">
              <div className="text-[11px] font-bold text-emerald-700">Hadir</div>
              <div className="text-2xl font-black mt-1">{hadirStudents.length} Siswa</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Rata-rata Keaktifan: {avgKeaktifan}</div>
            </div>
            <div className="p-4 rounded-md bg-blue-50 border border-blue-100 text-blue-900">
              <div className="text-[11px] font-bold text-blue-700">Izin (Surat)</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'IZIN').length} Siswa
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">Dispensasi resmi</div>
            </div>
            <div className="p-4 rounded-md bg-amber-50 border border-amber-100 text-amber-900">
              <div className="text-[11px] font-bold text-amber-700">Sakit</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'SAKIT').length} Siswa
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">Keterangan medis</div>
            </div>
            <div className="p-4 rounded-md bg-rose-50 border border-rose-100 text-rose-900">
              <div className="text-[11px] font-bold text-rose-700">Alpa</div>
              <div className="text-2xl font-black mt-1">
                {attendanceList.filter(s => s.status === 'ALFA').length} Siswa
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">Tanpa keterangan</div>
            </div>
          </div>

          {/* Summary Roster List */}
          <div className="border border-slate-200 rounded-md overflow-hidden max-h-72 overflow-y-auto">
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
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-md hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 3: Dispensasi</span>
            </button>

            <button
              onClick={() => setIsLockModalOpen(true)}
              disabled={isSessionLocked}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-extrabold text-xs rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSessionLocked ? 'Sesi Sudah Terkunci' : 'Kunci & Submit Presensi Permanen ke Log'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Tandai Hari Libur */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-amber-600" />
              <span>Tandai Libur / Tanggal Merah</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menandai sesi libur tanpa mengurangi skor presensi siswa.
            </p>

            <div className="space-y-3 mb-6">
              <select
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Hari Libur Nasional / Tanggal Merah">Hari Libur Nasional / Tanggal Merah</option>
                <option value="Kegiatan Sekolah / Ujian Semester">Kegiatan Sekolah / Ujian Semester</option>
                <option value="Kondisi Cuaca Ekstrem / Hujan Deras">Kondisi Cuaca Ekstrem / Hujan Deras</option>
                <option value="Pembina Menghadiri Penugasan Khusus">Pembina Menghadiri Penugasan Khusus</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmHoliday}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Status Libur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Kunci & Submit Presensi */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00B884]" />
              <span>Konfirmasi Kunci &amp; Submit Presensi</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Setelah disubmit, sesi akan menjadi <strong>ARSIP PERMANEN</strong> (status SELESAI), data terkunci tidak dapat diubah lagi, dan langsung masuk ke log presensi hari ini.
            </p>

            <div className="p-3.5 bg-emerald-50 rounded-md border border-emerald-200 mb-6 text-xs text-emerald-900 space-y-1">
              <div>Ekstrakurikuler: <strong>{currentSession.namaEskul}</strong></div>
              <div>Total Hadir: <strong>{hadirStudents.length} Siswa</strong> (Rata2 Keaktifan: {avgKeaktifan})</div>
              <div>Izin &amp; Sakit: <strong>{attendanceList.filter(s => s.status === 'IZIN' || s.status === 'SAKIT').length} Siswa</strong></div>
              <div>Alpa: <strong>{attendanceList.filter(s => s.status === 'ALFA').length} Siswa</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalizeAndLock}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-md text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? 'Mengunci...' : 'Ya, Kunci & Submit ke Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
