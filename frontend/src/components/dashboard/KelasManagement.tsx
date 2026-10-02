import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  Edit2, 
  SlidersHorizontal, 
  X, 
  Check, 
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Kelas, Guru } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export interface JurusanInfo {
  kode: string;
  nama: string;
}

// Daftar jurusan vokasi SMK standar & populer di Indonesia
export const POPULAR_JURUSAN: JurusanInfo[] = [
  { kode: 'RPL', nama: 'Rekayasa Perangkat Lunak' },
  { kode: 'TKJ', nama: 'Teknik Komputer & Jaringan' },
  { kode: 'AKL', nama: 'Akuntansi Keuangan Lembaga' },
  { kode: 'OTKP', nama: 'Otomatisasi Tata Kelola Perkantoran (MPLB)' },
  { kode: 'BDP', nama: 'Bisnis Daring & Pemasaran' },
  { kode: 'DKV', nama: 'Desain Komunikasi Visual' },
  { kode: 'PPLG', nama: 'Pengembangan Perangkat Lunak & Gim' },
  { kode: 'TJKT', nama: 'Teknik Jaringan Komputer & Telekomunikasi' },
  { kode: 'ANIMASI', nama: 'Animasi & Industri Kreatif' },
  { kode: 'KULINER', nama: 'Kuliner / Tata Boga' },
  { kode: 'PERHOTELAN', nama: 'Perhotelan & Pariwisata' },
  { kode: 'FARMASI', nama: 'Farmasi Klinis & Komunitas' },
  { kode: 'BROADCASTING', nama: 'Broadcasting & Perfilman' },
];

interface KelasManagementProps {
  kelasList: Kelas[];
  guruList: Guru[];
  onAddKelas: (newKelas: { namaKelas: string; tingkat: number; jurusan: string; waliKelasId?: string }) => void;
  onAssignWaliKelas: (kelasId: string, waliKelasId: string) => void;
  onUpdateKelas?: (kelasId: string, data: { namaKelas?: string; tingkat?: number; jurusan?: string; waliKelasId?: string }) => void;
  onDeleteKelas?: (kelasId: string) => void;
}

