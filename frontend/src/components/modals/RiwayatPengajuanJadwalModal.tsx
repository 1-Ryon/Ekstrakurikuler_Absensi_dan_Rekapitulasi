import React from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PengajuanJadwal, User } from '../../types';

interface RiwayatPengajuanJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pembina: User;
  proposals: PengajuanJadwal[];
  onOpenAddNew: () => void;
}

export const RiwayatPengajuanJadwalModal: React.FC<RiwayatPengajuanJadwalModalProps> = ({
  isOpen,
  onClose,
  pembina,
  proposals,
  onOpenAddNew,
}) => {
  if (!isOpen) return null;

  // Filter proposals submitted by this pembina or matching their coached eskuls
  const myProposals = proposals.filter((p) => {
    if (p.pembinaId === pembina.id) return true;
    const nameKeywords = (pembina.namaLengkap || '').toLowerCase().split(' ');
    return nameKeywords.some((kw) => kw.length > 2 && (p.pembinaNama || '').toLowerCase().includes(kw));
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-700 text-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Riwayat Usulan Jadwal</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Status Pengajuan Jadwal Saya
                </h2>
                <p className="text-emerald-50 text-xs">
                  Pantau status verifikasi dan catatan resmi dari Koordinator Ekstrakurikuler.
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

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Total Usulan: {myProposals.length} Pengajuan
              </span>
              <button
                type="button"
                onClick={() => { onClose(); onOpenAddNew(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajukan Baru</span>
              </button>
            </div>

            {myProposals.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <Calendar className="w-9 h-9 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Pengajuan Perubahan Jadwal</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Anda belum pernah mengajukan permohonan ganti jadwal untuk eskul yang Anda bina.
                </p>
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAddNew(); }}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ajukan Perubahan Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {prop.namaEskul}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Diajukan pada {new Date(prop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div>
                        {prop.status === 'MENUNGGU_VALIDASI' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            Menunggu Validasi
                          </span>
                        )}
                        {prop.status === 'DISETUJUI' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disetujui
                          </span>
                        )}
                        {prop.status === 'DITOLAK' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Schedule Comparison */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Jadwal Asal</span>
                        <div className="font-bold text-slate-700 mt-0.5">Hari {prop.hariLama}</div>
                        <div className="font-mono text-slate-500">{prop.jamMulaiLama} - {prop.jamSelesaiLama}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Jadwal Diusulkan</span>
                        <div className="font-bold text-emerald-900 mt-0.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-[#00B884]" /> Hari {prop.hariBaru}
                        </div>
                        <div className="font-mono text-emerald-700 font-bold">{prop.jamMulaiBaru} - {prop.jamSelesaiBaru}</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                      <span className="font-bold text-slate-600">Alasan: </span>
                      <span className="text-slate-600 italic">"{prop.alasan}"</span>
                    </div>

                    {prop.catatanKoordinator && (
                      <div className={`p-2.5 rounded-xl text-[11px] border ${
                        prop.status === 'DISETUJUI'
                          ? 'bg-teal-50 border-teal-200 text-teal-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Tanggapan Koordinator:</span>
                        </div>
                        <p>{prop.catatanKoordinator}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
