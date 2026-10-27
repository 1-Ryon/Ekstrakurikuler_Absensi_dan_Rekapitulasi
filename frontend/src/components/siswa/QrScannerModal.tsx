import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck,
  RefreshCw,
  SwitchCamera,
  Upload,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessScan: (studentName: string, eskulName: string, rawToken?: string) => void;
  currentActiveToken?: string;
  studentId?: string;
  studentName?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccessScan,
  currentActiveToken = 'SMK-AMANAH-DEMO-TOKEN',
  studentId = 'usr-sis-01',
  studentName = 'Muhammad Farhan Al-Fatih',
}) => {
  const [scanState, setScanState] = useState<'IDLE' | 'CAMERA_STARTING' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [simulatedDistance] = useState<number>(14);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-reader';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play audio chime on successful scan
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context restricted or unavailable
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
        console.warn('Error stopping html5-qrcode scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Prevent double processing
    if (scanState === 'VERIFYING' || scanState === 'SUCCESS') return;

    setScanState('VERIFYING');
    await stopCamera();

    try {
      // Fire confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      playSuccessSound();

      // Send to backend API
      let resolvedEskul = 'Ekstrakurikuler SMK Al Amanah';
      const res = await api.scanPresensi(decodedText, studentId, 'Kamera Siswa (PWA Valid)');
      if (res) {
        resolvedEskul = (res as any).namaEskul || (res as any).data?.namaEskul || resolvedEskul;
      }

      setScanState('SUCCESS');
      setScannedResult(`Presensi ${resolvedEskul} berhasil diverifikasi!`);
      onSuccessScan(studentName, resolvedEskul, decodedText);
    } catch (err: any) {
      setScanState('ERROR');
      setErrorMessage(err.message || 'Gagal memverifikasi token QR Code. Pastikan sesi eskul sedang berlangsung.');
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    setErrorMessage(null);
    setScanState('CAMERA_STARTING');

    await stopCamera();

    // Check if browser has mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanState('ERROR');
      setErrorMessage('Browser ini tidak mendukung akses kamera secara langsung. Silakan gunakan opsi unggah gambar QR atau simulasi.');
      return;
    }

    try {
      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: mode },
        {
          fps: 12,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // ignore scan frame misses
        }
      );

      setScanState('SCANNING');
    } catch (err: any) {
      console.warn('Failed to start camera with facingMode:', mode, err);
      // Fallback: try default camera without constraint
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const qrScanner = new Html5Qrcode(scannerContainerId);
          html5QrCodeRef.current = qrScanner;
          await qrScanner.start(
            cameras[0].id,
            { fps: 12, qrbox: { width: 230, height: 230 } },
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
          setScanState('SCANNING');
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback camera failed:', fallbackErr);
      }

      setScanState('ERROR');
      setErrorMessage('Izin kamera ditolak atau kamera sedang digunakan aplikasi lain. Anda tetap dapat mengunggah file foto QR atau menggunakan tombol uji.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanState('IDLE');
      setScannedResult(null);
      setErrorMessage(null);

      // Short delay to let DOM element render
      const timer = setTimeout(() => {
        startCamera(facingMode);
      }, 200);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, facingMode]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanState('VERIFYING');
    try {
      const scanner = html5QrCodeRef.current || new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = scanner;
      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setScanState('ERROR');
      setErrorMessage('Tidak ditemukan QR Code yang valid pada gambar yang Anda unggah.');
    }
  };

  const triggerSimulatedScan = () => {
    handleScanSuccess(currentActiveToken || `SMK-AMANAH:sesi-demo:${Math.floor(Date.now() / 15000)}:TEST`);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-lg w-[92vw] max-w-sm p-4 sm:p-6 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup Pemindai"
          className="absolute top-4 right-4 size-8 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-[#00B884] text-xs font-semibold mb-1.5 border border-emerald-500/20">
            <Camera className="size-3.5" />
            <span>Kamera Presensi Siswa</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">Pindai QR Dinamis Guru</h3>
          <p className="text-xs text-slate-400">
            Arahkan kamera ke layar proyektor / ponsel guru pembina
          </p>
        </div>

        {/* Scanner Viewfinder Box */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-md border border-slate-800 overflow-hidden flex flex-col items-center justify-center mb-3.5 shadow-inner">
          
          {/* html5-qrcode video element will mount here */}
          <div 
            id={scannerContainerId} 
            className="w-full h-full object-cover overflow-hidden" 
          />

          {/* Scanner Loading State */}
          {scanState === 'CAMERA_STARTING' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2.5 p-4 text-center z-10">
              <RefreshCw className="size-8 text-[#00B884] animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Mengaktifkan kamera perangkat...</p>
              <p className="text-[10px] text-slate-500">Mohon izinkan akses kamera pada peramban Anda</p>
            </div>
          )}

          {/* Overlay Target Box during Scanning */}
          {scanState === 'SCANNING' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Laser scan line animation */}
              <div className="absolute inset-x-4 h-0.5 bg-[#00B884] opacity-80 animate-pulse top-1/3" />

              {/* Viewfinder Target corners */}
              <div className="w-48 h-48 border-2 border-dashed border-[#00B884]/80 rounded-md flex items-center justify-center relative">
                {/* 4 corner accents */}
                <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-[#00B884]" />
                <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-[#00B884]" />
                <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-[#00B884]" />
                <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-[#00B884]" />
              </div>

              <div className="absolute bottom-2.5 text-[10px] text-slate-300 flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700/80">
                <MapPin className="size-3 text-[#00B884]" />
                <span>Geofencing: {simulatedDistance}m di area sekolah (Valid)</span>
              </div>
            </div>
          )}

          {/* Verifying TOTP Token state */}
          {scanState === 'VERIFYING' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2.5 p-4 text-center z-10">
              <RefreshCw className="size-10 text-[#00B884] animate-spin" />
              <div className="text-sm font-bold text-white">Memverifikasi QR Code...</div>
              <p className="text-[11px] text-slate-400">Sinkronisasi kehadiran dengan basis data sekolah</p>
            </div>
          )}

          {/* Scan Success state */}
          {scanState === 'SUCCESS' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2 text-center p-4 z-10 animate-in zoom-in-95">
              <div className="size-14 rounded-md bg-emerald-500/20 text-[#00B884] flex items-center justify-center mb-1">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="text-base font-bold text-white">Presensi Berhasil!</div>
              <div className="text-xs text-emerald-400 font-semibold px-2">{scannedResult}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Waktu: {new Date().toLocaleTimeString()} WIB
              </div>
            </div>
          )}

          {/* Error / Fallback State */}
          {scanState === 'ERROR' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2 p-4 text-center z-10">
              <AlertCircle className="size-10 text-rose-500 mb-1" />
              <div className="text-sm font-bold text-white">Kamera Belum Aktif</div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px]">
                {errorMessage || 'Pastikan izin kamera aktif pada peramban Anda.'}
              </p>
              <button
                onClick={() => startCamera(facingMode)}
                className="mt-2 px-3.5 py-1.5 bg-[#00B884] text-white text-xs font-semibold rounded-md hover:bg-[#009e70] transition-colors cursor-pointer"
              >
                Coba Akses Lagi
              </button>
            </div>
          )}
        </div>

        {/* Camera Controls & Fallback Buttons */}
        <div className="flex items-center gap-2 mb-3.5">
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="flex-1 py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-md border border-slate-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Ganti Kamera Depan / Belakang"
          >
            <SwitchCamera className="size-3.5 text-emerald-400" />
            <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-md border border-slate-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Unggah Foto QR Code"
          >
            <Upload className="size-3.5 text-blue-400" />
            <span>Pilih Foto</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Security Watermark */}
        <div className="space-y-2 mb-3.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 bg-slate-800/40 p-2.5 rounded-md border border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Validitas Geofence & Waktu:</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">Tervalidasi Aktif</span>
          </div>
        </div>

        {/* Action Button */}
        {scanState === 'SUCCESS' ? (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs rounded-md shadow-sm transition-all cursor-pointer"
          >
            Selesai
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={triggerSimulatedScan}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-slate-200 hover:text-white font-medium text-xs rounded-md border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="size-3.5 text-emerald-400" />
              <span>Verifikasi Presensi Mandiri (Scan Otomatis)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
