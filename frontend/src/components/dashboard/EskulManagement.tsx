import React, { useState, useMemo, useEffect } from 'react';
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
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Sun,
  Radio,
  CalendarOff,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eskul, PengajuanJadwal, SesiPertemuan } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { cn } from '../../lib/utils';
import {
  Card,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui';
import {
  getEskulRealTimeStatus,
  checkIsIndonesianHoliday,
  formatIndonesianFullDate,
  getIndonesianDayName,
  EskulRealtimeStatusInfo
} from '../../utils/scheduleStatus';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface EskulManagementProps {
  eskulList: Eskul[];
  sessions?: SesiPertemuan[];
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
  sessions = [],
  onAddEskul,
  onAddPembina,
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
  const [deletingEskul, setDeletingEskul] = useState<Eskul | null>(null);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isHolidaySimulated, setIsHolidaySimulated] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const categories = ['Olahraga', 'Teknologi', 'Seni & Budaya', 'Keagamaan', 'Kepemimpinan'];
  const statusFilterOptions = [
    { key: 'Aktif', label: 'Master: Aktif' },
    { key: 'Non-Aktif', label: 'Master: Non-Aktif' },
    { key: 'BERLANGSUNG', label: 'Sedang Berjalan (Live)' },
    { key: 'HARI_INI', label: 'Jadwal Hari Ini' },
    { key: 'LIBUR', label: 'Libur (Tgl Merah)' },
  ];

  const holidayCheck = useMemo(() => {
    return checkIsIndonesianHoliday(currentDate);
  }, [currentDate]);

  const isTodayHoliday = isHolidaySimulated || holidayCheck.isHoliday;
  const activeHolidayName = isHolidaySimulated 
    ? 'Hari Libur Kegiatan Sekolah' 
    : (holidayCheck.holidayName || 'Hari Libur Nasional / Tanggal Merah');

  const eskulStatusMap = useMemo(() => {
    const map = new Map<string, EskulRealtimeStatusInfo>();
    for (const eskul of eskulList) {
      const statusInfo = getEskulRealTimeStatus(eskul, {
        currentDate,
        sessions,
        forceHoliday: isTodayHoliday,
        holidayReason: activeHolidayName,
      });
      map.set(eskul.id, statusInfo);
    }
    return map;
  }, [eskulList, currentDate, sessions, isTodayHoliday, activeHolidayName]);

  const totalEskul = eskulList.length;
  const activeEskul = eskulList.filter(e => e.status !== 'Non-Aktif').length;
  const totalKuota = eskulList.reduce((acc, e) => acc + (e.kuota || 0), 0);
  const totalTerisi = eskulList.reduce((acc, e) => acc + (e.jumlahSiswa || 0), 0);

  const currentlyRunningCount = useMemo(() => {
    let count = 0;
    eskulStatusMap.forEach((status) => {
      if (status.key === 'BERLANGSUNG') count++;
    });
    return count;
  }, [eskulStatusMap]);

  const scheduledTodayCount = useMemo(() => {
    const todayName = getIndonesianDayName(currentDate);
    return eskulList.filter(
      (e) => (e.jadwalHari || '').toLowerCase().trim() === todayName.toLowerCase().trim() && e.status !== 'Non-Aktif'
    ).length;
  }, [eskulList, currentDate]);

  const toggleStatusFilter = (st: string) => {
    setSelectedStatuses(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

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

      const statusInfo = eskulStatusMap.get(item.id);
      let matchesStatus = selectedStatuses.length === 0;

      if (selectedStatuses.length > 0 && statusInfo) {
        matchesStatus = selectedStatuses.some((st) => {
          if (st === 'Aktif') return item.status === 'Aktif';
          if (st === 'Non-Aktif') return item.status === 'Non-Aktif';
          if (st === 'BERLANGSUNG') return statusInfo.key === 'BERLANGSUNG';
          if (st === 'HARI_INI') return statusInfo.key === 'BERLANGSUNG' || statusInfo.key === 'HARI_INI_MENUNGGU' || statusInfo.key === 'HARI_INI_SELESAI';
          if (st === 'LIBUR') return statusInfo.key === 'LIBUR';
          return false;
        });
      }

      return matchesSearch && matchesCategoryTab && matchesStatus;
    });
  }, [eskulList, searchTerm, selectedCategoryTab, selectedStatuses, eskulStatusMap]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Kelola Ekstrakurikuler
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Manajemen data eskul, guru pembina, jadwal latihan mingguan, dan kuota pendaftaran.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsHolidaySimulated(prev => !prev)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
              isTodayHoliday
                ? "bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-400/20"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            )}
            title="Klik untuk menetapkan status Hari Libur Kegiatan Sekolah"
          >
            <Sun className={cn("size-3.5", isTodayHoliday ? "text-purple-600" : "text-muted-foreground")} />
            <span>{isTodayHoliday ? 'Libur Sekolah Aktif' : 'Tandai Libur Sekolah'}</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[10px] font-bold uppercase",
              isTodayHoliday ? "bg-purple-200/80 text-purple-900" : "bg-muted text-muted-foreground"
            )}>
              {isTodayHoliday ? 'AKTIF' : 'NONAKTIF'}
            </span>
          </button>

          {onAddPembina && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddPembina}
              className="gap-2 text-xs font-semibold"
            >
              <Users className="size-4 text-primary" />
              <span>+ Buat Akun Pembina</span>
            </Button>
          )}

          <Button
            variant="brand"
            size="sm"
            onClick={onAddEskul}
            className="gap-2 text-xs font-semibold"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>Tambah Eskul Baru</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isTodayHoliday && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 via-fuchsia-50 to-indigo-50 border border-purple-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <CalendarOff className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                      Hari Ini: Tanggal Merah / Libur Nasional
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-800 border-purple-300 font-semibold py-0">
                      {activeHolidayName}
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-800/90 mt-0.5">
                    Kegiatan ekstrakurikuler rutin diliburkan otomatis. Siswa <strong>tidak dikenakan sanksi alfa</strong> dan nilai presensi tetap aman.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-purple-700 font-medium hidden sm:inline">
                  {formatIndonesianFullDate(currentDate)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 border-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Ekstrakurikuler
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {totalEskul} <span className="text-xs font-normal text-muted-foreground">ESKUL</span>
            </div>
          </div>
          <div className="size-10 rounded-md bg-emerald-50 text-primary flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
        </Card>

        <Card className="p-5 border-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Status Eskul &amp; Sesi Jam</span>
              {currentlyRunningCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  Berjalan
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
              <span>{activeEskul}</span>
              <span className="text-xs font-normal text-muted-foreground">Aktif</span>
              {currentlyRunningCount > 0 ? (
                <span className="text-xs font-semibold text-emerald-600">
                  ({currentlyRunningCount} Berjalan)
                </span>
              ) : isTodayHoliday ? (
                <span className="text-xs font-semibold text-purple-600">
                  (Libur Nasional)
                </span>
              ) : (
                <span className="text-xs font-normal text-muted-foreground">
                  ({scheduledTodayCount} Hari Ini)
                </span>
              )}
            </div>
          </div>
          <div className={cn(
            "size-10 rounded-md flex items-center justify-center shrink-0 transition-colors",
            currentlyRunningCount > 0 
              ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" 
              : "bg-emerald-50 text-primary"
          )}>
            {currentlyRunningCount > 0 ? (
              <Radio className="size-5 animate-pulse" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>
        </Card>

        <Card className="p-5 border-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Kuota &amp; Pendaftar
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {totalTerisi} <span className="text-xs font-normal text-muted-foreground">/ {totalKuota} Siswa</span>
            </div>
          </div>
          <div className="size-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Button
          type="button"
          variant={selectedCategoryTab === 'ALL' ? 'brand' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryTab('ALL')}
          className="text-xs shrink-0 font-medium"
        >
          Semua Kategori ({totalEskul})
        </Button>

        {categories.map((cat) => {
          const count = eskulList.filter(e => e.kategori === cat).length;
          const isSelected = selectedCategoryTab === cat;

          return (
            <Button
              key={cat}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategoryTab(cat)}
              className="text-xs shrink-0 font-medium gap-1.5"
            >
              <span>{cat}</span>
              <span className="opacity-70">({count})</span>
            </Button>
          );
        })}
      </div>

      <Card className="p-4 border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari eskul, pembina, hari, atau lokasi..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={selectedStatuses.length > 0 ? "brand" : "outline"}
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            className="gap-2 text-xs font-semibold"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filter Status</span>
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>

          <div className="flex items-center bg-muted p-1 rounded-md border border-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-sm transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tampilan Tabel"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </Card>

      {(selectedCategoryTab !== 'ALL' || selectedStatuses.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-xs -mt-2">
          <span className="text-muted-foreground font-medium">Filter Aktif:</span>
          {selectedCategoryTab !== 'ALL' && (
            <Badge variant="brand" className="gap-1.5 font-medium">
              Kategori: <strong>{selectedCategoryTab}</strong>
              <button type="button" onClick={() => setSelectedCategoryTab('ALL')} className="hover:opacity-80 cursor-pointer">
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {selectedStatuses.map((st) => (
            <Badge key={st} variant="brand" className="gap-1.5 font-medium">
              Status: <strong>{st}</strong>
              <button type="button" onClick={() => toggleStatusFilter(st)} className="hover:opacity-80 cursor-pointer">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={() => { setSelectedCategoryTab('ALL'); setSelectedStatuses([]); }}
            className="text-muted-foreground hover:text-destructive font-semibold underline text-xs cursor-pointer ml-1"
          >
            Hapus Semua
          </button>
        </div>
      )}

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
              className="bg-background rounded-lg border border-border shadow-xl p-5 w-full max-w-md relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Filter Ekstrakurikuler</h3>
                    <p className="text-[11px] text-muted-foreground">Filter berdasarkan status keaktifan dan jadwal real-time</p>
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
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Status Eskul &amp; Jadwal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {statusFilterOptions.map((opt) => {
                    const isSelected = selectedStatuses.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleStatusFilter(opt.key)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border transition-all cursor-pointer text-left",
                          isSelected
                            ? "bg-emerald-50 text-primary border-primary font-semibold"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "size-3.5 rounded flex items-center justify-center border text-[9px] shrink-0",
                          isSelected ? "bg-primary border-primary text-white" : "border-border bg-background"
                        )}>
                          {isSelected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{opt.label}</span>
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
                    setSelectedStatuses([]);
                    setSelectedCategoryTab('ALL');
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

      {filteredEskul.length === 0 ? (
        <Card className="p-12 text-center border-border space-y-3">
          <div className="size-12 rounded-md bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Layers className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Tidak Ada Ekstrakurikuler Ditemukan
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tidak ada eskul yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategoryTab('ALL');
              setSelectedStatuses([]);
            }}
            className="gap-2 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Pencarian &amp; Filter</span>
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed min-w-[980px]">
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/75 hover:bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <TableHead className="w-[23%] min-w-[210px] py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Ekstrakurikuler</TableHead>
                  <TableHead className="w-[18%] min-w-[170px] py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Guru Pembina</TableHead>
                  <TableHead className="w-[21%] min-w-[190px] py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Jadwal &amp; Lokasi</TableHead>
                  <TableHead className="w-[14%] min-w-[130px] py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Kapasitas &amp; Kuota</TableHead>
                  <TableHead className="w-[14%] min-w-[140px] py-3 px-4 text-center font-bold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                  <TableHead className="w-[10%] min-w-[100px] py-3 px-3 text-center font-bold text-xs uppercase tracking-wider text-slate-500 whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEskul.map((eskul) => {
                  const quotaPercent = Math.round((eskul.jumlahSiswa / (eskul.kuota || 1)) * 100);
                  const statusInfo = eskulStatusMap.get(eskul.id) || getEskulRealTimeStatus(eskul);

                  return (
                    <TableRow key={eskul.id} className="hover:bg-muted/30 transition-colors border-b border-border/60">
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-foreground text-sm truncate">
                            {eskul.namaEskul}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-semibold py-0 shrink-0">
                              {eskul.kategori}
                            </Badge>
                            {eskul.deskripsi && (
                              <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                {eskul.deskripsi}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            name={eskul.pembinaNama}
                            className="size-8 ring-1 ring-border shrink-0 text-xs"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground text-xs truncate">
                              {eskul.pembinaNama}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Pembina Terdaftar
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="space-y-1 text-muted-foreground min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
                            <Calendar className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">
                              Setiap {eskul.jadwalHari || '-'}, {eskul.jamMulai || '15:30'} - {eskul.jamSelesai || '17:00'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{eskul.lokasi}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-foreground">
                              {eskul.jumlahSiswa} / {eskul.kuota} Siswa
                            </span>
                            <span className={`font-semibold ${quotaPercent >= 90 ? 'text-amber-600' : 'text-primary'}`}>
                              {quotaPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                quotaPercent >= 90 ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 mx-auto w-full max-w-[130px]">
                          <button
                            type="button"
                            onClick={() => onToggleStatus(eskul.id)}
                            className="cursor-pointer group relative focus:outline-none transition-transform active:scale-95 inline-flex items-center justify-center w-full"
                            title={`Status Operasional: ${eskul.status}. Real-time: ${statusInfo.detail}. Klik untuk toggle keaktifan.`}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-6 px-2.5 w-full max-w-[125px] justify-center text-[10px] font-semibold gap-1.5 transition-all shadow-2xs border shrink-0",
                                statusInfo.badgeClass
                              )}
                            >
                              <span className={cn(
                                "size-1.5 rounded-full shrink-0",
                                statusInfo.dotColor,
                                statusInfo.isLive && "animate-ping"
                              )} />
                              <span className="truncate">{statusInfo.badgeText}</span>
                            </Badge>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onToggleStatus(eskul.id)}
                            className="text-[9px] text-muted-foreground/80 hover:text-foreground tracking-tight font-medium transition-colors cursor-pointer"
                            title="Klik untuk ubah Master Status (Aktif / Non-Aktif)"
                          >
                            {eskul.status === 'Aktif' ? 'Master: Aktif' : 'Master: Non-Aktif'}
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditEskul(eskul)}
                            className="size-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Data Eskul"
                          >
                            <Edit3 className="size-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingEskul(eskul)}
                            className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus Eskul"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEskul.map((eskul) => {
            const quotaPercent = Math.round((eskul.jumlahSiswa / (eskul.kuota || 1)) * 100);
            const statusInfo = eskulStatusMap.get(eskul.id) || getEskulRealTimeStatus(eskul);

            return (
              <Card
                key={eskul.id}
                className="p-5 border-border transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {eskul.kategori}
                    </Badge>
                    
                    <button
                      type="button"
                      onClick={() => onToggleStatus(eskul.id)}
                      className="cursor-pointer group focus:outline-none"
                      title="Klik untuk ubah status keaktifan eskul"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 px-2.5 text-[10px] font-semibold gap-1.5 transition-all border",
                          statusInfo.badgeClass
                        )}
                      >
                        <span className={cn(
                          "size-1.5 rounded-full shrink-0",
                          statusInfo.dotColor,
                          statusInfo.isLive && "animate-ping"
                        )} />
                        <span>{statusInfo.badgeText}</span>
                      </Badge>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {eskul.namaEskul}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {eskul.deskripsi}
                  </p>

                  <div className="flex items-center gap-3 my-3.5 p-2.5 bg-muted/40 rounded-md border border-border">
                    <UserAvatar
                      name={eskul.pembinaNama}
                      className="size-9 ring-1 ring-border shrink-0 text-xs"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">
                        Pembina Terdaftar
                      </div>
                      <div className="text-xs font-bold text-foreground truncate">
                        {eskul.pembinaNama}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground mb-3.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                      <span>Setiap {eskul.jadwalHari}, {eskul.jamMulai} - {eskul.jamSelesai} WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{eskul.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{eskul.jumlahSiswa} / {eskul.kuota} Siswa ({quotaPercent}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-3.5">
                    <div
                      className={`h-full rounded-full ${
                        quotaPercent >= 90 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    onClick={() => onOpenSession(eskul)}
                    className="flex-1 gap-1.5 text-xs font-semibold"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Buka Sesi QR</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditEskul(eskul)}
                      className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Ubah Data"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingEskul(eskul)}
                      className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Hapus Eskul"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingEskul}
        onClose={() => setDeletingEskul(null)}
        onConfirm={() => {
          if (deletingEskul) {
            onDeleteEskul(deletingEskul.id);
            setDeletingEskul(null);
          }
        }}
        title="Hapus Ekstrakurikuler"
        itemName={deletingEskul?.namaEskul}
        itemType="Ekstrakurikuler"
        description="Apakah Anda yakin ingin menghapus ekstrakurikuler ini? Seluruh data keanggotaan siswa dan jadwal latihan terkait akan dihapus secara permanen."
      />
    </div>
  );
};
