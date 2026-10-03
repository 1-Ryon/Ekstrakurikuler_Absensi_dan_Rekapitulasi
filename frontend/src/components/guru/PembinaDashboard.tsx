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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Eskul, SesiPertemuan, StudentProfile, PresensiRecord, PenilaianRecord, PengajuanJadwal } from '../../types';
import { NavItemKey } from '../Sidebar';
import { UserAvatar } from '../common/UserAvatar';

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
}) => {
  // Find all eskuls coached by this pembina (support multi-eskul)
  const coachedEskuls = useMemo(() => {
    const list = eskulList.filter((e) => {
      if (e.pembinaId === currentPembina.id) return true;
      const nameKeywords = (currentPembina.namaLengkap || '').toLowerCase().split(' ');
      return nameKeywords.some((kw) => kw.length > 2 && (e.pembinaNama || '').toLowerCase().includes(kw));
    });
    return list.length > 0 ? list : [eskulList[0] || {
      id: 'esk-01',
      namaEskul: 'Futsal Prestasi',
      kategori: 'Olahraga',
      pembinaId: currentPembina.id,
      pembinaNama: currentPembina.namaLengkap,
      pembinaAvatar: '',
      jadwalHari: 'Jumat',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal Indoor Utama',
      kuota: 40,
      jumlahSiswa: 35,
    }];
  }, [eskulList, currentPembina]);

  // Selected Active Eskul Tab (for multi-eskul coaches)
  const [selectedEskulId, setSelectedEskulId] = useState<string>(() => coachedEskuls[0]?.id || '');
  const activeCoachedEskul = coachedEskuls.find(e => e.id === selectedEskulId) || coachedEskuls[0];

  // Current Day Information
  const todayDate = useMemo(() => new Date(), []);
  const todayName = useMemo(() => getDayName(todayDate), [todayDate]);
  const isTodaySchedule = useMemo(() => {
    return (activeCoachedEskul?.jadwalHari || '').toLowerCase().trim() === todayName.toLowerCase().trim();
  }, [activeCoachedEskul, todayName]);

  // Days until next scheduled session
  const daysUntilNextSession = useMemo(() => {
    const daysOrder = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const targetIdx = daysOrder.indexOf(activeCoachedEskul.jadwalHari);
    const currentIdx = todayDate.getDay();
    if (targetIdx === -1) return 0;
    return (targetIdx - currentIdx + 7) % 7;
  }, [activeCoachedEskul, todayDate]);

  // Students enrolled in the active eskul
  const enrolledStudents = useMemo(() => {
    return students.filter(
      (s) => s.enrolledEskulIds && s.enrolledEskulIds.includes(activeCoachedEskul.id)
    );
  }, [students, activeCoachedEskul]);

  // Active Session for this eskul
  const todaySession = useMemo(() => {
    if (!activeCoachedEskul) return undefined;
    return sessions.find((s) => s.eskulId === activeCoachedEskul.id);
  }, [sessions, activeCoachedEskul]);

  // Recent attendance for this eskul
  const eskulLogs = useMemo(() => {
    return recentLogs.filter(
      (l) => l.sesiId === todaySession?.id || l.namaEskul === activeCoachedEskul.namaEskul
    );
  }, [recentLogs, todaySession, activeCoachedEskul]);

  // Weekly Schedule mapping for this coach
  const coachScheduleByDay = useMemo(() => {
    const map: Record<string, Eskul[]> = {};
    coachedEskuls.forEach(e => {
      const day = e.jadwalHari || 'Jumat';
      if (!map[day]) map[day] = [];
      map[day].push(e);
    });
    return map;
  }, [coachedEskuls]);

  // Student search
  const [studentSearch, setStudentSearch] = useState('');
  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.kelas.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.nis && s.nis.includes(studentSearch))
  );

  // Editable Agenda / Jurnal State
  const [agendaMateri, setAgendaMateri] = useState(
    todaySession?.materi || activeCoachedEskul.deskripsi || 'Latihan fisik daya tahan, teknik passing cepat, strategi transisi bertahan ke menyerang.'
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

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-700 text-white rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Portal Kerja Guru Pembina Ekstrakurikuler</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, {currentPembina.namaLengkap}!
            </h1>
            <p className="text-emerald-50 text-xs sm:text-sm max-w-xl leading-relaxed">
              Membina <strong>{coachedEskuls.length} Cabang Ekstrakurikuler</strong> • NIP: {currentPembina.nomorInduk || '-'}
            </p>

            {/* Multi-Eskul Tab Pills */}
            {coachedEskuls.length > 1 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-100">Pilih Eskul yang Dikelola:</span>
                {coachedEskuls.map((e) => {
                  const isSelected = e.id === activeCoachedEskul.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEskulId(e.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-[#00B884] shadow-md scale-105'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      <span>{e.namaEskul}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-100 text-[#00B884]' : 'bg-black/20 text-white'}`}>
                        {e.jadwalHari}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleStartSession}
              className="flex items-center gap-2 px-4 py-3 bg-white text-[#00B884] hover:bg-emerald-50 active:scale-[0.98] font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka QR Proyektor (15s)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scanner-guru')}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Pindai Kartu Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('penilaian')}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Masukkan Nilai Rapor</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Jadwal & Status Sesi Latihan Utama (Hero Schedule Card) */}
      <div className={`rounded-3xl p-5 sm:p-6 border shadow-2xs transition-all ${
        isTodaySchedule 
          ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-emerald-300 ring-2 ring-emerald-200/60' 
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            {/* Status Header Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isTodaySchedule ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white text-xs font-extrabold rounded-full shadow-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>HARI INI ADALAH JADWAL LATIHAN RUTIN!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hari Ini: {todayName} • Bukan Jadwal Rutin</span>
                </span>
              )}

              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                {activeCoachedEskul.namaEskul} ({activeCoachedEskul.kategori})
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isTodaySchedule ? (
                  <span>Sesi Latihan Hari Ini Siap Dibuka</span>
                ) : (
                  <span>
                    Jadwal Latihan Berikutnya: Setiap {activeCoachedEskul.jadwalHari}
                  </span>
                )}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                {isTodaySchedule ? (
                  <span>Siswa dapat melakukan presensi melalui QR Dinamis proyektor atau dipindai Kartu Siswa-nya oleh pembina.</span>
                ) : (
                  <span>
                    Jadwal rutin cabang {activeCoachedEskul.namaEskul} adalah setiap hari <strong>{activeCoachedEskul.jadwalHari}</strong> ({daysUntilNextSession === 1 ? 'Besok' : `${daysUntilNextSession} hari lagi`}). Anda juga dapat membuka sesi tambahan hari ini jika diperlukan.
                  </span>
                )}
              </p>
            </div>

            {/* 3 Detail Specs: Hari & Jam, Lokasi, Peserta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Jadwal &amp; Jam</div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {activeCoachedEskul.jadwalHari}, {activeCoachedEskul.jamMulai} - {activeCoachedEskul.jamSelesai} WIB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lokasi Fasilitas</div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={activeCoachedEskul.lokasi}>
                    {activeCoachedEskul.lokasi}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Kapasitas Peserta</div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {enrolledStudents.length} / {activeCoachedEskul.kuota} Siswa Terdaftar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Callout Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
            {/* 1. Alur Presensi 4-Tahap (Utama & Resmi) */}
            <button
              type="button"
              onClick={() => onNavigate('alur-absensi')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-[#00B884] to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Alur Presensi 4-Tahap (Resmi)</span>
            </button>

            {/* 2. Seleksi & Pendaftaran Siswa */}
            <button
              type="button"
              onClick={() => onNavigate('pembina-pendaftaran')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100/70 text-blue-800 font-bold text-xs rounded-2xl border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Pendaftaran &amp; Kuota Siswa</span>
            </button>

            {/* 3. Buka Sesi Standar / Proyektor */}
            <button
              type="button"
              onClick={handleStartSession}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>{isTodaySchedule ? 'Tampilkan QR Proyektor' : 'Mulai Sesi Latihan'}</span>
            </button>

            {/* 4. Scanner Cepat Guru */}
            <button
              type="button"
              onClick={() => onNavigate('scanner-guru')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>Pindai Kartu Siswa</span>
            </button>

            {/* 5. Pengajuan Jadwal */}
            {onOpenAjukanJadwalModal && (
              <button
                type="button"
                onClick={() => onOpenAjukanJadwalModal(activeCoachedEskul)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 hover:bg-amber-100/70 text-amber-800 font-bold text-xs rounded-2xl border border-amber-200/80 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Ajukan Ganti Jadwal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Kalender Jadwal Mingguan Pembina (Weekly Schedule Strip) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ajukan Ganti Jadwal</span>
              </button>
            )}

            {onOpenRiwayatJadwalModal && (
              <button
                type="button"
                onClick={onOpenRiwayatJadwalModal}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
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

        {/* 6 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day.key.toLowerCase() === todayName.toLowerCase();
            const eskulsOnDay = coachScheduleByDay[day.key] || [];
            const hasSchedule = eskulsOnDay.length > 0;

            return (
              <div
                key={day.key}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[110px] ${
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
                        <div key={e.id} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
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
      </div>

      {/* 4. KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Eskul Terpilih</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 truncate">
              {activeCoachedEskul.namaEskul}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              Kategori: {activeCoachedEskul.kategori}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Siswa Binaan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {enrolledStudents.length || activeCoachedEskul.jumlahSiswa || 35}
              <span className="text-xs font-medium text-slate-400 ml-1">Siswa</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Dari kuota {activeCoachedEskul.kuota} siswa
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Status Pertemuan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#00B884]">
                {todaySession?.status || 'BERLANGSUNG'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">
              {activeCoachedEskul.jamMulai} - {activeCoachedEskul.jamSelesai} WIB
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Rata-rata Presensi</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#00B884]">
              95.4%
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Tingkat disiplin sangat baik
            </span>
          </div>
        </div>
      </div>

      {/* 5. Main Grid: Agenda & Jurnal Latihan + Live Scan Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Agenda Latihan & Roster Siswa */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card Jurnal & Agenda Latihan */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Jurnal &amp; Agenda Materi Pertemuan
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Catatan materi latihan untuk evaluasi perkembangan kompetensi siswa
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Pertemuan Ke-12
              </span>
            </div>

            {/* Active Session Topic & Description Highlight */}
            {todaySession?.judul && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00B884]" />
                    Topik Pertemuan Sesi Ini:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase">
                    {todaySession.status}
                  </span>
                </div>
                <div className="font-black text-slate-900 text-sm">{todaySession.judul}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  {todaySession.deskripsi}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Materi / Fokus Latihan Hari Ini:
              </label>
              <textarea
                rows={3}
                value={agendaMateri}
                onChange={(e) => setAgendaMateri(e.target.value)}
                placeholder="Tuliskan materi latihan, target capaian, atau catatan khusus..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] leading-relaxed"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {isSavedMateri ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Materi berhasil disimpan!
                    </span>
                  ) : (
                    'Materi otomatis dicantumkan pada jurnal absensi.'
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleSaveMateri}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            {/* 3 Attendance Mode Quick Actions */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2.5">
                Pilih Metode Pengambilan Presensi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-[#00B884]" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00B884] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">QR Proyektor</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Siswa pindai QR 15 detik</p>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('scanner-guru')}
                  className="p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-2xl text-left transition-all cursor-pointer group"
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
                  className="p-3 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl text-left transition-all cursor-pointer group"
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
          </div>

          {/* Roster Siswa Anggota Eskul */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Anggota: {activeCoachedEskul.namaEskul}
                </h3>
                <p className="text-xs text-slate-400">
                  Total {enrolledStudents.length} siswa terdaftar di bawah bimbingan Anda
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa atau kelas..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00B884]"
                />
              </div>
            </div>

            {/* Table of students */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                    <th className="pb-2.5">Siswa</th>
                    <th className="pb-2.5 whitespace-nowrap">Kelas</th>
                    <th className="pb-2.5 text-center whitespace-nowrap">Kehadiran</th>
                    <th className="pb-2.5 text-right whitespace-nowrap">Nilai Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Tidak ada siswa yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.slice(0, 7).map((student) => {
                      const grade = penilaianList.find(
                        (p) => p.siswaId === student.id && p.eskulId === activeCoachedEskul.id
                      );
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 flex items-center gap-2.5">
                            <UserAvatar
                              name={student.namaLengkap}
                              className="w-7 h-7 shrink-0 text-[10px]"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-[140px] sm:max-w-[200px]">
                                {student.namaLengkap}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">NIS: {student.nis || student.nomorInduk}</span>
                            </div>
                          </td>
                          <td className="py-2.5 font-medium text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/80">
                              {student.kelas}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-bold text-emerald-600 whitespace-nowrap">
                            {student.kehadiranRataRata}%
                          </td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            {grade ? (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[#00B884] font-bold text-xs">
                                {grade.nilaiAkhir} ({grade.predikat})
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onNavigate('penilaian')}
                                className="text-[10px] text-amber-600 hover:underline font-bold cursor-pointer"
                              >
                                + Beri Nilai
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-400">Menampilkan {Math.min(7, filteredStudents.length)} dari {enrolledStudents.length} siswa</span>
              <button
                type="button"
                onClick={() => onNavigate('penilaian')}
                className="text-[#00B884] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Input &amp; Kelola Rapor Nilai Selengkapnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Scan Feed Hari Ini & Pedoman */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-900">
                  Aktivitas Presensi Terkini
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Real-time</span>
            </div>

            {/* List of recent checkins */}
            <div className="space-y-2.5">
              {eskulLogs.length > 0 ? (
                eskulLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {log.namaSiswa}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {log.kelas} • {log.waktuScan} WIB
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      log.status === 'HADIR'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.status === 'IZIN'
                        ? 'bg-blue-100 text-blue-700'
                        : log.status === 'SAKIT'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
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

            <button
              type="button"
              onClick={() => onNavigate('live-presensi')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Log Presensi Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Info & Schedule Guide Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-xs text-emerald-800 space-y-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00B884]" />
              Pedoman Jadwal &amp; Sesi Pembina
            </span>
            <ul className="text-emerald-700/90 text-[11px] space-y-1.5 list-disc list-inside leading-relaxed">
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
    </div>
  );
};
