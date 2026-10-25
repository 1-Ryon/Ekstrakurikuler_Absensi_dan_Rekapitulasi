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
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PEMBINA_LIST, INITIAL_ESKUL_LIST, INITIAL_STUDENTS, INITIAL_SESSIONS } from '../../data/mockData';
import { Eskul, SesiPertemuan, PresensiRecord, StudentProfile, Guru, PengajuanJadwal } from '../../types';
import { NavItemKey } from '../Sidebar';
import { UserAvatar } from '../common/UserAvatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from '../ui';
import { WeeklyScheduleChart } from './WeeklyScheduleChart';

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
    return eskulList || [];
  }, [eskulList]);

  const effectiveStudents = useMemo(() => {
    return students && students.length > 0 ? students : INITIAL_STUDENTS;
  }, [students]);

  const effectivePembinaList = useMemo(() => {
    if (pembinaList && pembinaList.length > 0) return pembinaList;
    return PEMBINA_LIST;
  }, [pembinaList]);

  const effectiveSessions = useMemo(() => {
    return sessions || [];
  }, [sessions]);

  // 2. Real Date & Day Calculation (0: Senin, ..., 6: Minggu)
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const todayDayName = DAY_NAMES[todayIndex];

  // Selected Day Index for inspector
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);

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
      { name: 'Olahraga & Prestasi', count: counts['Olahraga'] || 0, percent: Math.round(((counts['Olahraga'] || 0) / total) * 100), color: 'text-amber-600' },
      { name: 'Teknologi & Digital', count: counts['Teknologi'] || 0, percent: Math.round(((counts['Teknologi'] || 0) / total) * 100), color: 'text-slate-700' },
      { name: 'Keagamaan & Karakter', count: counts['Keagamaan'] || 0, percent: Math.round(((counts['Keagamaan'] || 0) / total) * 100), color: 'text-[#00B884]' },
      { name: 'Seni & Budaya', count: counts['Seni & Budaya'] || 0, percent: Math.round(((counts['Seni & Budaya'] || 0) / total) * 100), color: 'text-amber-700' },
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

  // Helper: Kategori badge color mapping (Harmonized to SMK Al Amanah Brand Palette)
  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'Olahraga':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'Teknologi':
        return 'bg-slate-100 text-slate-700 border-slate-300/80';
      case 'Keagamaan':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'Kepemimpinan':
        return 'bg-emerald-100/70 text-emerald-900 border-emerald-300/80';
      case 'Seni & Budaya':
        return 'bg-amber-100/60 text-amber-900 border-amber-300/70';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000000] tracking-tight">
            Dashbord Koordinator
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Memantau jadwal mingguan eskul, daftar guru pembina bertugas, dan fasilitas yang digunakan Pada Eskul.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch sm:self-auto flex-wrap">

          {/* + Tambah Eskul */}
          <Button
            variant="brand"
            size="sm"
            onClick={onOpenAddEskul}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Tambah Eskul</span>
          </Button>

          {/* Impor Data Siswa */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImport}
            className="border-[#00B884] text-[#00B884] hover:bg-[#00B884]/10 gap-1.5"
          >
            <Upload className="size-4" />
            <span>Impor Siswa</span>
          </Button>
        </div>
      </div>

      {/* Action Center for Pending Verifications (Clean semantic Cards, no gradient slop) */}
      {(pendingProposalsCount > 0 || pendingPendaftaranCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {pendingProposalsCount > 0 && (
            <Card className="border-amber-200 bg-amber-50/60 p-4 rounded-lg flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Calendar className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-amber-950 truncate flex items-center gap-2">
                    <span>{pendingProposalsCount} Permohonan Jadwal</span>
                    <Badge variant="warning" className="text-[10px]">Perlu Verifikasi</Badge>
                  </div>
                  <div className="text-[11px] text-amber-800/80 truncate">
                    Guru pembina mengajukan penyesuaian jadwal kegiatan
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate('validasi-jadwal')}
                className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/70 shrink-0 font-semibold"
              >
                Tinjau Jadwal
              </Button>
            </Card>
          )}

          {pendingPendaftaranCount > 0 && (
            <Card className="border-blue-200 bg-blue-50/60 p-4 rounded-lg flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <UserCheck className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-blue-950 truncate flex items-center gap-2">
                    <span>{pendingPendaftaranCount} Pendaftar Siswa</span>
                    <Badge variant="secondary" className="text-[10px]">Hasil Seleksi</Badge>
                  </div>
                  <div className="text-[11px] text-blue-800/80 truncate">
                    Hasil seleksi pembina menunggu pengesahan resmi
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate('validasi-pendaftaran')}
                className="bg-white border-blue-300 text-blue-900 hover:bg-blue-100/70 shrink-0 font-semibold"
              >
                Sahkan Siswa
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 4 Stat Cards Grid: Eskul, Siswa, Guru Pembina, Sesi Hari Ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Ekstrakurikuler */}
        <Card
          onClick={() => onNavigate('eskul')}
          className="cursor-pointer hover:border-[#00B884] transition-colors rounded-lg flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Total Ekstrakurikuler
            </CardTitle>
            <ArrowUpRight className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00B884] tracking-tight">
              {effectiveEskulList.length}
            </div>
            <div>
              <Badge variant="brand" className="text-[10px]">
                {effectiveEskulList.filter(e => e.status !== 'Non-Aktif').length} Cabang Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Siswa Terdaftar */}
        <Card
          onClick={() => onNavigate('siswa')}
          className="cursor-pointer hover:border-slate-300 transition-colors rounded-lg flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Total Siswa Terdaftar
            </CardTitle>
            <ArrowUpRight className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {effectiveStudents.length}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {enrolledPercentage}% ({enrolledStudentsCount} siswa ber-eskul)
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Guru Pembina */}
        <Card
          onClick={() => onNavigate('pembina')}
          className="cursor-pointer hover:border-slate-300 transition-colors rounded-lg flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Total Guru Pembina
            </CardTitle>
            <ArrowUpRight className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {effectivePembinaList.length}
            </div>
            <div>
              <Badge variant="success" className="text-[10px]">
                {effectivePembinaList.length} Terverifikasi
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Sesi Eskul Hari Ini */}
        <Card
          onClick={() => onNavigate('dynamic-qr')}
          className="cursor-pointer hover:border-slate-300 transition-colors rounded-lg flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Sesi Hari Ini ({todayDayName})
            </CardTitle>
            <ArrowUpRight className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {todayActiveSessionsCount}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {todaySchedule.eskulList.length > 0
                ? todaySchedule.eskulList.map(e => e.namaEskul).slice(0, 2).join(', ')
                : 'Tidak ada sesi aktif'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SEBARAN JADWAL ESKUL MINGGUAN (SENIN — MINGGU) DENGAN GRAFIK 2 MODE        */}
      {/* ========================================================================= */}
      <Card className="rounded-lg shadow-xs space-y-6 p-5 sm:p-6">
        <WeeklyScheduleChart
          weeklySchedule={weeklySchedule}
          selectedDayIndex={selectedDayIndex}
          onSelectDay={(idx) => setSelectedDayIndex(idx)}
          totalWeeklySessions={totalWeeklySessions}
          peakDays={peakDays}
          todayDayName={todayDayName}
          onOpenAddEskul={onOpenAddEskul}
        />

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
            className="pt-4 border-t border-border"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Jadwal Eskul & Guru Pembina Pada Hari {selectedDay.dayName}
                    </h3>
                    <Badge variant="brand" className="text-[11px]">
                      {selectedDay.jumlahEskul} Eskul
                    </Badge>
                    {selectedDay.isToday && (
                      <Badge variant="default" className="text-[10px]">
                        Hari Ini
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDay.keterangan} • {selectedDay.eskulList.length} sesi eskul terjadwal aktif di SMK Al Amanah
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('eskul')}
                className="text-xs text-[#00B884] hover:text-[#009e70] hover:bg-emerald-50 gap-1 self-start sm:self-auto"
              >
                <span>Kelola Data Eskul</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>

            {/* Eskul & Pembina Cards for Selected Day */}
            {selectedDay.eskulList.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-lg bg-slate-50 border border-dashed border-border space-y-2">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Tidak Ada Jadwal Eskul Hari {selectedDay.dayName}
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Tidak ada kegiatan ekstrakurikuler yang dijadwalkan pada hari {selectedDay.dayName}.
                </p>
                <Button
                  size="sm"
                  variant="brand"
                  onClick={onOpenAddEskul}
                  className="gap-1.5 mt-2"
                >
                  <Plus className="size-4" />
                  <span>Jadwalkan Eskul di Hari {selectedDay.dayName}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {selectedDay.eskulList.map((item) => {
                  return (
                    <Card
                      key={item.id}
                      className="p-4 rounded-lg border-border hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <Badge variant="outline" className={`mb-1.5 text-[10px] ${getCategoryColor(item.kategori)}`}>
                          {item.kategori}
                        </Badge>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {item.namaEskul}
                        </h4>
                      </div>

                      {/* PEMBINA BERTUGAS */}
                      <div className="p-2.5 rounded-md bg-slate-50 border border-border flex items-center gap-2.5">
                        <UserAvatar
                          name={item.pembinaNama}
                          className="size-8 shrink-0 text-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Guru Pembina:
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {item.pembinaNama}
                          </h5>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="size-3.5 text-slate-400 shrink-0" />
                          <span>{item.jamMulai} - {item.jamSelesai} WIB</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.lokasi}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="size-3.5 text-[#00B884]" />
                          <span>{item.jumlahSiswa || item.kuota} / {item.kuota} Siswa</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Bottom Section: 2 Columns (Daftar Seluruh Pembina & Kategori/Fasilitas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Card: "Daftar Guru Pembina Eskul" */}
        <Card className="rounded-lg shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Data Guru Pembina Eskul
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Guru pembimbing ekstrakurikuler yang tervalidasi
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('pembina')}
              className="text-xs text-[#00B884] hover:text-[#009e70] hover:bg-emerald-50 gap-1"
            >
              <span>Lihat Semua</span>
              <ExternalLink className="size-3" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {effectivePembinaList.slice(0, 4).map((pembina) => (
              <div key={pembina.id} className="flex items-center gap-3 group">
                <div className="relative shrink-0">
                  <UserAvatar
                    name={pembina.namaLengkap}
                    className="size-9 text-xs"
                  />
                  <div className="size-2 bg-emerald-500 rounded-full border border-white absolute bottom-0 right-0"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#00B884] transition-colors truncate">
                    {pembina.namaLengkap}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {pembina.spesialisasi || 'Pembina Ekstrakurikuler'}
                  </p>
                </div>
                <Badge variant="success" className="text-[10px] shrink-0">
                  Aktif
                </Badge>
              </div>
            ))}
          </CardContent>

          <CardFooter className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>{effectivePembinaList.length} Pembina Terdaftar</span>
          </CardFooter>
        </Card>

        {/* Right Card: Sebaran Kategori & Pemanfaatan Fasilitas Sekolah */}
        <Card className="rounded-lg shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                Fasilitas & Lokasi Latihan Eskul
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Sarana sekolah aktif yang diisi Koordinator pada Kelola Eskul
              </CardDescription>
            </div>
            {scheduleCollisionInfo.hasCollision ? (
              <Badge variant="warning" className="text-[10px]">
                {scheduleCollisionInfo.collisionCount} Jadwal Bersamaan
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">
                Jadwal Terkoordinasi
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Pemanfaatan Fasilitas Ruang / Lokasi */}
            {facilityGroups.length === 0 ? (
              <div className="p-4 rounded-md bg-slate-50 border border-dashed border-border text-center text-xs text-muted-foreground">
                Belum ada lokasi latihan yang diisi oleh Koordinator pada Kelola Eskul.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto pr-1">
                {facilityGroups.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-md bg-slate-50 border border-border flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] truncate">
                      <MapPin className="size-3 text-[#00B884] shrink-0" />
                      <span className="truncate" title={f.title}>{f.title}</span>
                    </div>
                    <div className="font-semibold text-slate-900 text-xs mt-1 truncate" title={f.eskuls.join(', ')}>
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
            <div className="space-y-2 pt-1 border-t border-border text-xs">
              {categoryStats.map((cat, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{cat.name} ({cat.count} Cabang)</span>
                  <span className={`font-semibold ${cat.color}`}>{cat.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total {facilityGroups.length} Sarana Terpakai</span>
            <span className="font-medium text-emerald-600">Sinkron dari Kelola Eskul</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
