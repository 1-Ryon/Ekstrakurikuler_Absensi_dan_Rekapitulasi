import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  ScanLine, 
  Award, 
  CheckCircle2, 
  Check,
  ChevronRight, 
  Search, 
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  CalendarDays,
  Play,
  Layers,
  Info,
  Clock4,
  CheckCircle,
  AlertCircle,
  FileText,
  UserMinus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eskul, SesiPertemuan, StudentProfile, PresensiRecord, PenilaianRecord, PengajuanJadwal } from '../../types';
import { NavItemKey } from '../Sidebar';
import { UserAvatar } from '../common/UserAvatar';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { api } from '../../services/api';
import {
  Card,
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui';

interface PembinaDashboardProps {
  currentPembina: User;
  eskulList: Eskul[];
  students: StudentProfile[];
  sessions: SesiPertemuan[];
  recentLogs: PresensiRecord[];
  penilaianList: PenilaianRecord[];
  jadwalProposals?: PengajuanJadwal[];
  onNavigate: (tab: NavItemKey) => void;
  onOpenSession: (eskul: Eskul) => void;
  onOpenBukaAbsensiModal?: (eskul: Eskul) => void;
  onOpenAjukanJadwalModal?: (eskul: Eskul) => void;
  onOpenRiwayatJadwalModal?: () => void;
  onRefreshData?: () => void;
}

const DAYS_OF_WEEK = [
  { key: 'Senin', label: 'Senin' },
  { key: 'Selasa', label: 'Selasa' },
  { key: 'Rabu', label: 'Rabu' },
  { key: 'Kamis', label: 'Kamis' },
  { key: 'Jumat', label: 'Jumat' },
  { key: 'Sabtu', label: 'Sabtu' },
];

const getDayName = (date: Date): string => {
  const map: Record<number, string> = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
  };
  return map[date.getDay()] || 'Senin';
};

