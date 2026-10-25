import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Search, 
  Download, 
  Save, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calculator,
  HelpCircle,
  FileCheck,
  SlidersHorizontal,
  Filter,
  X,
  Check,
  RotateCcw,
  Trophy,
  Medal,
  Plus,
  Trash2,
  Sparkles,
  Building
} from 'lucide-react';
import { PenilaianRecord, Eskul, PrestasiLombaRecord, StudentProfile } from '../../types';
import { api } from '../../services/api';
import { AddPrestasiModal } from '../modals/AddPrestasiModal';

interface PenilaianPageProps {
  penilaianList: PenilaianRecord[];
  eskulList: Eskul[];
  onSavePenilaian: (records: PenilaianRecord[]) => void;
  defaultEskuls?: string[];
  defaultClasses?: string[];
  students?: StudentProfile[];
}

export const PenilaianPage: React.FC<PenilaianPageProps> = ({
  penilaianList,
  eskulList,
  onSavePenilaian,
  defaultEskuls = [],
  defaultClasses = [],
  students = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rapor' | 'prestasi'>('rapor');
  const [records, setRecords] = useState<PenilaianRecord[]>(penilaianList);
  const [selectedEskuls, setSelectedEskuls] = useState<string[]>(defaultEskuls);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(defaultClasses);
  const [selectedPredikats, setSelectedPredikats] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Prestasi Lomba State
  const [prestasiList, setPrestasiList] = useState<PrestasiLombaRecord[]>([]);
  const [isLoadingPrestasi, setIsLoadingPrestasi] = useState(false);
  const [isAddPrestasiModalOpen, setIsAddPrestasiModalOpen] = useState(false);
  const [prestasiSearch, setPrestasiSearch] = useState('');
  const [prestasiEskulFilter, setPrestasiEskulFilter] = useState('ALL');
  const [prestasiTingkatFilter, setPrestasiTingkatFilter] = useState('ALL');

  const fetchPrestasi = async () => {
    setIsLoadingPrestasi(true);
    try {
      const data = await api.getPrestasi();
      if (Array.isArray(data)) {
        setPrestasiList(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingPrestasi(false);
    }
  };

  React.useEffect(() => {
    fetchPrestasi();
  }, []);

  const handleDeletePrestasi = async (id: string, namaLomba: string) => {
    if (!window.confirm(`Hapus catatan prestasi "${namaLomba}"? Poin bonus siswa akan disesuaikan kembali.`)) return;
    try {
      await api.deletePrestasi(id);
      setPrestasiList(prev => prev.filter(p => p.id !== id));
      // Refresh rekap nilai if available
      try {
        const updatedPenilaian = await api.getPenilaian();
        if (Array.isArray(updatedPenilaian)) {
          setRecords(updatedPenilaian);
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data prestasi.');
    }
  };

  React.useEffect(() => {
    if (defaultEskuls.length > 0) setSelectedEskuls(defaultEskuls);
  }, [defaultEskuls.join(',')]);

  React.useEffect(() => {
    if (defaultClasses.length > 0) setSelectedClasses(defaultClasses);
  }, [defaultClasses.join(',')]);

  const availableClasses = Array.from(new Set(records.map(r => r.kelas))).sort();
  const predikatOptions = ['A', 'B', 'C', 'D'];

  const toggleEskul = (id: string) => {
    setSelectedEskuls(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const togglePredikat = (p: string) => {
    setSelectedPredikats(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const activeFiltersCount = 
    selectedEskuls.length + 
    selectedClasses.length + 
    selectedPredikats.length;

  const calculateFinalGrade = (kehadiran: number, keaktifan: number, kinerja: number) => {
    // Kehadiran 40%, Keaktifan 30%, Kinerja 30%
    const score = (kehadiran * 0.4) + (keaktifan * 0.3) + (kinerja * 0.3);
    const rounded = Math.round(score * 10) / 10;

    let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
    if (rounded >= 85) predikat = 'A';
    else if (rounded >= 75) predikat = 'B';
    else if (rounded >= 65) predikat = 'C';
    else predikat = 'D';

    return { score: rounded, predikat };
  };

  const handleScoreChange = (
    id: string, 
    field: 'nilaiKehadiran' | 'nilaiKeaktifan' | 'nilaiKinerja', 
    val: number
  ) => {
    const clampedVal = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;

        const updated = { ...rec, [field]: clampedVal };
        const { score, predikat } = calculateFinalGrade(
          updated.nilaiKehadiran,
          updated.nilaiKeaktifan,
          updated.nilaiKinerja
        );
        return {
          ...updated,
          nilaiAkhir: score,
          predikat,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleNoteChange = (id: string, note: string) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, catatan: note } : rec))
    );
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSavePenilaian(records);
    setHasUnsavedChanges(false);
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nisn.includes(searchTerm) ||
      r.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEskul = selectedEskuls.length === 0 || selectedEskuls.includes(r.eskulId);
    const matchesKelas = selectedClasses.length === 0 || selectedClasses.includes(r.kelas);
    const matchesPredikat = selectedPredikats.length === 0 || selectedPredikats.includes(r.predikat);
    return matchesSearch && matchesEskul && matchesKelas && matchesPredikat;
  });

  const handleExportExcel = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Ekstrakurikuler', 'Kehadiran (40%)', 'Keaktifan (30%)', 'Kinerja (30%)', 'Nilai Akhir', 'Predikat', 'Catatan Capaian Kompetensi'];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      r.nisn,
      `"${r.namaSiswa}"`,
      r.kelas,
      `"${r.namaEskul}"`,
      r.nilaiKehadiran,
      r.nilaiKeaktifan,
      r.nilaiKinerja,
      r.nilaiAkhir,
      r.predikat,
      `"${r.catatan}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Eskul_Semester_Ganjil_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            {activeSubTab === 'rapor' ? 'Penilaian & Rekap Nilai' : 'Prestasi & Kejuaraan Lomba'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeSubTab === 'rapor' 
              ? 'Format penilaian kompetensi non-akademik akhir semester: Kehadiran (40%), Keaktifan (30%), Kinerja (30%).' 
              : 'Pencatatan medali, piala, dan prestasi perlombaan eksternal yang otomatis menambah poin bonus rapor.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSubTab === 'rapor' ? (
            <>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm rounded-md shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Excel / Rapor</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-all shadow-sm cursor-pointer ${
                  hasUnsavedChanges
                    ? 'bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAddPrestasiModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white font-bold text-sm rounded-md shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Prestasi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('rapor')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'rapor'
              ? 'border-[#00B884] text-[#00B884]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Rekap Nilai Rapor Siswa</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prestasi')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'prestasi'
              ? 'border-[#00B884] text-[#00B884]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Prestasi & Kejuaraan Lomba</span>
          {prestasiList.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
              {prestasiList.length}
            </span>
          )}
        </button>
      </div>

      {savedSuccessAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Berhasil menyimpan seluruh entri nilai dan catatan naratif rapor siswa!</span>
        </div>
      )}

      {activeSubTab === 'rapor' && (
        <>
          {/* Formula & Weighting Banner */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Calculator className="size-4 text-[#00B884] shrink-0" />
          <div>
            <span className="font-bold text-slate-800">Rumus Penilaian Kurikulum Merdeka: </span>
            <span className="text-slate-600">Nilai Akhir = (Kehadiran × 40%) + (Keaktifan × 30%) + (Kinerja × 30%)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-white rounded-md font-semibold text-emerald-800 border border-emerald-200">A: ≥ 85</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-semibold text-blue-800 border border-blue-200">B: 75 - 84</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-semibold text-amber-800 border border-amber-200">C: 65 - 74</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-semibold text-rose-800 border border-rose-200">D: &lt; 65</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NISN, atau kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Unified Filter Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-emerald-50 text-[#00B884] border-emerald-200 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00B884]" />
              <span>Filter Penilaian</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Menampilkan <strong className="text-slate-700">{filteredRecords.length}</strong> siswa
            </span>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Filter Aktif:</span>

            {selectedEskuls.map((id) => {
              const name = eskulList.find(e => e.id === id)?.namaEskul || id;
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] font-medium text-[11px] border border-emerald-100">
                  Eskul: {name}
                  <button onClick={() => toggleEskul(id)} className="hover:text-emerald-800 ml-0.5 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {selectedClasses.map((cls) => (
              <span key={cls} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] font-medium text-[11px] border border-emerald-100">
                Kelas: {cls}
                <button onClick={() => toggleClass(cls)} className="hover:text-emerald-800 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedPredikats.map((pred) => (
              <span key={pred} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] font-medium text-[11px] border border-emerald-100">
                Predikat: {pred}
                <button onClick={() => togglePredikat(pred)} className="hover:text-emerald-800 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={() => {
                setSelectedEskuls([]);
                setSelectedClasses([]);
                setSelectedPredikats([]);
              }}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-medium ml-1 underline decoration-dotted cursor-pointer"
            >
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Window (Multi-Choice) */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl border border-slate-200 relative space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-md bg-emerald-50 border border-emerald-200 text-[#00B884] flex items-center justify-center">
                    <SlidersHorizontal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Filter Penilaian Rapor</h3>
                    <p className="text-xs text-slate-400">Pilih satu atau lebih kriteria penilaian (Multi-Select)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* 1. Ekstrakurikuler (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cabang Eskul {selectedEskuls.length > 0 && <span className="text-[#00B884]">({selectedEskuls.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedEskuls(eskulList.map(e => e.id))}
                        className="text-[#00B884] hover:underline font-medium cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedEskuls([])}
                        className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
                    {eskulList.map((e) => {
                      const isSelected = selectedEskuls.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => toggleEskul(e.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="size-2.5 stroke-[3]" />}
                          </div>
                          <span>{e.namaEskul}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Kelas (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kelas / Rombel {selectedClasses.length > 0 && <span className="text-[#00B884]">({selectedClasses.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedClasses([...availableClasses])}
                        className="text-[#00B884] hover:underline font-medium cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedClasses([])}
                        className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
                    {availableClasses.map(c => {
                      const isSelected = selectedClasses.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleClass(c)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="size-2.5 stroke-[3]" />}
                          </div>
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Predikat Nilai (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Predikat Nilai {selectedPredikats.length > 0 && <span className="text-[#00B884]">({selectedPredikats.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedPredikats([...predikatOptions])}
                        className="text-[#00B884] hover:underline font-medium cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPredikats([])}
                        className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {predikatOptions.map((pred) => {
                      const isSelected = selectedPredikats.includes(pred);
                      return (
                        <button
                          key={pred}
                          type="button"
                          onClick={() => togglePredikat(pred)}
                          className={`py-2 px-2 rounded-md text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="size-2.5 stroke-[3]" />}
                          </div>
                          <span>Predikat {pred}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEskuls([]);
                    setSelectedClasses([]);
                    setSelectedPredikats([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Assessment Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">Ekstrakurikuler</th>
                <th className="py-3.5 px-3 text-center w-28">Kehadiran (40%)</th>
                <th className="py-3.5 px-3 text-center w-28">Keaktifan (30%)</th>
                <th className="py-3.5 px-3 text-center w-28">Kinerja (30%)</th>
                <th className="py-3.5 px-3 text-center w-24">Nilai Akhir</th>
                <th className="py-3.5 px-3 text-center w-16">Predikat</th>
                <th className="py-3.5 px-4 min-w-[280px]">Catatan Capaian Kompetensi (Rapor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Siswa */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{item.namaSiswa}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.nisn} • {item.kelas}</div>
                  </td>

                  {/* Eskul */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-xs font-semibold rounded-full border border-emerald-100">
                      {item.namaEskul}
                    </span>
                  </td>

                  {/* Nilai Kehadiran Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKehadiran}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKehadiran', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Keaktifan Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKeaktifan}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKeaktifan', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Kinerja Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKinerja}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKinerja', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Akhir (Calculated) */}
                  <td className="py-3 px-3 text-center">
                    <span className="text-base font-extrabold text-slate-800">
                      {item.nilaiAkhir}
                    </span>
                  </td>

                  {/* Predikat */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-8 h-8 rounded-full font-extrabold text-sm leading-8 text-center ${
                      item.predikat === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.predikat === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : item.predikat === 'C'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.predikat}
                    </span>
                  </td>

                  {/* Catatan Naratif */}
                  <td className="py-3 px-4">
                    <textarea
                      rows={2}
                      value={item.catatan}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      placeholder="Tuliskan capaian kompetensi siswa untuk rapor..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 resize-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredRecords.length} Nilai Siswa Terdaftar untuk Semester Ganjil 2026/2027</span>
          <span className="font-semibold text-slate-700">Format Nilai Terintegrasi e-Rapor</span>
        </div>
      </div>
        </>
      )}

      {/* SUB-TAB 2: PRESTASI & KEJUARAAN LOMBA */}
      {activeSubTab === 'prestasi' && (
        <div className="space-y-6">
          {/* KPI Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00B884]">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Total Kejuaraan</span>
                <span className="text-xl font-black text-slate-800">{prestasiList.length} Prestasi</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Medal className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Medali Emas (Juara 1)</span>
                <span className="text-xl font-black text-amber-600">
                  {prestasiList.filter(p => p.peringkat === 'JUARA_1').length} Lomba
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Medal className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Perak & Perunggu</span>
                <span className="text-xl font-black text-slate-700">
                  {prestasiList.filter(p => ['JUARA_2', 'JUARA_3'].includes(p.peringkat)).length} Lomba
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Bonus Poin Rapor</span>
                <span className="text-xl font-black text-teal-600">
                  +{prestasiList.reduce((acc, p) => acc + (p.poinTambahan || 0), 0)} Poin
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={prestasiSearch}
                onChange={(e) => setPrestasiSearch(e.target.value)}
                placeholder="Cari kejuaraan, nama siswa, atau penyelenggara..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Eskul Filter */}
              <select
                value={prestasiEskulFilter}
                onChange={(e) => setPrestasiEskulFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] font-medium text-slate-700"
              >
                <option value="ALL">Semua Ekstrakurikuler</option>
                {eskulList.map((e) => (
                  <option key={e.id} value={e.id}>{e.namaEskul}</option>
                ))}
              </select>

              {/* Tingkat Filter */}
              <select
                value={prestasiTingkatFilter}
                onChange={(e) => setPrestasiTingkatFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] font-medium text-slate-700"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="KOTA">Tingkat Kota / Kab</option>
                <option value="PROVINSI">Tingkat Provinsi</option>
                <option value="NASIONAL">Tingkat Nasional</option>
                <option value="INTERNASIONAL">Tingkat Internasional</option>
              </select>

              {(prestasiSearch || prestasiEskulFilter !== 'ALL' || prestasiTingkatFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setPrestasiSearch('');
                    setPrestasiEskulFilter('ALL');
                    setPrestasiTingkatFilter('ALL');
                  }}
                  className="px-2.5 py-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md font-semibold transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Prestasi Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Peringkat & Medali</th>
                    <th className="py-3 px-4">Nama Kejuaraan & Penyelenggara</th>
                    <th className="py-3 px-4">Siswa Peraih Prestasi</th>
                    <th className="py-3 px-4">Ekstrakurikuler</th>
                    <th className="py-3 px-4 text-center">Tingkat</th>
                    <th className="py-3 px-4 text-center">Bonus Nilai</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {prestasiList.filter((item) => {
                    const matchSearch =
                      (item.namaLomba && item.namaLomba.toLowerCase().includes(prestasiSearch.toLowerCase())) ||
                      (item.namaSiswa && item.namaSiswa.toLowerCase().includes(prestasiSearch.toLowerCase())) ||
                      (item.nis && item.nis.includes(prestasiSearch)) ||
                      (item.penyelenggara && item.penyelenggara.toLowerCase().includes(prestasiSearch.toLowerCase()));
                    const matchEskul = prestasiEskulFilter === 'ALL' || item.eskulId === prestasiEskulFilter;
                    const matchTingkat = prestasiTingkatFilter === 'ALL' || item.tingkat === prestasiTingkatFilter;
                    return matchSearch && matchEskul && matchTingkat;
                  }).length > 0 ? (
                    prestasiList.filter((item) => {
                      const matchSearch =
                        (item.namaLomba && item.namaLomba.toLowerCase().includes(prestasiSearch.toLowerCase())) ||
                        (item.namaSiswa && item.namaSiswa.toLowerCase().includes(prestasiSearch.toLowerCase())) ||
                        (item.nis && item.nis.includes(prestasiSearch)) ||
                        (item.penyelenggara && item.penyelenggara.toLowerCase().includes(prestasiSearch.toLowerCase()));
                      const matchEskul = prestasiEskulFilter === 'ALL' || item.eskulId === prestasiEskulFilter;
                      const matchTingkat = prestasiTingkatFilter === 'ALL' || item.tingkat === prestasiTingkatFilter;
                      return matchSearch && matchEskul && matchTingkat;
                    }).map((item) => {
                      const isGold = item.peringkat === 'JUARA_1';
                      const isSilver = item.peringkat === 'JUARA_2';
                      const isBronze = item.peringkat === 'JUARA_3';

                      const badgeStyle = isGold
                        ? 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold'
                        : isSilver
                        ? 'bg-slate-200 text-slate-800 border-slate-300 font-bold'
                        : isBronze
                        ? 'bg-orange-100 text-orange-800 border-orange-300 font-bold'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';

                      const peringkatLabel = isGold
                        ? '🥇 Juara 1 (Emas)'
                        : isSilver
                        ? '🥈 Juara 2 (Perak)'
                        : isBronze
                        ? '🥉 Juara 3 (Perunggu)'
                        : item.peringkat === 'HARAPAN_1'
                        ? '🎗️ Harapan 1'
                        : '⭐ Finalis';

                      const studentName = item.namaSiswa || (item as any).siswa?.namaLengkap || 'Siswa SMK Al Amanah';
                      const studentNis = item.nis || (item as any).siswa?.nis || '';
                      const studentKelas = item.kelas || (item as any).siswa?.kelas?.namaKelas || '';
                      const eskulName = item.namaEskul || (item as any).eskul?.namaEskul || '';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs border ${badgeStyle}`}>
                              {peringkatLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{item.namaLomba}</div>
                            <div className="text-slate-500 text-2xs flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{item.penyelenggara || 'Dispora / Kemenpora'}</span>
                              <span className="text-slate-300">•</span>
                              <span>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {item.keterangan && (
                              <p className="text-slate-500 text-2xs mt-1 italic line-clamp-1">"{item.keterangan}"</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{studentName}</div>
                            <div className="text-slate-400 text-2xs font-mono">NIS: {studentNis} • {studentKelas}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-semibold">
                              {eskulName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-2xs font-bold uppercase tracking-wider">
                              {item.tingkat}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>+{item.poinTambahan || 10} Poin</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeletePrestasi(item.id, item.namaLomba)}
                              title="Hapus Prestasi"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <div className="font-bold text-sm text-slate-600">Belum Ada Data Prestasi Lomba</div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Klik tombol "Catat Prestasi Baru" di atas untuk menambahkan perolehan piala dan medali siswa.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {prestasiList.length} Prestasi Lomba</span>
              <span className="font-semibold text-emerald-700">Otomatis Terintegrasi dengan Penilaian Rapor</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Prestasi Modal */}
      <AddPrestasiModal
        isOpen={isAddPrestasiModalOpen}
        onClose={() => setIsAddPrestasiModalOpen(false)}
        eskulList={eskulList}
        students={students}
        onSuccess={(newPrestasi) => {
          setPrestasiList(prev => [newPrestasi, ...prev]);
          fetchPrestasi();
        }}
        defaultEskulId={selectedEskuls[0] || ''}
      />
    </div>
  );
};
