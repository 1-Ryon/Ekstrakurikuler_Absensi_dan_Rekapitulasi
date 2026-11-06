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
  ChevronDown,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentProfile, Eskul, Role, Kelas } from '../../types';
import { api } from '../../services/api';
import { StudentCardModal } from '../modals/StudentCardModal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui';

interface StudentManagementProps {
  students: StudentProfile[];
  eskulList: Eskul[];
  kelasList?: Kelas[];
  onRefreshStudents?: () => void;
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
  kelasList = [],
  onRefreshStudents,
  onAssignEskul,
  onAddStudent,
  defaultClasses = [],
  defaultEskuls = [],
  currentRole = 'ADMIN',
}) => {
  const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(defaultClasses);
  const [selectedEskulFilters, setSelectedEskulFilters] = useState<string[]>(defaultEskuls);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [selectedEskulsForEdit, setSelectedEskulsForEdit] = useState<string[]>([]);
  const [cardModalStudent, setCardModalStudent] = useState<StudentProfile | null>(null);
  const [isBatchCardModalOpen, setIsBatchCardModalOpen] = useState(false);
  const [batchModalStudents, setBatchModalStudents] = useState<StudentProfile[]>([]);

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [targetKelasId, setTargetKelasId] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteSuccessMsg, setPromoteSuccessMsg] = useState<string | null>(null);
  const [promoteErrorMsg, setPromoteErrorMsg] = useState<string | null>(null);

  const handleBatchPromoteClass = async () => {
    if (!targetKelasId) {
      setPromoteErrorMsg('Silakan pilih kelas tujuan terlebih dahulu.');
      return;
    }
    setIsPromoting(true);
    setPromoteErrorMsg(null);
    try {
      const res = await api.batchUpdateStudentClass(selectedStudentIds, targetKelasId);
      setPromoteSuccessMsg(res.message || 'Kenaikan/Pindah kelas berhasil diproses!');
      if (onRefreshStudents) {
        onRefreshStudents();
      }
      setTimeout(() => {
        setIsPromoteModalOpen(false);
        setPromoteSuccessMsg(null);
        setSelectedStudentIds([]);
      }, 1500);
    } catch (err: any) {
      setPromoteErrorMsg(err.message || 'Gagal memproses kenaikan kelas.');
    } finally {
      setIsPromoting(false);
    }
  };

  React.useEffect(() => {
    if (defaultClasses.length > 0) setSelectedClasses(defaultClasses);
  }, [defaultClasses.join(',')]);

  React.useEffect(() => {
    if (defaultEskuls.length > 0) setSelectedEskulFilters(defaultEskuls);
  }, [defaultEskuls.join(',')]);

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.kelas) set.add(s.kelas);
    });
    ['X RPL 1', 'X RPL 2', 'X AKL 1', 'XI RPL 1', 'XI TKJ 2', 'XI OTKP 1', 'XII RPL 1'].forEach(c => set.add(c));
    return Array.from(set).sort();
  }, [students]);

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

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const search = searchTerm.toLowerCase().trim();
      const nis = (s.nis || s.nomorInduk || '').toLowerCase();
      const nisn = (s.nisn || '').toLowerCase();
      const name = s.namaLengkap.toLowerCase();
      const matchesSearch = !search || name.includes(search) || nis.includes(search) || nisn.includes(search);

      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(s.kelas);

      const matchesEskul = selectedEskulFilters.length === 0 || 
        selectedEskulFilters.some(id => s.enrolledEskulIds?.includes(id));

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

  const paginatedStudents = useMemo(() => {
    if (pageSize === -1) return filteredStudents;
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClasses, selectedEskulFilters, quickFilter, pageSize]);

  const isAllSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(s.id));
  const isIndeterminate = paginatedStudents.some(s => selectedStudentIds.includes(s.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = paginatedStudents.map(s => s.id);
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
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

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (studentId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

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

  const handlePrintSelected = () => {
    const selectedList = students.filter(s => selectedStudentIds.includes(s.id));
    if (selectedList.length === 0) return;
    setBatchModalStudents(selectedList);
    setIsBatchCardModalOpen(true);
  };

  const handlePrintAllFiltered = () => {
    if (filteredStudents.length === 0) return;
    setBatchModalStudents(filteredStudents);
    setIsBatchCardModalOpen(true);
  };

  const activeFilterCount = selectedClasses.length + selectedEskulFilters.length;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data &amp; Keanggotaan Siswa
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Kelola database profil siswa, verifikasi partisipasi kegiatan ekstrakurikuler, cetak kartu QR Code presensi, dan kelola kredensial login.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrintAllFiltered}
            title="Cetak lembar A4 kartu QR Code siswa terpilih atau seluruh hasil filter"
            className="gap-2 font-medium"
          >
            <Printer className="size-4 text-primary" />
            <span>Cetak Kartu Massal ({filteredStudents.length})</span>
          </Button>

          {isKoordinator && (
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={onAddStudent}
              className="gap-2 font-semibold"
            >
              <UserPlus className="size-4" />
              <span>Impor / Tambah Siswa</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-3.5 border-border">
          <div className="w-10 h-10 rounded-md bg-emerald-50 text-primary flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {stats.total}
              <span className="text-xs font-medium text-muted-foreground ml-1">Siswa</span>
            </div>
            <div className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="size-3" />
              <span>100% Akun Aktif</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5 border-border">
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ber-Eskul</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {stats.withEskulCount}
              <span className="text-xs font-semibold text-blue-600 ml-1.5">({stats.coveragePercent}%)</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
              Mengikuti ≥1 ekstrakurikuler
            </div>
          </div>
        </Card>

        <Card 
          onClick={() => setQuickFilter(quickFilter === 'WITHOUT_ESKUL' ? 'ALL' : 'WITHOUT_ESKUL')}
          className={`p-4 sm:p-5 flex items-center gap-3.5 cursor-pointer transition-colors ${
            quickFilter === 'WITHOUT_ESKUL' 
              ? 'border-amber-400 bg-amber-50/30' 
              : 'border-border hover:border-amber-300'
          }`}
        >
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Belum Ber-Eskul</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {stats.withoutEskulCount}
              <span className="text-xs font-medium text-muted-foreground ml-1">Siswa</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold hover:underline mt-0.5 flex items-center gap-1">
              <span>{quickFilter === 'WITHOUT_ESKUL' ? 'Filter Aktif' : 'Klik untuk filter'}</span>
              <ChevronRight className="size-3" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-3.5 border-border">
          <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rerata Presensi</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {stats.avgAttendance}%
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
              {stats.lowAttendanceCount} siswa butuh atensi (&lt;80%)
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 border-border space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NIS, atau NISN..."
              className="w-full pl-9 pr-8 py-2 bg-background hover:bg-muted/50 focus:bg-background border border-border rounded-md text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={activeFilterCount > 0 ? "brand" : "outline"}
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="gap-2 text-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filter Spesifik</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <div className="flex items-center bg-muted p-1 rounded-md border border-border">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Tampilan Tabel Data"
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Tampilan Kartu Siswa"
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Status:</span>
          
          <Button
            type="button"
            variant={quickFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setQuickFilter('ALL')}
            className="text-xs h-7 px-2.5"
          >
            Semua Siswa ({stats.total})
          </Button>

          <Button
            type="button"
            variant={quickFilter === 'WITH_ESKUL' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setQuickFilter('WITH_ESKUL')}
            className="text-xs h-7 px-2.5"
          >
            Sudah Ber-Eskul ({stats.withEskulCount})
          </Button>

          <Button
            type="button"
            variant={quickFilter === 'WITHOUT_ESKUL' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setQuickFilter('WITHOUT_ESKUL')}
            className="text-xs h-7 px-2.5"
          >
            Belum Ber-Eskul ({stats.withoutEskulCount})
          </Button>

          <Button
            type="button"
            variant={quickFilter === 'LOW_ATTENDANCE' ? 'destructive' : 'ghost'}
            size="sm"
            onClick={() => setQuickFilter('LOW_ATTENDANCE')}
            className="text-xs h-7 px-2.5"
          >
            Presensi &lt;80% ({stats.lowAttendanceCount})
          </Button>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              {selectedClasses.map((cls) => (
                <Badge key={cls} variant="brand" className="gap-1 font-medium">
                  <span>{cls}</span>
                  <button type="button" onClick={() => setSelectedClasses(prev => prev.filter(c => c !== cls))} className="hover:opacity-80">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
              {selectedEskulFilters.map((id) => {
                const name = eskulList.find(e => e.id === id)?.namaEskul || id;
                return (
                  <Badge key={id} variant="brand" className="gap-1 font-medium">
                    <span>{name}</span>
                    <button type="button" onClick={() => setSelectedEskulFilters(prev => prev.filter(i => i !== id))} className="hover:opacity-80">
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                );
              })}
              <button
                type="button"
                onClick={() => { setSelectedClasses([]); setSelectedEskulFilters([]); }}
                className="text-[11px] text-destructive hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card className="p-12 text-center border-border">
          <div className="w-12 h-12 rounded-md bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <Search className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Tidak ada siswa yang cocok</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            Tidak ditemukan data siswa untuk kata kunci pencarian atau filter yang sedang diterapkan.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedClasses([]);
              setSelectedEskulFilters([]);
              setQuickFilter('ALL');
            }}
            className="mt-4"
          >
            Bersihkan Semua Filter
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/75 hover:bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <TableHead className="w-10 text-center py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleToggleSelectAll}
                      className="size-4 rounded text-primary focus:ring-primary/30 border-border cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="py-3">Profil Siswa</TableHead>
                  <TableHead className="py-3 whitespace-nowrap">Kelas</TableHead>
                  <TableHead className="py-3">Eskul Terdaftar</TableHead>
                  <TableHead className="py-3 whitespace-nowrap">Presensi</TableHead>
                  <TableHead className="py-3 whitespace-nowrap">{isKoordinator ? 'Kredensial Login' : 'Status Akun'}</TableHead>
                  <TableHead className="py-3 text-center whitespace-nowrap">Status</TableHead>
                  <TableHead className="py-3 text-right whitespace-nowrap min-w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => {
                  const enrolledEskuls = eskulList.filter(e => student.enrolledEskulIds?.includes(e.id));
                  const studentNis = student.nis || student.nomorInduk || '-';
                  const defaultPass = student.defaultPassword || `al_amanah_${studentNis.slice(-3)}`;
                  const isSelected = selectedStudentIds.includes(student.id);
                  const isPassVisible = visiblePasswords[student.id] || false;
                  const attendanceRate = student.kehadiranRataRata ?? 0;

                  return (
                    <TableRow
                      key={student.id}
                      className={`transition-colors border-b border-border/60 ${
                        isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      <TableCell className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(student.id)}
                          className="size-4 rounded text-primary focus:ring-primary/30 border-border cursor-pointer"
                        />
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={student.namaLengkap}
                            className="size-9 ring-1 ring-border shrink-0 text-xs"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-sm truncate flex items-center gap-1.5">
                              <span>{student.namaLengkap}</span>
                              {student.jenisKelamin && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  student.jenisKelamin === 'P' || student.jenisKelamin === 'Perempuan'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-muted text-muted-foreground border border-border'
                                }`}>
                                  {student.jenisKelamin.toString().toUpperCase().startsWith('P') ? 'P' : 'L'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono">NIS: {studentNis}</span>
                              {student.nisn && (
                                <>
                                  <span className="text-muted-foreground/40">•</span>
                                  <span className="font-mono">NISN: {student.nisn}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="font-semibold text-xs">
                          {student.kelas || 'Belum Ada'}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {enrolledEskuls.length > 0 ? (
                            enrolledEskuls.map(e => (
                              <Badge
                                key={e.id}
                                variant="brand"
                                className="text-[11px] font-semibold"
                              >
                                {e.namaEskul}
                              </Badge>
                            ))
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAssignModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-dashed border-amber-300 transition-colors cursor-pointer"
                              title="Siswa ini belum memiliki eskul. Klik untuk menambahkan eskul."
                            >
                              <AlertCircle className="size-3" />
                              <span>+ Pilih Eskul</span>
                            </button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span>{attendanceRate}%</span>
                            <span className={`text-[10px] font-medium ${
                              attendanceRate >= 85 ? 'text-primary' : attendanceRate >= 75 ? 'text-amber-600' : 'text-destructive'
                            }`}>
                              {attendanceRate >= 85 ? 'Baik' : attendanceRate >= 75 ? 'Cukup' : 'Kurang'}
                            </span>
                          </div>
                          <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                attendanceRate >= 85 
                                  ? 'bg-primary' 
                                  : attendanceRate >= 75 
                                  ? 'bg-amber-500' 
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {isKoordinator ? (
                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-medium">Akun:</span>
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {student.username || studentNis}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(student.username || studentNis, `usr-${student.id}`)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                title="Salin Nama Pengguna"
                              >
                                {copiedKey === `usr-${student.id}` ? (
                                  <CheckCheck className="size-3 text-primary" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-medium">Sandi:</span>
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                {isPassVisible ? defaultPass : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(student.id)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                title={isPassVisible ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
                              >
                                {isPassVisible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyText(defaultPass, `pwd-${student.id}`)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                                title="Salin Sandi"
                              >
                                {copiedKey === `pwd-${student.id}` ? (
                                  <CheckCheck className="size-3 text-primary" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      ) : (
                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="success" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Siswa Aktif</span>
                          </Badge>
                        </TableCell>
                      )}

                      <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                        {student.statusAktif ? (
                          <Badge variant="success" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1.5">
                            <span className="size-1.5 rounded-full bg-rose-500" />
                            <span>Cuti/Non-Aktif</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right whitespace-nowrap min-w-[100px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setCardModalStudent(student)}
                            className="gap-1.5 h-7 px-2.5 text-xs font-semibold"
                            title="Tampilkan Kartu Presensi QR Code Siswa"
                          >
                            <QrCode className="size-3.5 text-primary" />
                            <span className="hidden sm:inline">Kartu QR</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignModal(student)}
                            className="gap-1.5 h-7 px-2.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary hover:text-white"
                            title="Atur penugasan ekstrakurikuler siswa"
                          >
                            <UserCheck className="size-3.5" />
                            <span>Tetapkan</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="p-3.5 bg-muted/30 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan <strong>{paginatedStudents.length}</strong> dari <strong>{filteredStudents.length}</strong> siswa
                {filteredStudents.length !== students.length && ` (disaring dari total ${students.length})`}
              </span>
              
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-muted-foreground">Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-background border border-border text-foreground text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={-1}>Semua</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="size-7"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                
                <span className="px-2 font-semibold text-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="size-7"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedStudents.map((student) => {
            const enrolledEskuls = eskulList.filter(e => student.enrolledEskulIds?.includes(e.id));
            const studentNis = student.nis || student.nomorInduk || '-';
            const isSelected = selectedStudentIds.includes(student.id);
            const attendanceRate = student.kehadiranRataRata ?? 0;

            return (
              <Card
                key={student.id}
                className={`p-4 transition-all relative flex flex-col justify-between border-border ${
                  isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(student.id)}
                        className="size-4 rounded text-primary focus:ring-primary/30 border-border cursor-pointer"
                      />
                      <Badge variant="outline" className="text-xs font-semibold">
                        {student.kelas}
                      </Badge>
                    </div>

                    <Badge variant="success" className="gap-1 text-[11px]">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span>Aktif</span>
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3.5 my-3.5">
                    <UserAvatar
                      name={student.namaLengkap}
                      className="size-11 ring-1 ring-border shrink-0 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-sm truncate">{student.namaLengkap}</h4>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">NIS: {studentNis}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Kehadiran Eskul:</span>
                          <span className="font-bold text-foreground">{attendanceRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              attendanceRate >= 85 ? 'bg-primary' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-destructive'
                            }`}
                            style={{ width: `${attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Eskul Terdaftar:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {enrolledEskuls.length > 0 ? (
                        enrolledEskuls.map(e => (
                          <Badge
                            key={e.id}
                            variant="brand"
                            className="text-[11px] font-semibold"
                          >
                            {e.namaEskul}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                          Belum terdaftar eskul
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCardModalStudent(student)}
                    className="flex-1 gap-1.5 font-semibold text-xs"
                  >
                    <QrCode className="size-3.5 text-primary" />
                    <span>Kartu QR</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignModal(student)}
                    className="flex-1 gap-1.5 font-semibold text-xs border-primary/40 text-primary hover:bg-primary hover:text-white"
                  >
                    <UserCheck className="size-3.5" />
                    <span>Tetapkan Eskul</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-xl border border-border flex items-center gap-3 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {selectedStudentIds.length}
              </span>
              <span>Siswa Dipilih</span>
            </div>

            <div className="h-4 w-px bg-muted" />

            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handlePrintSelected}
              className="gap-1.5 h-7 px-3 text-xs"
            >
              <Printer className="size-3.5" />
              <span>Cetak Kartu QR ({selectedStudentIds.length})</span>
            </Button>

            {isKoordinator && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetKelasId(kelasList[0]?.id || '');
                  setPromoteErrorMsg(null);
                  setPromoteSuccessMsg(null);
                  setIsPromoteModalOpen(true);
                }}
                className="gap-1.5 h-7 px-3 text-xs bg-white text-slate-800 hover:bg-slate-100 border-slate-300"
              >
                <GraduationCap className="size-3.5 text-emerald-600" />
                <span>Naik / Pindah Kelas ({selectedStudentIds.length})</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-muted-foreground hover:text-background h-7 px-2 text-xs"
            >
              Batal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-background rounded-lg border border-border shadow-xl p-5 w-full max-w-lg relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-md bg-emerald-50 text-primary flex items-center justify-center">
                    <SlidersHorizontal className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Filter Data Siswa</h3>
                    <p className="text-xs text-muted-foreground">Pilih kelas dan cabang ekstrakurikuler</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Pilih Kelas {selectedClasses.length > 0 && <span className="text-primary">({selectedClasses.length})</span>}
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedClasses([...availableClasses])}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-muted-foreground/30">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedClasses([])}
                      className="text-muted-foreground hover:text-destructive font-medium cursor-pointer"
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
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-primary border-primary font-semibold'
                            : 'bg-muted/40 text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <div className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-border bg-background'
                        }`}>
                          {isSelected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span>{cls}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Cabang Eskul {selectedEskulFilters.length > 0 && <span className="text-primary">({selectedEskulFilters.length})</span>}
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedEskulFilters(eskulList.map(e => e.id))}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-muted-foreground/30">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEskulFilters([])}
                      className="text-muted-foreground hover:text-destructive font-medium cursor-pointer"
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
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-primary border-primary font-semibold'
                            : 'bg-muted/40 text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <div className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-border bg-background'
                        }`}>
                          {isSelected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span>{eskul.namaEskul}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedClasses([]);
                    setSelectedEskulFilters([]);
                  }}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset Filter</span>
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Terapkan Filter
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-lg w-full p-5 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={editingStudent.namaLengkap}
                  className="size-10 ring-1 ring-border shrink-0 text-sm"
                />
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Tetapkan Cabang Eskul
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {editingStudent.namaLengkap} ({editingStudent.kelas} - {editingStudent.nomorInduk || editingStudent.nis})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="size-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                Pilih satu atau lebih ekstrakurikuler yang diikuti oleh siswa ini:
              </p>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedEskulsForEdit(eskulList.map(e => e.id))}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedEskulsForEdit([])}
                  className="text-muted-foreground hover:text-destructive font-medium cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {eskulList.map((eskul) => {
                const isSelected = selectedEskulsForEdit.includes(eskul.id);
                return (
                  <div
                    key={eskul.id}
                    onClick={() => handleToggleEskulSelect(eskul.id)}
                    className={`p-3 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-emerald-50/50'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>{eskul.namaEskul}</span>
                        {eskul.kategori && (
                          <Badge variant="secondary" className="text-[10px] py-0">
                            {eskul.kategori}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Pembina: {eskul.pembinaNama} • {eskul.jadwalHari}, {eskul.jamMulai} WIB
                      </div>
                    </div>

                    <div className={`size-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                    }`}>
                      {isSelected && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3.5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingStudent(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={handleSaveAssignment}
              >
                Simpan Penugasan
              </Button>
            </div>
          </div>
        </div>
      )}

      <StudentCardModal
        isOpen={cardModalStudent !== null}
        onClose={() => setCardModalStudent(null)}
        student={cardModalStudent}
        eskulList={eskulList}
        isBatchMode={false}
      />

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

      {isPromoteModalOpen && (
        <div
          onClick={() => !isPromoting && setIsPromoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-[92vw] max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Naik Kelas / Promosi Rombel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perbarui tingkat rombel belajar siswa terpilih
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPromoting}
                onClick={() => setIsPromoteModalOpen(false)}
                className="size-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{selectedStudentIds.length} Siswa Terpilih</span>
                </span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Riwayat absensi per sesi latihan, presensi QR lampau, dan nilai rapor (KHN) siswa pada semester sebelumnya tetap tersimpan permanen dan tidak akan hilang.
                </p>
              </div>

              {promoteSuccessMsg && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="size-4 text-emerald-700 shrink-0" />
                  <span>{promoteSuccessMsg}</span>
                </div>
              )}

              {promoteErrorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                  <span>{promoteErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Pilih Kelas Tujuan Baru:
                </label>
                <select
                  value={targetKelasId}
                  onChange={(e) => setTargetKelasId(e.target.value)}
                  disabled={isPromoting}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKelas} (Tingkat {k.tingkat || 10} - {k.jurusan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPromoting}
                onClick={() => setIsPromoteModalOpen(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                disabled={isPromoting || !targetKelasId}
                onClick={handleBatchPromoteClass}
                className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="size-3.5" />
                    <span>Konfirmasi Naik Kelas</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
