import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Filter, 
  Building, 
  Clock, 
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Eskul, PendaftaranEskul, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface PendaftaranSiswaPembinaProps {
  currentUser: User;
  coachedEskuls: Eskul[];
  onRefreshData?: () => void;
}

export const PendaftaranSiswaPembina: React.FC<PendaftaranSiswaPembinaProps> = ({
  currentUser,
  coachedEskuls,
  onRefreshData,
}) => {
  const [selectedEskulId, setSelectedEskulId] = useState<string>(
    coachedEskuls[0]?.id || ''
  );
  const [registrations, setRegistrations] = useState<PendaftaranEskul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SELEKSI' | 'SIAP_KIRIM' | 'DITINJAU' | 'RESMI'>('SELEKSI');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [catatanBatch, setCatatanBatch] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const activeEskul = coachedEskuls.find(e => e.id === selectedEskulId) || coachedEskuls[0];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRegistrations = async () => {
    if (!selectedEskulId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/pendaftaran?eskulId=${selectedEskulId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRegistrations(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEskulId]);

  // Quota Metrics
  const maxQuota = activeEskul?.kuota || 40;
  const officialMembers = activeEskul?.jumlahSiswa || registrations.filter(r => r.status === 'RESMI_TERDAFTAR').length;
  const acceptedByPembina = registrations.filter(r => r.status === 'DITERIMA_PEMBINA');
  const waitingKoordinator = registrations.filter(r => r.status === 'MENUNGGU_VALIDASI_KOORDINATOR');
  const waitingSelection = registrations.filter(r => r.status === 'MENUNGGU_SELEKSI');
  const totalApprovedAndPending = officialMembers + acceptedByPembina.length + waitingKoordinator.length;
  const isOverQuota = totalApprovedAndPending > maxQuota;
  const remainingQuota = Math.max(0, maxQuota - totalApprovedAndPending);

  // Tab Filtering
  const filteredList = registrations.filter((item) => {
    const matchSearch = 
      item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === 'SELEKSI') return item.status === 'MENUNGGU_SELEKSI';
    if (activeTab === 'SIAP_KIRIM') return item.status === 'DITERIMA_PEMBINA';
    if (activeTab === 'DITINJAU') return item.status === 'MENUNGGU_VALIDASI_KOORDINATOR';
    if (activeTab === 'RESMI') return item.status === 'RESMI_TERDAFTAR';
    return true;
  });

  const handleUpdateStatusSingle = async (pendaftaranId: string, newStatus: 'DITERIMA_PEMBINA' | 'DITOLAK' | 'MENUNGGU_SELEKSI') => {
    if (newStatus === 'DITERIMA_PEMBINA' && totalApprovedAndPending >= maxQuota) {
      showToast(`Peringatan: Kuota maksimal eskul (${maxQuota} siswa) telah terpenuhi.`, 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/pendaftaran/seleksi-pembina', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({
          pendaftaranIds: [pendaftaranId],
          status: newStatus,
          catatanPembina: newStatus === 'DITERIMA_PEMBINA' 
            ? 'Memenuhi syarat kemampuan dan lolos seleksi pembina.' 
            : 'Belum memenuhi kualifikasi kuota.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          newStatus === 'DITERIMA_PEMBINA' 
            ? 'Siswa diterima masuk daftar seleksi pembina.' 
            : 'Status siswa diperbarui.', 
          'success'
        );
        await fetchRegistrations();
        if (onRefreshData) onRefreshData();
      }
    } catch {
      showToast('Gagal mengubah status pendaftaran.', 'error');
    }
  };

  const handleSubmitBatchToKoordinator = async () => {
    if (acceptedByPembina.length === 0) return;
    setActionLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/pendaftaran/ajukan-koordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({
          eskulId: selectedEskulId,
          catatanPembina: catatanBatch || `Daftar ${acceptedByPembina.length} siswa terpilih hasil seleksi pembina untuk tahun ajaran 2026/2027.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast(data.message || 'Berkas siswa berhasil dikirim ke Koordinator!', 'success');
        setIsSubmitModalOpen(false);
        setCatatanBatch('');
        setActiveTab('DITINJAU');
        await fetchRegistrations();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.message || 'Gagal mengirim berkas.', 'error');
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
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-[#00B884] to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white tracking-wide">
              <UserPlus className="w-4 h-4" />
              <span>Manajemen Seleksi & Penerimaan Siswa Eskul</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pendaftaran Siswa: {activeEskul?.namaEskul || 'Ekstrakurikuler'}
            </h1>
            <p className="text-emerald-50 text-sm max-w-2xl leading-relaxed">
              Seleksi siswa yang mendaftar hingga kuota maksimal terpenuhi. Setelah daftar siswa terpilih sudah lengkap, kirim seluruh berkas ke Koordinator Eskul untuk divalidasi resmi.
            </p>
          </div>

          {/* Eskul Selector if Pembina coaches multiple */}
          {coachedEskuls.length > 1 && (
            <div className="bg-white/15 backdrop-blur-md p-2 rounded-2xl border border-white/20 self-start md:self-auto">
              <label className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold block px-2 mb-1">
                Pilih Eskul yang Dikelola:
              </label>
              <select
                value={selectedEskulId}
                onChange={(e) => setSelectedEskulId(e.target.value)}
                className="bg-slate-900/80 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
              >
                {coachedEskuls.map((e) => (
                  <option key={e.id} value={e.id}>{e.namaEskul}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quota Progress Gauge */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div className="text-[11px] text-emerald-100 font-medium">Batas Maksimal Kuota</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {maxQuota} <span className="text-xs font-normal text-emerald-100">Siswa</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div className="text-[11px] text-emerald-100 font-medium">Resmi Terdaftar</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-200 mt-0.5">
              {officialMembers} <span className="text-xs font-normal text-emerald-100">Aktif</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div className="text-[11px] text-emerald-100 font-medium">Dipilih Pembina</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {acceptedByPembina.length} <span className="text-xs font-normal text-emerald-100">Siap Kirim</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div className="text-[11px] text-emerald-100 font-medium">Sisa Slot Kuota</div>
            <div className={`text-xl sm:text-2xl font-black mt-0.5 ${isOverQuota ? 'text-rose-300' : 'text-white'}`}>
              {remainingQuota} <span className="text-xs font-normal text-emerald-100">Kursi</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Warning */}
        <div className="mt-4">
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isOverQuota ? 'bg-rose-400' : totalApprovedAndPending >= maxQuota ? 'bg-amber-400' : 'bg-white'
              }`}
              style={{ width: `${Math.min(100, Math.round((totalApprovedAndPending / maxQuota) * 100))}%` }}
            />
          </div>
          {isOverQuota && (
            <div className="mt-2 text-xs font-bold text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Peringatan: Jumlah siswa yang Anda pilih melebihi batas kapasitas kuota eskul ({totalApprovedAndPending}/{maxQuota}).</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Workflow Tabs & Send Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Step tabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl overflow-x-auto self-start">
          <button
            onClick={() => setActiveTab('SELEKSI')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SELEKSI' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendaftar Baru ({waitingSelection.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SIAP_KIRIM')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SIAP_KIRIM' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dipilih / Siap Kirim ({acceptedByPembina.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DITINJAU')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'DITINJAU' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ditinjau Koordinator ({waitingKoordinator.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RESMI')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'RESMI' ? 'bg-white text-[#00B884] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Resmi Terdaftar ({registrations.filter(r => r.status === 'RESMI_TERDAFTAR').length})</span>
          </button>
        </div>

        {/* Primary Action Button: Kirim Seluruh Siswa ke Koordinator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={acceptedByPembina.length === 0 || isOverQuota}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              acceptedByPembina.length > 0 && !isOverQuota
                ? 'bg-gradient-to-r from-emerald-600 to-[#00B884] hover:shadow-emerald-500/25 ring-2 ring-emerald-500/30 animate-pulse'
                : 'bg-slate-400'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Kirim Rekap Siswa ke Koordinator ({acceptedByPembina.length} Siswa)</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa yang mendaftar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
          />
        </div>
      </div>

      {/* Roster Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-5">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00B884]" />
            <span className="text-xs font-semibold">Memuat data pendaftar...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UserPlus className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <div className="font-bold text-slate-700">Tidak ada pendaftar di tab ini</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'SELEKSI' 
                ? 'Semua pendaftar baru telah Anda seleksi atau belum ada pendaftar baru masuk.' 
                : activeTab === 'SIAP_KIRIM'
                ? 'Belum ada siswa yang Anda tandai "Diterima". Pilih siswa dari tab Pendaftar Baru.'
                : 'Silakan periksa tab lainnya.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredList.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={item.namaSiswa}
                      className="w-12 h-12 rounded-2xl ring-2 ring-white shadow-xs shrink-0 text-sm"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-800 truncate">
                        {item.namaSiswa}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>NISN: {item.nisn}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">{item.kelas}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                        "{item.alasanDaftar || 'Berminat ikut ekstrakurikuler'}"
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {item.status === 'MENUNGGU_SELEKSI' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Perlu Seleksi
                      </span>
                    )}
                    {item.status === 'DITERIMA_PEMBINA' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Dipilih Pembina
                      </span>
                    )}
                    {item.status === 'MENUNGGU_VALIDASI_KOORDINATOR' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Menunggu Koordinator
                      </span>
                    )}
                    {item.status === 'RESMI_TERDAFTAR' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Resmi Terdaftar
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions per item for Pembina */}
                {item.status === 'MENUNGGU_SELEKSI' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => handleUpdateStatusSingle(item.id, 'DITOLAK')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleUpdateStatusSingle(item.id, 'DITERIMA_PEMBINA')}
                      className="px-4 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terima ke Kuota</span>
                    </button>
                  </div>
                )}

                {item.status === 'DITERIMA_PEMBINA' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Masuk kuota siswa terpilih</span>
                    </span>
                    <button
                      onClick={() => handleUpdateStatusSingle(item.id, 'MENUNGGU_SELEKSI')}
                      className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer underline"
                    >
                      Batal Terima
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal to Submit Batch to Koordinator */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Kirim Berkas Siswa ke Koordinator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ekstrakurikuler: <span className="font-bold text-slate-700">{activeEskul.namaEskul}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/70 space-y-1 text-xs text-emerald-900">
                <div className="font-bold">Ringkasan Kuota yang Diajukan:</div>
                <div className="flex items-center justify-between">
                  <span>Siswa Terpilih yang Dikirim:</span>
                  <span className="font-black font-mono text-sm">{acceptedByPembina.length} Siswa</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Anggota Resmi Saat Ini:</span>
                  <span>{officialMembers} Siswa</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Total Setelah Divalidasi:</span>
                  <span className="font-bold text-emerald-800">{officialMembers + acceptedByPembina.length} / {maxQuota} Kuota</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Catatan Pengantar untuk Koordinator (Opsional):</label>
                <textarea
                  value={catatanBatch}
                  onChange={(e) => setCatatanBatch(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                  placeholder="Contoh: Seluruh siswa telah memenuhi tes fisik dan uji bakat. Kuota telah terpenuhi."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitBatchToKoordinator}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Kirim Sekarang</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
