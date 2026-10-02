import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Printer, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Check, 
  Calendar, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2,
  Search,
  BookOpen,
  ArrowUpDown,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Eskul, PenilaianRecord, PresensiRecord } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { SchoolLogo } from '../SchoolLogo';

interface ReportsManagementProps {
  eskulList: Eskul[];
  penilaianList: PenilaianRecord[];
  presensiList: PresensiRecord[];
  defaultClasses?: string[];
  defaultEskuls?: string[];
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({
  eskulList,
  penilaianList,
  presensiList,
  defaultClasses = [],
  defaultEskuls = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026/2027');
  const [selectedEskuls, setSelectedEskuls] = useState<string[]>(defaultEskuls);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(defaultClasses);
  const [selectedPredikatFilter, setSelectedPredikatFilter] = useState<string>('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync default filters
  React.useEffect(() => {
    if (defaultClasses.length > 0) setSelectedClasses(defaultClasses);
  }, [defaultClasses.join(',')]);

  React.useEffect(() => {
    if (defaultEskuls.length > 0) setSelectedEskuls(defaultEskuls);
  }, [defaultEskuls.join(',')]);

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    penilaianList.forEach(p => {
      if (p.kelas) set.add(p.kelas);
    });
    ['X RPL 1', 'X RPL 2', 'X AKL 1', 'XI RPL 1', 'XI TKJ 2', 'XI OTKP 1', 'XII RPL 1', 'XII BDP 2'].forEach(c => set.add(c));
    return Array.from(set).sort();
  }, [penilaianList]);

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

  const activeFiltersCount = 
    (selectedSemester !== 'Ganjil 2026/2027' ? 1 : 0) +
    selectedEskuls.length + 
    selectedClasses.length +
    (selectedPredikatFilter !== 'ALL' ? 1 : 0);

  // Filtered List
  const filteredPenilaian = useMemo(() => {
    return penilaianList.filter((p) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        p.namaSiswa.toLowerCase().includes(search) ||
        p.nisn.toLowerCase().includes(search) ||
        p.kelas.toLowerCase().includes(search) ||
        p.namaEskul.toLowerCase().includes(search);

      const matchesEskul = selectedEskuls.length === 0 || selectedEskuls.includes(p.eskulId);
      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(p.kelas);
      const matchesPredikat = selectedPredikatFilter === 'ALL' || p.predikat === selectedPredikatFilter;

      return matchesSearch && matchesEskul && matchesClass && matchesPredikat;
    });
  }, [penilaianList, searchTerm, selectedEskuls, selectedClasses, selectedPredikatFilter]);

  // Dynamic Statistics computed from active data
  const stats = useMemo(() => {
    const total = filteredPenilaian.length;
    if (total === 0) {
      return {
        total: 0,
        avgFinalScore: 0,
        countA: 0,
        percentA: 0,
        countB: 0,
        countC: 0,
      };
    }

    const sumScore = filteredPenilaian.reduce((acc, p) => acc + (p.nilaiAkhir || 0), 0);
    const avgFinalScore = Number((sumScore / total).toFixed(1));
    const countA = filteredPenilaian.filter(p => p.predikat === 'A').length;
    const countB = filteredPenilaian.filter(p => p.predikat === 'B').length;
    const countC = filteredPenilaian.filter(p => p.predikat === 'C' || p.predikat === 'D').length;
    const percentA = Math.round((countA / total) * 100);

    return {
      total,
      avgFinalScore,
      countA,
      percentA,
      countB,
      countC,
    };
  }, [filteredPenilaian]);

