import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Upload,
  Phone, 
  Mail, 
  School, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  Users,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Guru, Kelas } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface GuruWaliManagementProps {
  guruList: Guru[];
  kelasList: Kelas[];
  onAddGuru: () => void;
  onOpenImport?: () => void;
  onEditGuru: (guru: Guru) => void;
  onDeleteGuru: (id: string) => void;
  onAssignWaliKelas: (kelasId: string, waliKelasId: string) => void;
}

export const GuruWaliManagement: React.FC<GuruWaliManagementProps> = ({
  guruList,
  kelasList,
  onAddGuru,
  onOpenImport,
  onEditGuru,
  onDeleteGuru,
  onAssignWaliKelas,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'WALI_KELAS' | 'NON_WALI'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [assigningGuru, setAssigningGuru] = useState<Guru | null>(null);
  const [selectedKelasIdToAssign, setSelectedKelasIdToAssign] = useState<string>('');

  // Statistics
  const totalGuru = guruList.length;
  const waliKelasCount = guruList.filter(g => g.isWaliKelas || (g.kelasWali && g.kelasWali.length > 0)).length;
  const totalKelas = kelasList.length;
  const unassignedKelasCount = kelasList.filter(k => !k.waliKelasId).length;

  // Filtered List
  const filteredList = useMemo(() => {
    return guruList.filter((g) => {
      // Search
      const matchesSearch =
        g.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.spesialisasi && g.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.kelasWali && g.kelasWali.some(k => k.namaKelas.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      // Role Filter (Wali Kelas vs Guru)
      const isWali = g.isWaliKelas || (g.kelasWali && g.kelasWali.length > 0);
      if (selectedRoleFilter === 'WALI_KELAS' && !isWali) return false;
      if (selectedRoleFilter === 'NON_WALI' && isWali) return false;

      // Status Filter
      if (selectedStatusFilter === 'AKTIF' && g.statusAktif === false) return false;
      if (selectedStatusFilter === 'NON_AKTIF' && g.statusAktif !== false) return false;

      return true;
    });
  }, [guruList, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  const activeFiltersCount = (selectedRoleFilter !== 'ALL' ? 1 : 0) + (selectedStatusFilter !== 'ALL' ? 1 : 0);

  const handleOpenAssign = (guru: Guru) => {
    setAssigningGuru(guru);
    const currentlyAssigned = kelasList.find(k => k.waliKelasId === guru.id);
    setSelectedKelasIdToAssign(currentlyAssigned?.id || '');
  };

  const handleSaveAssign = () => {
    if (assigningGuru && selectedKelasIdToAssign) {
      onAssignWaliKelas(selectedKelasIdToAssign, assigningGuru.id);
      setAssigningGuru(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Data Guru & Wali Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master data tenaga pendidik, penetapan wali kelas per rombel, dan manajemen akun.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Impor Data Guru</span>
            </button>
          )}
          <button
            onClick={onAddGuru}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Tambah Guru / Wali Kelas</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Guru Terdata
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {totalGuru} <span className="text-xs font-normal text-slate-400">Guru</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Wali Kelas Ditugaskan
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {waliKelasCount} <span className="text-xs font-normal text-slate-400">Rombel</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Kelas / Rombel
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {totalKelas} <span className="text-xs font-normal text-slate-400">Kelas</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <School className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kelas Belum Ada Wali
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {unassignedKelasCount} <span className="text-xs font-normal text-slate-400">Kelas</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari guru, NIP, kelas binaan, username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 text-[#00B884] border-emerald-300 ring-2 ring-[#00B884]/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00B884]" />
                <h3 className="text-base font-extrabold text-slate-800">Filter Data Guru & Wali</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Role Penugasan Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Penugasan Wali Kelas</label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                >
                  <option value="ALL">Semua Guru Pendidik</option>
                  <option value="WALI_KELAS">Hanya yang Bertugas Wali Kelas</option>
                  <option value="NON_WALI">Belum Ditugaskan Wali Kelas</option>
                </select>
              </div>

              {/* Status Akun Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Status Akun Login</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AKTIF">Hanya Aktif</option>
                  <option value="NON_AKTIF">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Wali Kelas Modal */}
      {assigningGuru && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Tetapkan Wali Kelas
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih rombongan belajar untuk {assigningGuru.namaLengkap}
                </p>
              </div>
              <button
                onClick={() => setAssigningGuru(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Pilih Kelas Binaan</label>
              <select
                value={selectedKelasIdToAssign}
                onChange={(e) => setSelectedKelasIdToAssign(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKelas} ({k.jurusan}) {k.waliKelasId && k.waliKelasId !== assigningGuru.id ? `— Saat ini: ${k.waliKelas?.namaLengkap || 'Ada Wali Lain'}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssigningGuru(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAssign}
                disabled={!selectedKelasIdToAssign}
                className="px-5 py-2 bg-[#00B884] hover:bg-[#009E71] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data guru yang sesuai</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan daftar guru pendidik.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Guru Pendidik</th>
                  <th className="py-3.5 px-4">Tugas Wali Kelas</th>
                  <th className="py-3.5 px-4">Akun Login</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((guru) => {
                  // Resolve class assigned to this guru
                  const assignedClass = kelasList.find(k => k.waliKelasId === guru.id) || 
                    (guru.kelasWali && guru.kelasWali.length > 0 ? guru.kelasWali[0] : null);

                  return (
                    <tr key={guru.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={guru.namaLengkap}
                            className="w-10 h-10 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-xs"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {guru.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              NIP: {guru.nip || '-'}
                            </div>
                            {guru.spesialisasi && (
                              <div className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md inline-block mt-1 font-medium">
                                {guru.spesialisasi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Wali Kelas Binaan */}
                      <td className="py-3.5 px-4">
                        {assignedClass ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60 text-[11px] font-semibold">
                            <School className="w-3.5 h-3.5" />
                            <span>{assignedClass.namaKelas}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssign(guru)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tugaskan Kelas</span>
                          </button>
                        )}
                      </td>

                      {/* Login Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                            <span className="text-slate-400">User:</span>
                            <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                              {guru.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <KeyRound className="w-3 h-3 text-slate-400" />
                            <span>Pass: guru_{guru.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contacts */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-[11px]">
                          {guru.noHp && guru.noHp !== '-' ? (
                            <a
                              href={`https://wa.me/${guru.noHp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-slate-600 hover:text-[#00B884] transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#00B884]" />
                              <span>{guru.noHp}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                          {guru.email && guru.email !== '-' && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{guru.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            guru.statusAktif !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              guru.statusAktif !== false ? 'bg-[#00B884]' : 'bg-slate-400'
                            }`}
                          />
                          <span>{guru.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAssign(guru)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Tetapkan / Ganti Kelas Wali"
                          >
                            <School className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditGuru(guru)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data guru "${guru.namaLengkap}"?`)) {
                                onDeleteGuru(guru.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Guru"
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
        /* BENTO GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((guru) => {
            const assignedClass = kelasList.find(k => k.waliKelasId === guru.id) || 
              (guru.kelasWali && guru.kelasWali.length > 0 ? guru.kelasWali[0] : null);

            return (
              <div
                key={guru.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={guru.namaLengkap}
                        className="w-12 h-12 ring-2 ring-emerald-500/20 shrink-0 text-sm shadow-xs"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                          {guru.namaLengkap}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          NIP: {guru.nip || '-'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        guru.statusAktif !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${guru.statusAktif !== false ? 'bg-[#00B884]' : 'bg-slate-400'}`} />
                      {guru.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>

                  {guru.spesialisasi && (
                    <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <strong>Bidang:</strong> {guru.spesialisasi}
                    </div>
                  )}

                  {/* Wali Kelas Badge */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Penugasan Wali Kelas:
                    </div>
                    {assignedClass ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-bold">
                        <School className="w-4 h-4" />
                        <span>Wali Kelas {assignedClass.namaKelas}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssign(guru)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tetapkan Sebagai Wali Kelas</span>
                      </button>
                    )}
                  </div>

                  {/* Credentials & Contact */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {guru.username}
                      </span>
                    </div>
                    {guru.noHp && guru.noHp !== '-' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${guru.noHp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[#00B884] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{guru.noHp}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenAssign(guru)}
                    className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Penugasan Kelas"
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>Kelas</span>
                  </button>
                  <button
                    onClick={() => onEditGuru(guru)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus data guru "${guru.namaLengkap}"?`)) {
                        onDeleteGuru(guru.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
