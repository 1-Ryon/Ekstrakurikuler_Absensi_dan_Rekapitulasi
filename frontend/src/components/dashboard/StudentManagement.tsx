import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Check, 
  CheckCircle2, 
  XCircle,
  QrCode, 
  Printer, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  LayoutGrid,
  List,
  Users,
  Award,
  AlertCircle,
  CalendarCheck,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  UserCheck,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentProfile, Eskul, Role } from '../../types';
import { StudentCardModal } from '../modals/StudentCardModal';
import { UserAvatar } from '../common/UserAvatar';

interface StudentManagementProps {
  students: StudentProfile[];
  eskulList: Eskul[];
  onAssignEskul: (studentId: string, eskulIds: string[]) => void;
  onAddStudent: () => void;
  defaultClasses?: string[];
  defaultEskuls?: string[];
  currentRole?: Role;
}

type QuickFilterType = 'ALL' | 'WITH_ESKUL' | 'WITHOUT_ESKUL' | 'LOW_ATTENDANCE';
type ViewMode = 'table' | 'grid';

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  eskulList,
  onAssignEskul,
  onAddStudent,
  defaultClasses = [],
  defaultEskuls = [],
  currentRole = 'ADMIN',
}) => {
  const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(defaultClasses);
  const [selectedEskulFilters, setSelectedEskulFilters] = useState<string[]>(defaultEskuls);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Multi-Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Password visibility map (studentId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [selectedEskulsForEdit, setSelectedEskulsForEdit] = useState<string[]>([]);
  const [cardModalStudent, setCardModalStudent] = useState<StudentProfile | null>(null);
  const [isBatchCardModalOpen, setIsBatchCardModalOpen] = useState(false);
  const [batchModalStudents, setBatchModalStudents] = useState<StudentProfile[]>([]);

  // Sync default filter props
  React.useEffect(() => {
    if (defaultClasses.length > 0) setSelectedClasses(defaultClasses);
  }, [defaultClasses.join(',')]);

  React.useEffect(() => {
    if (defaultEskuls.length > 0) setSelectedEskulFilters(defaultEskuls);
  }, [defaultEskuls.join(',')]);

  // Available classes computed dynamically from students + standard SMK classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.kelas) set.add(s.kelas);
    });
    ['X RPL 1', 'X RPL 2', 'X AKL 1', 'XI RPL 1', 'XI TKJ 2', 'XI OTKP 1', 'XII RPL 1'].forEach(c => set.add(c));
    return Array.from(set).sort();
  }, [students]);

  // Overall Statistics for KPI Cards
  const stats = useMemo(() => {
    const total = students.length;
    const withEskul = students.filter(s => s.enrolledEskulIds && s.enrolledEskulIds.length > 0);
    const withoutEskul = students.filter(s => !s.enrolledEskulIds || s.enrolledEskulIds.length === 0);
    const lowAttendance = students.filter(s => (s.kehadiranRataRata ?? 0) < 80);

    const totalAttendance = students.reduce((acc, s) => acc + (s.kehadiranRataRata ?? 0), 0);
    const avgAttendance = total > 0 ? Math.round(totalAttendance / total) : 0;
    const coveragePercent = total > 0 ? Math.round((withEskul.length / total) * 100) : 0;

    return {
      total,
      withEskulCount: withEskul.length,
      withoutEskulCount: withoutEskul.length,
      lowAttendanceCount: lowAttendance.length,
      coveragePercent,
      avgAttendance,
    };
  }, [students]);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search filter
      const search = searchTerm.toLowerCase().trim();
      const nis = (s.nis || s.nomorInduk || '').toLowerCase();
      const nisn = (s.nisn || '').toLowerCase();
      const name = s.namaLengkap.toLowerCase();
      const matchesSearch = !search || name.includes(search) || nis.includes(search) || nisn.includes(search);

      // 2. Class filter
      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(s.kelas);

      // 3. Eskul filter
      const matchesEskul = selectedEskulFilters.length === 0 || 
        selectedEskulFilters.some(id => s.enrolledEskulIds?.includes(id));

      // 4. Quick filter tab
      let matchesQuick = true;
      if (quickFilter === 'WITH_ESKUL') {
        matchesQuick = (s.enrolledEskulIds?.length || 0) > 0;
      } else if (quickFilter === 'WITHOUT_ESKUL') {
        matchesQuick = !s.enrolledEskulIds || s.enrolledEskulIds.length === 0;
      } else if (quickFilter === 'LOW_ATTENDANCE') {
        matchesQuick = (s.kehadiranRataRata ?? 0) < 80;
      }

      return matchesSearch && matchesClass && matchesEskul && matchesQuick;
    });
  }, [students, searchTerm, selectedClasses, selectedEskulFilters, quickFilter]);

  // Pagination slice
  const paginatedStudents = useMemo(() => {
    if (pageSize === -1) return filteredStudents;
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  // Reset page on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClasses, selectedEskulFilters, quickFilter, pageSize]);

  // Selection handlers
  const isAllSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(s.id));
  const isIndeterminate = paginatedStudents.some(s => selectedStudentIds.includes(s.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all on current page
      const pageIds = paginatedStudents.map(s => s.id);
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on current page
      const pageIds = paginatedStudents.map(s => s.id);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Clipboard copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Password toggle
  const togglePasswordVisibility = (studentId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // Assign modal
  const openAssignModal = (student: StudentProfile) => {
    setEditingStudent(student);
    setSelectedEskulsForEdit([...(student.enrolledEskulIds || [])]);
  };

  const handleToggleEskulSelect = (eskulId: string) => {
    if (selectedEskulsForEdit.includes(eskulId)) {
      setSelectedEskulsForEdit(selectedEskulsForEdit.filter(id => id !== eskulId));
    } else {
      setSelectedEskulsForEdit([...selectedEskulsForEdit, eskulId]);
    }
  };

  const handleSaveAssignment = () => {
    if (editingStudent) {
      onAssignEskul(editingStudent.id, selectedEskulsForEdit);
      setEditingStudent(null);
    }
  };

  // Batch Print Selected Students
  const handlePrintSelected = () => {
    const selectedList = students.filter(s => selectedStudentIds.includes(s.id));
    if (selectedList.length === 0) return;
    setBatchModalStudents(selectedList);
    setIsBatchCardModalOpen(true);
  };

  // Batch Print All Filtered
  const handlePrintAllFiltered = () => {
    if (filteredStudents.length === 0) return;
    setBatchModalStudents(filteredStudents);
    setIsBatchCardModalOpen(true);
  };

  const activeFilterCount = selectedClasses.length + selectedEskulFilters.length;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
            <span className="text-xs text-slate-400 font-medium">T.A. 2026/2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Data & Keanggotaan Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">
            Kelola database profil siswa, verifikasi partisipasi kegiatan ekstrakurikuler, cetak kartu QR Code presensi, dan kelola kredensial login.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintAllFiltered}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            title="Cetak lembar A4 kartu QR Code siswa terpilih atau seluruh hasil filter"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Cetak Kartu Massal ({filteredStudents.length})</span>
          </button>

          {isKoordinator && (
            <button
              type="button"
              onClick={onAddStudent}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Impor / Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Siswa */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Siswa</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.total}
              <span className="text-xs font-medium text-slate-400 ml-1">Siswa</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Akun Aktif</span>
            </div>
          </div>
        </div>

        {/* Card 2: Partisipasi Eskul */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ber-Eskul</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.withEskulCount}
              <span className="text-xs font-semibold text-blue-600 ml-1.5">({stats.coveragePercent}%)</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              Mengikuti ≥1 ekstrakurikuler
            </div>
          </div>
        </div>

        {/* Card 3: Belum Memilih Eskul */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'WITHOUT_ESKUL' ? 'ALL' : 'WITHOUT_ESKUL')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            quickFilter === 'WITHOUT_ESKUL' 
              ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20' 
              : 'border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Belum Ber-Eskul</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.withoutEskulCount}
              <span className="text-xs font-medium text-slate-400 ml-1">Siswa</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold hover:underline mt-0.5 flex items-center gap-1">
              <span>{quickFilter === 'WITHOUT_ESKUL' ? 'Menampilkan Filter' : 'Klik untuk filter'}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Card 4: Rata-Rata Presensi */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rerata Presensi</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.avgAttendance}%
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {stats.lowAttendanceCount} siswa butuh atensi (&lt;80%)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls Toolbar: Search, Quick Tabs, Filters & View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NIS, atau NISN..."
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

          {/* Right Toolbar: View Toggle & Advanced Filter */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Dialog Trigger */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-emerald-50 text-[#00B884] border-emerald-300 ring-2 ring-[#00B884]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Spesifik</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Data"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu Siswa"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Segmentation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          
          <button
            type="button"
            onClick={() => setQuickFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              quickFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Semua Siswa ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('WITH_ESKUL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              quickFilter === 'WITH_ESKUL'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Sudah Ber-Eskul ({stats.withEskulCount})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('WITHOUT_ESKUL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              quickFilter === 'WITHOUT_ESKUL'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Belum Ber-Eskul ({stats.withoutEskulCount})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('LOW_ATTENDANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              quickFilter === 'LOW_ATTENDANCE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            Presensi &lt;80% ({stats.lowAttendanceCount})
          </button>

          {/* Active Applied Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              {selectedClasses.map((cls) => (
                <span key={cls} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-200">
                  <span>{cls}</span>
                  <button type="button" onClick={() => setSelectedClasses(prev => prev.filter(c => c !== cls))} className="hover:text-emerald-950">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {selectedEskulFilters.map((id) => {
                const name = eskulList.find(e => e.id === id)?.namaEskul || id;
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-200">
                    <span>{name}</span>
                    <button type="button" onClick={() => setSelectedEskulFilters(prev => prev.filter(i => i !== id))} className="hover:text-emerald-950">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() => { setSelectedClasses([]); setSelectedEskulFilters([]); }}
                className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Data Display (Table or Grid View) */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada siswa yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Tidak ditemukan data siswa untuk kata kunci pencarian atau filter yang sedang diterapkan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedClasses([]);
              setSelectedEskulFilters([]);
              setQuickFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Bersihkan Semua Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {/* Checkbox Select All */}
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-[#00B884] focus:ring-[#00B884]/30 border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Profil Siswa</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Kelas</th>
                  <th className="py-3.5 px-4">Eskul Terdaftar</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Presensi</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{isKoordinator ? 'Kredensial Login' : 'Status Akun'}</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedStudents.map((student) => {
                  const enrolledEskuls = eskulList.filter(e => student.enrolledEskulIds?.includes(e.id));
                  const studentNis = student.nis || student.nomorInduk || '-';
                  const defaultPass = student.defaultPassword || `al_amanah_${studentNis.slice(-3)}`;
                  const isSelected = selectedStudentIds.includes(student.id);
                  const isPassVisible = visiblePasswords[student.id] || false;
                  const attendanceRate = student.kehadiranRataRata ?? 0;

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox Single */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(student.id)}
                          className="w-4 h-4 rounded text-[#00B884] focus:ring-[#00B884]/30 border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Profil Siswa */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={student.namaLengkap}
                            className="w-9 h-9 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-2xs"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                              <span>{student.namaLengkap}</span>
                              {student.jenisKelamin && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  student.jenisKelamin === 'P' || student.jenisKelamin === 'Perempuan'
                                    ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {student.jenisKelamin.toString().toUpperCase().startsWith('P') ? 'P' : 'L'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono">NIS: {studentNis}</span>
                              {student.nisn && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-mono text-slate-400">NISN: {student.nisn}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas (No wrapping) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100/90 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200/80 shadow-2xs">
                          {student.kelas || 'Belum Ada'}
                        </span>
                      </td>

                      {/* Eskul Terdaftar */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {enrolledEskuls.length > 0 ? (
                            enrolledEskuls.map(e => (
                              <span
                                key={e.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-[#009e70] text-[11px] font-semibold rounded-md border border-emerald-200/70"
                              >
                                {e.namaEskul}
                              </span>
                            ))
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAssignModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-dashed border-amber-300 transition-colors cursor-pointer"
                              title="Siswa ini belum memiliki eskul. Klik untuk menambahkan eskul."
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>+ Pilih Eskul</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Presensi Micro Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span>{attendanceRate}%</span>
                            <span className={`text-[10px] font-medium ${
                              attendanceRate >= 85 ? 'text-emerald-600' : attendanceRate >= 75 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {attendanceRate >= 85 ? 'Baik' : attendanceRate >= 75 ? 'Cukup' : 'Kurang'}
                            </span>
                          </div>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                attendanceRate >= 85 
                                  ? 'bg-emerald-500' 
                                  : attendanceRate >= 75 
                                  ? 'bg-amber-500' 
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Kredensial Login (Khusus Koordinator/Admin) atau Status Akun (Untuk Pembina) */}
                      {isKoordinator ? (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">Akun:</span>
                              <span className="font-mono text-xs font-semibold text-slate-700">
                                {student.username || studentNis}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(student.username || studentNis, `usr-${student.id}`)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                title="Salin Nama Pengguna"
                              >
                                {copiedKey === `usr-${student.id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">Sandi:</span>
                              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {isPassVisible ? defaultPass : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(student.id)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                title={isPassVisible ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
                              >
                                {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyText(defaultPass, `pwd-${student.id}`)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                title="Salin Sandi"
                              >
                                {copiedKey === `pwd-${student.id}` ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Siswa Aktif</span>
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {student.statusAktif ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Cuti/Non-Aktif</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Cetak / Tampilkan Kartu QR Siswa */}
                          <button
                            type="button"
                            onClick={() => setCardModalStudent(student)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Tampilkan Kartu Presensi QR Code Siswa"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#00B884]" />
                            <span className="hidden sm:inline">Kartu QR</span>
                          </button>

                          {/* Tombol Tetapkan Eskul */}
                          <button
                            type="button"
                            onClick={() => openAssignModal(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-[#00B884] text-[#00B884] hover:text-white font-semibold text-xs rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                            title="Atur penugasan ekstrakurikuler siswa"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Tetapkan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controls */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan <strong>{paginatedStudents.length}</strong> dari <strong>{filteredStudents.length}</strong> siswa
                {filteredStudents.length !== students.length && ` (disaring dari total ${students.length})`}
              </span>
              
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-400">Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00B884]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={-1}>Semua</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 font-semibold text-slate-700">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedStudents.map((student) => {
            const enrolledEskuls = eskulList.filter(e => student.enrolledEskulIds?.includes(e.id));
            const studentNis = student.nis || student.nomorInduk || '-';
            const isSelected = selectedStudentIds.includes(student.id);
            const attendanceRate = student.kehadiranRataRata ?? 0;

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all relative flex flex-col justify-between ${
                  isSelected ? 'border-[#00B884] ring-2 ring-emerald-100 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Checkbox, Class & Status */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(student.id)}
                        className="w-4 h-4 rounded text-[#00B884] focus:ring-[#00B884]/30 border-slate-300 cursor-pointer"
                      />
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                        {student.kelas}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Aktif</span>
                    </span>
                  </div>

                  {/* Card Center: Avatar & Info */}
                  <div className="flex items-start gap-3.5 my-4">
                    <UserAvatar
                      name={student.namaLengkap}
                      className="w-12 h-12 ring-2 ring-emerald-500/20 shrink-0 text-sm shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{student.namaLengkap}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">NIS: {studentNis}</p>
                      
                      {/* Attendance Bar */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Kehadiran Eskul:</span>
                          <span className="font-bold text-slate-700">{attendanceRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              attendanceRate >= 85 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Eskuls */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eskul Terdaftar:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {enrolledEskuls.length > 0 ? (
                        enrolledEskuls.map(e => (
                          <span
                            key={e.id}
                            className="px-2 py-0.5 bg-emerald-50 text-[#009e70] text-[11px] font-semibold rounded-md border border-emerald-200/80"
                          >
                            {e.namaEskul}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                          Belum terdaftar eskul
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCardModalStudent(student)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#00B884]" />
                    <span>Kartu QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAssignModal(student)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#00B884]/10 hover:bg-[#00B884] text-[#00B884] hover:text-white font-semibold text-xs rounded-xl border border-emerald-200 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tetapkan Eskul</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Floating Bottom Bulk Action Bar (Visible when >= 1 student selected) */}
      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 text-xs font-semibold backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00B884] text-white flex items-center justify-center text-xs font-black">
                {selectedStudentIds.length}
              </span>
              <span>Siswa Dipilih</span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <button
              type="button"
              onClick={handlePrintSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu QR ({selectedStudentIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Modal Filter Spesifik (Kelas & Eskul) */}
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
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg relative z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Filter Data Siswa</h3>
                    <p className="text-xs text-slate-400">Pilih kelas dan cabang ekstrakurikuler</p>
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

              {/* Filter Kelas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Kelas {selectedClasses.length > 0 && <span className="text-[#00B884]">({selectedClasses.length})</span>}
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
                        onClick={() => setSelectedClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls])}
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

              {/* Filter Eskul */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cabang Eskul {selectedEskulFilters.length > 0 && <span className="text-[#00B884]">({selectedEskulFilters.length})</span>}
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedEskulFilters(eskulList.map(e => e.id))}
                      className="text-[#00B884] hover:underline font-semibold cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEskulFilters([])}
                      className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-0.5">
                  {eskulList.map((eskul) => {
                    const isSelected = selectedEskulFilters.includes(eskul.id);
                    return (
                      <button
                        key={eskul.id}
                        type="button"
                        onClick={() => setSelectedEskulFilters(prev => prev.includes(eskul.id) ? prev.filter(i => i !== eskul.id) : [...prev, eskul.id])}
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
                        <span>{eskul.namaEskul}</span>
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
                    setSelectedClasses([]);
                    setSelectedEskulFilters([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal Multi-Select Assign Eskul */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={editingStudent.namaLengkap}
                  className="w-10 h-10 ring-2 ring-emerald-500/20 shrink-0 text-sm shadow-2xs"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Tetapkan Cabang Eskul
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingStudent.namaLengkap} ({editingStudent.kelas} - {editingStudent.nomorInduk || editingStudent.nis})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-600">
                Pilih satu atau lebih ekstrakurikuler yang diikuti oleh siswa ini:
              </p>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedEskulsForEdit(eskulList.map(e => e.id))}
                  className="text-[#00B884] hover:underline font-semibold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedEskulsForEdit([])}
                  className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {eskulList.map((eskul) => {
                const isSelected = selectedEskulsForEdit.includes(eskul.id);
                return (
                  <div
                    key={eskul.id}
                    onClick={() => handleToggleEskulSelect(eskul.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00B884] bg-emerald-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>{eskul.namaEskul}</span>
                        {eskul.kategori && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-normal">
                            {eskul.kategori}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Pembina: {eskul.pembinaNama} • {eskul.jadwalHari}, {eskul.jamMulai} WIB
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal Cetak Kartu QR Satuan Siswa */}
      <StudentCardModal
        isOpen={cardModalStudent !== null}
        onClose={() => setCardModalStudent(null)}
        student={cardModalStudent}
        eskulList={eskulList}
        isBatchMode={false}
      />

      {/* 9. Modal Cetak Massal Lembar A4 (Batch PDF) */}
      <StudentCardModal
        isOpen={isBatchCardModalOpen}
        onClose={() => {
          setIsBatchCardModalOpen(false);
          setBatchModalStudents([]);
        }}
        student={null}
        allStudents={batchModalStudents.length > 0 ? batchModalStudents : filteredStudents}
        eskulList={eskulList}
        isBatchMode={true}
      />
    </div>
  );
};
