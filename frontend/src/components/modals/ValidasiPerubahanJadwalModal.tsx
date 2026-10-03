import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PengajuanJadwal, User } from '../../types';

interface ValidasiPerubahanJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  proposals: PengajuanJadwal[];
  onValidate: (
    proposalId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    catatanKoordinator?: string
  ) => Promise<void>;
}

export const ValidasiPerubahanJadwalModal: React.FC<ValidasiPerubahanJadwalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  proposals,
  onValidate,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [selectedProposal, setSelectedProposal] = useState<PengajuanJadwal | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const pendingProposals = proposals.filter((p) => p.status === 'MENUNGGU_VALIDASI');
  const historyProposals = proposals.filter((p) => p.status !== 'MENUNGGU_VALIDASI');

  const displayedList = activeTab === 'PENDING' ? pendingProposals : historyProposals;

  const handleOpenAction = (prop: PengajuanJadwal, type: 'APPROVE' | 'REJECT') => {
    setSelectedProposal(prop);
    setActionType(type);
    setCatatan(
      type === 'APPROVE'
        ? 'Disetujui. Fasilitas dan penyesuaian jadwal telah dikoordinasikan.'
        : ''
    );
    setErrorMsg('');
  };

  const handleConfirmAction = async () => {
    if (!selectedProposal || !actionType) return;

    if (actionType === 'REJECT' && (!catatan.trim() || catatan.trim().length < 5)) {
      setErrorMsg('Alasan penolakan permohonan wajib diisi minimal 5 karakter agar pembina dapat merevisi jadwal.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      await onValidate(
        selectedProposal.id,
        actionType === 'APPROVE' ? 'DISETUJUI' : 'DITOLAK',
        catatan.trim()
      );
      setSelectedProposal(null);
      setActionType(null);
      setCatatan('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses validasi permohonan.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
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
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-600 to-[#00B884] text-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Portal Validasi Koordinator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Validasi Permohonan Perubahan Jadwal
                </h2>
                <p className="text-teal-50 text-xs">
                  Verifikasi dan sahkan usulan hari, jam, dan lokasi latihan dari pembina ekstrakurikuler.
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

            {/* Tab switch */}
            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => { setActiveTab('PENDING'); setSelectedProposal(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-[#00B884] shadow-sm'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <span>Menunggu Validasi</span>
                {pendingProposals.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
                    {pendingProposals.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('HISTORY'); setSelectedProposal(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-[#00B884] shadow-sm'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <span>Riwayat Selesai</span>
                <span className="text-[10px] opacity-80">({historyProposals.length})</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {displayedList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-[1.5]" />
                <h4 className="text-sm font-bold text-slate-800">
                  {activeTab === 'PENDING'
                    ? 'Tidak Ada Permohonan Menunggu'
                    : 'Belum Ada Riwayat Validasi'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'PENDING'
                    ? 'Seluruh permohonan perubahan jadwal dari pembina telah divalidasi dengan baik.'
                    : 'Permohonan yang telah Anda setujui atau tolak akan diarsipkan di sini untuk audit.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedList.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                  >
                    {/* Header Item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">
                            {prop.namaEskul}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {prop.kategoriEskul || 'Eskul'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Diajukan oleh: <strong>{prop.pembinaNama}</strong> • {new Date(prop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {prop.status === 'MENUNGGU_VALIDASI' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Menunggu Validasi
                          </span>
                        )}
                        {prop.status === 'DISETUJUI' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Disetujui
                          </span>
                        )}
                        {prop.status === 'DITOLAK' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-600" /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      {/* Old */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jadwal Lama</div>
                        <div className="font-bold text-slate-800">Hari {prop.hariLama}</div>
                        <div className="font-mono text-[11px]">{prop.jamMulaiLama} - {prop.jamSelesaiLama} WIB</div>
                        <div className="truncate text-slate-500">{prop.lokasiLama}</div>
                      </div>

                      {/* New */}
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-1">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                          <span>Jadwal Baru Diusulkan</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 font-bold uppercase">{prop.jenisPerubahan}</span>
                        </div>
                        <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span>Hari {prop.hariBaru}</span>
                        </div>
                        <div className="font-mono text-[11px] text-emerald-800 font-bold">{prop.jamMulaiBaru} - {prop.jamSelesaiBaru} WIB</div>
                        <div className="truncate text-emerald-700">{prop.lokasiBaru || prop.lokasiLama}</div>
                      </div>
                    </div>

                    {/* Alasan */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-700 mb-0.5">Alasan Permohonan:</div>
                      <p className="text-slate-600 italic leading-relaxed">"{prop.alasan}"</p>
                    </div>

                    {/* Catatan Koordinator if exists */}
                    {prop.catatanKoordinator && (
                      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900">
                        <div className="font-bold flex items-center gap-1.5 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                          <span>Catatan Koordinator ({prop.diverifikasiOlehNama || 'Viska A. Zulkarnaen'}):</span>
                        </div>
                        <p className="text-teal-800">{prop.catatanKoordinator}</p>
                      </div>
                    )}

                    {/* Action Buttons for Pending */}
                    {prop.status === 'MENUNGGU_VALIDASI' && (
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(prop, 'REJECT')}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Tolak Permohonan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAction(prop, 'APPROVE')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 fill-white" />
                          <span>Setujui &amp; Terapkan Jadwal</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Dialog Confirmation Modal */}
            {selectedProposal && actionType && (
              <div className="p-4 rounded-2xl border-2 border-[#00B884] bg-emerald-50/40 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {actionType === 'APPROVE' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Konfirmasi Persetujuan Perubahan Jadwal</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Konfirmasi Penolakan Usulan Jadwal</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedProposal(null); setActionType(null); }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  {actionType === 'APPROVE' ? (
                    <span>
                      Jadwal cabang <strong>{selectedProposal.namaEskul}</strong> akan langsung diperbarui ke hari <strong>{selectedProposal.hariBaru}</strong> pukul <strong>{selectedProposal.jamMulaiBaru} - {selectedProposal.jamSelesaiBaru} WIB</strong>.
                    </span>
                  ) : (
                    <span>
                      Usulan perubahan jadwal akan ditolak. Berikan catatan edukatif kepada pembina <strong>{selectedProposal.pembinaNama}</strong> mengenai alasan penolakan.
                    </span>
                  )}
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {actionType === 'APPROVE' ? 'Catatan Tambahan Koordinator (Opsional):' : 'Alasan Penolakan (Wajib):'}
                  </label>
                  <textarea
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder={
                      actionType === 'APPROVE'
                        ? 'Contoh: Disetujui. Fasilitas lapangan indoor telah dijadwalkan.'
                        : 'Contoh: Pada hari tersebut lapangan sudah penuh digunakan cabang basket.'
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedProposal(null); setActionType(null); }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmAction}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${
                      actionType === 'APPROVE'
                        ? 'bg-[#00B884] hover:bg-[#009e70]'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : actionType === 'APPROVE' ? 'Sahkan Perubahan Jadwal' : 'Kirim Penolakan'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Login sebagai: <strong>{currentUser.namaLengkap}</strong> ({currentUser.role})</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