export const PembinaDashboard: React.FC<PembinaDashboardProps> = ({
  currentPembina,
  eskulList,
  students,
  sessions,
  recentLogs,
  penilaianList,
  jadwalProposals,
  onNavigate,
  onOpenSession,
  onOpenBukaAbsensiModal,
  onOpenAjukanJadwalModal,
  onOpenRiwayatJadwalModal,
  onRefreshData,
}) => {
  const coachedEskuls = useMemo(() => {
    return eskulList.filter((e) => {
      if (e.pembinaId === currentPembina.id) return true;
      const nameKeywords = (currentPembina.namaLengkap || '').toLowerCase().split(' ');
      return nameKeywords.some((kw) => kw.length > 2 && (e.pembinaNama || '').toLowerCase().includes(kw));
    });
  }, [eskulList, currentPembina]);

  const [selectedEskulId, setSelectedEskulId] = useState<string>(() => coachedEskuls[0]?.id || '');
  const activeCoachedEskul = coachedEskuls.find(e => e.id === selectedEskulId) || coachedEskuls[0] || null;
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>([]);
  const [kickingStudent, setKickingStudent] = useState<StudentProfile | null>(null);
  const [kickReason, setKickReason] = useState<string>('Indisipliner / Jarang Hadir');
  const [isSubmittingKick, setIsSubmittingKick] = useState<boolean>(false);
  const [kickSuccessMsg, setKickSuccessMsg] = useState<string>('');
  
  const handleConfirmKick = async () => {
    if (!kickingStudent || !activeCoachedEskul) return;
    setIsSubmittingKick(true);
    try {
      await api.kickMember(activeCoachedEskul.id, kickingStudent.id, kickReason);
      setExcludedStudentIds(prev => [...prev, kickingStudent.id]);
      setKickSuccessMsg(`Siswa ${kickingStudent.namaLengkap} berhasil dikeluarkan dari ${activeCoachedEskul.namaEskul}.`);
      setKickingStudent(null);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setKickSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal mengeluarkan siswa: ${err.message}`);
    } finally {
      setIsSubmittingKick(false);
    }
  };

  const todayDate = useMemo(() => new Date(), []);
  const todayName = useMemo(() => getDayName(todayDate), [todayDate]);
  const isTodaySchedule = useMemo(() => {
    return (activeCoachedEskul?.jadwalHari || '').toLowerCase().trim() === todayName.toLowerCase().trim();
  }, [activeCoachedEskul, todayName]);

  const daysUntilNextSession = useMemo(() => {
    if (!activeCoachedEskul) return 0;
    const daysOrder = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const targetIdx = daysOrder.indexOf(activeCoachedEskul.jadwalHari);
    const currentIdx = todayDate.getDay();
    if (targetIdx === -1) return 0;
    return (targetIdx - currentIdx + 7) % 7;
  }, [activeCoachedEskul, todayDate]);

  const enrolledStudents = useMemo(() => {
    if (!activeCoachedEskul) return [];
    return students.filter(
      (s) => s.enrolledEskulIds && s.enrolledEskulIds.includes(activeCoachedEskul.id)
    ).filter((s) => !excludedStudentIds.includes(s.id));
  }, [students, activeCoachedEskul]);

  const todaySession = useMemo(() => {
    if (!activeCoachedEskul) return undefined;
    return sessions.find((s) => s.eskulId === activeCoachedEskul.id);
  }, [sessions, activeCoachedEskul]);

  const eskulLogs = useMemo(() => {
    if (!activeCoachedEskul) return [];
    return recentLogs.filter(
      (l) => l.sesiId === todaySession?.id || l.namaEskul === activeCoachedEskul.namaEskul
    );
  }, [recentLogs, todaySession, activeCoachedEskul]);

  const coachScheduleByDay = useMemo(() => {
    const map: Record<string, Eskul[]> = {};
    coachedEskuls.forEach(e => {
      const day = e.jadwalHari || 'Jumat';
      if (!map[day]) map[day] = [];
      map[day].push(e);
    });
    return map;
  }, [coachedEskuls]);

  const [studentSearch, setStudentSearch] = useState('');
  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.kelas.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.nis && s.nis.includes(studentSearch))
  );

  const [agendaMateri, setAgendaMateri] = useState(
    todaySession?.materi || activeCoachedEskul?.deskripsi || 'Latihan fisik daya tahan, teknik passing cepat, strategi transisi bertahan ke menyerang.'
  );
  const [isSavedMateri, setIsSavedMateri] = useState(false);

  const handleSaveMateri = () => {
    setIsSavedMateri(true);
    setTimeout(() => setIsSavedMateri(false), 2500);
  };

  const handleStartSession = () => {
    if (onOpenBukaAbsensiModal) {
      onOpenBukaAbsensiModal(activeCoachedEskul);
    } else {
      onOpenSession(activeCoachedEskul);
      onNavigate('dynamic-qr');
    }
  };

  const myPendingProposalsCount = useMemo(() => {
    if (!jadwalProposals) return 0;
    return jadwalProposals.filter(
      (p) =>
        p.status === 'MENUNGGU_VALIDASI' &&
        (p.pembinaId === currentPembina.id ||
          coachedEskuls.some((e) => e.id === p.eskulId))
    ).length;
  }, [jadwalProposals, currentPembina, coachedEskuls]);

  if (!activeCoachedEskul) {
    return (
      <div className="space-y-6 pb-16">
        <Card className="p-8 sm:p-12 text-center border-border shadow-xs space-y-4">
          <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Users className="size-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Belum Ada Ekstrakurikuler yang Diampu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Akun Anda terdaftar aktif sebagai Pembina ({currentPembina.namaLengkap}), namun saat ini belum ada cabang ekstrakurikuler yang ditugaskan kepada Anda atau data eskul sedang kosong.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Silakan hubungi Administrator atau Koordinator Ekstrakurikuler untuk mendaftarkan cabang ekstrakurikuler baru.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Portal Guru Pembina
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Selamat Bertugas, {currentPembina.namaLengkap}!
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
              Membina <strong className="text-slate-800">{coachedEskuls.length} Cabang Ekstrakurikuler</strong> • NIP: {currentPembina.nomorInduk || '-'}
            </p>

            {coachedEskuls.length > 1 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Pilih Eskul yang Dikelola:</span>
                {coachedEskuls.map((e) => {
                  const isSelected = e.id === activeCoachedEskul.id;
                  return (
                    <Button
                      key={e.id}
                      variant={isSelected ? "brand" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEskulId(e.id)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <span>{e.namaEskul}</span>
                      <Badge variant={isSelected ? "secondary" : "outline"} className="text-[10px] py-0 px-1">
                        {e.jadwalHari}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="brand"
              size="sm"
              onClick={handleStartSession}
              className="gap-2 h-9"
            >
              <QrCode className="size-4" />
              <span>Buka QR Proyektor (15s)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('scanner-guru')}
              className="gap-2 h-9"
            >
              <ScanLine className="size-4" />
              <span>Pindai Kartu Siswa</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('penilaian')}
              className="gap-2 h-9"
            >
              <Award className="size-4" />
              <span>Masukkan Nilai Rapor</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className={`p-5 sm:p-6 transition-colors ${
        isTodaySchedule 
          ? 'border-emerald-300 bg-emerald-50/30' 
          : ''
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {isTodaySchedule ? (
                <Badge variant="brand" className="text-xs font-semibold gap-1.5 py-1 px-3">
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <span>HARI INI JADWAL LATIHAN RUTIN</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-medium gap-1.5 py-1 px-3">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span>Hari Ini: {todayName} • Bukan Jadwal Rutin</span>
                </Badge>
              )}

              <Badge variant="secondary" className="text-xs font-medium py-1 px-2.5">
                {activeCoachedEskul.namaEskul} ({activeCoachedEskul.kategori})
              </Badge>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                {isTodaySchedule ? (
                  <span>Sesi Latihan Hari Ini Siap Dibuka</span>
                ) : (
                  <span>
                    Jadwal Latihan Berikutnya: Setiap {activeCoachedEskul.jadwalHari}
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
                {isTodaySchedule ? (
                  <span>Siswa dapat melakukan presensi melalui QR Dinamis proyektor atau dipindai Kartu Siswa-nya oleh pembina.</span>
                ) : (
                  <span>
                    Jadwal rutin cabang {activeCoachedEskul.namaEskul} adalah setiap hari <strong className="text-foreground">{activeCoachedEskul.jadwalHari}</strong> ({daysUntilNextSession === 1 ? 'Besok' : `${daysUntilNextSession} hari lagi`}). Anda juga dapat membuka sesi tambahan hari ini jika diperlukan.
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-3 p-3 bg-card rounded-md border border-border">
                <div className="size-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Jadwal &amp; Jam</div>
                  <div className="font-semibold text-foreground text-xs mt-0.5">
                    {activeCoachedEskul.jadwalHari}, {activeCoachedEskul.jamMulai} - {activeCoachedEskul.jamSelesai} WIB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-card rounded-md border border-border">
                <div className="size-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Lokasi Fasilitas</div>
                  <div className="font-semibold text-foreground text-xs mt-0.5 truncate" title={activeCoachedEskul.lokasi}>
                    {activeCoachedEskul.lokasi}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-card rounded-md border border-border">
                <div className="size-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kapasitas Peserta</div>
                  <div className="font-semibold text-foreground text-xs mt-0.5">
                    {enrolledStudents.length} / {activeCoachedEskul.kuota} Siswa Terdaftar
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
            <Button
              variant="brand"
              size="sm"
              onClick={() => onNavigate('dynamic-qr')}
              className="gap-2 h-9"
            >
              <QrCode className="size-4" />
              <span>Buka QR Proyektor (15s)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('pembina-pendaftaran')}
              className="gap-2 h-9 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <Users className="size-4 text-blue-600" />
              <span>Pendaftaran &amp; Kuota Siswa</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStartSession}
              className="gap-2 h-9"
            >
              <Play className="size-4 fill-emerald-600 text-emerald-600" />
              <span>{isTodaySchedule ? 'Tampilkan QR Proyektor' : 'Mulai Sesi Latihan'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('scanner-guru')}
              className="gap-2 h-9"
            >
              <ScanLine className="size-4 text-emerald-600" />
              <span>Pindai Kartu Siswa</span>
            </Button>

            {onOpenAjukanJadwalModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenAjukanJadwalModal(activeCoachedEskul)}
                className="gap-2 h-9 text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
              >
                <Calendar className="size-4 text-amber-600" />
                <span>Ajukan Ganti Jadwal</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kalender Jadwal Mingguan Pembina
              </h3>
              <p className="text-[11px] text-slate-400">
                Rangkaian hari latihan seluruh cabang ekstrakurikuler yang Anda bimbing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAjukanJadwalModal && (
              <button
                type="button"
                onClick={() => onOpenAjukanJadwalModal(activeCoachedEskul)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ajukan Ganti Jadwal</span>
              </button>
            )}

            {onOpenRiwayatJadwalModal && (
              <button
                type="button"
                onClick={onOpenRiwayatJadwalModal}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Riwayat Usulan</span>
                {myPendingProposalsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
                    {myPendingProposalsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day.key.toLowerCase() === todayName.toLowerCase();
            const eskulsOnDay = coachScheduleByDay[day.key] || [];
            const hasSchedule = eskulsOnDay.length > 0;

            return (
              <div
                key={day.key}
                className={`p-3 rounded-md border transition-all flex flex-col justify-between min-h-[110px] ${
                  isToday 
                    ? 'border-[#00B884] bg-emerald-50/40 ring-2 ring-emerald-200/70 shadow-2xs' 
                    : hasSchedule
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#00B884]' : hasSchedule ? 'text-slate-800' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 bg-[#00B884] text-white rounded text-[9px] font-black uppercase">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  {hasSchedule ? (
                    <div className="space-y-1">
                      {eskulsOnDay.map((e) => (
                        <div key={e.id} className="p-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <div className="font-bold text-[11px] leading-tight truncate">{e.namaEskul}</div>
                          <div className="text-[10px] text-emerald-600 font-mono mt-0.5">{e.jamMulai} - {e.jamSelesai}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic block mt-1">Libur Latihan</span>
                  )}
                </div>

                {hasSchedule && (
                  <div className="text-[10px] text-slate-400 font-medium truncate mt-2 pt-1 border-t border-slate-100">
                    📍 {eskulsOnDay[0]?.lokasi}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-2">
            <span>Eskul Terpilih</span>
            <div className="size-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="size-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
              {activeCoachedEskul.namaEskul}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              Kategori: {activeCoachedEskul.kategori}
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-2">
            <span>Total Siswa Binaan</span>
            <div className="size-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {enrolledStudents.length || activeCoachedEskul.jumlahSiswa || 35}
              <span className="text-xs font-normal text-muted-foreground ml-1">Siswa</span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Dari kuota {activeCoachedEskul.kuota} siswa
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-2">
            <span>Status Pertemuan</span>
            <div className="size-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="text-[11px]">
                {todaySession?.status || 'BERLANGSUNG'}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block font-mono">
              {activeCoachedEskul.jamMulai} - {activeCoachedEskul.jamSelesai} WIB
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-2">
            <span>Rata-rata Presensi</span>
            <div className="size-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">
              95.4%
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Tingkat disiplin sangat baik
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Jurnal &amp; Agenda Materi Pertemuan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Catatan materi latihan untuk evaluasi perkembangan kompetensi siswa
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                Pertemuan Ke-12
              </Badge>
            </div>

            {todaySession?.judul && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Topik Pertemuan Sesi Ini:
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-200/60 text-emerald-900 border-emerald-300 uppercase">
                    {todaySession.status}
                  </Badge>
                </div>
                <div className="font-semibold text-slate-900 text-sm">{todaySession.judul}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  {todaySession.deskripsi}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Materi / Fokus Latihan Hari Ini:
              </label>
              <textarea
                rows={3}
                value={agendaMateri}
                onChange={(e) => setAgendaMateri(e.target.value)}
                placeholder="Tuliskan materi latihan, target capaian, atau catatan khusus..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] leading-relaxed resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {isSavedMateri ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Materi berhasil disimpan!
                    </span>
                  ) : (
                    'Materi otomatis dicantumkan pada jurnal absensi.'
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveMateri}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium"
                >
                  Simpan Catatan
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700 block mb-2.5">
                Pilih Metode Pengambilan Presensi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="p-3 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">QR Proyektor</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Siswa pindai QR 15 detik</p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('scanner-guru')}
                  className="p-3 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <ScanLine className="w-4 h-4 text-blue-600" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Pindai Kartu Siswa</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Guru pindai QR di HP/kartu</p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('live-presensi')}
                  className="p-3 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Presensi Langsung &amp; Izin</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Dispensasi &amp; status izin</p>
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Anggota: {activeCoachedEskul.namaEskul}
                </h3>
                <p className="text-xs text-slate-500">
                  Total {enrolledStudents.length} siswa terdaftar di bawah bimbingan Anda
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Cari siswa atau kelas..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-slate-600">Siswa</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 whitespace-nowrap">Kelas</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-center whitespace-nowrap">Kehadiran</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-right whitespace-nowrap">Nilai Rapor</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-center whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        Tidak ada siswa yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.slice(0, 7).map((student) => {
                      const grade = penilaianList.find(
                        (p) => p.siswaId === student.id && p.eskulId === activeCoachedEskul.id
                      );
                      return (
                        <TableRow key={student.id} className="hover:bg-slate-50/70">
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                name={student.namaLengkap}
                                className="w-7 h-7 shrink-0 text-[10px]"
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block truncate max-w-[140px] sm:max-w-[200px] text-xs">
                                  {student.namaLengkap}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">NIS: {student.nis || student.nomorInduk}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 font-medium text-slate-600 whitespace-nowrap text-xs">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-[11px]">
                              {student.kelas}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 text-center font-bold text-emerald-600 whitespace-nowrap text-xs">
                            {student.kehadiranRataRata}%
                          </TableCell>
                          <TableCell className="py-2.5 text-right whitespace-nowrap text-xs">
                            {grade ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                                {grade.nilaiAkhir} ({grade.predikat})
                              </Badge>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onNavigate('penilaian')}
                                className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                              >
                                + Beri Nilai
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-center whitespace-nowrap text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setKickingStudent(student);
                                setKickReason('Indisipliner / Jarang Hadir');
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Keluarkan Siswa dari Eskul"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-500">Menampilkan {Math.min(7, filteredStudents.length)} dari {enrolledStudents.length} siswa</span>
              <button
                type="button"
                onClick={() => onNavigate('penilaian')}
                className="text-emerald-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Input &amp; Kelola Rapor Nilai Selengkapnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Aktivitas Presensi Terkini
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                Real-time
              </Badge>
            </div>

            <div className="space-y-2.5">
              {eskulLogs.length > 0 ? (
                eskulLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {log.namaSiswa}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {log.kelas} • {log.waktuScan} WIB
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 border ${
                      log.status === 'HADIR'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : log.status === 'IZIN'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : log.status === 'SAKIT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Belum ada presensi yang masuk.</p>
                  <p className="text-[11px] mt-1 text-slate-400">Buka QR Proyektor atau Pindai Kartu Siswa untuk mulai merekam kehadiran.</p>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('live-presensi')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-700"
            >
              <span>Lihat Log Presensi Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Card>

          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-2">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pedoman Jadwal &amp; Sesi Pembina
            </span>
            <ul className="text-emerald-800 text-[11px] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                Jadwal resmi ekstrakurikuler ditetapkan pada hari <strong>{activeCoachedEskul.jadwalHari} ({activeCoachedEskul.jamMulai} - {activeCoachedEskul.jamSelesai} WIB)</strong>.
              </li>
              <li>
                Pembina dapat membuka sesi di luar hari rutin jika terdapat latihan intensif atau persiapan kejuaraan.
              </li>
              <li>
                Pastikan sesi ditutup setelah latihan berakhir agar presensi otomatis diakumulasikan ke nilai rapor semester.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!kickingStudent}
        onClose={() => setKickingStudent(null)}
        onConfirm={handleConfirmKick}
        isLoading={isSubmittingKick}
        title="Keluarkan Siswa dari Ekstrakurikuler"
        itemName={kickingStudent?.namaLengkap}
        itemType="Anggota Eskul"
        description={`Apakah Anda yakin ingin mengeluarkan siswa ini dari ekstrakurikuler ${activeCoachedEskul?.namaEskul || ''}? Keanggotaan siswa akan dinonaktifkan.`}
        confirmText="Ya, Keluarkan Siswa"
      />
    </div>
  );
};
