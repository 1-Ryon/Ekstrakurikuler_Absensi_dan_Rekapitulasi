import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
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
  ShieldCheck
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categories = ['Olahraga', 'Teknologi', 'Seni & Budaya', 'Keagamaan', 'Kepemimpinan'];
  const statuses = ['Aktif', 'Non-Aktif'];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatus = (st: string) => {
    setSelectedStatuses(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const activeFilterCount = selectedCategories.length + selectedStatuses.length;

  const filteredEskul = eskulList.filter((item) => {
    const matchesSearch = item.namaEskul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pembinaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.kategori);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header section matching style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Kelola Eskul & Pembina
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manajemen master data ekstrakurikuler, pembina terdaftar, jadwal, dan kuota siswa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenValidasiJadwal && (
            <button
              onClick={onOpenValidasiJadwal}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/70 border-2 border-emerald-300 text-[#00B884] font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
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
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 text-[#00B884] font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>+ Buat Akun Pembina</span>
            </button>
          )}

          <button
            onClick={onAddEskul}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Eskul Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari eskul, pembina, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        {/* Unified Filter Button (Opens Jendela Filter) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-emerald-50 text-[#00B884] border-emerald-300 ring-2 ring-[#00B884]/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs -mt-2">
          <span className="text-slate-400 font-medium">Filter Aktif:</span>
          {selectedCategories.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#00B884] font-medium rounded-lg border border-emerald-200/60">
              Kategori: <strong>{cat}</strong>
              <button type="button" onClick={() => toggleCategory(cat)} className="hover:text-emerald-800 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
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
            onClick={() => { setSelectedCategories([]); setSelectedStatuses([]); }}
            className="text-slate-500 hover:text-rose-600 font-semibold underline text-xs cursor-pointer ml-1"
          >
            Hapus Semua
          </button>
        </div>
      )}

      {/* Jendela Modal Filter (Multi-Choice) */}
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
                    <p className="text-[11px] text-slate-400">Bisa memilih lebih dari satu filter (Multi-Select)</p>
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

              {/* Kategori Field (Multi-select) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kategori Eskul {selectedCategories.length > 0 && <span className="text-[#00B884]">({selectedCategories.length})</span>}
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([...categories])}
                      className="text-[#00B884] hover:underline font-medium cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
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
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Field (Multi-select) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status Eskul {selectedStatuses.length > 0 && <span className="text-[#00B884]">({selectedStatuses.length})</span>}
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedStatuses([...statuses])}
                      className="text-[#00B884] hover:underline font-medium cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStatuses([])}
                      className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {statuses.map((st) => {
                    const isSelected = selectedStatuses.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStatus(st)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
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
                    setSelectedCategories([]);
                    setSelectedStatuses([]);
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

      {/* Grid of Eskul Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEskul.map((eskul) => {
          const quotaPercent = Math.round((eskul.jumlahSiswa / eskul.kuota) * 100);

          return (
            <div
              key={eskul.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-[11px] font-semibold rounded-full border border-emerald-100">
                    {eskul.kategori}
                  </span>
                  <button
                    onClick={() => onToggleStatus(eskul.id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
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
                    <span>{eskul.jumlahSiswa} / {eskul.kuota} Siswa Terdaftar ({quotaPercent}%)</span>
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
                  onClick={() => onOpenSession(eskul)}
                  className="flex-1 py-1.5 px-3 bg-[#00B884]/10 hover:bg-[#00B884]/20 text-[#00B884] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Sesi QR</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditEskul(eskul)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Ubah Data"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEskul(eskul.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
    </div>
  );
};
