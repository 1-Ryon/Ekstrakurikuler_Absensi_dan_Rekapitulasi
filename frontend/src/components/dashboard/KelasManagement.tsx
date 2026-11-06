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
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import {
  Card,
  Button,
  Badge,
  Input,
} from '../ui';

export interface JurusanInfo {
  kode: string;
  nama: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState<string[]>([]);
  const [selectedStatusWali, setSelectedStatusWali] = useState<string[]>([]);
  const [selectedJurusanFilter, setSelectedJurusanFilter] = useState<string>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [deletingKelas, setDeletingKelas] = useState<{ id: string; nama: string } | null>(null);

  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState(10);
  const [jurusan, setJurusan] = useState('Rekayasa Perangkat Lunak');
  const [isCustomJurusan, setIsCustomJurusan] = useState(false);
  const [customJurusan, setCustomJurusan] = useState('');
  const [selectedWaliId, setSelectedWaliId] = useState('');

  const [editNamaKelas, setEditNamaKelas] = useState('');
  const [editTingkat, setEditTingkat] = useState(10);
  const [editJurusan, setEditJurusan] = useState('');
  const [isEditCustomJurusan, setIsEditCustomJurusan] = useState(false);
  const [editCustomJurusan, setEditCustomJurusan] = useState('');
  const [editWaliId, setEditWaliId] = useState('');

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

