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
          className="bg-white rounded-lg w-[92vw] max-w-2xl shadow-xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90dvh]"
        >
          <div className="p-6 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold">
                  <ShieldCheck className="size-3.5" />
                  <span>Portal Validasi Koordinator</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Validasi Permohonan Perubahan Jadwal
                </h2>
                <p className="text-slate-500 text-xs">
                  Verifikasi dan sahkan usulan hari, jam, dan lokasi latihan dari pembina ekstrakurikuler.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-100 rounded-md w-fit">
              <button
                type="button"
                onClick={() => { setActiveTab('PENDING'); setSelectedProposal(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Menunggu Validasi</span>
                {pendingProposals.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {pendingProposals.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('HISTORY'); setSelectedProposal(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Riwayat Selesai</span>
                <span className="text-[10px] text-slate-400">({historyProposals.length})</span>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="size-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {displayedList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto stroke-[1.5]" />
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
                    className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {prop.namaEskul}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {prop.kategoriEskul || 'Eskul'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Diajukan oleh: <strong>{prop.pembinaNama}</strong> • {new Date(prop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {prop.status === 'MENUNGGU_VALIDASI' && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Menunggu Validasi
                          </span>
                        )}
                        {prop.status === 'DISETUJUI' && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="size-3 text-emerald-600" /> Disetujui
                          </span>
                        )}
                        {prop.status === 'DITOLAK' && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <X className="size-3 text-rose-600" /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jadwal Lama</div>
                        <div className="font-bold text-slate-800">Hari {prop.hariLama}</div>
                        <div className="font-mono text-[11px]">{prop.jamMulaiLama} - {prop.jamSelesaiLama} WIB</div>
                        <div className="truncate text-slate-500">{prop.lokasiLama}</div>
                      </div>

                      <div className="p-3 rounded-md bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-1">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                          <span>Jadwal Baru Diusulkan</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-200 text-emerald-900 font-bold uppercase">{prop.jenisPerubahan}</span>
                        </div>
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <ArrowRight className="size-3 text-emerald-600" />
                          <span>Hari {prop.hariBaru}</span>
                        </div>
                        <div className="font-mono text-[11px] text-emerald-800 font-bold">{prop.jamMulaiBaru} - {prop.jamSelesaiBaru} WIB</div>
                        <div className="truncate text-emerald-700">{prop.lokasiBaru || prop.lokasiLama}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-700 mb-0.5">Alasan Permohonan:</div>
                      <p className="text-slate-600 italic leading-relaxed">"{prop.alasan}"</p>
                    </div>

                    {prop.catatanKoordinator && (
                      <div className="p-3 bg-teal-50/60 rounded-md border border-teal-200 text-xs text-teal-900">
                        <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                          <ShieldCheck className="size-3.5 text-teal-700" />
                          <span>Catatan Koordinator ({prop.diverifikasiOlehNama || 'Viska A. Zulkarnaen'}):</span>
                        </div>
                        <p className="text-teal-800">{prop.catatanKoordinator}</p>
                      </div>
                    )}

                    {prop.status === 'MENUNGGU_VALIDASI' && (
                      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(prop, 'APPROVE')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#00B884] hover:bg-[#009e70] active:scale-98 text-white font-semibold text-xs rounded-md shadow-xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="size-4" />
                          <span>Setujui Jadwal</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAction(prop, 'REJECT')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-md font-semibold text-xs transition-all cursor-pointer"
                        >
                          <XCircle className="size-4 text-rose-600" />
                          <span>Tolak Jadwal</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedProposal && actionType && (
              <div className="p-4 rounded-lg border border-[#00B884]/40 bg-emerald-50/30 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {actionType === 'APPROVE' ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>Konfirmasi Persetujuan Perubahan Jadwal</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4 text-rose-600" />
                        <span>Konfirmasi Penolakan Usulan Jadwal</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedProposal(null); setActionType(null); }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="size-4" />
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
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
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
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedProposal(null); setActionType(null); }}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmAction}
                    className={`w-full py-2 px-3 rounded-md text-xs font-semibold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      actionType === 'APPROVE'
                        ? 'bg-[#00B884] hover:bg-[#009e70]'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : actionType === 'APPROVE' ? 'Setujui Jadwal' : 'Tolak Jadwal'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Login sebagai: <strong>{currentUser.namaLengkap}</strong> ({currentUser.role})</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
