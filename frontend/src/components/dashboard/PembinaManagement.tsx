import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Upload,
  Phone, 
  Mail, 
  Award, 
  Volleyball, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import { Guru, Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface PembinaManagementProps {
  pembinaList: Guru[];
  eskulList: Eskul[];
  onAddPembina: () => void;
  onOpenImport?: () => void;
  onEditPembina: (pembina: Guru) => void;
  onDeletePembina: (id: string) => void;
}

export const PembinaManagement: React.FC<PembinaManagementProps> = ({
  pembinaList,
  eskulList,
  onAddPembina,
  onOpenImport,
  onEditPembina,
  onDeletePembina,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEskulFilter, setSelectedEskulFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Compute statistics
  const totalPembina = pembinaList.length;
  const activePembina = pembinaList.filter(p => p.statusAktif !== false).length;
  const coachedEskulCount = eskulList.filter(e => e.pembinaId).length;

  // Filtered list
  const filteredList = useMemo(() => {
    return pembinaList.filter((p) => {
      // Search query
      const matchesSearch = 
        p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.spesialisasi && p.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.eskulDiampu && p.eskulDiampu.some(e => e.namaEskul.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      // Eskul Filter
      if (selectedEskulFilter !== 'ALL') {
        const hasEskul = p.eskulDiampu?.some(e => e.id === selectedEskulFilter || e.namaEskul === selectedEskulFilter);
        if (!hasEskul) return false;
      }

      // Status Filter
      if (selectedStatusFilter === 'AKTIF' && p.statusAktif === false) return false;
      if (selectedStatusFilter === 'NON_AKTIF' && p.statusAktif !== false) return false;

      return true;
    });
  }, [pembinaList, searchTerm, selectedEskulFilter, selectedStatusFilter]);

  const activeFiltersCount = (selectedEskulFilter !== 'ALL' ? 1 : 0) + (selectedStatusFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Data Guru Pembina
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master data pembina ekstrakurikuler, penugasan cabang eskul, dan kredensial akun login.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Impor Data Pembina</span>
            </button>
          )}
          <button
            onClick={onAddPembina}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Buat Akun Pembina</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Pembina Terdaftar
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {totalPembina} <span className="text-xs font-normal text-slate-400">Guru</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pembina Aktif Bertugas
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {activePembina} <span className="text-xs font-normal text-slate-400">Akun</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cabang Eskul Terbina
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {coachedEskulCount} <span className="text-xs font-normal text-slate-400">Cabang</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Volleyball className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
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
            placeholder="Cari nama pembina, NIP, eskul, username..."
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
                <h3 className="text-base font-extrabold text-slate-800">Filter Data Pembina</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Filter Eskul */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Cabang Eskul Binaan</label>
                <select
                  value={selectedEskulFilter}
                  onChange={(e) => setSelectedEskulFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                >
                  <option value="ALL">Semua Cabang Eskul</option>
                  {eskulList.map((eskul) => (
                    <option key={eskul.id} value={eskul.namaEskul}>
                      {eskul.namaEskul} ({eskul.kategori})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Status Akun</label>
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
                  setSelectedEskulFilter('ALL');
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

      {/* Main Content: Table or Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data pembina yang sesuai</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data pembina.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Guru Pembina</th>
                  <th className="py-3.5 px-4">Eskul yang Dibina</th>
                  <th className="py-3.5 px-4">Akun Login</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((pembina) => {
                  // Resolve coached eskul names
                  const coachedEskuls = eskulList.filter(
                    (e) => e.pembinaId === pembina.id || (e.pembinaNama && e.pembinaNama.toLowerCase() === pembina.namaLengkap.toLowerCase())
                  );

                  return (
                    <tr key={pembina.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={pembina.namaLengkap}
                            className="w-10 h-10 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-xs"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {pembina.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              NIP: {pembina.nip || '-'}
                            </div>
                            {pembina.spesialisasi && (
                              <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mt-1 font-medium">
                                {pembina.spesialisasi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coached Eskuls */}
                      <td className="py-3.5 px-4">
                        {coachedEskuls.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {coachedEskuls.map((eskul) => (
                              <span
                                key={eskul.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] border border-emerald-200/60 text-[11px] font-semibold"
                              >
                                <Volleyball className="w-3 h-3" />
                                <span>{eskul.namaEskul}</span>
                              </span>
                            ))}
                          </div>
                        ) : pembina.eskulDiampu && pembina.eskulDiampu.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {pembina.eskulDiampu.map((e) => (
                              <span
                                key={e.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] border border-emerald-200/60 text-[11px] font-semibold"
                              >
                                <Volleyball className="w-3 h-3" />
                                <span>{e.namaEskul}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ditugaskan</span>
                        )}
                      </td>

                      {/* Login Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                            <span className="text-slate-400">User:</span>
                            <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                              {pembina.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <KeyRound className="w-3 h-3 text-slate-400" />
                            <span>Pass: pembina_{pembina.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contacts */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-[11px]">
                          {pembina.noHp && pembina.noHp !== '-' ? (
                            <a
                              href={`https://wa.me/${pembina.noHp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-slate-600 hover:text-[#00B884] transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#00B884]" />
                              <span>{pembina.noHp}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                          {pembina.email && pembina.email !== '-' && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{pembina.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pembina.statusAktif !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pembina.statusAktif !== false ? 'bg-[#00B884]' : 'bg-slate-400'
                            }`}
                          />
                          <span>{pembina.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditPembina(pembina)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Pembina"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data pembina "${pembina.namaLengkap}"?`)) {
                                onDeletePembina(pembina.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pembina"
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
          {filteredList.map((pembina) => {
            const coachedEskuls = eskulList.filter(
              (e) => e.pembinaId === pembina.id || (e.pembinaNama && e.pembinaNama.toLowerCase() === pembina.namaLengkap.toLowerCase())
            );

            return (
              <div
                key={pembina.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={pembina.namaLengkap}
                        className="w-12 h-12 ring-2 ring-emerald-500/20 shrink-0 text-sm shadow-xs"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                          {pembina.namaLengkap}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          NIP: {pembina.nip || '-'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        pembina.statusAktif !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pembina.statusAktif !== false ? 'bg-[#00B884]' : 'bg-slate-400'}`} />
                      {pembina.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>

                  {pembina.spesialisasi && (
                    <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <strong>Spesialisasi:</strong> {pembina.spesialisasi}
                    </div>
                  )}

                  {/* Coached Eskuls */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cabang Eskul Binaan:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coachedEskuls.length > 0 ? (
                        coachedEskuls.map((eskul) => (
                          <span
                            key={eskul.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] border border-emerald-200/60 text-[11px] font-semibold"
                          >
                            <Volleyball className="w-3 h-3" />
                            <span>{eskul.namaEskul}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum ditugaskan</span>
                      )}
                    </div>
                  </div>

                  {/* Credentials & Contact */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {pembina.username}
                      </span>
                    </div>
                    {pembina.noHp && pembina.noHp !== '-' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${pembina.noHp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[#00B884] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{pembina.noHp}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditPembina(pembina)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah Data</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus data pembina "${pembina.namaLengkap}"?`)) {
                        onDeletePembina(pembina.id);
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
