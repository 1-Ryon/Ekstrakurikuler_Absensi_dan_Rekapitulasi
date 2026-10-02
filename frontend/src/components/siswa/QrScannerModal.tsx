import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessScan: (studentName: string, eskulName: string) => void;
  currentActiveToken: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccessScan,
  currentActiveToken,
}) => {
  const [scanState, setScanState] = useState<'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('SCANNING');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(18); // 18 meters from school
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanState('SCANNING');
      setScannedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerScan = () => {
    setScanState('VERIFYING');

    // Simulate camera capture and geofencing verification
    setTimeout(() => {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }

      setScanState('SUCCESS');
      setScannedResult('Eskul Futsal - Lapangan Olahraga Utama');
      onSuccessScan('Muhammad Rizky Pratama', 'Eskul Futsal');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00B884] text-xs font-semibold mb-2 border border-emerald-500/20">
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Presensi Siswa</span>
          </div>
          <h3 className="text-lg font-bold">Pindai QR Dinamis Guru</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Arahkan kamera ke layar proyektor / HP guru pembina
          </p>
        </div>

        {/* Scanner Viewfinder Box */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center mb-4">
          {scanState === 'SCANNING' && (
            <>
              {/* Laser scan line animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00B884] to-transparent shadow-[0_0_15px_#00B884] animate-bounce top-1/3" />

              {/* Viewfinder Target corners */}
              <div className="w-48 h-48 border-2 border-dashed border-[#00B884]/70 rounded-xl flex items-center justify-center relative">
                <div className="text-center text-xs text-slate-400 font-mono">
                  Menunggu Target QR...
                </div>
                {/* 4 corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00B884]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00B884]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00B884]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00B884]" />
              </div>

              <div className="absolute bottom-3 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Geofencing: {simulatedDistance}m di area sekolah (Valid)</span>
              </div>
            </>
          )}

          {scanState === 'VERIFYING' && (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-10 h-10 text-[#00B884] animate-spin" />
              <div className="text-sm font-semibold text-slate-200">
                Memverifikasi TOTP Token...
              </div>
              <div className="text-xs text-slate-500">
                Pemeriksaan Keamanan Token
              </div>
            </div>
          )}

          {scanState === 'SUCCESS' && (
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-[#00B884] flex items-center justify-center mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-base font-bold text-white">Presensi Berhasil!</div>
              <div className="text-xs text-emerald-400 font-semibold">{scannedResult}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Status: HADIR (Waktu: {new Date().toLocaleTimeString()} WIB)
              </div>
            </div>
          )}
        </div>

        {/* Geofencing & TOTP Status Info */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Validitas Waktu Token:</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">Tervalidasi &lt; 15s</span>
          </div>
        </div>

        {/* Action Button */}
        {scanState === 'SCANNING' ? (
          <button
            onClick={triggerScan}
            className="w-full py-3 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Pindai QR Sekarang</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Selesai
          </button>
        )}
      </div>
    </div>
  );
};
