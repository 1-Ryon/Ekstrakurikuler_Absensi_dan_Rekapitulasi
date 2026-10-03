import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Upload, 
  Users, 
  Clock, 
  ExternalLink, 
  CalendarDays, 
  Calendar,
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Building2, 
  QrCode,
  BarChart2,
  LineChart,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PEMBINA_LIST, INITIAL_ESKUL_LIST, INITIAL_STUDENTS, INITIAL_SESSIONS } from '../../data/mockData';
import { Eskul, SesiPertemuan, PresensiRecord, StudentProfile, Guru, PengajuanJadwal } from '../../types';
import { NavItemKey } from '../Sidebar';
import { UserAvatar } from '../common/UserAvatar';

interface AdminDashboardProps {
  eskulList?: Eskul[];
  students?: StudentProfile[];
  pembinaList?: Guru[];
  sessions?: SesiPertemuan[];
  presensiLog?: PresensiRecord[];
  jadwalProposals?: PengajuanJadwal[];
  pendingPendaftaranCount?: number;
  onOpenAddEskul: () => void;
  onOpenImport: () => void;
  onOpenValidasiJadwal?: () => void;
  onNavigate: (tab: NavItemKey) => void;
  onOpenSession?: (eskul: Eskul) => void;
}

const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
const SHORT_DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'] as const;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  eskulList,
  students,
  pembinaList,
  sessions,
  presensiLog: _presensiLog,
  jadwalProposals,
  pendingPendaftaranCount = 0,
  onOpenAddEskul,
  onOpenImport,
  onOpenValidasiJadwal,
  onNavigate,
  onOpenSession,
}) => {
  // 1. Data Fallback & Normalization
  const effectiveEskulList = useMemo(() => {
    return eskulList && eskulList.length > 0 ? eskulList : INITIAL_ESKUL_LIST;
  }, [eskulList]);

  const effectiveStudents = useMemo(() => {
    return students && students.length > 0 ? students : INITIAL_STUDENTS;
  }, [students]);

  const effectivePembinaList = useMemo(() => {
    if (pembinaList && pembinaList.length > 0) return pembinaList;
    return PEMBINA_LIST;
  }, [pembinaList]);

  const effectiveSessions = useMemo(() => {
    return sessions && sessions.length > 0 ? sessions : INITIAL_SESSIONS;
  }, [sessions]);

  // 2. Real Date & Day Calculation (0: Senin, ..., 6: Minggu)
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const todayDayName = DAY_NAMES[todayIndex];

  // Selected Day Index for inspector
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);

  // Toggle between Bar Chart (Batang) and Line Chart (Garis)
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'line'>('bar');

  // 3. Dynamic Weekly Schedule from effectiveEskulList
  const attendanceBase = [96, 94, 91, 95, 90, 97, 88];

  const weeklySchedule = useMemo(() => {
    return DAY_NAMES.map((dayName, idx) => {
      const eskulsOnDay = effectiveEskulList.filter(
        (e) => (e.jadwalHari || '').toLowerCase().trim() === dayName.toLowerCase().trim() && e.status !== 'Non-Aktif'
      );
      const isToday = idx === todayIndex;
      return {
        dayIndex: idx,
        dayName,
        shortDay: SHORT_DAYS[idx],
        jumlahEskul: eskulsOnDay.length,
        kehadiranPercent: attendanceBase[idx] || 90,
        isToday,
        keterangan: eskulsOnDay.length > 0 
          ? `${eskulsOnDay.length} Cabang Eskul Aktif` 
          : 'Tidak Ada Kegiatan Terjadwal',
        eskulList: eskulsOnDay.map((e) => ({
          id: e.id,
          namaEskul: e.namaEskul,
          kategori: e.kategori || 'Umum',
          jamMulai: e.jamMulai || '15:30',
          jamSelesai: e.jamSelesai || '17:00',
          lokasi: e.lokasi || 'SMK Al Amanah',
          pembinaNama: e.pembinaNama || 'Guru Pembina',
          kuota: e.kuota || 40,
          jumlahSiswa: e.jumlahSiswa || 0,
          rawEskul: e,
        })),
      };
    });
  }, [effectiveEskulList, todayIndex]);

  const selectedDay = weeklySchedule[selectedDayIndex] || weeklySchedule[todayIndex];
  const todaySchedule = weeklySchedule[todayIndex];
  const maxEskulCount = Math.max(...weeklySchedule.map(d => d.jumlahEskul), 4);
  const totalWeeklySessions = weeklySchedule.reduce((acc, d) => acc + d.jumlahEskul, 0);

  // Puncak kegiatan
  const peakDays = useMemo(() => {
    const active = [...weeklySchedule].filter(d => d.jumlahEskul > 0).sort((a, b) => b.jumlahEskul - a.jumlahEskul);
    if (active.length === 0) return 'Belum ada jadwal eskul terjadwal';
    const topCount = active[0].jumlahEskul;
    const topDays = active.filter(d => d.jumlahEskul === topCount);
    return topDays.map(d => `${d.dayName} (${d.jumlahEskul} Eskul)`).join(' & ');
  }, [weeklySchedule]);

  // Total Siswa Enrolled
  const enrolledStudentsCount = useMemo(() => {
    return effectiveStudents.filter(s => s.enrolledEskulIds && s.enrolledEskulIds.length > 0).length;
  }, [effectiveStudents]);

  const enrolledPercentage = useMemo(() => {
    if (effectiveStudents.length === 0) return 0;
    return Math.round((enrolledStudentsCount / effectiveStudents.length) * 100);
  }, [effectiveStudents, enrolledStudentsCount]);

  // Today Active Sesi
  const todayActiveSessionsCount = useMemo(() => {
    const runningSessions = effectiveSessions.filter(s => s.status === 'BERLANGSUNG');
    if (runningSessions.length > 0) return runningSessions.length;
    return todaySchedule.jumlahEskul;
  }, [effectiveSessions, todaySchedule]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const total = effectiveEskulList.length || 1;
    const counts: Record<string, number> = {
      'Olahraga': 0,
      'Teknologi': 0,
      'Seni & Budaya': 0,
      'Keagamaan': 0,
      'Kepemimpinan': 0,
    };
    effectiveEskulList.forEach(e => {
      if (counts[e.kategori] !== undefined) {
        counts[e.kategori]++;
      } else {
        counts[e.kategori] = 1;
      }
    });

    return [
      { name: 'Olahraga & Prestasi', count: counts['Olahraga'] || 0, percent: Math.round(((counts['Olahraga'] || 0) / total) * 100), color: 'text-sky-600' },
      { name: 'Teknologi & Digital', count: counts['Teknologi'] || 0, percent: Math.round(((counts['Teknologi'] || 0) / total) * 100), color: 'text-violet-600' },
      { name: 'Seni & Budaya', count: counts['Seni & Budaya'] || 0, percent: Math.round(((counts['Seni & Budaya'] || 0) / total) * 100), color: 'text-amber-600' },
    ];
  }, [effectiveEskulList]);

  // Facility Groups: Dynamic aggregation from actual 'lokasi' entered by Coordinator
  const facilityGroups = useMemo(() => {
    const locationMap = new Map<string, { eskuls: string[]; days: Set<string>; count: number }>();

    effectiveEskulList.forEach(e => {
      const loc = (e.lokasi || '').trim();
      if (!loc) return;

      if (!locationMap.has(loc)) {
        locationMap.set(loc, { eskuls: [], days: new Set<string>(), count: 0 });
      }
      const entry = locationMap.get(loc)!;
      if (!entry.eskuls.includes(e.namaEskul)) {
        entry.eskuls.push(e.namaEskul);
      }
      if (e.jadwalHari) {
        entry.days.add(e.jadwalHari);
      }
      entry.count++;
    });

    return Array.from(locationMap.entries()).map(([lokasi, data]) => ({
      title: lokasi,
      eskuls: data.eskuls,
      days: Array.from(data.days),
      totalEskul: data.count,
    }));
  }, [effectiveEskulList]);

  // Schedule Collision Check based on day & location
  const scheduleCollisionInfo = useMemo(() => {
    const dayLocationMap = new Map<string, string[]>();
    let collisionCount = 0;

    effectiveEskulList.forEach(e => {
      if (!e.lokasi || !e.jadwalHari) return;
      const key = `${e.lokasi.toLowerCase().trim()}___${e.jadwalHari.toLowerCase().trim()}`;
      if (!dayLocationMap.has(key)) {
        dayLocationMap.set(key, []);
      }
      const list = dayLocationMap.get(key)!;
      list.push(e.namaEskul);
      if (list.length > 1) {
        collisionCount++;
      }
    });

    return {
      hasCollision: collisionCount > 0,
      collisionCount,
    };
  }, [effectiveEskulList]);

  // Helper: Kategori badge color mapping
  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'Olahraga':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Teknologi':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Seni & Budaya':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Keagamaan':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Kepemimpinan':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper: Get Pembina avatar by name
  const getPembinaAvatar = (name: string): string => {
    const match = effectivePembinaList.find((p: any) => 
      (p.namaLengkap || '').toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes((p.namaLengkap || '').toLowerCase().split(' ')[0])
    );
    if (match && match.avatarUrl) return match.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00B884&color=fff&bold=true`;
  };

  const pendingProposalsCount = useMemo(() => {
    if (!jadwalProposals) return 0;
    return jadwalProposals.filter((p) => p.status === 'MENUNGGU_VALIDASI').length;
  }, [jadwalProposals]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00B884] tracking-tight">
            Dasbor Koordinator
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Pantau sebaran jadwal mingguan eskul, daftar guru pembina bertugas, dan fasilitas sekolah SMK Al Amanah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-stretch sm:self-auto flex-wrap">
          {/* Validasi Jadwal */}
          <button
            onClick={() => onNavigate('validasi-jadwal')}
            className="relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-amber-50 hover:bg-amber-100/70 border-2 border-amber-300 active:scale-[0.98] text-amber-800 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.2] text-amber-600" />
            <span>Validasi Jadwal</span>
            {pendingProposalsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                {pendingProposalsCount}
              </span>
            )}
          </button>

          {/* Validasi Pendaftaran Siswa */}
          <button
            onClick={() => onNavigate('validasi-pendaftaran')}
            className="relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-50 hover:bg-blue-100/70 border-2 border-blue-300 active:scale-[0.98] text-blue-700 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 stroke-[2.2] text-blue-600" />
            <span>Validasi Pendaftaran</span>
            {pendingPendaftaranCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                {pendingPendaftaranCount}
              </span>
            )}
          </button>

          {/* + Tambah Eskul */}
          <button
            onClick={onOpenAddEskul}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Eskul</span>
          </button>

          {/* Impor Data Siswa */}
          <button
            onClick={onOpenImport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 active:scale-[0.98] text-[#00B884] font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2]" />
            <span>Impor Siswa</span>
          </button>
        </div>
      </div>

      {/* Alert Banner for Pending Schedule Proposals */}
      {pendingProposalsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                Terdapat {pendingProposalsCount} Permohonan Perubahan Jadwal Menunggu Validasi!
              </div>
              <div className="text-xs text-amber-100 mt-0.5">
                Guru pembina mengajukan penyesuaian hari, jam, atau lokasi eskul. Silakan tinjau dan lakukan validasi.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('validasi-jadwal')}
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 active:scale-[0.98] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            Tinjau &amp; Validasi Sekarang
          </button>
        </div>
      )}

      {/* Alert Banner for Pending Student Registrations */}
      {pendingPendaftaranCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                Terdapat {pendingPendaftaranCount} Siswa Pendaftar Menunggu Pengesahan Koordinator!
              </div>
              <div className="text-xs text-blue-100 mt-0.5">
                Pembina telah menyeleksi siswa sesuai kuota maksimal eskul dan mengajukan batch siswa terpilih untuk disahkan.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('validasi-pendaftaran')}
            className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 active:scale-[0.98] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            Validasi Pendaftar Sekarang
          </button>
        </div>
      )}

      {/* 4 Stat Cards Grid: Eskul, Siswa, Guru Pembina, Sesi Hari Ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Ekstrakurikuler */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onNavigate('eskul')}
          className="bg-[#00B884] text-white p-4 sm:p-5 rounded-2xl shadow-xs cursor-pointer relative overflow-hidden flex flex-col justify-between h-36 sm:h-44"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-white/95">
              Total Ekstrakurikuler
            </span>
            <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-white/90">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {effectiveEskulList.length}
            </span>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-medium rounded-full">
              {effectiveEskulList.filter(e => e.status !== 'Non-Aktif').length} Cabang Eskul Aktif
            </span>
          </div>
        </motion.div>

        {/* Card 2: Total Siswa Terdaftar */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onNavigate('siswa')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs cursor-pointer flex flex-col justify-between h-36 sm:h-44 hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Total Siswa Terdaftar
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
              {effectiveStudents.length}
            </span>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-medium rounded-full truncate max-w-full">
              {enrolledPercentage}% ({enrolledStudentsCount} Siswa Ber-Eskul)
            </span>
          </div>
        </motion.div>

        {/* Card 3: Total Guru Pembina */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onNavigate('pembina')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs cursor-pointer flex flex-col justify-between h-36 sm:h-44 hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Total Guru Pembina
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
              {effectivePembinaList.length}
            </span>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-medium rounded-full border border-emerald-100">
              {effectivePembinaList.length} Pembina Terverifikasi
            </span>
          </div>
        </motion.div>

        {/* Card 4: Sesi Eskul Hari Ini */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onNavigate('dynamic-qr')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs cursor-pointer flex flex-col justify-between h-36 sm:h-44 hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Sesi Eskul Hari Ini
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
              {todayActiveSessionsCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Hari {todayDayName}
            </span>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-medium rounded-full truncate max-w-full">
              {todaySchedule.eskulList.length > 0 
                ? todaySchedule.eskulList.map(e => e.namaEskul).slice(0, 3).join(', ') + (todaySchedule.eskulList.length > 3 ? '...' : '')
                : 'Tidak ada jadwal eskul hari ini'
              }
            </span>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* SEBARAN JADWAL ESKUL MINGGUAN (SENIN — MINGGU) DENGAN INSPEKTOR ROSTER     */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        {/* Header of Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#00B884] font-bold text-xs">
                Jadwal Mingguan
              </span>
              <span className="text-xs text-slate-400">Total {totalWeeklySessions} Sesi Eskul Terjadwal / Pekan</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
              Sebaran Eskul & Guru Pembina (Senin — Minggu)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih hari untuk melihat eskul apa saja yang aktif dan siapa guru pembina yang bertugas pada hari tersebut.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Switcher: Batang vs Garis */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setChartViewMode('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'bar'
                    ? 'bg-white text-[#00B884] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('line')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'line'
                    ? 'bg-white text-[#00B884] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Garis</span>
              </button>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
              Hari: <strong className="text-[#00B884]">{selectedDay.dayName}</strong> ({selectedDay.jumlahEskul} Eskul)
            </span>
          </div>
        </div>

        {/* 7-Day Interactive Visual Representation (Batang vs Garis) */}
        <div className="space-y-4">
          {chartViewMode === 'bar' ? (
            /* ================= VIEW 1: GRAFIK BATANG ================= */
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 w-full">
              {weeklySchedule.map((day) => {
                const isSelected = selectedDay.dayIndex === day.dayIndex;
                const isToday = day.isToday;
                const heightPercent = day.jumlahEskul > 0 
                  ? Math.max(25, Math.round((day.jumlahEskul / maxEskulCount) * 100))
                  : 8;

                return (
                  <motion.div
                    key={day.dayIndex}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => setSelectedDayIndex(day.dayIndex)}
                    className={`relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isSelected
                        ? 'border-[#00B884] bg-emerald-50/40 ring-2 ring-[#00B884]/30 shadow-md'
                        : isToday
                        ? 'border-emerald-300 bg-white shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Today Badge */}
                    {isToday && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-2 py-0.5 bg-[#00B884] text-white text-[9px] font-bold rounded-full shadow-xs uppercase tracking-wider inline-flex items-center gap-1">
                          Hari Ini
                        </span>
                      </div>
                    )}

                    {/* Day Name & Count */}
                    <div className="text-center pt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        {day.shortDay}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {day.dayName}
                      </h4>
                    </div>

                    {/* Visual Bar Column */}
                    <div className="my-2.5 flex flex-col items-center">
                      <div className="w-full h-24 sm:h-28 bg-slate-200/50 rounded-xl relative flex flex-col justify-end p-1 overflow-hidden">
                        {/* Fill Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className={`w-full rounded-lg transition-all flex flex-col items-center justify-start pt-1.5 ${
                            day.jumlahEskul === 0
                              ? 'bg-slate-300/60'
                              : isSelected
                              ? 'bg-gradient-to-t from-[#00B884] to-[#14d49a] shadow-xs'
                              : isToday
                              ? 'bg-gradient-to-t from-[#00B884] to-[#40d7a9]'
                              : 'bg-gradient-to-t from-slate-400 to-slate-300'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold text-white leading-none drop-shadow-xs">
                            {day.jumlahEskul}
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center space-y-1">
                      <div className="inline-block px-2 py-0.5 rounded-full bg-white border border-slate-200/80 text-[10px] font-semibold text-slate-700">
                        {day.jumlahEskul} Eskul
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {day.eskulList.length} Sesi Aktif
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* ================= VIEW 2: GRAFIK GARIS (MURNI GARIS) ================= */
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00B884] inline-block ring-4 ring-emerald-50"></span>
                  <span className="font-bold text-slate-700">Diagram Garis Sebaran Eskul (Senin — Minggu)</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  Klik titik pada garis untuk melihat roster kegiatan hari tersebut
                </span>
              </div>
              
              {/* Dynamic SVG Clean Line Chart */}
              {(() => {
                const chartWidth = 740;
                const chartHeight = 230;
                const padLeft = 65;
                const padRight = 50;
                const padTop = 38;
                const padBottom = 55;
                const usableW = chartWidth - padLeft - padRight;
                const usableH = chartHeight - padTop - padBottom;
                const maxVal = maxEskulCount;

                const linePoints = weeklySchedule.map((day, idx) => {
                  const x = padLeft + idx * (usableW / (weeklySchedule.length - 1));
                  const y = (chartHeight - padBottom) - (day.jumlahEskul / maxVal) * usableH;
                  return { ...day, x, y };
                });

                const polylinePath = linePoints
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                  .join(' ');

                const selectedPoint = linePoints.find(p => p.dayIndex === selectedDay.dayIndex);

                return (
                  <div className="w-full h-56 sm:h-64 relative">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-full overflow-visible select-none"
                    >
                      {/* Horizontal Gridlines & Y-Axis Scale */}
                      {Array.from({ length: maxVal + 1 }, (_, lvl) => {
                        const y = (chartHeight - padBottom) - (lvl / maxVal) * usableH;
                        return (
                          <g key={lvl}>
                            <line
                              x1={padLeft - 10}
                              y1={y}
                              x2={chartWidth - padRight + 10}
                              y2={y}
                              stroke="#F1F5F9"
                              strokeDasharray="4 4"
                              strokeWidth="1.2"
                            />
                            <text
                              x={padLeft - 18}
                              y={y + 3.5}
                              fill="#94A3B8"
                              fontSize="11"
                              fontWeight="500"
                              textAnchor="end"
                            >
                              {lvl} {lvl === maxVal ? 'Eskul' : ''}
                            </text>
                          </g>
                        );
                      })}

                      {/* Axes */}
                      <line
                        x1={padLeft - 10}
                        y1={padTop - 5}
                        x2={padLeft - 10}
                        y2={chartHeight - padBottom}
                        stroke="#E2E8F0"
                        strokeWidth="1.2"
                      />
                      <line
                        x1={padLeft - 10}
                        y1={chartHeight - padBottom}
                        x2={chartWidth - padRight + 10}
                        y2={chartHeight - padBottom}
                        stroke="#E2E8F0"
                        strokeWidth="1.2"
                      />

                      {/* Vertical Guideline on Selected Day */}
                      {selectedPoint && (
                        <line
                          x1={selectedPoint.x}
                          y1={padTop}
                          x2={selectedPoint.x}
                          y2={chartHeight - padBottom}
                          stroke="#00B884"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          opacity="0.8"
                        />
                      )}

                      {/* Pure Line Stroke */}
                      <motion.path
                        d={polylinePath}
                        fill="none"
                        stroke="#00B884"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />

                      {/* Data Nodes & Day Labels */}
                      {linePoints.map((point) => {
                        const isSelected = selectedDay.dayIndex === point.dayIndex;
                        const isToday = point.isToday;

                        return (
                          <g
                            key={point.dayIndex}
                            onClick={() => setSelectedDayIndex(point.dayIndex)}
                            className="cursor-pointer group"
                          >
                            {/* Invisible wide column for easy click/touch */}
                            <rect
                              x={point.x - 45}
                              y={padTop - 15}
                              width="90"
                              height={usableH + 55}
                              fill="transparent"
                            />

                            {/* Halo / Pulse ring on selected */}
                            {isSelected && (
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="13"
                                fill="#00B884"
                                fillOpacity="0.18"
                              />
                            )}

                            {/* Data point circle */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={isSelected ? 6.5 : 5}
                              fill={isSelected ? '#00B884' : '#FFFFFF'}
                              stroke="#00B884"
                              strokeWidth={isSelected ? 3 : 2.5}
                              className="transition-transform group-hover:scale-110"
                            />

                            {/* Value badge above point */}
                            <g transform={`translate(${point.x}, ${point.y - 24})`}>
                              <rect
                                x="-15"
                                y="-9"
                                width="30"
                                height="18"
                                rx="9"
                                fill={isSelected ? '#00B884' : '#FFFFFF'}
                                stroke={isSelected ? '#00B884' : '#CBD5E1'}
                                strokeWidth="1"
                                className="shadow-xs"
                              />
                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                                fill={isSelected ? '#FFFFFF' : '#334155'}
                                fontSize="10"
                                fontWeight="bold"
                              >
                                {point.jumlahEskul}
                              </text>
                            </g>

                            {/* X-axis Day Name */}
                            <text
                              x={point.x}
                              y={chartHeight - padBottom + 23}
                              textAnchor="middle"
                              fill={isSelected ? '#00B884' : '#475569'}
                              fontSize="12"
                              fontWeight={isSelected ? 'bold' : '600'}
                            >
                              {point.dayName}
                            </text>

                            {/* Today Indicator or Sub-label */}
                            {isToday ? (
                              <g transform={`translate(${point.x}, ${chartHeight - padBottom + 36})`}>
                                <rect
                                  x="-23"
                                  y="-6"
                                  width="46"
                                  height="13"
                                  rx="6.5"
                                  fill="#00B884"
                                />
                                <text
                                  x="0"
                                  y="3.5"
                                  textAnchor="middle"
                                  fill="#FFFFFF"
                                  fontSize="8"
                                  fontWeight="bold"
                                  letterSpacing="0.5"
                                >
                                  HARI INI
                                </text>
                              </g>
                            ) : (
                              <text
                                x={point.x}
                                y={chartHeight - padBottom + 36}
                                textAnchor="middle"
                                fill="#94A3B8"
                                fontSize="10"
                              >
                                {point.shortDay}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-1 px-1 gap-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00B884] inline-block shrink-0"></span>
              Puncak kegiatan: <strong>{peakDays}</strong>
            </span>
            <span>Menampilkan data eskul untuk: <strong className="text-slate-700">Hari {selectedDay.dayName}</strong></span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL INSPEKTOR: DAFTAR ESKUL & GURU PEMBINA HARI TERPILIH                */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay.dayIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pt-4 border-t border-slate-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      Roster Eskul & Guru Pembina: Hari {selectedDay.dayName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#00B884] font-bold text-[11px]">
                      {selectedDay.jumlahEskul} Eskul Terjadwal
                    </span>
                    {selectedDay.isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedDay.keterangan} • {selectedDay.eskulList.length} sesi eskul terjadwal aktif di SMK Al Amanah
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('eskul')}
                className="text-xs text-[#00B884] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Kelola Data Eskul & Pembina</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Eskul & Pembina Cards for Selected Day */}
            {selectedDay.eskulList.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B884] mx-auto flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-700">
                  Tidak Ada Jadwal Eskul Hari {selectedDay.dayName}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Tidak ada kegiatan ekstrakurikuler yang dijadwalkan pada hari {selectedDay.dayName}. Sekolah tidak mengadakan sesi eskul pada hari ini.
                </p>
                <button
                  onClick={onOpenAddEskul}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Jadwalkan Eskul di Hari {selectedDay.dayName}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {selectedDay.eskulList.map((item) => {
                  const avatarUrl = getPembinaAvatar(item.pembinaNama);

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${getCategoryColor(item.kategori)}`}>
                          {item.kategori}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {item.namaEskul}
                        </h4>
                      </div>

                      {/* PEMBINA BERTUGAS */}
                      <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                        <UserAvatar
                          name={item.pembinaNama}
                          className="w-9 h-9 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Guru Pembina:
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {item.pembinaNama}
                          </h5>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.jamMulai} - {item.jamSelesai} WIB</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.lokasi}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.jumlahSiswa || item.kuota} / {item.kuota} Siswa</span>
                        </div>

                        <button
                          onClick={() => {
                            if (onOpenSession && item.rawEskul) {
                              onOpenSession(item.rawEskul);
                            } else {
                              onNavigate('dynamic-qr');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-[#00B884] text-[#00B884] hover:text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Buka Sesi</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section: 2 Columns (Daftar Seluruh Pembina & Kategori/Fasilitas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Card: "Daftar Guru Pembina Eskul" */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Daftar Guru Pembina Eskul
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Guru pembimbing ekstrakurikuler resmi SMK Al Amanah
                </p>
              </div>
              <button 
                onClick={() => onNavigate('pembina')}
                className="text-xs text-[#00B884] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {effectivePembinaList.slice(0, 4).map((pembina) => (
                <div key={pembina.id} className="flex items-center gap-3.5 group">
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={pembina.namaLengkap}
                      className="w-10 h-10 ring-2 ring-emerald-500/20 shadow-xs text-xs"
                    />
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#00B884] transition-colors truncate">
                      {pembina.namaLengkap}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {pembina.spesialisasi || 'Pembina Ekstrakurikuler'}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shrink-0">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{effectivePembinaList.length} Pembina Ekstrakurikuler Terdaftar</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Terverifikasi
            </span>
          </div>
        </div>

        {/* Right Card: Sebaran Kategori & Pemanfaatan Fasilitas Sekolah */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00B884]" />
                  Fasilitas & Lokasi Latihan Eskul
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sarana sekolah aktif yang diisi Koordinator pada Kelola Eskul
                </p>
              </div>
              {scheduleCollisionInfo.hasCollision ? (
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Ada {scheduleCollisionInfo.collisionCount} Jadwal Bersamaan
                </span>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Jadwal Terkoordinasi
                </span>
              )}
            </div>

            {/* Pemanfaatan Fasilitas Ruang / Lokasi (Dinamis dari Input Koordinator) */}
            {facilityGroups.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 mb-4">
                Belum ada lokasi latihan yang diisi oleh Koordinator pada Kelola Eskul.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4 max-h-48 overflow-y-auto pr-1">
                {facilityGroups.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] truncate">
                      <MapPin className="w-3 h-3 text-[#00B884] shrink-0" />
                      <span className="truncate" title={f.title}>{f.title}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs mt-1 truncate" title={f.eskuls.join(', ')}>
                      {f.eskuls.join(', ')}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1 truncate">
                      Setiap {f.days.length > 0 ? f.days.join(', ') : 'Sesuai Jadwal'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mini Kategori Progress Bars */}
            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              {categoryStats.map((cat, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{cat.name} ({cat.count} Cabang)</span>
                  <span className={`font-bold ${cat.color}`}>{cat.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total {facilityGroups.length} Sarana Sekolah Terpakai</span>
            <span className="font-medium text-emerald-600">Sinkron dari Kelola Eskul</span>
          </div>
        </div>
      </div>
    </div>
  );
};
