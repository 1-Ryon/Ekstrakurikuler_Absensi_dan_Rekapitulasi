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
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PengajuanJadwal, User, Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
} from '../ui';

interface ValidasiJadwalViewProps {
  currentUser: User;
  proposals: PengajuanJadwal[];
  eskulList: Eskul[];
  onValidate: (
    proposalId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    catatanKoordinator?: string
  ) => Promise<void>;
  onBack?: () => void;
}

export const ValidasiJadwalView: React.FC<ValidasiJadwalViewProps> = ({
  currentUser,
  proposals,
  eskulList,
  onValidate,
  onBack,
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
      <Card className="p-6 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CalendarClock className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {onBack && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    className="gap-1.5 h-7 px-2.5 text-xs font-semibold"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Kembali ke Dasbor</span>
                  </Button>
                )}
                <Badge variant="warning" className="text-[10px] font-bold uppercase tracking-wider">
                  Modul Validasi Koordinator
                </Badge>
                <span className="text-xs text-muted-foreground">Verifikator: {currentUser.namaLengkap}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mt-1 tracking-tight">
                Validasi Perubahan Jadwal Ekstrakurikuler
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Tinjau dan putuskan permohonan pergantian hari, jam, atau lokasi latihan yang diajukan oleh pembina. Jadwal yang disetujui otomatis mengupdate kalender sekolah.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50/70 border border-amber-200 rounded-md px-3.5 py-2.5 text-center min-w-[90px]">
              <span className="text-xs font-semibold text-amber-700 block">Menunggu</span>
              <span className="text-2xl font-bold text-amber-600">{pendingProposals.length}</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-md px-3.5 py-2.5 text-center min-w-[90px]">
              <span className="text-xs font-semibold text-primary block">Disetujui</span>
              <span className="text-2xl font-bold text-primary">{approvedProposals.length}</span>
            </div>
            <div className="bg-muted/50 border border-border rounded-md px-3.5 py-2.5 text-center min-w-[90px]">
              <span className="text-xs font-semibold text-muted-foreground block">Total</span>
              <span className="text-2xl font-bold text-foreground">{proposals.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Control Bar: Tabs, Filter & Search */}
      <Card className="p-3.5 border-border flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-md w-full md:w-auto">
          <Button
            variant={activeTab === 'PENDING' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('PENDING')}
            className="flex-1 md:flex-none gap-2 text-xs font-semibold h-8"
          >
            <span>Perlu Tindakan</span>
            {pendingProposals.length > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                {pendingProposals.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === 'HISTORY' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('HISTORY')}
            className="flex-1 md:flex-none gap-2 text-xs font-semibold h-8"
          >
            <span>Riwayat Keputusan</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
              {historyProposals.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ALL')}
            className="flex-1 md:flex-none gap-2 text-xs font-semibold h-8"
          >
            <span>Semua Data</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
              {proposals.length}
            </Badge>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari eskul / pembina..."
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="relative shrink-0">
            <Filter className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedEskulFilter}
              onChange={(e) => setSelectedEskulFilter(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
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
      </Card>

      {/* Proposal Cards List */}
      {filteredProposals.length === 0 ? (
        <Card className="p-12 text-center border-border">
          <div className="size-12 rounded-md bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Tidak Ada Permohonan Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
            {activeTab === 'PENDING'
              ? 'Seluruh permohonan perubahan jadwal dari pembina telah selesai divalidasi. Tidak ada antrean pending!'
              : 'Tidak ditemukan data pengajuan jadwal sesuai kriteria pencarian dan filter.'}
          </p>
          {onBack && (
            <div className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Kembali ke Dasbor Utama</span>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProposals.map((prop) => {
            const isPending = prop.status === 'MENUNGGU_VALIDASI';
            const isApproved = prop.status === 'DISETUJUI';
            const isRejected = prop.status === 'DITOLAK';

            return (
              <Card
                key={prop.id}
                className={`p-5 transition-all flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/10'
                    : isApproved
                    ? 'border-emerald-300'
                    : 'border-destructive/30'
                }`}
              >
                <div>
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-semibold py-0">
                          {prop.kategoriEskul || 'Ekstrakurikuler'}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold py-0"
                        >
                          {prop.jenisPerubahan}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        {prop.namaEskul}
                      </h3>
                    </div>

                    <Badge
                      variant={isPending ? 'warning' : isApproved ? 'success' : 'destructive'}
                      className="gap-1.5 shrink-0"
                    >
                      {isPending && <Clock className="size-3 animate-spin" />}
                      {isApproved && <CheckCircle2 className="size-3" />}
                      {isRejected && <XCircle className="size-3" />}
                      {isPending ? 'Menunggu Validasi' : isApproved ? 'Disetujui' : 'Ditolak'}
                    </Badge>
                  </div>

                  {/* Pembina Info */}
                  <div className="flex items-center gap-2.5 py-2 px-3 bg-muted/40 rounded-md mb-3 border border-border">
                    <UserAvatar
                      name={prop.pembinaNama}
                      avatarUrl={prop.pembinaAvatar}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {prop.pembinaNama}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Diajukan: {new Date(prop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Comparison: Lama vs Baru */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        Jadwal Semula
                      </span>
                      <div className="space-y-1 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0" />
                          <span className="font-semibold text-foreground">{prop.hariLama}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0" />
                          <span>{prop.jamMulaiLama} - {prop.jamSelesaiLama}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{prop.lokasiLama}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                          Jadwal Baru
                        </span>
                        <ArrowRight className="size-3 text-amber-600" />
                      </div>
                      <div className="space-y-1 text-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-amber-600 shrink-0" />
                          <span className="font-bold text-amber-950">{prop.hariBaru}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-amber-600 shrink-0" />
                          <span className="font-bold text-amber-950">{prop.jamMulaiBaru} - {prop.jamSelesaiBaru}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-amber-600 shrink-0" />
                          <span className="truncate font-semibold text-amber-950">{prop.lokasiBaru}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alasan */}
                  <div className="p-3 bg-muted/30 rounded-md border border-border text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] mb-1">
                      <FileText className="size-3.5" />
                      <span>Alasan Permohonan:</span>
                    </div>
                    <p className="text-foreground italic leading-relaxed">
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
                    <div className={`p-3 rounded-md border text-xs mb-2 ${
                      isApproved ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <ShieldCheck className="size-3.5" />
                        <span>Catatan Koordinator:</span>
                      </div>
                      <p className="italic">
                        {prop.catatanKoordinator || (isApproved ? 'Disetujui tanpa catatan khusus.' : 'Ditolak.')}
                      </p>
                      {prop.verifiedAt && (
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          Diverifikasi pada: {new Date(prop.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending - Equal 50/50 Width */}
                {isPending && (
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border mt-2">
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      onClick={() => handleOpenAction(prop, 'APPROVE')}
                      className="w-full gap-1.5 text-xs font-semibold"
                    >
                      <Check className="size-4" />
                      <span>Setujui Jadwal</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAction(prop, 'REJECT')}
                      className="w-full gap-1.5 text-xs font-semibold border-rose-200 text-destructive hover:bg-rose-50"
                    >
                      <XCircle className="size-4" />
                      <span>Tolak Jadwal</span>
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedProposal && actionType && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-lg max-w-md w-full p-5 shadow-xl border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`size-10 rounded-md flex items-center justify-center text-white ${
                    actionType === 'APPROVE' ? 'bg-primary' : 'bg-destructive'
                  }`}
                >
                  {actionType === 'APPROVE' ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <XCircle className="size-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {actionType === 'APPROVE' ? 'Konfirmasi Persetujuan Jadwal' : 'Konfirmasi Penolakan'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedProposal.namaEskul} ({selectedProposal.pembinaNama})
                  </p>
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs text-emerald-900 mb-4 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-primary">
                    <Sparkles className="size-3.5" />
                    Jadwal akan diperbarui ke sistem:
                  </p>
                  <p className="text-foreground">
                    <strong>{selectedProposal.hariBaru}</strong>, {selectedProposal.jamMulaiBaru} - {selectedProposal.jamSelesaiBaru} ({selectedProposal.lokasiBaru})
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-md text-xs text-rose-900 mb-4">
                  <p className="font-semibold">
                    Permohonan akan ditolak dan pembina akan menerima pemberitahuan beserta alasan penolakan.
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Catatan Koordinator {actionType === 'REJECT' && <span className="text-destructive">*</span>}
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
                  className="w-full p-2.5 bg-background border border-border rounded-md text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errorMsg && (
                  <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => {
                    setSelectedProposal(null);
                    setActionType(null);
                    setErrorMsg('');
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant={actionType === 'APPROVE' ? 'brand' : 'destructive'}
                  disabled={isProcessing}
                  onClick={handleConfirmAction}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <Clock className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  <span>{actionType === 'APPROVE' ? 'Setujui Sekarang' : 'Tolak Permohonan'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