  const handleExportXLSX = () => {
    const headers = [
      'No', 
      'NISN', 
      'Nama Siswa', 
      'Kelas', 
      'Ekstrakurikuler', 
      'Nilai Kehadiran (40%)', 
      'Nilai Keaktifan (30%)', 
      'Nilai Kinerja (30%)', 
      'Nilai Akhir', 
      'Predikat', 
      'Keterangan Capaian'
    ];
    
    const rows = filteredPenilaian.map((r, i) => [
      i + 1,
      r.nisn,
      `"${r.namaSiswa}"`,
      `"${r.kelas}"`,
      `"${r.namaEskul}"`,
      r.nilaiKehadiran,
      r.nilaiKeaktifan,
      r.nilaiKinerja,
      r.nilaiAkhir,
      r.predikat,
      `"${r.catatan.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Rekap_Nilai_Eskul_SMK_Al_Amanah_${selectedSemester.replace(/[\/\s]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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
            Laporan &amp; Rekapitulasi Nilai Eskul
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">
            Rekapitulasi resmi kehadiran presensi QR, akumulasi bobot kompetensi siswa, dan pencetakan rapor ekstrakurikuler.
          </p>
        </div>

        {/* Global Export & Print Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            title="Ekspor tabel rekapitulasi nilai ke format Spreadsheet / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            title="Cetak lembar rekapitulasi resmi dengan kop surat dan tanda tangan"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards (Responsive 4-Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Rerata Nilai Akhir */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rerata Nilai Akhir</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.avgFinalScore}
              <span className="text-xs font-semibold text-emerald-600 ml-1.5">(Skor Tinggi)</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Validasi Bobot Resmi</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Data Rekap */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Siswa Terekap</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.total}
              <span className="text-xs font-medium text-slate-400 ml-1">Penilaian</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {selectedSemester}
            </div>
          </div>
        </div>

        {/* Card 3: Distribusi Predikat A */}
        <div 
          onClick={() => setSelectedPredikatFilter(selectedPredikatFilter === 'A' ? 'ALL' : 'A')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedPredikatFilter === 'A'
              ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
              : 'border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Predikat A</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.countA}
              <span className="text-xs font-semibold text-emerald-600 ml-1.5">({stats.percentA}%)</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {selectedPredikatFilter === 'A' ? 'Filter Aktif' : 'Sangat Baik (≥85)'}
            </div>
          </div>
        </div>

        {/* Card 4: Predikat B & C */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Predikat B &amp; C</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.countB + stats.countC}
              <span className="text-xs font-medium text-slate-400 ml-1">Siswa</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {stats.countB} Baik • {stats.countC} Cukup
            </div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & Quick Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NISN, kelas, atau cabang eskul..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] transition-all"
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
            {/* Filter Modal Trigger */}
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
              <span>Filter Rekapitulasi</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Total: <strong className="text-slate-900 font-bold">{filteredPenilaian.length}</strong> Data Siswa
            </span>
          </div>
        </div>

        {/* Quick Filter Segmentation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Predikat:</span>
          
          <button
            type="button"
            onClick={() => setSelectedPredikatFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedPredikatFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Semua ({penilaianList.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedPredikatFilter('A')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedPredikatFilter === 'A'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Predikat A ({stats.countA})
          </button>

          <button
            type="button"
            onClick={() => setSelectedPredikatFilter('B')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedPredikatFilter === 'B'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Predikat B ({stats.countB})
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Active Applied Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{selectedSemester}</span>
            </span>

            {selectedEskuls.map((eskulId) => {
              const name = eskulList.find(e => e.id === eskulId)?.namaEskul || eskulId;
              return (
                <span key={eskulId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  <span>Eskul: {name}</span>
                  <button type="button" onClick={() => toggleEskul(eskulId)} className="hover:text-emerald-950 cursor-pointer">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}

            {selectedClasses.map((cls) => (
              <span key={cls} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <span>Kelas: {cls}</span>
                <button type="button" onClick={() => toggleClass(cls)} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSemester('Ganjil 2026/2027');
                  setSelectedEskuls([]);
                  setSelectedClasses([]);
                  setSelectedPredikatFilter('ALL');
                }}
                className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset Semua
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Rekapitulasi Table (Crisp Typography & Zero Wrapping Bugs) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Nama Siswa</th>
                <th className="py-3.5 px-4 whitespace-nowrap">NISN &amp; Kelas</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Ekstrakurikuler</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div>Kehadiran</div>
                  <div className="text-[9px] font-normal text-slate-400 lowercase">(bobot 40%)</div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div>Keaktifan</div>
                  <div className="text-[9px] font-normal text-slate-400 lowercase">(bobot 30%)</div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div>Kinerja</div>
                  <div className="text-[9px] font-normal text-slate-400 lowercase">(bobot 30%)</div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div>Nilai Akhir</div>
                  <div className="text-[9px] font-normal text-slate-400 lowercase">(skor akhir)</div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Predikat</th>
                <th className="py-3.5 px-4">Keterangan Capaian Kompetensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPenilaian.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">Tidak ada data rekapitulasi yang cocok.</p>
                    <p className="text-[11px]">Silakan sesuaikan kriteria pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredPenilaian.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Nama Siswa */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={item.namaSiswa}
                          className="w-8 h-8 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-2xs"
                        />
                        <div className="font-bold text-slate-900 text-sm">
                          {item.namaSiswa}
                        </div>
                      </div>
                    </td>

                    {/* NISN & Kelas */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-semibold text-slate-700">
                          {item.nisn}
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200/80">
                          {item.kelas}
                        </span>
                      </div>
                    </td>

                    {/* Cabang Eskul */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-[#009e70] text-xs font-semibold rounded-lg border border-emerald-200/70">
                        {item.namaEskul}
                      </span>
                    </td>

                    {/* Kehadiran (40%) */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-800 text-xs">{item.nilaiKehadiran}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(item.nilaiKehadiran * 0.4).toFixed(1)}
                      </div>
                    </td>

                    {/* Keaktifan (30%) */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-800 text-xs">{item.nilaiKeaktifan}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(item.nilaiKeaktifan * 0.3).toFixed(1)}
                      </div>
                    </td>

                    {/* Kinerja (30%) */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-800 text-xs">{item.nilaiKinerja}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(item.nilaiKinerja * 0.3).toFixed(1)}
                      </div>
                    </td>

                    {/* Nilai Akhir */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="font-black text-sm text-[#00B884]">
                        {item.nilaiAkhir}
                      </span>
                    </td>

                    {/* Predikat */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs border shadow-2xs ${
                        item.predikat === 'A'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : item.predikat === 'B'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {item.predikat}
                      </span>
                    </td>

                    {/* Keterangan Capaian Kompetensi */}
                    <td className="py-3.5 px-4 min-w-[240px] max-w-md">
                      <div className="text-xs text-slate-600 leading-relaxed py-0.5">
                        {item.catatan}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>Menampilkan <strong>{filteredPenilaian.length}</strong> dari <strong>{penilaianList.length}</strong> data rekapitulasi penilaian</span>
          <span className="font-semibold text-slate-700">Tahun Ajaran 2026/2027 • Semester Ganjil</span>
        </div>
      </div>

      {/* 5. Filter Modal Window (Multi-Choice) */}
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
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 relative z-10 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Filter Rekapitulasi</h3>
                    <p className="text-xs text-slate-400">Pilih kriteria untuk menyaring tabel nilai</p>
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

              {/* Filter Options */}
              <div className="space-y-4">
                {/* 1. Tahun Ajaran / Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Tahun Ajaran &amp; Semester
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Ganjil 2026/2027', 'Genap 2025/2026'].map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setSelectedSemester(sem)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedSemester === sem
                            ? 'bg-[#00B884] text-white border-[#00B884] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Semester {sem}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Cabang Ekstrakurikuler (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cabang Eskul {selectedEskuls.length > 0 && <span className="text-[#00B884]">({selectedEskuls.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedEskuls(eskulList.map(e => e.id))}
                        className="text-[#00B884] hover:underline font-semibold cursor-pointer"
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
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{e.namaEskul}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Kelas (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kelas / Rombel {selectedClasses.length > 0 && <span className="text-[#00B884]">({selectedClasses.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedClasses([...availableClasses])}
                        className="text-[#00B884] hover:underline font-semibold cursor-pointer"
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
                    {availableClasses.map((cls) => {
                      const isSelected = selectedClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{cls}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSemester('Ganjil 2026/2027');
                    setSelectedEskuls([]);
                    setSelectedClasses([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Modal Preview Cetak Resmi PDF (Official Print Document) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pratinjau Dokumen Rekapitulasi Rapor Resmi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official School Document Header (Kop Surat Resmi) */}
            <div className="my-6 border-b-2 border-slate-900 pb-4 flex items-center justify-center gap-4">
              <SchoolLogo size="lg" showText={false} className="shrink-0" />
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
                  SMK AL AMANAH KOTA TANGERANG SELATAN
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Jl. Raya Puspiptek Serpong No. 12, Kota Tangerang Selatan, Banten • Telp: (021) 756-1234
                </p>
                <h3 className="text-sm font-extrabold text-slate-900 underline uppercase mt-2.5">
                  LEMBAR REKAPITULASI NILAI EKSTRAKURIKULER SISWA
                </h3>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tahun Pelajaran 2026/2027 • Semester {selectedSemester}
                </div>
              </div>
            </div>

            {/* Content Table in Print Modal */}
            <table className="w-full text-xs text-left border border-slate-300 border-collapse mb-6">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border-r border-slate-300">Nama Lengkap</th>
                  <th className="p-2 border-r border-slate-300">NISN / Kelas</th>
                  <th className="p-2 border-r border-slate-300">Ekstrakurikuler</th>
                  <th className="p-2 border-r border-slate-300 text-center">Nilai Akhir</th>
                  <th className="p-2 border-r border-slate-300 text-center">Predikat</th>
                  <th className="p-2">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPenilaian.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{item.namaSiswa}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{item.nisn} ({item.kelas})</td>
                    <td className="p-2 border-r border-slate-200">{item.namaEskul}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-black text-emerald-700">{item.nilaiAkhir}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">{item.predikat}</td>
                    <td className="p-2 text-slate-700">{item.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Area (Tanda Tangan Kepala Sekolah & Koordinator) */}
            <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-slate-200 text-slate-800">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala SMK Al Amanah</p>
                <div className="h-16" />
                <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
                <p className="text-slate-500 font-mono text-[11px]">NIP. 19680315 199303 1 004</p>
              </div>

              <div>
                <p>Tangerang Selatan, 28 September 2026</p>
                <p className="font-bold">Koordinator Ekstrakurikuler</p>
                <div className="h-16" />
                <p className="font-bold underline">Muhammad Farhan Al-Fatih, S.Pd.</p>
                <p className="text-slate-500 font-mono text-[11px]">NIP. 19890412 201402 2 003</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
