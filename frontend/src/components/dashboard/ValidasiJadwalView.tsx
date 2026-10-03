import React, { useState } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PengajuanJadwal, User, Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface ValidasiJadwalViewProps {
  currentUser: User;
  proposals: PengajuanJadwal[];
  eskulList: Eskul[];
  onValidate: (
    proposalId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    catatanKoordinator?: string
  ) => Promise<void>;
}

export const ValidasiJadwalView: React.FC<ValidasiJadwalViewProps> = ({
  currentUser,
  proposals,
  eskulList,
  onValidate,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEskulFilter, setSelectedEskulFilter] = useState('ALL');
  const [selectedProposal, setSelectedProposal] = useState<PengajuanJadwal | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pendingProposals = proposals.filter((p) => p.status === 'MENUNGGU_VALIDASI');
  const historyProposals = proposals.filter((p) => p.status !== 'MENUNGGU_VALIDASI');
  const approvedProposals = proposals.filter((p) => p.status === 'DISETUJUI');

  const filteredProposals = proposals.filter((p) => {
    // Tab filter
    if (activeTab === 'PENDING' && p.status !== 'MENUNGGU_VALIDASI') return false;
    if (activeTab === 'HISTORY' && p.status === 'MENUNGGU_VALIDASI') return false;

    // Eskul filter
    if (selectedEskulFilter !== 'ALL' && p.eskulId !== selectedEskulFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.namaEskul.toLowerCase().includes(q);
      const matchPembina = p.pembinaNama.toLowerCase().includes(q);
      const matchAlasan = p.alasan.toLowerCase().includes(q);
      if (!matchName && !matchPembina && !matchAlasan) return false;
    }

    return true;
  });

  const handleOpenAction = (prop: PengajuanJadwal, type: 'APPROVE' | 'REJECT') => {
    setSelectedProposal(prop);
    setActionType(type);
    setCatatan(
      type === 'APPROVE'
        ? 'Disetujui. Fasilitas dan penyesuaian jadwal latihan telah dikoordinasikan.'
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <CalendarClock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Modul Validasi Koordinator
                </span>
                <span className="text-xs text-slate-400">Verifikator: {currentUser.namaLengkap}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Validasi Perubahan Jadwal Ekstrakurikuler
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Tinjau dan putuskan permohonan pergantian hari, jam, atau lokasi latihan yang diajukan oleh pembina. Jadwal yang disetujui otomatis mengupdate kalender sekolah.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50 border border-amber-200/70 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-xs font-bold text-amber-700 block">Menunggu</span>
              <span className="text-2xl font-black text-amber-600">{pendingProposals.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/70 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-xs font-bold text-emerald-700 block">Disetujui</span>
              <span className="text-2xl font-black text-emerald-600">{approvedProposals.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-xs font-bold text-slate-600 block">Total</span>
              <span className="text-2xl font-black text-slate-800">{proposals.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-white text-amber-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Perlu Tindakan</span>
            {pendingProposals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {pendingProposals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Riwayat Keputusan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {historyProposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Semua Data</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {proposals.length}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari eskul / pembina..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="relative shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedEskulFilter}
              onChange={(e) => setSelectedEskulFilter(e.target.value)}
              className="pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Eskul</option>
              {eskulList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.namaEskul}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposal Cards List */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Permohonan Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {activeTab === 'PENDING'
              ? 'Seluruh permohonan perubahan jadwal dari pembina telah selesai divalidasi. Tidak ada antrean pending!'
              : 'Tidak ditemukan data pengajuan jadwal sesuai kriteria pencarian dan filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProposals.map((prop) => {
            const isPending = prop.status === 'MENUNGGU_VALIDASI';
            const isApproved = prop.status === 'DISETUJUI';
            const isRejected = prop.status === 'DITOLAK';

            return (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  isPending
                    ? 'border-amber-200/90 shadow-sm hover:border-amber-300'
                    : isApproved
                    ? 'border-emerald-200/80'
                    : 'border-rose-200/80'
                }`}
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {prop.kategoriEskul || 'Ekstrakurikuler'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          prop.jenisPerubahan === 'PERMANEN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {prop.jenisPerubahan}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {prop.namaEskul}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {isPending && <Clock className="w-3 h-3 animate-spin" />}
                    {isApproved && <CheckCircle2 className="w-3 h-3" />}
                    {isRejected && <XCircle className="w-3 h-3" />}
                    {isPending ? 'Menunggu Validasi' : isApproved ? 'Disetujui' : 'Ditolak'}
                  </span>
                </div>

                {/* Pembina Info */}
                <div className="flex items-center gap-2.5 py-2 px-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                  <UserAvatar
                    name={prop.pembinaNama}
                    avatarUrl={prop.pembinaAvatar}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {prop.pembinaNama}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Diajukan: {new Date(prop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Comparison: Lama vs Baru */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jadwal Semula
                    </span>
                    <div className="space-y-1 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700">{prop.hariLama}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{prop.jamMulaiLama} - {prop.jamSelesaiLama}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{prop.lokasiLama}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        Jadwal Yang Diajukan
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-600" />
                    </div>
                    <div className="space-y-1 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-amber-900">{prop.hariBaru}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-amber-900">{prop.jamMulaiBaru} - {prop.jamSelesaiBaru}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate font-semibold text-amber-900">{prop.lokasiBaru}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alasan */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Alasan Permohonan:</span>
                  </div>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{prop.alasan}"
                  </p>
                  {prop.tanggalEfektif && (
                    <p className="text-[11px] text-amber-700 font-semibold mt-1.5">
                      Berlaku mulai: {prop.tanggalEfektif}
                    </p>
                  )}
                </div>

                {/* Status/Catatan Verifikator if already validated */}
                {!isPending && (
                  <div className={`p-3 rounded-xl border text-xs mb-2 ${
                    isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Catatan Koordinator:</span>
                    </div>
                    <p className="italic">
                      {prop.catatanKoordinator || (isApproved ? 'Disetujui tanpa catatan khusus.' : 'Ditolak.')}
                    </p>
                    {prop.verifiedAt && (
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Diverifikasi pada: {new Date(prop.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons for Pending */}
                {isPending && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenAction(prop, 'APPROVE')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#00B884] hover:bg-[#009e70] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Jadwal</span>
                    </button>
                    <button
                      onClick={() => handleOpenAction(prop, 'REJECT')}
                      className="py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedProposal && actionType && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                    actionType === 'APPROVE' ? 'bg-[#00B884]' : 'bg-rose-500'
                  }`}
                >
                  {actionType === 'APPROVE' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionType === 'APPROVE' ? 'Konfirmasi Persetujuan Jadwal' : 'Konfirmasi Penolakan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedProposal.namaEskul} ({selectedProposal.pembinaNama})
                  </p>
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 mb-4 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Jadwal akan diperbarui ke sistem:
                  </p>
                  <p className="text-slate-700">
                    <strong>{selectedProposal.hariBaru}</strong>, {selectedProposal.jamMulaiBaru} - {selectedProposal.jamSelesaiBaru} ({selectedProposal.lokasiBaru})
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mb-4">
                  <p className="font-semibold">
                    Permohonan akan ditolak dan pembina akan menerima pemberitahuan beserta alasan penolakan.
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Koordinator {actionType === 'REJECT' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'Catatan opsional persetujuan...'
                      : 'Tuliskan alasan penolakan agar pembina dapat merevisi permohonan...'
                  }
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {errorMsg && (
                  <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setSelectedProposal(null);
                    setActionType(null);
                    setErrorMsg('');
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmAction}
                  className={`flex-1 py-2.5 px-4 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-[#00B884] hover:bg-[#009e70]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{actionType === 'APPROVE' ? 'Setujui Sekarang' : 'Tolak Permohonan'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
