import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ExternalLink, 
  Calendar, 
  SlidersHorizontal, 
  X, 
  Check, 
  RotateCcw, 
  ShieldCheck,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eskul, PengajuanJadwal } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface EskulManagementProps {
  eskulList: Eskul[];
  jadwalProposals?: PengajuanJadwal[];
  onAddEskul: () => void;
  onAddPembina?: () => void;
  onOpenValidasiJadwal?: () => void;
  onEditEskul: (eskul: Eskul) => void;
  onDeleteEskul: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenSession: (eskul: Eskul) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Olahraga': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200/80' },
  'Teknologi': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300/80' },
  'Keagamaan': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200/80' },
  'Kepemimpinan': { bg: 'bg-emerald-100/70', text: 'text-emerald-900', border: 'border-emerald-300/80' },
  'Seni & Budaya': { bg: 'bg-amber-100/60', text: 'text-amber-900', border: 'border-amber-300/70' },
};

export const EskulManagement: React.FC<EskulManagementProps> = ({
  eskulList,
  jadwalProposals,
  onAddEskul,
  onAddPembina,
  onOpenValidasiJadwal,
  onEditEskul,
  onDeleteEskul,
  onToggleStatus,
  onOpenSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categories = ['Olahraga', 'Teknologi', 'Seni & Budaya', 'Keagamaan', 'Kepemimpinan'];
  const statuses = ['Aktif', 'Non-Aktif'];

  // Metrics
  const totalEskul = eskulList.length;
  const activeEskul = eskulList.filter(e => e.status !== 'Non-Aktif').length;
  const totalKuota = eskulList.reduce((acc, e) => acc + (e.kuota || 0), 0);
  const totalTerisi = eskulList.reduce((acc, e) => acc + (e.jumlahSiswa || 0), 0);

  const toggleStatus = (st: string) => {
    setSelectedStatuses(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const activeFilterCount = (selectedCategoryTab !== 'ALL' ? 1 : 0) + selectedStatuses.length;

  // Filtered List
  const filteredEskul = useMemo(() => {
    return eskulList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        item.namaEskul.toLowerCase().includes(q) ||
        item.pembinaNama.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        (item.jadwalHari && item.jadwalHari.toLowerCase().includes(q));

      const matchesCategoryTab = 
        selectedCategoryTab === 'ALL' || item.kategori === selectedCategoryTab;

      const matchesStatus = 
        selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

      return matchesSearch && matchesCategoryTab && matchesStatus;
    });
  }, [eskulList, searchTerm, selectedCategoryTab, selectedStatuses]);

  const getCatStyle = (cat: string) => {
    return CATEGORY_STYLES[cat] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00B884] tracking-tight">
            Kelola Ekstrakurikuler
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manajemen master data eskul, guru pembina, jadwal latihan mingguan, dan kapasitas kuota siswa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenValidasiJadwal && (
            <button
              onClick={onOpenValidasiJadwal}
              className="relative flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Validasi Jadwal</span>
              {jadwalProposals && jadwalProposals.filter(p => p.status === 'MENUNGGU_VALIDASI').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                  {jadwalProposals.filter(p => p.status === 'MENUNGGU_VALIDASI').length}
                </span>
              )}
            </button>
          )}

          {onAddPembina && (
            <button
              onClick={onAddPembina}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#00B884]" />
              <span>+ Buat Akun Pembina</span>
            </button>
          )}

          <button
            onClick={onAddEskul}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Eskul Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bento Grid (mirrors PembinaManagement layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Ekstrakurikuler
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {totalEskul} <span className="text-xs font-normal text-slate-400">Cabang</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Eskul Aktif Berjalan
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {activeEskul} <span className="text-xs font-normal text-slate-400">Aktif</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Kuota &amp; Pendaftar
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {totalTerisi} <span className="text-xs font-normal text-slate-400">/ {totalKuota} Kursi Siswa</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Quick Category Selector Pills (Kategori bentuk data seperti data pembina) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategoryTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategoryTab === 'ALL'
              ? 'bg-[#00B884] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Kategori ({totalEskul})
        </button>

        {categories.map((cat) => {
          const count = eskulList.filter(e => e.kategori === cat).length;
          const isSelected = selectedCategoryTab === cat;
          const style = getCatStyle(cat);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryTab(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : `${style.bg} ${style.text} ${style.border} hover:opacity-90`
              }`}
            >
              <span>{cat}</span>
              <span className="ml-1.5 opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter, & View Mode Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari eskul, pembina, hari, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Status Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              selectedStatuses.length > 0
                ? 'bg-emerald-50 text-[#00B884] border-emerald-300 ring-2 ring-[#00B884]/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Status</span>
            {selectedStatuses.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                {selectedStatuses.length}
              </span>
            )}
          </button>

          {/* View Mode Switcher: Table vs Cards Grid */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedCategoryTab !== 'ALL' || selectedStatuses.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-xs -mt-2">
          <span className="text-slate-400 font-medium">Filter Aktif:</span>
          {selectedCategoryTab !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#00B884] font-medium rounded-lg border border-emerald-200/60">
              Kategori: <strong>{selectedCategoryTab}</strong>
              <button type="button" onClick={() => setSelectedCategoryTab('ALL')} className="hover:text-emerald-800 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatuses.map((st) => (
            <span key={st} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#00B884] font-medium rounded-lg border border-emerald-200/60">
              Status: <strong>{st}</strong>
              <button type="button" onClick={() => toggleStatus(st)} className="hover:text-emerald-800 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => { setSelectedCategoryTab('ALL'); setSelectedStatuses([]); }}
            className="text-slate-500 hover:text-rose-600 font-semibold underline text-xs cursor-pointer ml-1"
          >
            Hapus Semua
          </button>
        </div>
      )}

      {/* Filter Modal Dialog */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md relative z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00B884]" />
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Filter Ekstrakurikuler</h3>
                    <p className="text-[11px] text-slate-400">Atur filter status dan kategori eskul</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Status Keaktifan
                </label>
                <div className="flex gap-2">
                  {statuses.map((st) => {
                    const isSelected = selectedStatuses.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStatus(st)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatuses([]);
                    setSelectedCategoryTab('ALL');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content: Table View vs Grid Cards View */}
      {filteredEskul.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tidak Ada Ekstrakurikuler Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada eskul yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategoryTab('ALL');
              setSelectedStatuses([]);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pencarian &amp; Filter</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ==================== VIEW 1: TABLE VIEW ==================== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Cabang Eskul</th>
                  <th className="py-3.5 px-4">Guru Pembina</th>
                  <th className="py-3.5 px-4">Jadwal &amp; Lokasi</th>
                  <th className="py-3.5 px-4">Kapasitas &amp; Kuota</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEskul.map((eskul) => {
                  const quotaPercent = Math.round((eskul.jumlahSiswa / (eskul.kuota || 1)) * 100);
                  const style = getCatStyle(eskul.kategori);

                  return (
                    <tr key={eskul.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Cabang Eskul */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-800 text-sm">
                            {eskul.namaEskul}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                              {eskul.kategori}
                            </span>
                            {eskul.deskripsi && (
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {eskul.deskripsi}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Guru Pembina */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={eskul.pembinaNama}
                            className="w-8 h-8 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-xs">
                              {eskul.pembinaNama}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Pembina Terdaftar
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Jadwal & Lokasi */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Setiap {eskul.jadwalHari || '-'}, {eskul.jamMulai || '15:30'} - {eskul.jamSelesai || '17:00'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{eskul.lokasi}</span>
                          </div>
                        </div>
                      </td>

                      {/* Kapasitas & Kuota */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700">
                              {eskul.jumlahSiswa} / {eskul.kuota} Siswa
                            </span>
                            <span className={`font-semibold ${quotaPercent >= 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {quotaPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                quotaPercent >= 90 ? 'bg-amber-500' : 'bg-[#00B884]'
                              }`}
                              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(eskul.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            eskul.status === 'Aktif'
                              ? 'bg-emerald-100/70 text-emerald-700 hover:bg-emerald-200/70'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {eskul.status === 'Aktif' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Non-Aktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenSession(eskul)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-[#00B884] text-[#00B884] hover:text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="Buka Sesi Presensi QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Buka Sesi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditEskul(eskul)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Eskul"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteEskul(eskul.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Eskul"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== VIEW 2: GRID CARDS VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEskul.map((eskul) => {
            const quotaPercent = Math.round((eskul.jumlahSiswa / (eskul.kuota || 1)) * 100);
            const style = getCatStyle(eskul.kategori);

            return (
              <div
                key={eskul.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                      {eskul.kategori}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(eskul.id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                        eskul.status === 'Aktif'
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {eskul.status === 'Aktif' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Non-Aktif</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Eskul Title & Description */}
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">
                    {eskul.namaEskul}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {eskul.deskripsi}
                  </p>

                  {/* Pembina Profile Box */}
                  <div className="flex items-center gap-3 my-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <UserAvatar
                      name={eskul.pembinaNama}
                      className="w-10 h-10 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">
                        Pembina Terdaftar
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {eskul.pembinaNama}
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Location */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Setiap {eskul.jadwalHari}, {eskul.jamMulai} - {eskul.jamSelesai} WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{eskul.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{eskul.jumlahSiswa} / {eskul.kuota} Siswa ({quotaPercent}%)</span>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full ${
                        quotaPercent >= 90 ? 'bg-amber-500' : 'bg-[#00B884]'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSession(eskul)}
                    className="flex-1 py-1.5 px-3 bg-[#00B884]/10 hover:bg-[#00B884]/20 text-[#00B884] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Sesi QR</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditEskul(eskul)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Ubah Data"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEskul(eskul.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Eskul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
