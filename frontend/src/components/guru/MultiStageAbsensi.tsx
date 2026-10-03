import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  QrCode, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  FileCheck, 
  Lock, 
  FileText, 
  Send, 
  CalendarOff, 
  Award, 
  Star, 
  Check, 
  RefreshCw,
  Eye,
  Building,
  HelpCircle,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Eskul, SesiPertemuan, StudentProfile, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface MultiStageAbsensiProps {
  currentUser: User;
  coachedEskuls: Eskul[];
  sessions: SesiPertemuan[];
  students: StudentProfile[];
  onFinish?: () => void;
  onRefreshData?: () => void;
}

interface StudentAttendanceState {
  siswaId: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  avatarUrl?: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA';
  waktuScan?: string;
  metode: 'DYNAMIC_QR' | 'SCAN_QR_SISWA' | 'MANUAL_CHECKLIST';
  nilaiKeaktifan: number;
  ratingKeaktifan: string;
  keterangan: string;
  buktiSurat: string;
}

export const MultiStageAbsensi: React.FC<MultiStageAbsensiProps> = ({
  currentUser,
  coachedEskuls,
  sessions,
  students,
  onFinish,
  onRefreshData,
}) => {
  // Stepper Stage: 1 = Scan QR & Detection, 2 = Keaktifan, 3 = Izin/Sakit, 4 = Review & Lock
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Eskul & Session
  const [selectedEskulId, setSelectedEskulId] = useState<string>(coachedEskuls[0]?.id || '');
  const activeEskul = coachedEskuls.find((e) => e.id === selectedEskulId) || coachedEskuls[0];

  const [activeSession, setActiveSession] = useState<SesiPertemuan | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendanceState>>({});
  const [lastScannedStudent, setLastScannedStudent] = useState<StudentAttendanceState | null>(null);

  // Scanning & Tools
  const [scanMode, setScanMode] = useState<'CAMERA_GURU' | 'PROJECTOR_QR'>('CAMERA_GURU');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSimStudentId, setSelectedSimStudentId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totpToken, setTotpToken] = useState('');

  // Agenda & Form Info
  const [materiLatihan, setMateriLatihan] = useState('Latihan materi teknik dan taktik rutin mingguan');
  const [deskripsiLatihan, setDeskripsiLatihan] = useState('Latihan rutin ekstrakurikuler berjalan dengan baik dan lancar.');

  // Holiday Modal
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayReasonType, setHolidayReasonType] = useState('Hari Libur Nasional / Tanggal Merah');
  const [holidayCustomReason, setHolidayCustomReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm Lock Modal
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // ignore
    }
  };

  // Find or initialize session for today
  const initSessionAndRoster = async () => {
    if (!selectedEskulId) return;

    // Find session for this eskul
    const foundSession = sessions.find((s) => s.eskulId === selectedEskulId);
    let currentSess = foundSession || null;

    if (!currentSess) {
      try {
        const res = await fetch('http://localhost:5000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eskulId: selectedEskulId,
            pembuatId: currentUser.id,
            judul: `Latihan Rutin: ${activeEskul?.namaEskul}`,
            deskripsi: 'Pertemuan dan latihan terstruktur ekstrakurikuler.',
          }),
        });
        const json = await res.json();
        if (json.success) {
          currentSess = json.data;
        }
      } catch {
        // Fallback local session
        currentSess = {
          id: `sess-${selectedEskulId}`,
          eskulId: selectedEskulId,
          namaEskul: activeEskul?.namaEskul || 'Ekstrakurikuler',
          pembinaNama: currentUser.namaLengkap,
          tanggal: new Date().toISOString().slice(0, 10),
          jamMulai: activeEskul?.jamMulai || '15:30',
          jamSelesai: activeEskul?.jamSelesai || '17:00',
          lokasi: activeEskul?.lokasi || 'SMK Al Amanah',
          judul: `Latihan Rutin: ${activeEskul?.namaEskul}`,
          deskripsi: 'Pertemuan rutin.',
          materi: 'Latihan Rutin',
          tokenAktif: 'STANDBY',
          tokenExpiresAt: Date.now() + 15000,
          status: 'BERLANGSUNG',
          totalHadir: 0,
          totalSiswa: 35,
        };
      }
    }

    setActiveSession(currentSess);
    if (currentSess) {
      setIsSessionLocked(Boolean(currentSess.isLocked) || currentSess.status === 'SELESAI');
      setMateriLatihan(currentSess.materi || currentSess.judul || 'Latihan Rutin');
      setDeskripsiLatihan(currentSess.deskripsi || 'Latihan berjalan dengan baik.');
    }

    // Load roster and attendance sheet from backend
    if (currentSess?.id) {
      try {
        const sheetRes = await fetch(`http://localhost:5000/api/sessions/${currentSess.id}/attendance-sheet`);
        if (sheetRes.ok) {
          const sheetJson = await sheetRes.json();
          if (sheetJson.success && sheetJson.data?.roster) {
            const initialMap: Record<string, StudentAttendanceState> = {};
            sheetJson.data.roster.forEach((r: any) => {
              initialMap[r.siswaId] = {
                siswaId: r.siswaId,
                namaSiswa: r.namaSiswa,
                nis: r.nis,
                nisn: r.nisn,
                kelas: r.kelas,
                avatarUrl: r.avatarUrl,
                status: r.status === 'BELUM_ABSEN' ? 'ALFA' : r.status,
                waktuScan: r.waktuScan,
                metode: r.metode || 'SCAN_QR_SISWA',
                nilaiKeaktifan: r.nilaiKeaktifan || 85,
                ratingKeaktifan: r.ratingKeaktifan || 'Sangat Baik',
                keterangan: r.keterangan || '',
                buktiSurat: r.buktiSurat || '',
              };
            });
            setAttendanceMap(initialMap);
            return;
          }
        }
      } catch {
        // Fallback to local students list
      }
    }

    // Fallback: Populate from props students enrolled in this eskul
    const initialMap: Record<string, StudentAttendanceState> = {};
    const enrolled = students.filter(
      (s) => s.enrolledEskulIds && s.enrolledEskulIds.includes(selectedEskulId)
    );
    const targetStudents = enrolled.length > 0 ? enrolled : students.slice(0, 15);

    targetStudents.forEach((s) => {
      initialMap[s.id] = {
        siswaId: s.id,
        namaSiswa: s.namaLengkap,
        nis: s.nis || '20241001',
        nisn: s.nisn || s.nomorInduk || '0061928374',
        kelas: s.kelas,
        avatarUrl: s.avatarUrl,
        status: 'ALFA',
        metode: 'SCAN_QR_SISWA',
        nilaiKeaktifan: 85,
        ratingKeaktifan: 'Sangat Baik',
        keterangan: '',
        buktiSurat: '',
      };
    });
    setAttendanceMap(initialMap);
  };

  useEffect(() => {
    initSessionAndRoster();
  }, [selectedEskulId]);

  // Projector Dynamic Token Generator
  const generateNewToken = () => {
    const timestamp = Math.floor(Date.now() / 15000);
    const salt = Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = `SMK-AMANAH:${activeSession?.id || 'sesi'}:${timestamp}:${salt}`;
    setTotpToken(token);
    setTimeLeft(15);
  };

  useEffect(() => {
    if (scanMode !== 'PROJECTOR_QR' || isSessionLocked) return;
    generateNewToken();
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
  }, [scanMode, isSessionLocked]);

  // Handle Scanning of a student card
  const handleRecordStudentPresence = async (studentId: string) => {
    if (isSessionLocked) {
      showToast('Sesi ini telah dikunci dan tidak dapat menerima scan baru.', 'error');
      return;
    }

    setIsScanning(true);
    playBeep();

    try {
      // Call backend scan endpoint
      if (activeSession?.id) {
        await fetch('http://localhost:5000/api/presensi/scan-student-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sesiId: activeSession.id,
            studentIdOrNis: studentId,
            pembinaId: currentUser.id,
            nilaiKeaktifan: 88,
            ratingKeaktifan: 'Sangat Baik',
          }),
        });
      }
    } catch {
      // Proceed locally
    }

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {
      // Ignore
    }

    setAttendanceMap((prev) => {
      const existing = prev[studentId];
      if (!existing) return prev;
      const updated: StudentAttendanceState = {
        ...existing,
        status: 'HADIR',
        waktuScan: new Date().toLocaleTimeString('id-ID'),
        metode: 'SCAN_QR_SISWA',
      };
      setLastScannedStudent(updated);
      return { ...prev, [studentId]: updated };
    });

    setIsScanning(false);
  };

  // Mark Session as Holiday
  const handleConfirmHoliday = async () => {
    const finalReason = holidayReasonType === 'Lainnya (Kustom)' ? holidayCustomReason : holidayReasonType;
    if (!finalReason.trim()) {
      showToast('Alasan libur wajib diisi.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/sessions/mark-holiday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role },
        body: JSON.stringify({
          eskulId: selectedEskulId,
          pembuatId: currentUser.id,
          alasanLibur: finalReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Pertemuan berhasil ditandai Libur: ${finalReason}. Tidak ada siswa dialfakan.`, 'success');
        setIsHolidayModalOpen(false);
        setIsSessionLocked(true);
        if (activeSession) {
          setActiveSession({ ...activeSession, status: 'LIBUR', isLibur: true, alasanLibur: finalReason });
        }
        if (onRefreshData) onRefreshData();
      }
    } catch {
      showToast('Gagal menandai hari libur.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Final Attendance & Lock History
  const handleFinalizeAndLock = async () => {
    if (!activeSession?.id) return;
    setActionLoading(true);

    const kehadiranPayload = Object.values(attendanceMap).map((item) => ({
      siswaId: item.siswaId,
      status: item.status,
      nilaiKeaktifan: item.nilaiKeaktifan,
      ratingKeaktifan: item.ratingKeaktifan,
      keterangan: item.keterangan,
      buktiSurat: item.buktiSurat,
      metode: item.metode,
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${activeSession.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role },
        body: JSON.stringify({
          kehadiran: kehadiranPayload,
          judul: activeSession.judul || `Latihan Rutin ${activeEskul.namaEskul}`,
          deskripsi: deskripsiLatihan,
          materi: materiLatihan,
          pembuatId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        showToast('Presensi berhasil difinalisasi dan dikunci menjadi History Resmi!', 'success');
        setIsSessionLocked(true);
        setIsLockConfirmOpen(false);
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || 'Gagal memfinalisasi presensi.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const attendanceList = Object.values(attendanceMap);
  const totalStudents = attendanceList.length;
  const hadirStudents = attendanceList.filter((s) => s.status === 'HADIR');
  const izinStudents = attendanceList.filter((s) => s.status === 'IZIN');
  const sakitStudents = attendanceList.filter((s) => s.status === 'SAKIT');
  const alfaStudents = attendanceList.filter((s) => s.status === 'ALFA');

  const avgKeaktifan = hadirStudents.length > 0 
    ? Math.round(hadirStudents.reduce((acc, curr) => acc + curr.nilaiKeaktifan, 0) / hadirStudents.length)
    : 85;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50 backdrop-blur-md'
                : 'bg-rose-900/90 text-rose-100 border-rose-500/50 backdrop-blur-md'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Presensi 4-Tahap Lapangan (Official Workflow)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Alur Presensi Eskul: {activeEskul?.namaEskul || 'Ekstrakurikuler'}
            </h1>
            <p className="text-emerald-50 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Scan QR dan deteksi instan identitas siswa, berikan nilai keaktifan harian lapangan, catat izin/sakit dengan bukti surat, lalu kunci hasil akhir menjadi arsip history resmi sekolah.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Opsi Hari Libur / Tanggal Merah */}
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarOff className="w-4 h-4" />
              <span>Tandai Hari Ini Libur</span>
            </button>

            {coachedEskuls.length > 1 && (
              <select
                value={selectedEskulId}
                onChange={(e) => setSelectedEskulId(e.target.value)}
                className="bg-white/20 text-white rounded-2xl px-3 py-2 text-xs font-bold border border-white/30 backdrop-blur-md focus:outline-none"
              >
                {coachedEskuls.map((e) => (
                  <option key={e.id} value={e.id} className="text-slate-800">
                    {e.namaEskul}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-2.5">
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
              <span>Pindai & Deteksi QR</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
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
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950">
                Avg {avgKeaktifan}
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
              <span>Izin & Sakit (Surat)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white">
                {izinStudents.length + sakitStudents.length} Siswa
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
              <span>Review & Kunci History</span>
              {isSessionLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <span className="text-[10px] text-emerald-200">Final</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Locked Notice if already finalized */}
      {isSessionLocked && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold">Sesi Telah Difinalisasi & Dikunci (Official History).</span>
              <span className="text-amber-700 ml-1">
                Data presensi ini sudah tersimpan permanen dan dapat dilihat oleh Koordinator Ekstrakurikuler serta Wali Kelas.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase tracking-wider">
            Terkunci
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 1: PINDAI & DETEKSI QR INSTAN DENGAN NOTIFIKASI REAL-TIME */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Mode Switch & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start">
              <button
                onClick={() => setScanMode('CAMERA_GURU')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scanMode === 'CAMERA_GURU' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Kamera Pindai Guru (Scan Siswa)</span>
              </button>
              <button
                onClick={() => setScanMode('PROJECTOR_QR')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scanMode === 'PROJECTOR_QR' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Proyektor Dinamis (Siswa Scan)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>{soundEnabled ? 'Beep Aktif' : 'Beep Senyap'}</span>
              </button>
            </div>
          </div>

          {/* Grid Viewfinder & Live Detection Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Viewfinder Column */}
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sesi: {activeEskul?.namaEskul}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{activeSession?.lokasi}</span>
              </div>

              {scanMode === 'CAMERA_GURU' ? (
                <div className="relative w-full max-w-sm aspect-square mx-auto bg-slate-950 rounded-2xl border-2 border-slate-800 my-4 flex flex-col items-center justify-center p-4 shadow-inner">
                  {/* Laser bouncing bar */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00B884] to-transparent shadow-[0_0_15px_#00B884] animate-bounce top-1/2" />
                  <div className="w-44 h-44 border-2 border-dashed border-[#00B884]/60 rounded-2xl flex flex-col items-center justify-center relative p-3">
                    <QrCode className="w-12 h-12 text-slate-600 mb-2 stroke-[1.2]" />
                    <span className="text-[10px] text-slate-400 text-center font-bold">
                      Arahkan Kamera ke Kartu Siswa
                    </span>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00B884]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00B884]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00B884]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00B884]" />
                  </div>
                  <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scanner Siap Mendeteksi Instan</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG value={totpToken || 'STANDBY'} size={180} level="H" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      Token Berganti Dalam {timeLeft} Detik
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Siswa membuka menu Pindai di HP masing-masing dan mengarahkan ke layar ini
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Bar */}
              <div className="mt-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-300 font-bold shrink-0">Simulasi Scan:</span>
                  <select
                    value={selectedSimStudentId}
                    onChange={(e) => setSelectedSimStudentId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none flex-1 sm:w-48"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {attendanceList.map((s) => (
                      <option key={s.siswaId} value={s.siswaId}>
                        {s.namaSiswa} ({s.kelas}) - {s.status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => selectedSimStudentId && handleRecordStudentPresence(selectedSimStudentId)}
                  disabled={isScanning || !selectedSimStudentId || isSessionLocked}
                  className="w-full sm:w-auto px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pindai Kartu Ini (Beep)</span>
                </button>
              </div>
            </div>

            {/* Right Column: INSTANT STUDENT DETECTED CARD */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Siswa Terdeteksi Terakhir
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Real-Time Detection
                  </span>
                </div>

                {lastScannedStudent ? (
                  <motion.div
                    key={lastScannedStudent.siswaId + (lastScannedStudent.waktuScan || '')}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        name={lastScannedStudent.namaSiswa}
                        className="w-14 h-14 rounded-2xl ring-2 ring-emerald-500 shadow-sm text-base shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-800 text-base leading-tight truncate">
                          {lastScannedStudent.namaSiswa}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          NISN: <span className="font-mono font-bold text-slate-800">{lastScannedStudent.nisn}</span> • {lastScannedStudent.kelas}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-extrabold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Status: HADIR TERVERIFIKASI ({lastScannedStudent.waktuScan || 'Baru Saja'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Nilai Keaktifan Lapangan:</span>
                      <span className="font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                        {lastScannedStudent.nilaiKeaktifan} ({lastScannedStudent.ratingKeaktifan})
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Arahkan kamera ke kartu siswa untuk mendeteksi data kehadiran secara instan.
                  </div>
                )}
              </div>

              {/* Attendance Mini Feed */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Siswa Hadir ({hadirStudents.length} / {totalStudents})
                  </h3>
                  <span className="text-xs font-bold text-[#00B884]">
                    {Math.round((hadirStudents.length / Math.max(1, totalStudents)) * 100)}%
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {hadirStudents.map((s) => (
                    <div
                      key={s.siswaId}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate">{s.namaSiswa}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.kelas} • {s.waktuScan || 'Hadir'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        ⭐ {s.nilaiKeaktifan}
                      </span>
                    </div>
                  ))}
                  {hadirStudents.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Belum ada siswa yang melakukan scan presensi.
                    </div>
                  )}
                </div>

                {/* Next Step CTA */}
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-3 py-3 bg-[#00B884] hover:bg-[#009e70] active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lanjut ke Tahap 2: Nilai Keaktifan ({hadirStudents.length} Hadir)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 2: PENILAIAN KEAKTIFAN HARIAN SISWA DI LAPANGAN */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Tahap 2: Nilai Keaktifan Lapangan Hari Ini</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan rating dan skor keaktifan harian untuk seluruh siswa yang hadir mengikuti sesi latihan hari ini.
              </p>
            </div>

            {/* Quick Batch Set */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Setel Cepat Semua Hadir:</span>
              <button
                onClick={() => {
                  setAttendanceMap((prev) => {
                    const next = { ...prev };
                    Object.keys(next).forEach((id) => {
                      if (next[id].status === 'HADIR') {
                        next[id] = { ...next[id], nilaiKeaktifan: 88, ratingKeaktifan: 'Sangat Baik' };
                      }
                    });
                    return next;
                  });
                  showToast('Semua siswa hadir disetel nilai keaktifan 88 (Sangat Baik).', 'success');
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#00B884] rounded-xl text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                Setel 88 (Sangat Baik)
              </button>
            </div>
          </div>

          {/* Students Rating Table */}
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
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-xl" />
                      <div>
                        <div className="font-extrabold text-sm text-slate-800">{s.namaSiswa}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.kelas} • NISN: {s.nisn}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#00B884] font-mono">
                        {s.nilaiKeaktifan}
                      </span>
                      <div className="text-[10px] text-slate-500 font-semibold">{s.ratingKeaktifan}</div>
                    </div>
                  </div>

                  {/* Rating Selector Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200/60">
                    {[
                      { label: 'Sangat Baik', score: 92 },
                      { label: 'Baik', score: 85 },
                      { label: 'Cukup', score: 75 },
                      { label: 'Kurang', score: 65 },
                    ].map((rate) => (
                      <button
                        key={rate.label}
                        type="button"
                        onClick={() => {
                          setAttendanceMap((prev) => ({
                            ...prev,
                            [s.siswaId]: {
                              ...prev[s.siswaId],
                              nilaiKeaktifan: rate.score,
                              ratingKeaktifan: rate.label,
                            },
                          }));
                        }}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center ${
                          s.ratingKeaktifan === rate.label
                            ? 'bg-[#00B884] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {rate.label}
                      </button>
                    ))}
                  </div>

                  {/* Slider Adjuster */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Skor:</span>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={s.nilaiKeaktifan}
                      onChange={(e) => {
                        const score = Number(e.target.value);
                        let label = 'Sangat Baik';
                        if (score < 70) label = 'Kurang';
                        else if (score < 80) label = 'Cukup';
                        else if (score < 90) label = 'Baik';

                        setAttendanceMap((prev) => ({
                          ...prev,
                          [s.siswaId]: {
                            ...prev[s.siswaId],
                            nilaiKeaktifan: score,
                            ratingKeaktifan: label,
                          },
                        }));
                      }}
                      className="w-full accent-[#00B884] cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 1: Scan</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Lanjut ke Tahap 3: Izin & Sakit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 3: KETERANGAN IZIN, SAKIT & SURAT KETERANGAN */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Tahap 3: Input Izin, Sakit & Keterangan Surat</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bagi siswa yang belum hadir / berhalangan, masukkan status dispensasi resmi setelah menerima surat izin orang tua atau surat sakit dokter.
            </p>
          </div>

          <div className="space-y-3.5">
            {attendanceList
              .filter((s) => s.status !== 'HADIR')
              .map((s) => (
                <div
                  key={s.siswaId}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.namaSiswa} className="w-10 h-10 rounded-xl shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm text-slate-800">{s.namaSiswa}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.kelas} • NISN: {s.nisn}</div>
                      </div>
                    </div>

                    {/* Status Pill Selectors */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {(['HADIR', 'IZIN', 'SAKIT', 'ALFA'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [s.siswaId]: {
                                ...prev[s.siswaId],
                                status: st,
                                metode: st === 'HADIR' ? 'MANUAL_CHECKLIST' : prev[s.siswaId].metode,
                              },
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            s.status === st
                              ? st === 'HADIR'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'IZIN'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : st === 'SAKIT'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If IZIN or SAKIT, show inputs for reason and doctor/parent letter */}
                  {(s.status === 'IZIN' || s.status === 'SAKIT') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 animate-in fade-in-50">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Alasan {s.status === 'IZIN' ? 'Izin' : 'Sakit'}:
                        </label>
                        <input
                          type="text"
                          value={s.keterangan}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [s.siswaId]: { ...prev[s.siswaId], keterangan: val },
                            }));
                          }}
                          placeholder={s.status === 'IZIN' ? 'Contoh: Izin acara keluarga mendesak' : 'Contoh: Demam flu'}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00B884]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Surat Keterangan / Bukti Fisik:
                        </label>
                        <input
                          type="text"
                          value={s.buktiSurat}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [s.siswaId]: { ...prev[s.siswaId], buktiSurat: val },
                            }));
                          }}
                          placeholder="Contoh: Surat Dokter Klinik Amanah / Surat Izin Ortu"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00B884]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {attendanceList.filter((s) => s.status !== 'HADIR').length === 0 && (
              <div className="p-8 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center text-xs text-emerald-800 font-bold">
                Luar biasa! Seluruh siswa terdaftar hadir pada pertemuan ini (100% Kehadiran).
              </div>
            )}
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 2: Keaktifan</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Lanjut ke Tahap 4: Review Rekap & Kunci</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 4: REVIEW REKAPITULASI & FINAL SUBMIT KUNCI HISTORY */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#00B884]" />
              <span>Tahap 4: Review Rekapitulasi & Kunci Arsip History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Periksa ringkasan presensi pertemuan hari ini. Begitu disubmit, data akan berstatus final (Terkunci) dan langsung dapat dipantau oleh Koordinator Ekstrakurikuler serta Wali Kelas.
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
              <div className="text-2xl font-black mt-1">{izinStudents.length} Siswa</div>
              <div className="text-[10px] text-blue-600 mt-0.5">Dispensasi resmi tercatat</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
              <div className="text-[11px] font-bold text-amber-700">Sakit</div>
              <div className="text-2xl font-black mt-1">{sakitStudents.length} Siswa</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Surat dokter / orang tua</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
              <div className="text-[11px] font-bold text-rose-700">Alpa</div>
              <div className="text-2xl font-black mt-1">{alfaStudents.length} Siswa</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Tanpa keterangan</div>
            </div>
          </div>

          {/* Materi & Deskripsi Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Topik / Materi Latihan Utama Hari Ini:</label>
              <input
                type="text"
                disabled={isSessionLocked}
                value={materiLatihan}
                onChange={(e) => setMateriLatihan(e.target.value)}
                placeholder="Contoh: Latihan transisi bertahan dan drill finishing"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Evaluasi & Catatan Pelaksanaan:</label>
              <input
                type="text"
                disabled={isSessionLocked}
                value={deskripsiLatihan}
                onChange={(e) => setDeskripsiLatihan(e.target.value)}
                placeholder="Contoh: Seluruh siswa antusias, disiplin waktu terjaga."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          {/* Roster Full Review Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 p-3 text-xs font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
              <span>Rekapitulasi Lengkap Peserta Sesi</span>
              <span className="font-mono text-slate-500">{attendanceList.length} Total Anggota</span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
              {attendanceList.map((s) => (
                <div key={s.siswaId} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <UserAvatar name={s.namaSiswa} className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="truncate">
                      <div className="font-extrabold text-slate-800 truncate">{s.namaSiswa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.kelas} • NISN: {s.nisn}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {s.status === 'HADIR' && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        ⭐ {s.nilaiKeaktifan} ({s.ratingKeaktifan})
                      </span>
                    )}
                    {s.status === 'IZIN' && (
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                        IZIN: {s.keterangan || 'Dispensasi'}
                      </span>
                    )}
                    {s.status === 'SAKIT' && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        SAKIT: {s.keterangan || 'Surat Dokter'}
                      </span>
                    )}
                    {s.status === 'ALFA' && (
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                        ALFA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stepper Footer Controls & Final Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tahap 3: Izin & Sakit</span>
            </button>

            {isSessionLocked ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sesi Telah Terkunci Resmi</span>
                </span>
                {onFinish && (
                  <button
                    onClick={onFinish}
                    className="px-4 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Kembali ke Beranda
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLockConfirmOpen(true)}
                disabled={actionLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-[#00B884] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Submit & Kunci History Pertemuan Ini</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TANDAI HARI LIBUR / TANGGAL MERAH */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isHolidayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                  <CalendarOff className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Tandai Hari Ini Libur / Tanggal Merah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ekstrakurikuler: <span className="font-bold text-slate-700">{activeEskul.namaEskul}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Pilih Alasan Libur:</label>
                {[
                  'Hari Libur Nasional / Tanggal Merah',
                  'Ujian Tengah / Akhir Semester (UTS/UAS)',
                  'Kondisi Cuaca Buruk / Hujan Deras (Force Majeure)',
                  'Kegiatan Khusus Sekolah / Hari Besar',
                  'Lainnya (Kustom)',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      holidayReasonType === reason
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="holidayReason"
                      checked={holidayReasonType === reason}
                      onChange={() => setHolidayReasonType(reason)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}

                {holidayReasonType === 'Lainnya (Kustom)' && (
                  <textarea
                    value={holidayCustomReason}
                    onChange={(e) => setHolidayCustomReason(e.target.value)}
                    placeholder="Tuliskan alasan spesifik diliburkannya sesi hari ini..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                ℹ️ <strong>Catatan:</strong> Menandai libur tidak akan mengurangi persentase kehadiran siswa (tidak dihitung alpa) dan otomatis tercatat pada rekap kehadiran Koordinator.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setIsHolidayModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmHoliday}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CalendarOff className="w-4 h-4" />}
                  <span>Simpan Status Libur</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI KUNCI HISTORY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isLockConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Konfirmasi Kunci History Presensi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pastikan seluruh data kehadiran dan nilai keaktifan sudah benar.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-xs text-amber-950">
                <div className="font-extrabold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Peringatan Penting:</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Setelah disubmit, sesi ini akan menjadi <strong>ARSIP PERMANEN</strong> yang <strong>tidak dapat diubah kembali</strong> oleh pembina, dan langsung diteruskan ke Koordinator Ekstrakurikuler.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hadir:</span>
                  <span className="font-bold text-emerald-700">{hadirStudents.length} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Izin & Sakit:</span>
                  <span className="font-bold text-blue-700">{izinStudents.length + sakitStudents.length} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alpa:</span>
                  <span className="font-bold text-rose-700">{alfaStudents.length} Siswa</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setIsLockConfirmOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Periksa Kembali
                </button>
                <button
                  onClick={handleFinalizeAndLock}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Ya, Kunci & Selesaikan</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
