import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Smartphone, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Users,
  QrCode,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SesiPertemuan, StudentProfile, PresensiRecord } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface TeacherStudentScannerProps {
  currentSession: SesiPertemuan;
  students: StudentProfile[];
  onRecordAttendance: (student: StudentProfile, session: SesiPertemuan) => void;
  recentLogs: PresensiRecord[];
}

export const TeacherStudentScanner: React.FC<TeacherStudentScannerProps> = ({
  currentSession,
  students,
  onRecordAttendance,
  recentLogs,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedStudent, setLastScannedStudent] = useState<StudentProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch confirmation beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // ignore audio context restrictions
    }
  };

  const handleScanStudent = (studentToScan: StudentProfile) => {
    setIsScanning(true);

    setTimeout(() => {
      playBeep();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // fallback
      }

      setLastScannedStudent(studentToScan);
      onRecordAttendance(studentToScan, currentSession);
      setIsScanning(false);
    }, 400);
  };

  const currentStudentToSimulate = students.find((s) => s.id === selectedStudentId) || students[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight flex items-center gap-3">
            <span>Pemindai Guru (Pindai QR Siswa)</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Mode Lapangan
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Guru/Pembimbing memindai QR Code dari kartu fisik atau layar HP siswa untuk mencatat kehadiran instan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Suara Beep: Aktif' : 'Suara Beep: Hening'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left is Scanner Frame, Right is Last Scanned & Live Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Teacher Camera Viewfinder */}
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Top Session Info */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Sesi: {currentSession.namaEskul} ({currentSession.jamMulai} - {currentSession.jamSelesai} WIB)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Lokasi: {currentSession.lokasi}
            </span>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center my-2 shadow-inner">
            {/* Laser scanning bar */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00B884] to-transparent shadow-[0_0_15px_#00B884] animate-bounce top-1/2" />

            {/* Target Reticle */}
            <div className="w-48 h-48 border-2 border-dashed border-[#00B884]/70 rounded-2xl flex flex-col items-center justify-center relative p-4">
              <QrCode className="w-14 h-14 text-slate-600 mb-2 stroke-[1.2]" />
              <span className="text-[11px] text-slate-400 text-center font-semibold">
                Arahkan ke Kartu ID / HP Siswa
              </span>

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00B884]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00B884]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00B884]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00B884]" />
            </div>

            {/* Status pill inside camera */}
            <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Kamera Guru Siap Mendeteksi</span>
            </div>
          </div>

          {/* Quick Simulation / Demo Bar */}
          <div className="w-full mt-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-300 font-semibold shrink-0">Simulasi Kartu Siswa:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00B884] flex-1 sm:w-48"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.namaLengkap} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => currentStudentToSimulate && handleScanStudent(currentStudentToSimulate)}
              disabled={isScanning}
              className="w-full sm:w-auto px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pindai Kartu Ini (Beep)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Student Confirmation & Recent Attendance Feed */}
        <div className="lg:col-span-5 space-y-5">
          {/* Last Scanned Student Pop-up Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Verifikasi Presensi Terakhir
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Otomatis Tersimpan
              </span>
            </div>

            {lastScannedStudent ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3.5 mb-3">
                  <UserAvatar
                    name={lastScannedStudent.namaLengkap}
                    className="w-14 h-14 rounded-2xl ring-2 ring-emerald-500 shadow-xs text-base"
                  />
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800 leading-tight">
                      {lastScannedStudent.namaLengkap}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      NISN: <span className="font-mono font-bold text-slate-800">{lastScannedStudent.nomorInduk}</span> • {lastScannedStudent.kelas}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Status: HADIR (Pukul {new Date().toLocaleTimeString('id-ID')})</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span>Metode: Kartu Fisik / QR Siswa</span>
                  <span className="text-emerald-700 font-bold">100% Terverifikasi Guru</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Arahkan kamera ke kartu siswa untuk memverifikasi kehadiran.
              </div>
            )}
          </div>

          {/* Quick Stats in Session */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Kehadiran Terkumpul Sesi Ini</span>
              <span className="text-[#00B884] font-extrabold text-base">
                {recentLogs.length} Siswa Hadir
              </span>
            </h3>

            {/* Recent Mini List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800">{log.namaSiswa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.waktuScan} WIB</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
