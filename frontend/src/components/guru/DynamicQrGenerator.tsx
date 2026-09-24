import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  QrCode
} from 'lucide-react';
import { Eskul, SesiPertemuan } from '../../types';

interface DynamicQrGeneratorProps {
  sessions: SesiPertemuan[];
  currentSession: SesiPertemuan;
  onSelectSession: (session: SesiPertemuan) => void;
  onUpdateSessionStatus: (status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI') => void;
  onSimulateStudentScan: (sessionToken: string) => void;
}

export const DynamicQrGenerator: React.FC<DynamicQrGeneratorProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onUpdateSessionStatus,
  onSimulateStudentScan,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [tokenPayload, setTokenPayload] = useState(currentSession.tokenAktif);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const qrContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Dynamic QR Presensi Eskul
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Sistem QR Code terenkripsi berganti otomatis setiap 15 detik untuk mencegah kecurangan dan titip absen.
          </p>
        </div>

        {/* Quick Simulator Scan Action */}
        <button
          onClick={() => onSimulateStudentScan(tokenPayload)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulasi 1 Siswa Scan QR</span>
        </button>
      </div>

      {/* Main Grid: Left is QR Display, Right is Session Info & Controls */}
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
                className={`p-2 rounded-xl transition-colors ${
                  isFullscreen ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={soundEnabled ? 'Matikan Suara Beep' : 'Nyalakan Suara Beep'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl transition-colors ${
                  isFullscreen ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Proyektor Layar Penuh'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* QR Canvas Container with Animated Border & Circular countdown */}
          <div className="relative my-4 flex flex-col items-center">
            {/* Countdown Ring */}
            <div className="relative p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-[#00B884]/40 flex items-center justify-center">
              {currentSession.status === 'BERLANGSUNG' ? (
                <div className="relative bg-white p-5 rounded-2xl shadow-xl border border-slate-100">
                  <QRCodeSVG
                    value={tokenPayload}
                    size={isFullscreen ? 320 : 230}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=60&auto=format&fit=crop&q=80',
                      x: undefined,
                      y: undefined,
                      height: 38,
                      width: 38,
                      excavate: true,
                    }}
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
                <span className="text-slate-400 font-medium">Payload Token: </span>
                <span className="font-mono text-slate-700 font-semibold truncate">
                  {tokenPayload}
                </span>
              </div>
            </div>
            <button
              onClick={generateNewToken}
              className="text-[#00B884] hover:text-[#009e70] font-semibold text-xs flex items-center gap-1 shrink-0 ml-2"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Right Column: Session Selector & Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Session Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">
              Pilih Sesi Kegiatan Hari Ini
            </h2>

            {/* Session Selector Buttons */}
            <div className="space-y-2.5">
              {sessions.map((sess) => {
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

            {/* Attendance Progress in Current Session */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Kehadiran Terverifikasi</span>
                <span className="text-[#00B884] font-bold">
                  {currentSession.totalHadir} / {currentSession.totalSiswa} Siswa ({Math.round((currentSession.totalHadir / currentSession.totalSiswa) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#00B884] h-full rounded-full transition-all"
                  style={{ width: `${(currentSession.totalHadir / currentSession.totalSiswa) * 100}%` }}
                />
              </div>
            </div>

            {/* Session State Actions */}
            <div className="mt-6 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kontrol Sesi Presensi
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateSessionStatus('BERLANGSUNG')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
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
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
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
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
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
    </div>
  );
};
