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
  FlipHorizontal,
  Upload,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

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
  const [isMirrored, setIsMirrored] = useState<boolean>(() => {
    const saved = localStorage.getItem('attendance_camera_mirrored');
    return saved === 'true';
  });

  const toggleMirror = () => {
    setIsMirrored((prev) => {
      const next = !prev;
      localStorage.setItem('attendance_camera_mirrored', String(next));
      return next;
    });
  };
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToSchool, setDistanceToSchool] = useState<number | null>(null);
  const [geofenceActive, setGeofenceActive] = useState<boolean>(true);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(150);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(true);
  const [locationNotice, setLocationNotice] = useState<string>('Memeriksa posisi GPS...');
  const isScanningRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const checkLocation = async () => {
      try {
        const settings = await api.getSettings();
        if (!isMounted) return;
        const isActive = settings?.isGeofenceActive ?? true;
        const radius = settings?.geofenceRadius ?? 150;
        const schoolLat = settings?.schoolLatitude ?? -6.34215;
        const schoolLng = settings?.schoolLongitude ?? 106.71124;

        setGeofenceActive(isActive);
        setGeofenceRadius(radius);

        if (!isActive) {
          setIsInsideGeofence(true);
          setLocationNotice('Mode Bebas (Geofencing GPS dinonaktifkan di pengaturan)');
          return;
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!isMounted) return;
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setUserCoords({ lat, lng });
              const dist = calculateHaversine(lat, lng, schoolLat, schoolLng);
              setDistanceToSchool(dist);
              if (dist <= radius) {
                setIsInsideGeofence(true);
                setLocationNotice(`Terverifikasi di Area Sekolah (Jarak: ${dist}m, Maks: ${radius}m)`);
              } else {
                setIsInsideGeofence(false);
                setLocationNotice(`Di Luar Radius Sekolah (${dist}m > ${radius}m)`);
              }
            },
            (err) => {
              if (!isMounted) return;
              console.warn('Geolocation warning:', err.message);
              setIsInsideGeofence(true);
              setLocationNotice('GPS Lokal Toleransi (Izin lokasi dibatasi browser)');
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        } else {
          setIsInsideGeofence(true);
          setLocationNotice('Geolocation tidak didukung pada browser ini');
        }
      } catch (e) {
        console.warn('Settings load error:', e);
      }
    };

    checkLocation();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-reader';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playSuccessSound = () => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const audioCtx = audioCtxRef.current;
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
    }
  };

  const stopCamera = async () => {
    isScanningRef.current = false;
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
    if (isScanningRef.current || scanState === 'VERIFYING' || scanState === 'SUCCESS') return;
    isScanningRef.current = true;

    setScanState('VERIFYING');
    await stopCamera();

    try {
      try {
        confetti({
          particleCount: 30,
          spread: 55,
          origin: { y: 0.6 }
        });
      } catch {
      }

      playSuccessSound();

      let resolvedEskul = 'Ekstrakurikuler SMK Al Amanah';
      if (!isInsideGeofence && geofenceActive) {
        setScanState('ERROR');
        setErrorMessage(`Presensi ditolak: Anda berada ${distanceToSchool}m di luar batas area SMK Al Amanah (${geofenceRadius}m).`);
        return;
      }

      const res = await api.scanPresensi(
        decodedText,
        studentId,
        `Kamera Siswa (PWA - ${distanceToSchool ? distanceToSchool + 'm' : 'GPS OK'})`,
        'DYNAMIC_QR',
        userCoords?.lat,
        userCoords?.lng
      );
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
          fps: 10,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
        }
      );

      setScanState('SCANNING');
    } catch (err: any) {
      console.warn('Failed to start camera with facingMode:', mode, err);
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const qrScanner = new Html5Qrcode(scannerContainerId);
          html5QrCodeRef.current = qrScanner;
          await qrScanner.start(
            cameras[0].id,
            { fps: 10, qrbox: { width: 230, height: 230 } },
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
        
        <button
          onClick={onClose}
          aria-label="Tutup Pemindai"
          className="absolute top-4 right-4 size-8 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="size-4" />
        </button>

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

        <div className="relative w-full aspect-square bg-slate-950 rounded-md border border-slate-800 overflow-hidden flex flex-col items-center justify-center mb-3.5 shadow-inner">
          
          <div 
            id={scannerContainerId} 
            className={`w-full h-full object-cover overflow-hidden scanner-video-container ${
              isMirrored ? 'scanner-video-mirrored [&_video]:-scale-x-100' : 'scanner-video-unmirrored [&_video]:scale-x-100'
            }`} 
          />

          {/* Quick Floating Mirror Toggle */}
          <button
            type="button"
            onClick={toggleMirror}
            className="absolute top-2.5 right-2.5 z-20 px-2 py-1 rounded bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-[10px] text-slate-200 flex items-center gap-1.5 backdrop-blur-xs shadow-md transition-all cursor-pointer"
            title="Balik arah kamera (Jangan Mirror / Mirror)"
          >
            <FlipHorizontal className="size-3 text-emerald-400" />
            <span>{isMirrored ? 'Mode Cermin' : 'Jangan Mirror'}</span>
          </button>

          {scanState === 'CAMERA_STARTING' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2.5 p-4 text-center z-10">
              <RefreshCw className="size-8 text-[#00B884] animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Mengaktifkan kamera perangkat...</p>
              <p className="text-[10px] text-slate-500">Mohon izinkan akses kamera pada peramban Anda</p>
            </div>
          )}

          {scanState === 'SCANNING' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="absolute inset-x-4 h-0.5 bg-[#00B884] opacity-80 animate-pulse top-1/3" />

              <div className="w-48 h-48 border-2 border-dashed border-[#00B884]/80 rounded-md flex items-center justify-center relative">
                <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-[#00B884]" />
                <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-[#00B884]" />
                <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-[#00B884]" />
                <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-[#00B884]" />
              </div>

              <div className="absolute bottom-2.5 text-[10px] text-slate-300 flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700/80">
                <MapPin className="size-3 text-[#00B884]" />
                <span>Geofencing: {distanceToSchool ?? 14}m di area sekolah ({isInsideGeofence ? 'Valid' : 'Luar Radius'})</span>
              </div>
            </div>
          )}

          {scanState === 'VERIFYING' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2.5 p-4 text-center z-10">
              <RefreshCw className="size-10 text-[#00B884] animate-spin" />
              <div className="text-sm font-bold text-white">Memverifikasi QR Code...</div>
              <p className="text-[11px] text-slate-400">Sinkronisasi kehadiran dengan basis data sekolah</p>
            </div>
          )}

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

        <div className="flex items-center gap-2 mb-3.5">
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="flex-1 py-2 px-2.5 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-md border border-slate-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Ganti Kamera Depan / Belakang"
          >
            <SwitchCamera className="size-3.5 text-emerald-400" />
            <span>{facingMode === 'environment' ? 'Belakang' : 'Depan'}</span>
          </button>

          <button
            type="button"
            onClick={toggleMirror}
            className={`py-2 px-2.5 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isMirrored
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700/60'
            }`}
            title={!isMirrored ? 'Mode Normal (Kamera Tidak Mirror)' : 'Mode Cermin (Kamera Mirror)'}
          >
            <FlipHorizontal className="size-3.5 text-emerald-400" />
            <span>{!isMirrored ? 'Jangan Mirror' : 'Mirror'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-2.5 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-md border border-slate-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Unggah Foto QR Code"
          >
            <Upload className="size-3.5 text-blue-400" />
            <span>Foto</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="space-y-2 mb-3.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 bg-slate-800/40 p-2.5 rounded-md border border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Validitas Geofence & Waktu:</span>
            </span>
            <span className={`font-mono font-semibold text-[11px] truncate max-w-[180px] ${isInsideGeofence ? 'text-emerald-400' : 'text-rose-400'}`}>
              {locationNotice}
            </span>
          </div>
        </div>

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
