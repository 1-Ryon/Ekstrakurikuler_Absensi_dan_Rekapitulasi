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
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Eskul, PendaftaranEskul, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface ValidasiPendaftaranSiswaProps {
  currentUser: User;
  eskulList: Eskul[];
  onRefreshData?: () => void;
}

export const ValidasiPendaftaranSiswa: React.FC<ValidasiPendaftaranSiswaProps> = ({
  currentUser,
  eskulList,
  onRefreshData,
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
      const res = await fetch('http://localhost:5000/api/pendaftaran');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRegistrations(json.data);
        }
      }
    } catch {
      // Fallback local mockup data if server temporarily unavailable
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter registrations
  const filteredList = registrations.filter((item) => {
    const matchEskul = selectedEskulId === 'ALL' || item.eskulId === selectedEskulId;
    const matchSearch = 
      item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.nisn.includes(searchQuery) ||
      item.namaEskul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchEskul || !matchSearch) return false;

    if (activeTab === 'PENDING') {
      return item.status === 'MENUNGGU_VALIDASI_KOORDINATOR';
    }
    if (activeTab === 'APPROVED') {
      return item.status === 'RESMI_TERDAFTAR';
    }
    return true;
  });

  const pendingCount = registrations.filter(r => r.status === 'MENUNGGU_VALIDASI_KOORDINATOR').length;
  const approvedCount = registrations.filter(r => r.status === 'RESMI_TERDAFTAR').length;
  const totalCount = registrations.length;

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
      const res = await fetch('http://localhost:5000/api/pendaftaran/validasi-koordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({
          pendaftaranIds: modalAction.targetIds,
          aksi: modalAction.type === 'APPROVE' ? 'SETUJUI' : 'TOLAK',
          catatanKoordinator: modalAction.catatan,
          koordinatorId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (modalAction.type === 'APPROVE') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
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
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50 backdrop-blur-md'
                : 'bg-rose-900/90 text-rose-100 border-rose-500/50 backdrop-blur-md'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Otoritas Validasi Koordinator Ekstrakurikuler</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Validasi Pendaftaran & Kuota Siswa Eskul
            </h1>
            <p className="text-emerald-50 text-sm max-w-2xl leading-relaxed">
              Tinjau dan sahkan seluruh berkas calon siswa yang telah diseleksi oleh Guru Pembina. Setelah divalidasi resmi, siswa akan otomatis tercatat sebagai Anggota Resmi di database sekolah.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchRegistrations}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-xs text-emerald-100 font-medium">Menunggu Validasi Anda</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 flex items-center gap-2">
              <span>{pendingCount}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 font-bold">
                Perlu Tindakan
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-xs text-emerald-100 font-medium">Telah Divalidasi Resmi</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {approvedCount} <span className="text-xs font-normal text-emerald-100">Siswa Aktif</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-xs text-emerald-100 font-medium">Total Berkas Pendaftaran</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalCount} <span className="text-xs font-normal text-emerald-100">Calon Anggota</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eskul Quota Status Cards */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00B884]" />
            <span>Kapasitas & Kuota Ekstrakurikuler</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Tahun Ajaran 2026/2027
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {eskulList.map((eskul) => {
            const currentMembers = eskul.jumlahSiswa || 0;
            const quota = eskul.kuota || 40;
            const percent = Math.min(100, Math.round((currentMembers / quota) * 100));
            const isFull = currentMembers >= quota;

            return (
              <div 
                key={eskul.id}
                onClick={() => setSelectedEskulId(eskul.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedEskulId === eskul.id
                    ? 'border-[#00B884] bg-emerald-50/50 shadow-sm ring-2 ring-[#00B884]/20'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 truncate">
                  <span className="truncate">{eskul.namaEskul}</span>
                  {isFull ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">PENUH</span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500">{percent}%</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Pembina: {eskul.pembinaNama.split(' ')[0]}</span>
                  <span className="font-mono font-bold text-slate-700">{currentMembers}/{quota}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-[#00B884]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-white text-[#00B884] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Validasi ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-white text-[#00B884] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resmi Terdaftar ({approvedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-[#00B884] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({totalCount})
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa, NIS, kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <select
            value={selectedEskulId}
            onChange={(e) => setSelectedEskulId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
          >
            <option value="ALL">Semua Ekstrakurikuler</option>
            {eskulList.map((e) => (
              <option key={e.id} value={e.id}>{e.namaEskul}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-[#00B884] flex items-center justify-center text-white text-[11px]">
              {selectedIds.length}
            </span>
            <span>Berkas siswa dipilih untuk divalidasi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openActionModal('REJECT', selectedIds, ['Siswa Terpilih'])}
              className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Tolak Terpilih</span>
            </button>
            <button
              onClick={() => openActionModal('APPROVE', selectedIds, ['Siswa Terpilih'])}
              className="px-4 py-2 bg-[#00B884] hover:bg-[#00a375] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validasi & Sahkan Semua Terpilih</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Table of Registrations */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#00B884]" />
            <span className="text-sm font-semibold">Memuat berkas pendaftaran...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <div className="font-bold text-slate-700">Tidak ada berkas pendaftaran ditemukan</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'PENDING'
                ? 'Semua berkas pendaftaran calon siswa sudah divalidasi atau belum ada pengajuan baru dari Guru Pembina.'
                : 'Silakan ubah filter atau kata kunci pencarian Anda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#00B884] focus:ring-[#00B884]"
                    />
                  </th>
                  <th className="p-4">Calon Siswa</th>
                  <th className="p-4">Ekstrakurikuler Tujuan</th>
                  <th className="p-4">Catatan Seleksi Pembina</th>
                  <th className="p-4">Status & Tanggal</th>
                  <th className="p-4 text-center">Aksi Koordinator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isPending = item.status === 'MENUNGGU_VALIDASI_KOORDINATOR';
                  const isApproved = item.status === 'RESMI_TERDAFTAR';
                  const isRejected = item.status === 'DITOLAK';

                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-slate-300 text-[#00B884] focus:ring-[#00B884]"
                        />
                      </td>

                      {/* Siswa Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={item.namaSiswa}
                            className="w-10 h-10 rounded-xl ring-2 ring-slate-100 text-xs shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">
                              {item.namaSiswa}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>NISN: {item.nisn}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600">{item.kelas}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Eskul Info */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00B884]" />
                          <span>{item.namaEskul}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Pembina: <span className="text-slate-600 font-medium">{item.pembinaNama}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-1">
                          Kuota: {item.jumlahAnggotaResmi}/{item.kuotaEskul} terisi
                        </div>
                      </td>

                      {/* Catatan Pembina */}
                      <td className="p-4 max-w-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed italic">
                          "{item.catatanPembina || item.alasanDaftar || 'Direkomendasikan oleh pembina.'}"
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Menunggu Validasi</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Resmi Terdaftar</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Ditolak</span>
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openActionModal('REJECT', [item.id], [item.namaSiswa])}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs border border-rose-200 transition-all cursor-pointer"
                              title="Tolak Siswa"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => openActionModal('APPROVE', [item.id], [item.namaSiswa])}
                              className="px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                              title="Sahkan & Validasi Siswa"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sahkan Siswa</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Telah Diproses
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalAction.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  modalAction.type === 'APPROVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {modalAction.type === 'APPROVE' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {modalAction.type === 'APPROVE' ? 'Sahkan Siswa Terdaftar Resmi' : 'Tolak Pendaftaran Siswa'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalAction.targetIds.length} Siswa akan diproses secara resmi oleh Koordinator.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Catatan Resmi Koordinator:</label>
                <textarea
                  value={modalAction.catatan}
                  onChange={(e) => setModalAction(prev => ({ ...prev, catatan: e.target.value }))}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                  placeholder="Berikan alasan atau catatan pengesahan..."
                />
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {modalAction.type === 'APPROVE'
                    ? 'Setelah disahkan, siswa otomatis resmi tercatat di daftar anggota eskul (Roster), rapor, dan dapat melakukan absensi presensi.'
                    : 'Pendaftaran yang ditolak akan diarsipkan dan pemberitahuan akan diteruskan ke guru pembina terkait.'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setModalAction(prev => ({ ...prev, isOpen: false }))}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2 ${
                    modalAction.type === 'APPROVE'
                      ? 'bg-[#00B884] hover:bg-[#009e70]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{modalAction.type === 'APPROVE' ? 'Konfirmasi & Sahkan' : 'Konfirmasi Tolak'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