  const activeJurusanSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    kelasList.forEach(k => {
      if (k.jurusan) {
        counts[k.jurusan] = (counts[k.jurusan] || 0) + 1;
      }
    });
    return counts;
  }, [kelasList]);

  const handleNamaKelasChange = (val: string) => {
    setNamaKelas(val);
    const upper = val.toUpperCase();

    for (const item of POPULAR_JURUSAN) {
      if (upper.includes(item.kode)) {
        setJurusan(item.nama);
        setIsCustomJurusan(false);
        break;
      }
    }

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

    setNamaKelas('');
    setCustomJurusan('');
    setIsCustomJurusan(false);
    setSelectedWaliId('');
    setIsAddModalOpen(false);
  };

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
      onAssignWaliKelas(editingKelas.id, editWaliId);
    }

    setEditingKelas(null);
  };

  const handleDeleteClass = (kelasId: string, nama: string) => {
    setDeletingKelas({ id: kelasId, nama });
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Kelas &amp; Rombel
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Manajemen rombel kelas, struktur kejuruan, penugasan wali kelas, dan integrasi data presensi siswa.
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          type="button"
          onClick={() => {
            setIsCustomJurusan(false);
            setCustomJurusan('');
            setIsAddModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          <span>Tambah Kelas Baru</span>
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kelas, jurusan, atau wali kelas..."
              className="pl-9 pr-8 h-9 text-xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`gap-2 h-9 text-xs ${
                activeFiltersCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : ''
              }`}
            >
              <SlidersHorizontal className="size-3.5 text-emerald-600" />
              <span>Filter Tingkat & Wali</span>
              {activeFiltersCount > 0 && (
                <Badge variant="brand" className="size-4 p-0 text-[10px] flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Total: <strong className="text-foreground font-semibold">{filteredKelas.length}</strong> Rombel
            </span>
          </div>
        </div>

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
      </Card>

      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <SlidersHorizontal className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Filter Rombel Kelas</h3>
                      <p className="text-xs text-muted-foreground">Saring berdasarkan jenjang dan penugasan wali</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setIsFilterModalOpen(false)}
                    className="size-7"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
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
                          className={`py-2 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                          }`}
                        >
                          Kelas {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
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
                          className={`w-full flex items-center justify-between p-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                          }`}
                        >
                          <span>{s.label}</span>
                          <div className={`size-4 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border bg-background'
                          }`}>
                            {isSelected && <Check className="size-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setSelectedTingkat([]);
                      setSelectedStatusWali([]);
                    }}
                    className="gap-1.5 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset Filter</span>
                  </Button>
                  <Button
                    variant="brand"
                    size="sm"
                    type="button"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Terapkan Filter
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredKelas.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tidak ada rombel kelas yang cocok</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            Tidak ditemukan kelas untuk pencarian atau filter yang sedang diterapkan.
          </p>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedTingkat([]);
              setSelectedStatusWali([]);
              setSelectedJurusanFilter('ALL');
            }}
            className="mt-4"
          >
            Bersihkan Filter
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKelas.map((k) => (
            <Card
              key={k.id}
              className="p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-200 shrink-0">
                      {k.tingkat}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground leading-snug">
                        {k.namaKelas}
                      </h3>
                      <Badge variant="outline" className="text-[11px] font-medium mt-0.5">
                        {k.jurusan}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => openEditModal(k)}
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="Ubah Rombel / Wali Kelas"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                </div>

                <div className="p-3 bg-muted/40 rounded-md border border-border mb-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-emerald-600" />
                      <span>Wali Kelas</span>
                    </div>
                    {k.waliKelas && (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5">Ditugaskan</Badge>
                    )}
                  </div>

                  {k.waliKelas ? (
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={k.waliKelas.namaLengkap}
                        className="size-8 ring-1 ring-border shrink-0 text-xs"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {k.waliKelas.namaLengkap}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          NIP: {k.waliKelas.nip || '-'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        <span>Belum Ada Wali</span>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        type="button"
                        onClick={() => openEditModal(k)}
                        className="text-xs text-emerald-600 p-0 h-auto font-medium"
                      >
                        + Tugaskan
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  <span>{k._count?.siswaList ?? 0} Siswa Terdaftar</span>
                </span>
                <span className="text-[11px] font-medium">
                  Semester Ganjil
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Tambah Rombel Kelas Baru</h3>
                    <p className="text-xs text-muted-foreground">Daftarkan rombel kelas dan jurusan ke sistem sekolah</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="size-7"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <form onSubmit={handleSaveKelas} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Nama Rombel Kelas (Contoh: X RPL 1, XI DKV 2)
                    </label>
                    <Input
                      required
                      value={namaKelas}
                      onChange={(e) => handleNamaKelasChange(e.target.value)}
                      placeholder="Contoh: X DKV 1"
                      className="h-9 text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Sparkles className="size-3 text-emerald-600" />
                      <span>Sistem otomatis mendeteksi tingkat &amp; jurusan dari kode kelas.</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Tingkat</label>
                      <select
                        value={tingkat}
                        onChange={(e) => setTingkat(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value={10}>Kelas 10 (X)</option>
                        <option value={11}>Kelas 11 (XI)</option>
                        <option value={12}>Kelas 12 (XII)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground">Jurusan</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomJurusan(!isCustomJurusan);
                            if (!isCustomJurusan) setCustomJurusan('');
                          }}
                          className="text-[10px] text-emerald-600 hover:underline font-medium cursor-pointer"
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
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {allAvailableJurusan.map((jName) => (
                            <option key={jName} value={jName}>
                              {jName}
                            </option>
                          ))}
                          <option value="CUSTOM_OPTION">+ Tambah Jurusan Baru (Kustom)...</option>
                        </select>
                      ) : (
                        <Input
                          required
                          value={customJurusan}
                          onChange={(e) => setCustomJurusan(e.target.value)}
                          placeholder="Ketik nama jurusan baru..."
                          className="h-9 text-xs"
                        />
                      )}
                    </div>
                  </div>

                  {isCustomJurusan && (
                    <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Jurusan <strong>{customJurusan || 'baru'}</strong> akan otomatis tersimpan ke database dan tersedia untuk pemilihan rombel kelas berikutnya.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Pilih Wali Kelas (Opsional)
                    </label>
                    <select
                      value={selectedWaliId}
                      onChange={(e) => setSelectedWaliId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">-- Belum Ditugaskan Wali Kelas --</option>
                      {guruList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.namaLengkap} ({g.nip ? `NIP: ${g.nip}` : 'Guru'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="brand"
                      size="sm"
                      type="submit"
                    >
                      Simpan Kelas
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingKelas(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Ubah Data Rombel Kelas</h3>
                    <p className="text-xs text-muted-foreground">Perbarui nama kelas, jurusan, atau wali kelas</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setEditingKelas(null)}
                    className="size-7"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <form onSubmit={handleSaveEditKelas} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Nama Rombel Kelas</label>
                    <Input
                      required
                      value={editNamaKelas}
                      onChange={(e) => setEditNamaKelas(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Tingkat</label>
                      <select
                        value={editTingkat}
                        onChange={(e) => setEditTingkat(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value={10}>Kelas 10 (X)</option>
                        <option value={11}>Kelas 11 (XI)</option>
                        <option value={12}>Kelas 12 (XII)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground">Jurusan</label>
                        <button
                          type="button"
                          onClick={() => setIsEditCustomJurusan(!isEditCustomJurusan)}
                          className="text-[10px] text-emerald-600 hover:underline font-medium cursor-pointer"
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
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {allAvailableJurusan.map((jName) => (
                            <option key={jName} value={jName}>
                              {jName}
                            </option>
                          ))}
                          <option value="CUSTOM_OPTION">+ Tambah Jurusan Baru (Kustom)...</option>
                        </select>
                      ) : (
                        <Input
                          required
                          value={editCustomJurusan}
                          onChange={(e) => setEditCustomJurusan(e.target.value)}
                          placeholder="Nama jurusan baru..."
                          className="h-9 text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Wali Kelas
                    </label>
                    <select
                      value={editWaliId}
                      onChange={(e) => setEditWaliId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">-- Belum Ditugaskan Wali Kelas --</option>
                      {guruList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.namaLengkap} - {g.nip ? `NIP: ${g.nip}` : 'Guru SMK'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClass(editingKelas.id, editingKelas.namaKelas)}
                      className="gap-1.5 text-xs"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Hapus Kelas</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingKelas(null)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        variant="brand"
                        size="sm"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deletingKelas}
        onClose={() => setDeletingKelas(null)}
        onConfirm={() => {
          if (deletingKelas && onDeleteKelas) {
            onDeleteKelas(deletingKelas.id);
            setDeletingKelas(null);
            setEditingKelas(null);
          }
        }}
        title="Hapus Rombel Kelas"
        itemName={deletingKelas?.nama}
        itemType="Rombel Kelas"
        description="Apakah Anda yakin ingin menghapus kelas ini? Data siswa di kelas ini tidak akan terhapus, namun status rombel dan penugasan wali kelasnya akan direset."
      />
    </div>
  );
};
