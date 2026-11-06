import React, { useState, useMemo } from 'react';
import { 
  X, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Eskul, StudentProfile } from '../../types';
import { api } from '../../services/api';
import { pushSystemNotification } from '../../utils/notificationService';

interface DaftarEskulModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  allEskuls: Eskul[];
  enrolledEskuls: Eskul[];
  onSuccess: () => void;
}

export const DaftarEskulModal: React.FC<DaftarEskulModalProps> = ({
  isOpen,
  onClose,
  student,
  allEskuls,
  enrolledEskuls,
  onSuccess,
}) => {
  const isMaxReached = enrolledEskuls.length >= 2;

  // Saring eskul yang belum diikuti
  const availableEskuls = useMemo(() => {
    const enrolledIds = enrolledEskuls.map(e => e.id);
    return allEskuls.filter(e => !enrolledIds.includes(e.id));
  }, [allEskuls, enrolledEskuls]);

  const [selectedEskulId, setSelectedEskulId] = useState<string>(availableEskuls[0]?.id || '');
  const [alasanDaftar, setAlasanDaftar] = useState<string>('Berminat mengembangkan minat dan bakat serta berkomitmen aktif mengikuti jadwal latihan rutin.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync selected eskul jika availableEskuls berubah
  React.useEffect(() => {
    if (availableEskuls.length > 0 && (!selectedEskulId || !availableEskuls.some(e => e.id === selectedEskulId))) {
      setSelectedEskulId(availableEskuls[0].id);
    }
  }, [availableEskuls, selectedEskulId]);

  if (!isOpen) return null;

  const selectedEskul = availableEskuls.find(e => e.id === selectedEskulId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMaxReached) {
      setErrorMsg('Anda telah mencapai batas maksimal 2 ekstrakurikuler.');
      return;
    }

    if (!selectedEskulId) {
      setErrorMsg('Silakan pilih ekstrakurikuler yang ingin didaftar.');
      return;
    }

    if (!alasanDaftar.trim()) {
      setErrorMsg('Alasan / motivasi mendaftar wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.daftarEskul({
        eskulId: selectedEskulId,
        siswaId: student.id,
        alasanDaftar: alasanDaftar.trim(),
      });

      if (res.success || !res.isAlreadyRegistered) {
        // Broadcast notifikasi ke Pembina eskul terkait dan Koordinator/Admin
        pushSystemNotification({
          title: `Pendaftaran Baru: ${selectedEskul?.namaEskul || 'Ekstrakurikuler'}`,
          desc: `Siswa ${student.namaLengkap} (${student.kelas || 'Siswa'}) mendaftar ke ekstrakurikuler ${selectedEskul?.namaEskul}. Motivasi: "${alasanDaftar.trim()}"`,
          category: 'PENDAFTARAN',
          senderName: student.namaLengkap,
          time: 'Baru saja',
          type: 'info',
          targetRoles: ['PEMBINA', 'KOORDINATOR', 'ADMIN'],
        });

        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Pendaftaran tidak dapat diproses.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim pendaftaran eskul. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[94vw] max-w-lg p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92dvh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-50 text-[#00B884] flex items-center justify-center border border-emerald-100 shadow-2xs">
              <Award className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pendaftaran Ekstrakurikuler Baru
              </h3>
              <p className="text-xs text-slate-500">
                Tahun Ajaran 2026/2027 • Siswa: <span className="font-semibold text-slate-800">{student.namaLengkap}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Status Kuota Cabang */}
        <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-emerald-600 shrink-0" />
            <span className="text-xs text-slate-700 font-medium">Batas Maksimal Ekstrakurikuler:</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            isMaxReached 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            {enrolledEskuls.length} / 2 Cabang Diikuti
          </span>
        </div>

        {isMaxReached ? (
          <div className="space-y-4 my-2">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm text-amber-800">
                <AlertCircle className="size-4 text-amber-600" />
                <span>Batas Maksimal 2 Eskul Telah Tercapai</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Kebijakan sekolah SMK Al-Amanah membatasi setiap siswa maksimal mengikuti <strong>2 cabang ekstrakurikuler</strong> guna menjaga keseimbangan akademik dan kegiatan pengembangan diri.
              </p>
              <div className="pt-2 border-t border-amber-200/80">
                <span className="font-semibold block mb-1">Eskul yang Anda ikuti saat ini:</span>
                <ul className="list-disc list-inside space-y-0.5 font-medium">
                  {enrolledEskuls.map(e => (
                    <li key={e.id}>{e.namaEskul} ({e.jadwalHari}, {e.jamMulai} WIB)</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
            {errorMsg && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Pilihan Eskul */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Cabang Ekstrakurikuler:
              </label>
              {availableEskuls.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Tidak ada eskul lain yang tersedia.</p>
              ) : (
                <select
                  value={selectedEskulId}
                  onChange={(e) => setSelectedEskulId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00B884]"
                >
                  {availableEskuls.map((eskul) => (
                    <option key={eskul.id} value={eskul.id}>
                      {eskul.namaEskul} ({eskul.kategori}) • Hari {eskul.jadwalHari}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Detail Eskul Terpilih */}
            {selectedEskul && (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{selectedEskul.namaEskul}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedEskul.kategori}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedEskul.pembinaNama || 'Guru Pembina'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Setiap {selectedEskul.jadwalHari}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{selectedEskul.jamMulai} - {selectedEskul.jamSelesai} WIB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedEskul.lokasi}</span>
                  </div>
                </div>
                {selectedEskul.deskripsi && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 line-clamp-2">
                    {selectedEskul.deskripsi}
                  </p>
                )}
              </div>
            )}

            {/* Alasan / Motivasi Mendaftar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alasan / Motivasi Bergabung:
              </label>
              <textarea
                rows={3}
                value={alasanDaftar}
                onChange={(e) => setAlasanDaftar(e.target.value)}
                placeholder="Tuliskan alasan mengapa Anda tertarik bergabung dengan ekstrakurikuler ini..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B884]"
              />
              <span className="text-[10px] text-slate-400">
                Pesan ini akan ditinjau oleh Guru Pembina saat seleksi berkas calon anggota.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-md hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || availableEskuls.length === 0}
                className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <Send className="size-3.5" />
                <span>{isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Resmi'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
