import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  AlertCircle,
  Building,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Award,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Eskul, PendaftaranEskul, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { api } from '../../services/api';
import { pushSystemNotification } from '../../utils/notificationService';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui';

interface ValidasiPendaftaranSiswaProps {
  currentUser: User;
  eskulList: Eskul[];
  onRefreshData?: () => void;
  onBack?: () => void;
}

export const ValidasiPendaftaranSiswa: React.FC<ValidasiPendaftaranSiswaProps> = ({
  currentUser,
  eskulList,
  onRefreshData,
  onBack,
}) => {
  const [registrations, setRegistrations] = useState<PendaftaranEskul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEskulId, setSelectedEskulId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalAction, setModalAction] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT';
    targetIds: string[];
    targetNames: string[];
    catatan: string;
  }>({
    isOpen: false,
    type: 'APPROVE',
    targetIds: [],
    targetNames: [],
    catatan: '',
  });
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPendaftaran();
      if (Array.isArray(data)) {
        setRegistrations(data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const baseFilteredList = registrations.filter((item) => {
    const matchEskul = selectedEskulId === 'ALL' || item.eskulId === selectedEskulId;
    const matchSearch = 
      item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.nisn.includes(searchQuery) ||
      item.namaEskul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase());

    return matchEskul && matchSearch;
  });

  const pendingCount = baseFilteredList.filter(r => r.status === 'MENUNGGU_VALIDASI_KOORDINATOR').length;
  const approvedCount = baseFilteredList.filter(r => r.status === 'RESMI_TERDAFTAR').length;
  const totalCount = baseFilteredList.length;

  const filteredList = baseFilteredList.filter((item) => {
    if (activeTab === 'PENDING') {
      return item.status === 'MENUNGGU_VALIDASI_KOORDINATOR';
    }
    if (activeTab === 'APPROVED') {
      return item.status === 'RESMI_TERDAFTAR';
    }
    return true;
  });

  const pendingCountByEskul = registrations.reduce((acc, r) => {
    if (r.status === 'MENUNGGU_VALIDASI_KOORDINATOR') {
      acc[r.eskulId] = (acc[r.eskulId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const selectedEskulName = eskulList.find(e => e.id === selectedEskulId)?.namaEskul;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openActionModal = (type: 'APPROVE' | 'REJECT', ids: string[], names: string[]) => {
    setModalAction({
      isOpen: true,
      type,
      targetIds: ids,
      targetNames: names,
      catatan: type === 'APPROVE' 
        ? 'Disetujui dan disahkan oleh Koordinator Ekstrakurikuler.' 
        : 'Kuota eskul telah penuh atau belum memenuhi kriteria kesiswaan.',
    });
  };

  const handleConfirmAction = async () => {
    if (modalAction.targetIds.length === 0) return;
    setActionLoading(true);

    try {
      const data = await api.validasiPendaftaran(
        modalAction.targetIds,
        modalAction.type === 'APPROVE' ? 'SETUJUI' : 'TOLAK',
        modalAction.catatan,
        currentUser.id
      );

      if (data.success) {
        if (modalAction.type === 'APPROVE') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          modalAction.targetIds.forEach(id => {
            const reg = registrations.find(r => r.id === id);
            if (reg) {
              pushSystemNotification({
                title: `Pendaftaran Eskul ${reg.namaEskul} DITERIMA!`,
                desc: `Selamat ${reg.namaSiswa}! Pendaftaran Anda di ekstrakurikuler ${reg.namaEskul} telah disetujui resmi oleh Koordinator. Anda kini resmi menjadi anggota aktif. Silakan ikuti jadwal latihan mingguan!`,
                category: 'PENDAFTARAN',
                senderName: currentUser.namaLengkap || 'Koordinator Ekstrakurikuler',
                time: 'Baru saja',
                type: 'success',
                targetRoles: ['SISWA'],
                targetUserId: reg.siswaId,
              });
            }
          });
        } else {
          modalAction.targetIds.forEach(id => {
            const reg = registrations.find(r => r.id === id);
            if (reg) {
              pushSystemNotification({
                title: `Pendaftaran Eskul ${reg.namaEskul} Ditolak`,
                desc: `Mohon maaf ${reg.namaSiswa}, pendaftaran Anda di ekstrakurikuler ${reg.namaEskul} belum dapat disetujui oleh Koordinator. Catatan / Alasan: "${modalAction.catatan || 'Kuota kelas telah terpenuhi.'}"`,
                category: 'PENDAFTARAN',
                senderName: currentUser.namaLengkap || 'Koordinator Ekstrakurikuler',
                time: 'Baru saja',
                type: 'warning',
                targetRoles: ['SISWA'],
                targetUserId: reg.siswaId,
              });
            }
          });
        }

        showToast(data.message || 'Validasi pendaftaran siswa berhasil diproses!', 'success');
        setSelectedIds([]);
        setModalAction(prev => ({ ...prev, isOpen: false }));
        await fetchRegistrations();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || 'Gagal memproses validasi pendaftaran.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md'
                : 'bg-rose-950/90 text-rose-100 border-rose-500/40 backdrop-blur-md'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {onBack && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    className="h-7 px-2.5 text-xs font-semibold gap-1.5"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Kembali ke Dasbor</span>
                  </Button>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Approval Center
                  </span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Validasi Pendaftaran &amp; Kuota Siswa Eskul
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
                Tinjau dan sahkan seluruh berkas calon siswa yang telah diseleksi oleh Guru Pembina. Setelah divalidasi resmi, siswa akan otomatis tercatat sebagai Anggota Resmi di database sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" />
                  <span>Kembali ke Dasbor</span>
                </Button>
              )}
              <Button
                variant="brand"
                size="sm"
                onClick={fetchRegistrations}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-border">
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground font-medium">Menunggu Validasi Anda</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
                <span>{pendingCount}</span>
                <Badge variant="warning" className="text-[10px] py-0">
                  Perlu Tindakan
                </Badge>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground font-medium">Telah Divalidasi Resmi</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {approvedCount} <span className="text-xs font-normal text-muted-foreground">Siswa Aktif</span>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <div className="text-xs text-muted-foreground font-medium">Total Berkas Pendaftaran</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {totalCount} <span className="text-xs font-normal text-muted-foreground">Calon Anggota</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Kapasitas & Kuota Ekstrakurikuler</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div 
              onClick={() => setSelectedEskulId('ALL')}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedEskulId === 'ALL'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-sm'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 font-bold">
                  <Building className="size-3.5 text-primary" />
                  Semua Ekstrakurikuler
                </span>
                <Badge variant={selectedEskulId === 'ALL' ? 'brand' : 'outline'} className="text-[10px] py-0 px-1.5">
                  {eskulList.length} Cabang
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Total Berkas: {registrations.length}</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {registrations.filter(r => r.status === 'MENUNGGU_VALIDASI_KOORDINATOR').length} Menunggu
                </span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
              </div>
            </div>

            {eskulList.map((eskul) => {
              const currentMembers = eskul.jumlahSiswa || 0;
              const quota = eskul.kuota || 40;
              const percent = Math.min(100, Math.round((currentMembers / quota) * 100));
              const isFull = currentMembers >= quota;
              const pendingForThis = pendingCountByEskul[eskul.id] || 0;

              return (
                <div 
                  key={eskul.id}
                  onClick={() => setSelectedEskulId(prev => prev === eskul.id ? 'ALL' : eskul.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedEskulId === eskul.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground truncate">
                    <span className="truncate">{eskul.namaEskul}</span>
                    {pendingForThis > 0 ? (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-bold animate-pulse">
                        {pendingForThis} Menunggu
                      </Badge>
                    ) : isFull ? (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5">PENUH</Badge>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground">{percent}%</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                    <span>Pembina: {eskul.pembinaNama.split(' ')[0]}</span>
                    <span className="font-mono font-medium text-foreground">{currentMembers}/{quota}</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-destructive' : percent > 80 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center bg-muted/60 p-1 rounded-lg self-start border border-border">
          <Button
            variant={activeTab === 'PENDING' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('PENDING')}
            className="h-8 px-3 text-xs gap-1.5"
          >
            <Clock className="size-3.5" />
            <span>Menunggu Validasi ({pendingCount})</span>
          </Button>
          <Button
            variant={activeTab === 'APPROVED' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('APPROVED')}
            className="h-8 px-3 text-xs gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Resmi Terdaftar ({approvedCount})</span>
          </Button>
          <Button
            variant={activeTab === 'ALL' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ALL')}
            className="h-8 px-3 text-xs"
          >
            Semua ({totalCount})
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari siswa, NIS, kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedEskulId}
            onChange={(e) => setSelectedEskulId(e.target.value)}
            className="h-9 px-3 text-xs font-medium rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Semua Ekstrakurikuler</option>
            {eskulList.map((e) => (
              <option key={e.id} value={e.id}>{e.namaEskul}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card text-foreground p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <Badge variant="brand" className="size-5 rounded-full p-0 flex items-center justify-center text-[11px]">
              {selectedIds.length}
            </Badge>
            <span>Berkas siswa dipilih untuk divalidasi</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openActionModal('REJECT', selectedIds, ['Siswa Terpilih'])}
              className="h-8 text-xs gap-1.5"
            >
              <XCircle className="size-3.5" />
              <span>Tolak Terpilih</span>
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => openActionModal('APPROVE', selectedIds, ['Siswa Terpilih'])}
              className="h-8 text-xs gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Validasi & Sahkan Semua Terpilih</span>
            </Button>
          </div>
        </motion.div>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <RefreshCw className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Memuat berkas pendaftaran...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-3">
            <Users className="size-10 mx-auto text-muted-foreground/60 stroke-[1.5]" />
            <div className="font-semibold text-foreground text-base">
              {selectedEskulId !== 'ALL'
                ? `Tidak ada berkas pendaftaran untuk ${selectedEskulName || 'ekstrakurikuler ini'}`
                : 'Tidak ada berkas pendaftaran ditemukan'}
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {selectedEskulId !== 'ALL'
                ? `Belum ada calon siswa yang mendaftar atau berkas ${selectedEskulName || ''} tidak ada yang berstatus '${activeTab === 'PENDING' ? 'Menunggu Validasi' : activeTab === 'APPROVED' ? 'Resmi Terdaftar' : 'Semua'}'.`
                : activeTab === 'PENDING'
                  ? 'Semua berkas pendaftaran calon siswa sudah divalidasi atau belum ada pengajuan baru dari Guru Pembina.'
                  : 'Silakan ubah filter atau kata kunci pencarian Anda.'}
            </p>
            {selectedEskulId !== 'ALL' && (
              <div className="pt-2">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setSelectedEskulId('ALL')}
                  className="gap-2"
                >
                  <Building className="size-3.5" />
                  <span>Tampilkan Berkas Semua Ekstrakurikuler</span>
                </Button>
              </div>
            )}
            {onBack && (
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Kembali ke Dasbor Utama</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/75 hover:bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Calon Siswa</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Ekstrakurikuler Tujuan</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Catatan Seleksi Pembina</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Status &amp; Tanggal</TableHead>
                  <TableHead className="text-center font-bold text-xs uppercase tracking-wider text-slate-500">Aksi Koordinator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isPending = item.status === 'MENUNGGU_VALIDASI_KOORDINATOR';
                  const isApproved = item.status === 'RESMI_TERDAFTAR';
                  const isRejected = item.status === 'DITOLAK';

                  return (
                    <TableRow 
                      key={item.id}
                      className={isSelected ? 'bg-primary/5' : ''}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={item.namaSiswa}
                            className="size-9 rounded-md border text-xs shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-foreground text-sm">
                              {item.namaSiswa}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                              <span>NISN: {item.nisn}</span>
                              <span>•</span>
                              <span className="font-medium text-foreground">{item.kelas}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-primary" />
                          <span>{item.namaEskul}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Pembina: <span className="text-foreground font-medium">{item.pembinaNama}</span>
                        </div>
                        <div className="text-[10px] text-primary font-medium mt-1">
                          Kuota: {item.jumlahAnggotaResmi}/{item.kuotaEskul} terisi
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <div className="p-2.5 rounded-md bg-muted/50 border border-border text-[11px] text-muted-foreground leading-relaxed italic">
                          "{item.catatanPembina || item.alasanDaftar || 'Direkomendasikan oleh pembina.'}"
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {isPending && (
                          <Badge variant="warning" className="gap-1 text-[10px]">
                            <Clock className="size-3 animate-spin" />
                            <span>Menunggu Validasi</span>
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge variant="success" className="gap-1 text-[10px]">
                            <CheckCircle2 className="size-3" />
                            <span>Resmi Terdaftar</span>
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" className="gap-1 text-[10px]">
                            <XCircle className="size-3" />
                            <span>Ditolak</span>
                          </Badge>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>

                      <TableCell className="text-center whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionModal('REJECT', [item.id], [item.namaSiswa])}
                              className="h-7 px-2.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                              title="Tolak Siswa"
                            >
                              Tolak
                            </Button>
                            <Button
                              variant="brand"
                              size="sm"
                              onClick={() => openActionModal('APPROVE', [item.id], [item.namaSiswa])}
                              className="h-7 px-2.5 text-xs gap-1"
                              title="Sahkan & Validasi Siswa"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Sahkan Siswa</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Telah Diproses
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {modalAction.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg p-6 max-w-lg w-full shadow-lg border border-border space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                  modalAction.type === 'APPROVE' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                }`}>
                  {modalAction.type === 'APPROVE' ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {modalAction.type === 'APPROVE' ? 'Sahkan Siswa Terdaftar Resmi' : 'Tolak Pendaftaran Siswa'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {modalAction.targetIds.length} Siswa akan diproses secara resmi oleh Koordinator.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground">Catatan Resmi Koordinator:</label>
                <textarea
                  value={modalAction.catatan}
                  onChange={(e) => setModalAction(prev => ({ ...prev, catatan: e.target.value }))}
                  rows={3}
                  className="w-full p-2.5 bg-background border border-input rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Berikan alasan atau catatan pengesahan..."
                />
              </div>

              <div className="p-3 bg-muted/60 border border-border rounded-md text-xs text-muted-foreground flex items-start gap-2.5">
                <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {modalAction.type === 'APPROVE'
                    ? 'Setelah disahkan, siswa otomatis resmi tercatat di daftar anggota eskul (Roster), rapor, dan dapat melakukan absensi presensi.'
                    : 'Pendaftaran yang ditolak akan diarsipkan dan pemberitahuan akan diteruskan ke guru pembina terkait.'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAction(prev => ({ ...prev, isOpen: false }))}
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button
                  variant={modalAction.type === 'APPROVE' ? 'brand' : 'destructive'}
                  size="sm"
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  className="gap-2"
                >
                  {actionLoading ? <RefreshCw className="size-3.5 animate-spin" /> : null}
                  <span>{modalAction.type === 'APPROVE' ? 'Konfirmasi & Sahkan' : 'Konfirmasi Tolak'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
