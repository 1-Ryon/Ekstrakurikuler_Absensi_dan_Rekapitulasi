import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Send, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eskul, User } from '../../types';

interface AjukanPerubahanJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pembina: User;
  coachedEskuls: Eskul[];
  allEskuls: Eskul[];
  onSubmitProposal: (proposalData: {
    eskulId: string;
    pembinaId: string;
    hariBaru: string;
    jamMulaiBaru: string;
    jamSelesaiBaru: string;
    lokasiBaru: string;
    jenisPerubahan: 'PERMANEN' | 'SEMENTARA';
    tanggalEfektif?: string;
    alasan: string;
  }) => Promise<void>;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const AjukanPerubahanJadwalModal: React.FC<AjukanPerubahanJadwalModalProps> = ({
  isOpen,
  onClose,
  pembina,
  coachedEskuls,
  allEskuls,
  onSubmitProposal,
}) => {
  const [selectedEskulId, setSelectedEskulId] = useState<string>('');
  const [hariBaru, setHariBaru] = useState('Sabtu');
  const [jamMulaiBaru, setJamMulaiBaru] = useState('08:00');
  const [jamSelesaiBaru, setJamSelesaiBaru] = useState('10:30');
  const [lokasiBaru, setLokasiBaru] = useState('');
  const [jenisPerubahan, setJenisPerubahan] = useState<'PERMANEN' | 'SEMENTARA'>('PERMANEN');
  const [tanggalEfektif, setTanggalEfektif] = useState('');
  const [alasan, setAlasan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected eskul
  useEffect(() => {
    if (coachedEskuls.length > 0 && (!selectedEskulId || !coachedEskuls.some(e => e.id === selectedEskulId))) {
      setSelectedEskulId(coachedEskuls[0].id);
    }
  }, [coachedEskuls, selectedEskulId]);

  const activeEskul = useMemo(() => {
    return coachedEskuls.find(e => e.id === selectedEskulId) || coachedEskuls[0];
  }, [coachedEskuls, selectedEskulId]);

  useEffect(() => {
    if (activeEskul && isOpen) {
      setLokasiBaru(activeEskul.lokasi || 'SMK Al Amanah');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [activeEskul, isOpen]);

  // Check possible facility or day conflicts with other eskuls
  const potentialConflicts = useMemo(() => {
    if (!activeEskul || !hariBaru) return [];
    return allEskuls.filter(
      (e) =>
        e.id !== activeEskul.id &&
        e.jadwalHari.toLowerCase() === hariBaru.toLowerCase() &&
        lokasiBaru &&
        e.lokasi.toLowerCase().includes(lokasiBaru.toLowerCase().trim())
    );
  }, [allEskuls, activeEskul, hariBaru, lokasiBaru]);

  if (!isOpen || !activeEskul) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alasan.trim() || alasan.trim().length < 5) {
      setErrorMsg('Alasan permohonan perubahan jadwal wajib diisi minimal 5 karakter agar dapat ditelaah oleh Koordinator.');
      return;
    }

    if (hariBaru === activeEskul.jadwalHari && jamMulaiBaru === activeEskul.jamMulai && jamSelesaiBaru === activeEskul.jamSelesai && lokasiBaru === activeEskul.lokasi) {
      setErrorMsg('Jadwal baru yang diajukan sama persis dengan jadwal yang sedang berjalan.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmitProposal({
        eskulId: activeEskul.id,
        pembinaId: pembina.id,
        hariBaru,
        jamMulaiBaru,
        jamSelesaiBaru,
        lokasiBaru: lokasiBaru.trim() || activeEskul.lokasi,
        jenisPerubahan,
        tanggalEfektif: tanggalEfektif || undefined,
        alasan: alasan.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirimkan permohonan perubahan jadwal.';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

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
          <div className="p-6 bg-gradient-to-r from-teal-700 via-[#00B884] to-emerald-700 text-white relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validasi Resmi Koordinator Eskul</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Pengajuan Perubahan Jadwal
                </h2>
                <p className="text-teal-50 text-xs leading-relaxed">
                  Permohonan akan diteruskan ke Koordinator Ekstrakurikuler untuk divalidasi &amp; disahkan.
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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

            {/* 1. Pilih Eskul yang dibina */}
            {coachedEskuls.length > 1 ? (
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Pilih Cabang Ekstrakurikuler:
                </label>
                <select
                  value={selectedEskulId}
                  onChange={(e) => setSelectedEskulId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                >
                  {coachedEskuls.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.namaEskul} ({e.jadwalHari}, {e.jamMulai} - {e.jamSelesai})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cabang Eskul Binaan</span>
                  <div className="font-extrabold text-slate-900 text-sm">{activeEskul.namaEskul}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] font-bold rounded-lg border border-emerald-100 text-[11px]">
                  {activeEskul.kategori}
                </span>
              </div>
            )}

            {/* 2. Side-by-side comparison: Jadwal Sekarang vs Jadwal Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box Jadwal Saat Ini (Read-only) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Jadwal Saat Ini
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">Aktif</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hari {activeEskul.jadwalHari}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeEskul.jamMulai} - {activeEskul.jamSelesai} WIB</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activeEskul.lokasi}</span>
                  </div>
                </div>
              </div>

              {/* Box Jadwal Baru Yang Diajukan */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-[#00B884]" />
                    Jadwal Yang Diajukan
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">Usulan</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Hari Baru</label>
                    <select
                      value={hariBaru}
                      onChange={(e) => setHariBaru(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/40"
                    >
                      {HARI_LIST.map((h) => (
                        <option key={h} value={h}>Hari {h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Jam Latihan</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="time"
                        value={jamMulaiBaru}
                        onChange={(e) => setJamMulaiBaru(e.target.value)}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#00B884]/40"
                      />
                      <input
                        type="time"
                        value={jamSelesaiBaru}
                        onChange={(e) => setJamSelesaiBaru(e.target.value)}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#00B884]/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Lokasi & Jenis Perubahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Lokasi Fasilitas Baru (Opsional):
                </label>
                <input
                  type="text"
                  value={lokasiBaru}
                  onChange={(e) => setLokasiBaru(e.target.value)}
                  placeholder={activeEskul.lokasi}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Sifat Perubahan Jadwal:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setJenisPerubahan('PERMANEN')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      jenisPerubahan === 'PERMANEN'
                        ? 'bg-[#00B884] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Permanen (Rutin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisPerubahan('SEMENTARA')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      jenisPerubahan === 'SEMENTARA'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sementara (Mingguan)
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Tanggal Efektif (jika sementara atau terjadwal) */}
            {jenisPerubahan === 'SEMENTARA' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Mulai Berlaku Pada Tanggal:
                </label>
                <input
                  type="date"
                  value={tanggalEfektif}
                  onChange={(e) => setTanggalEfektif(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                />
              </div>
            )}

            {/* Potential conflict hint */}
            {potentialConflicts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Peringatan Kemungkinan Penggunaan Fasilitas Bersamaan:</span>
                </div>
                <p>
                  Di hari {hariBaru}, eskul <strong>{potentialConflicts.map(c => c.namaEskul).join(', ')}</strong> juga terdaftar di lokasi yang serupa ({lokasiBaru}). Koordinator akan menelaah izin pemakaian ruang.
                </p>
              </div>
            )}

            {/* 5. Alasan Pengajuan (WAJIB) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Alasan Pengajuan Perubahan Jadwal <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Wajib diisi untuk Koordinator</span>
              </label>
              <textarea
                rows={3}
                required
                value={alasan}
                onChange={(e) => {
                  setAlasan(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: Mengalihkan jadwal latihan dari Jumat sore ke Sabtu pagi agar durasi latihan fisik lebih maksimal dan tidak bentrok dengan pendalaman materi kelas 12."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 focus:border-[#00B884] leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Koordinator akan menerima pemberitahuan permohonan ini untuk divalidasi.</span>
                <span>{alasan.length} karakter</span>
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
                disabled={isSubmitting || !alasan.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan ke Koordinator'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