export const KelasManagement: React.FC<KelasManagementProps> = ({
  kelasList,
  guruList,
  onAddKelas,
  onAssignWaliKelas,
  onUpdateKelas,
  onDeleteKelas,
}) => {
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedStatusWali, setSelectedStatusWali] = useState<string[]>([]);
  const [selectedJurusanFilter, setSelectedJurusanFilter] = useState<string>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  // Add Form states
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState(10);
  const [jurusan, setJurusan] = useState('Rekayasa Perangkat Lunak');
  const [isCustomJurusan, setIsCustomJurusan] = useState(false);
  const [customJurusan, setCustomJurusan] = useState('');
  const [selectedWaliId, setSelectedWaliId] = useState('');

  // Edit Form states
  const [editNamaKelas, setEditNamaKelas] = useState('');
  const [editTingkat, setEditTingkat] = useState(10);
  const [editJurusan, setEditJurusan] = useState('');
  const [isEditCustomJurusan, setIsEditCustomJurusan] = useState(false);
  const [editCustomJurusan, setEditCustomJurusan] = useState('');
  const [editWaliId, setEditWaliId] = useState('');

  // Dynamically aggregate ALL unique majors (Preset + existing custom from database)
  const allAvailableJurusan = useMemo(() => {
    const map = new Map<string, string>();
    POPULAR_JURUSAN.forEach(j => {
      map.set(j.nama.toLowerCase(), j.nama);
    });
    kelasList.forEach(k => {
      if (k.jurusan && !map.has(k.jurusan.toLowerCase())) {
        map.set(k.jurusan.toLowerCase(), k.jurusan);
      }
    });
    return Array.from(map.values()).sort();
  }, [kelasList]);

  // Unique majors currently in use across existing classes (for quick filter tabs)
  const activeJurusanSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    kelasList.forEach(k => {
      if (k.jurusan) {
        counts[k.jurusan] = (counts[k.jurusan] || 0) + 1;
      }
    });
    return counts;
  }, [kelasList]);

  // Smart Auto-detection of Jurusan from Class Name (e.g., typing 'X DKV 1' -> 'Desain Komunikasi Visual')
  const handleNamaKelasChange = (val: string) => {
    setNamaKelas(val);
    const upper = val.toUpperCase();

    // Check against popular abbreviations
    for (const item of POPULAR_JURUSAN) {
      if (upper.includes(item.kode)) {
        setJurusan(item.nama);
        setIsCustomJurusan(false);
        break;
      }
    }

    // Auto detect Tingkat (X, XI, XII or 10, 11, 12)
    if (upper.startsWith('XII') || upper.startsWith('12')) {
      setTingkat(12);
    } else if (upper.startsWith('XI') || upper.startsWith('11')) {
      setTingkat(11);
    } else if (upper.startsWith('X') || upper.startsWith('10')) {
      setTingkat(10);
    }
  };

  const toggleTingkat = (t: string) => {
    setSelectedTingkat(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleStatusWali = (s: string) => {
    setSelectedStatusWali(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const activeFiltersCount = selectedTingkat.length + selectedStatusWali.length + (selectedJurusanFilter !== 'ALL' ? 1 : 0);

  // Filtered Class List
  const filteredKelas = useMemo(() => {
    return kelasList.filter((k) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = k.namaKelas.toLowerCase().includes(search) ||
        k.jurusan.toLowerCase().includes(search) ||
        (k.waliKelas?.namaLengkap && k.waliKelas.namaLengkap.toLowerCase().includes(search));

      const matchesTingkat = selectedTingkat.length === 0 || selectedTingkat.includes(String(k.tingkat));
      const matchesStatusWali = selectedStatusWali.length === 0 || 
        (selectedStatusWali.includes('assigned') && !!k.waliKelasId) ||
        (selectedStatusWali.includes('unassigned') && !k.waliKelasId);

      const matchesJurusan = selectedJurusanFilter === 'ALL' || k.jurusan === selectedJurusanFilter;

      return matchesSearch && matchesTingkat && matchesStatusWali && matchesJurusan;
    });
  }, [kelasList, searchTerm, selectedTingkat, selectedStatusWali, selectedJurusanFilter]);

  // Handle Save New Class
  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    const finalJurusan = isCustomJurusan 
      ? (customJurusan.trim() || 'Umum') 
      : jurusan;

    onAddKelas({
      namaKelas: namaKelas.trim(),
      tingkat: Number(tingkat),
      jurusan: finalJurusan,
      waliKelasId: selectedWaliId || undefined,
    });

    // Reset Form
    setNamaKelas('');
    setCustomJurusan('');
    setIsCustomJurusan(false);
    setSelectedWaliId('');
    setIsAddModalOpen(false);
  };

  // Open Edit Modal
  const openEditModal = (k: Kelas) => {
    setEditingKelas(k);
    setEditNamaKelas(k.namaKelas);
    setEditTingkat(k.tingkat || 10);
    setEditWaliId(k.waliKelasId || '');

    if (allAvailableJurusan.includes(k.jurusan)) {
      setEditJurusan(k.jurusan);
      setIsEditCustomJurusan(false);
      setEditCustomJurusan('');
    } else {
      setEditJurusan('CUSTOM');
      setIsEditCustomJurusan(true);
      setEditCustomJurusan(k.jurusan);
    }
  };

  // Handle Save Edit Class
  const handleSaveEditKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKelas) return;

    const finalJurusan = isEditCustomJurusan
      ? (editCustomJurusan.trim() || editingKelas.jurusan)
      : editJurusan;

    if (onUpdateKelas) {
      onUpdateKelas(editingKelas.id, {
        namaKelas: editNamaKelas.trim() || editingKelas.namaKelas,
        tingkat: Number(editTingkat),
        jurusan: finalJurusan,
        waliKelasId: editWaliId || undefined,
      });
    } else {
      // Fallback: assign wali kelas only
      onAssignWaliKelas(editingKelas.id, editWaliId);
    }

    setEditingKelas(null);
  };

  // Handle Delete Class
  const handleDeleteClass = (kelasId: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kelas "${nama}"? Data siswa di kelas ini tidak akan terhapus, namun status rombelnya akan direset.`)) {
      if (onDeleteKelas) {
        onDeleteKelas(kelasId);
      }
      setEditingKelas(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
            <span className="text-xs text-slate-400 font-medium">T.A. 2026/2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Data Kelas & Rombel
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">
            Manajemen rombel kelas, struktur kejuruan, penugasan wali kelas, dan integrasi data presensi siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCustomJurusan(false);
            setCustomJurusan('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kelas, jurusan, atau wali kelas..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-emerald-50 text-[#00B884] border-emerald-300 ring-2 ring-[#00B884]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00B884]" />
              <span>Filter Tingkat & Wali</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Total: <strong className="text-slate-900 font-bold">{filteredKelas.length}</strong> Rombel
            </span>
          </div>
        </div>

        {/* 3. Dynamic Quick Jurusan Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Jurusan:</span>
          
          <button
            type="button"
            onClick={() => setSelectedJurusanFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedJurusanFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Semua ({kelasList.length})
          </button>

          {Object.entries(activeJurusanSummary).map(([jurusanName, count]) => {
            const isSelected = selectedJurusanFilter === jurusanName;
            return (
              <button
                key={jurusanName}
                type="button"
                onClick={() => setSelectedJurusanFilter(isSelected ? 'ALL' : jurusanName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span>{jurusanName}</span>
                <span className={`ml-1.5 text-[11px] font-normal ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}

          {selectedJurusanFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedJurusanFilter('ALL')}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Reset Jurusan
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedTingkat.length > 0 || selectedStatusWali.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Filter Aktif:</span>

            {selectedTingkat.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                <span>Tingkat {t}</span>
                <button type="button" onClick={() => toggleTingkat(t)} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {selectedStatusWali.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                <span>{s === 'assigned' ? 'Sudah Ada Wali' : 'Belum Ada Wali'}</span>
                <button type="button" onClick={() => toggleStatusWali(s)} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => {
                setSelectedTingkat([]);
                setSelectedStatusWali([]);
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* 4. Filter Modal Window */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md relative z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Filter Rombel Kelas</h3>
                    <p className="text-xs text-slate-400">Saring berdasarkan jenjang dan penugasan wali</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tingkat */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Tingkat Kelas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['10', '11', '12'].map((t) => {
                    const isSelected = selectedTingkat.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTingkat(t)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-[#00B884] border-[#00B884]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Kelas {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Wali */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Status Wali Kelas
                </label>
                <div className="space-y-1.5">
                  {[
                    { val: 'assigned', label: 'Sudah Ditugaskan Wali Kelas' },
                    { val: 'unassigned', label: 'Belum Ada Wali Kelas' }
                  ].map((s) => {
                    const isSelected = selectedStatusWali.includes(s.val);
                    return (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => toggleStatusWali(s.val)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-[#00B884] border-[#00B884]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{s.label}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${
                          isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTingkat([]);
                    setSelectedStatusWali([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Grid of Classes */}
      {filteredKelas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada rombel kelas yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Tidak ditemukan kelas untuk pencarian atau filter yang sedang diterapkan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedTingkat([]);
              setSelectedStatusWali([]);
              setSelectedJurusanFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKelas.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center font-black text-lg border border-emerald-100 shadow-2xs">
                      {k.tingkat}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {k.namaKelas}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200/60">
                        {k.jurusan}
                      </span>
                    </div>
                  </div>
                  
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(k)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#00B884] hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                    title="Ubah Rombel / Wali Kelas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Wali Kelas Card */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Wali Kelas</span>
                    </div>
                    {k.waliKelas && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Ditugaskan</span>
                    )}
                  </div>

                  {k.waliKelas ? (
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={k.waliKelas.namaLengkap}
                        className="w-9 h-9 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-2xs"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {k.waliKelas.namaLengkap}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          NIP: {k.waliKelas.nip || '-'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Belum Ada Wali</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditModal(k)}
                        className="text-[11px] text-[#00B884] hover:underline font-bold cursor-pointer"
                      >
                        + Tugaskan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{k._count?.siswaList ?? 0} Siswa Terdaftar</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Semester Ganjil
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Modal Tambah Kelas Baru (With Dynamic Jurusan Support) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Rombel Kelas Baru</h3>
                  <p className="text-xs text-slate-400">Daftarkan rombel kelas dan jurusan ke sistem sekolah</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveKelas} className="space-y-4">
                {/* Nama Kelas */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Rombel Kelas (Contoh: X RPL 1, XI DKV 2)
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKelas}
                    onChange={(e) => handleNamaKelasChange(e.target.value)}
                    placeholder="Contoh: X DKV 1"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Sistem otomatis mendeteksi tingkat &amp; jurusan dari kode kelas.</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tingkat */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat</label>
                    <select
                      value={tingkat}
                      onChange={(e) => setTingkat(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                    >
                      <option value={10}>Kelas 10 (X)</option>
                      <option value={11}>Kelas 11 (XI)</option>
                      <option value={12}>Kelas 12 (XII)</option>
                    </select>
                  </div>

                  {/* Jurusan Dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Jurusan</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomJurusan(!isCustomJurusan);
                          if (!isCustomJurusan) setCustomJurusan('');
                        }}
                        className="text-[10px] text-[#00B884] hover:underline font-bold cursor-pointer"
                      >
                        {isCustomJurusan ? 'Pilih dari List' : '+ Jurusan Baru'}
                      </button>
                    </div>

                    {!isCustomJurusan ? (
                      <select
                        value={jurusan}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM_OPTION') {
                            setIsCustomJurusan(true);
                            setCustomJurusan('');
                          } else {
                            setJurusan(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                      >
                        {allAvailableJurusan.map((jName) => (
                          <option key={jName} value={jName}>
                            {jName}
                          </option>
                        ))}
                        <option value="CUSTOM_OPTION">+ Tambah Jurusan Baru (Kustom)...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={customJurusan}
                        onChange={(e) => setCustomJurusan(e.target.value)}
                        placeholder="Ketik nama jurusan baru..."
                        className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                      />
                    )}
                  </div>
                </div>

                {isCustomJurusan && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Jurusan <strong>{customJurusan || 'baru'}</strong> akan otomatis tersimpan ke database dan tersedia untuk pemilihan rombel kelas berikutnya.
                    </span>
                  </div>
                )}

                {/* Pilih Wali Kelas (Opsional) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Pilih Wali Kelas (Opsional)
                  </label>
                  <select
                    value={selectedWaliId}
                    onChange={(e) => setSelectedWaliId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                  >
                    <option value="">-- Belum Ditugaskan Wali Kelas --</option>
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.namaLengkap} ({g.nip ? `NIP: ${g.nip}` : 'Guru'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Simpan Kelas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal Edit / Detail Rombel Kelas & Wali Kelas */}
      <AnimatePresence>
        {editingKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingKelas(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ubah Data Rombel Kelas</h3>
                  <p className="text-xs text-slate-400">Perbarui nama kelas, jurusan, atau wali kelas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingKelas(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditKelas} className="space-y-4">
                {/* Nama Kelas */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Rombel Kelas</label>
                  <input
                    type="text"
                    required
                    value={editNamaKelas}
                    onChange={(e) => setEditNamaKelas(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tingkat */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat</label>
                    <select
                      value={editTingkat}
                      onChange={(e) => setEditTingkat(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value={10}>Kelas 10 (X)</option>
                      <option value={11}>Kelas 11 (XI)</option>
                      <option value={12}>Kelas 12 (XII)</option>
                    </select>
                  </div>

                  {/* Jurusan */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Jurusan</label>
                      <button
                        type="button"
                        onClick={() => setIsEditCustomJurusan(!isEditCustomJurusan)}
                        className="text-[10px] text-[#00B884] hover:underline font-bold cursor-pointer"
                      >
                        {isEditCustomJurusan ? 'List' : '+ Kustom'}
                      </button>
                    </div>

                    {!isEditCustomJurusan ? (
                      <select
                        value={editJurusan}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM_OPTION') {
                            setIsEditCustomJurusan(true);
                            setEditCustomJurusan('');
                          } else {
                            setEditJurusan(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      >
                        {allAvailableJurusan.map((jName) => (
                          <option key={jName} value={jName}>
                            {jName}
                          </option>
                        ))}
                        <option value="CUSTOM_OPTION">+ Tambah Jurusan Baru (Kustom)...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={editCustomJurusan}
                        onChange={(e) => setEditCustomJurusan(e.target.value)}
                        placeholder="Nama jurusan baru..."
                        className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-medium text-slate-800"
                      />
                    )}
                  </div>
                </div>

                {/* Wali Kelas */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Wali Kelas
                  </label>
                  <select
                    value={editWaliId}
                    onChange={(e) => setEditWaliId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
                  >
                    <option value="">-- Belum Ditugaskan Wali Kelas --</option>
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.namaLengkap} - {g.nip ? `NIP: ${g.nip}` : 'Guru SMK'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(editingKelas.id, editingKelas.namaKelas)}
                    className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kelas</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingKelas(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
