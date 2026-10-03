import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eskul } from '../../types';

interface BukaAbsensiModalProps {
  isOpen: boolean;
  eskul: Eskul | null;
  onClose: () => void;
  onConfirm: (sessionData: {
    eskul: Eskul;
    judul: string;
    deskripsi: string;
    jamMulai: string;
    jamSelesai: string;
    lokasi: string;
  }) => void;
}

export const BukaAbsensiModal: React.FC<BukaAbsensiModalProps> = ({
  isOpen,
  eskul,
  onClose,
  onConfirm,
}) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jamMulai, setJamMulai] = useState('15:30');
  const [jamSelesai, setJamSelesai] = useState('17:00');
  const [lokasi, setLokasi] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggested quick topics based on eskul category
  const suggestedTopics = React.useMemo(() => {
    if (!eskul) return [];
    if (eskul.kategori === 'Olahraga') {
      return [
        {
          judul: 'Latihan Taktik & Penguatan Fisik',
          deskripsi: 'Hari ini membahas transisi bertahan ke menyerang, drill passing 1-2 sentuhan, dan simulasi tanding mini match 2x15 menit.',
        },
        {
          judul: 'Drill Akurasi & Finishing Lapangan',
          deskripsi: 'Hari ini membahas teknik penempatan bola, latihan shooting target sudut sempit, dan evaluasi fisik kelincahan.',
        },
      ];
    }
    if (eskul.kategori === 'Teknologi') {
      return [
        {
          judul: 'Praktik REST API & Integrasi QR Token',
          deskripsi: 'Hari ini membahas mekanisme enkripsi token TOTP 15 detik, validasi request server, dan praktik testing API di Postman.',
        },
        {
          judul: 'Slicing UI Dashboard & State Management',
          deskripsi: 'Hari ini membahas layouting responsive, integrasi micro-interactions Framer Motion, dan sinkronisasi data antar modul.',
        },
      ];
    }
    return [
      {
        judul: 'PBB Dasar & Pembinaan Disiplin',
        deskripsi: 'Hari ini membahas kerapian langkah tegap, sinkronisasi tempo baris-berbaris, dan penguatan mental kepemimpinan.',
      },
      {
        judul: 'Pendalaman Materi & Evaluasi Mingguan',
        deskripsi: 'Hari ini membahas materi lanjutan mingguan, praktik kelompok, dan evaluasi kehadiran serta keaktifan anggota.',
      },
    ];
  }, [eskul]);

  // Sync state when eskul changes or modal opens
  useEffect(() => {
    if (eskul && isOpen) {
      setJamMulai(eskul.jamMulai || '15:30');
      setJamSelesai(eskul.jamSelesai || '17:00');
      setLokasi(eskul.lokasi || 'SMK Al Amanah');
      setErrorMsg('');
      setIsSubmitting(false);

      // Default prefill if empty
      if (!judul) {
        setJudul(`Pertemuan Rutin & Latihan ${eskul.namaEskul}`);
      }
      if (!deskripsi) {
        setDeskripsi(
          `Hari ini membahas agenda latihan rutin ${eskul.namaEskul}, pemantapan materi dasar, dan praktik langsung di ${eskul.lokasi}.`
        );
      }
    }
  }, [eskul, isOpen]);

  const handleApplySuggestion = (topic: { judul: string; deskripsi: string }) => {
    setJudul(topic.judul);
    setDeskripsi(topic.deskripsi);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eskul) return;

    if (!judul.trim()) {
      setErrorMsg('Judul pertemuan / topik hari ini wajib diisi.');
      return;
    }

    if (!deskripsi.trim()) {
      setErrorMsg('Deskripsi apa yang dibahas dan latihan apa hari ini wajib diisi.');
      return;
    }

    if (deskripsi.trim().length < 10) {
      setErrorMsg('Deskripsi terlalu singkat. Mohon jelaskan rincian bahasan dan latihan minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);
    onConfirm({
      eskul,
      judul: judul.trim(),
      deskripsi: deskripsi.trim(),
      jamMulai,
      jamSelesai,
      lokasi: lokasi.trim() || eskul.lokasi,
    });
  };

  if (!isOpen || !eskul) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-700 text-white relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Buka Sesi Presensi &amp; QR Dinamis</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Form Pembukaan Absensi
                </h2>
                <p className="text-emerald-50 text-xs leading-relaxed">
                  Cabang: <strong>{eskul.namaEskul}</strong> ({eskul.kategori})
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-[#00B884]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pilihan Rekomendasi Topik Cepat:
                </span>
                <span className="text-slate-400">Klik untuk menerapkan</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTopics.map((top, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySuggestion(top)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] font-medium rounded-xl transition-colors cursor-pointer text-left"
                  >
                    ✨ {top.judul}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Judul Pertemuan (WAJIB) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Judul Pertemuan / Topik Hari Ini <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => {
                  setJudul(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Latihan Fisik & Taktik Formasi 3-1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 focus:border-[#00B884]"
              />
              <p className="text-[10px] text-slate-400">
                Judul topik akan terpampang jelas di layar proyektor QR dan aplikasi siswa.
              </p>
            </div>

            {/* 2. Deskripsi Bahasan & Latihan (WAJIB) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Rincian Bahasan &amp; Materi Latihan <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Hari ini membahas apa &amp; latihan apa</span>
              </label>
              <textarea
                rows={3}
                required
                value={deskripsi}
                onChange={(e) => {
                  setDeskripsi(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Hari ini membahas teori transisi menyerang ke bertahan, kemudian latihan drill passing kombinasi 1-2 sentuhan, dan ditutup mini match 2x15 menit."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 focus:border-[#00B884] leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Catatan ini otomatis tercatat dalam jurnal presensi dan laporan eskul.</span>
                <span>{deskripsi.length} karakter</span>
              </div>
            </div>

            {/* 3. Detail Waktu & Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jam Pelaksanaan</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                  />
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lokasi Fasilitas</span>
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Lokasi kegiatan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !judul.trim() || !deskripsi.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSubmitting ? 'Membuka Presensi...' : 'Buka Presensi Sekarang'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
