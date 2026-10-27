import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  CalendarClock,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  Flame,
  Check,
  Layers,
  Volleyball
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eskul, SesiPertemuan, PresensiRecord, PengajuanJadwal, StudentProfile } from '../../types';

interface RiwayatEskulSiswaPageProps {
  student?: StudentProfile | null;
  enrolledEskuls: Eskul[];
  sessions: SesiPertemuan[];
  attendanceHistory: PresensiRecord[];
  jadwalProposals?: PengajuanJadwal[];
  initialSelectedEskulId?: string | null;
  onBackToDashboard?: () => void;
}

const getCategoryBadge = (kategori?: string) => {
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

export const RiwayatEskulSiswaPage: React.FC<RiwayatEskulSiswaPageProps> = ({
  student,
  enrolledEskuls,
  sessions,
  attendanceHistory,
  jadwalProposals = [],
  initialSelectedEskulId = null,
  onBackToDashboard,
}) => {
  const [selectedEskulId, setSelectedEskulId] = useState<string | null>(initialSelectedEskulId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('SEMUA');
  const [attendanceFilter, setAttendanceFilter] = useState<'SEMUA' | 'HADIR' | 'IZIN_SAKIT' | 'ALPA'>('SEMUA');

  // Selected eskul object
  const selectedEskul = useMemo(() => {
    if (!selectedEskulId) return null;
    return enrolledEskuls.find((e) => e.id === selectedEskulId) || null;
  }, [selectedEskulId, enrolledEskuls]);

  // Filtered enrolled eskuls for list view
  const filteredEskuls = useMemo(() => {
    return enrolledEskuls.filter((eskul) => {
      const matchSearch =
        eskul.namaEskul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eskul.pembinaNama && eskul.pembinaNama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (eskul.lokasi && eskul.lokasi.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        filterCategory === 'SEMUA' || eskul.kategori?.toLowerCase() === filterCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [enrolledEskuls, searchQuery, filterCategory]);

  // Overall attendance calculation
  const totalStats = useMemo(() => {
    let totalSessionsCount = 0;
    let totalAttendedCount = 0;

    enrolledEskuls.forEach((eskul) => {
      // Find matching attendance
      const records = attendanceHistory.filter(
        (r) =>
          r.eskulId === eskul.id ||
          r.namaEskul?.toLowerCase() === eskul.namaEskul?.toLowerCase()
      );
      totalSessionsCount += records.length;
      totalAttendedCount += records.filter((r) => r.status === 'HADIR').length;
    });

    const averagePercent =
      totalSessionsCount > 0
        ? Math.round((totalAttendedCount / totalSessionsCount) * 100)
        : student?.kehadiranRataRata || 96;

    const activeProposals = jadwalProposals.filter((p) => {
      const isEnrolled = enrolledEskuls.some(
        (e) => e.id === p.eskulId || e.namaEskul.toLowerCase() === p.namaEskul.toLowerCase()
      );
      return isEnrolled;
    });

    return {
      averagePercent,
      totalSessionsCount,
      totalAttendedCount,
      activeProposalsCount: activeProposals.length,
    };
  }, [enrolledEskuls, attendanceHistory, student, jadwalProposals]);

  // Sessions and attendance for selected eskul
  const selectedEskulData = useMemo(() => {
    if (!selectedEskul) return null;

    // Filter sessions matching this eskul
    const eskulSessions = sessions.filter(
      (s) =>
        s.eskulId === selectedEskul.id ||
        s.namaEskul?.toLowerCase() === selectedEskul.namaEskul?.toLowerCase()
    );

    // Filter proposals matching this eskul
    const eskulProposals = jadwalProposals.filter(
      (p) =>
        p.eskulId === selectedEskul.id ||
        p.namaEskul?.toLowerCase() === selectedEskul.namaEskul?.toLowerCase()
    );

    // Filter attendance records for this student & eskul
    const studentRecords = attendanceHistory.filter(
      (r) =>
        (r.eskulId === selectedEskul.id ||
          r.namaEskul?.toLowerCase() === selectedEskul.namaEskul?.toLowerCase()) &&
        (student ? r.siswaId === student.id || r.nisn === student.nis || r.nisn === student.nomorInduk : true)
    );

    // Combine sessions with student attendance
    // If sessions list doesn't have all records, synthesize session entries from attendance logs
    const sessionMap = new Map<string, any>();

    eskulSessions.forEach((sesi) => {
      const matchRecord = studentRecords.find(
        (r) => r.sesiId === sesi.id || (r.tanggal && r.tanggal.includes(sesi.tanggal))
      );

      sessionMap.set(sesi.id, {
        id: sesi.id,
        tanggal: sesi.tanggal,
        jamMulai: sesi.jamMulai,
        jamSelesai: sesi.jamSelesai,
        lokasi: sesi.lokasi || selectedEskul.lokasi,
        judul: sesi.judul || sesi.materi || 'Latihan Rutin Ekstrakurikuler',
        materi: sesi.materi || sesi.judul || 'Materi & Pemantapan Keterampilan',
        deskripsi:
          sesi.deskripsi ||
          'Pembahasan materi praktik dan evaluasi perkembangan keterampilan anggota eskul.',
        statusSesi: sesi.status,
        attendanceStatus: matchRecord ? matchRecord.status : 'BELUM_PRESENSI',
        waktuScan: matchRecord?.waktuScan,
        metode: matchRecord?.metode,
        nilaiKeaktifan: matchRecord?.nilaiKeaktifan,
        ratingKeaktifan: matchRecord?.ratingKeaktifan,
      });
    });

    // Add attendance records that might not be in sessions array
    studentRecords.forEach((rec) => {
      if (!sessionMap.has(rec.sesiId)) {
        sessionMap.set(rec.sesiId || rec.id, {
          id: rec.sesiId || rec.id,
          tanggal: rec.tanggal || rec.waktuScan?.split('•')[0]?.trim() || 'Terjadwal',
          jamMulai: rec.jamScan || selectedEskul.jamMulai,
          jamSelesai: selectedEskul.jamSelesai,
          lokasi: selectedEskul.lokasi,
          judul: `Pertemuan & Latihan ${selectedEskul.namaEskul}`,
          materi: `Materi Pelatihan Rutin & Pemantapan Teknik ${selectedEskul.namaEskul}`,
          deskripsi:
            rec.keterangan ||
            'Pelatihan dan pembinaan keterampilan berkala dengan bimbingan guru pembina.',
          statusSesi: 'SELESAI',
          attendanceStatus: rec.status,
          waktuScan: rec.waktuScan,
          metode: rec.metode,
          nilaiKeaktifan: rec.nilaiKeaktifan,
          ratingKeaktifan: rec.ratingKeaktifan,
        });
      }
    });

    const combinedList = Array.from(sessionMap.values()).sort((a, b) => {
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    });

    // Stats for this eskul
    const hadirCount = combinedList.filter((s) => s.attendanceStatus === 'HADIR').length;
    const izinSakitCount = combinedList.filter(
      (s) => s.attendanceStatus === 'IZIN' || s.attendanceStatus === 'SAKIT'
    ).length;
    const alpaCount = combinedList.filter(
      (s) => s.attendanceStatus === 'ALPA' || s.attendanceStatus === 'BELUM_PRESENSI'
    ).length;
    const totalCount = combinedList.length;

    const percent =
      totalCount > 0 ? Math.round((hadirCount / totalCount) * 100) : student?.kehadiranRataRata || 96;

    return {
      sessions: combinedList,
      proposals: eskulProposals,
      stats: {
        percent,
        hadirCount,
        izinSakitCount,
        alpaCount,
        totalCount,
      },
    };
  }, [selectedEskul, sessions, attendanceHistory, jadwalProposals, student]);

  // Categories list for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    enrolledEskuls.forEach((e) => {
      if (e.kategori) set.add(e.kategori);
    });
    return ['SEMUA', ...Array.from(set)];
  }, [enrolledEskuls]);

  // Filtered session list by attendance status
  const filteredSessions = useMemo(() => {
    if (!selectedEskulData) return [];
    if (attendanceFilter === 'SEMUA') return selectedEskulData.sessions;
    if (attendanceFilter === 'HADIR')
      return selectedEskulData.sessions.filter((s) => s.attendanceStatus === 'HADIR');
    if (attendanceFilter === 'IZIN_SAKIT')
      return selectedEskulData.sessions.filter(
        (s) => s.attendanceStatus === 'IZIN' || s.attendanceStatus === 'SAKIT'
      );
    if (attendanceFilter === 'ALPA')
      return selectedEskulData.sessions.filter(
        (s) => s.attendanceStatus === 'ALPA' || s.attendanceStatus === 'BELUM_PRESENSI'
      );
    return selectedEskulData.sessions;
  }, [selectedEskulData, attendanceFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER / HERO */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                SMK Al-Amanah
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Riwayat Ekstrakurikuler
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
              Lihat seluruh cabang ekstrakurikuler yang Anda ikuti, pantau riwayat presensi kehadiran di setiap sesi latihan, materi yang dipelajari, serta pembaruan jadwal.
            </p>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 text-xs font-semibold rounded-md border border-slate-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ArrowLeft className="size-4 text-slate-600" />
              <span>Ke Beranda Utama</span>
            </button>
          )}
        </div>

        {/* Quick KPI Bento Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Eskul Diikuti</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{enrolledEskuls.length}</span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Aktif
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Kehadiran Rata-rata</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                {totalStats.averagePercent}%
              </span>
              <span className="text-[10px] text-slate-700 font-semibold bg-slate-200 px-2 py-0.5 rounded-md">
                Semester Ini
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Total Sesi Hadir</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                {totalStats.totalAttendedCount}
              </span>
              <span className="text-[10px] text-slate-500">Pertemuan</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Pembaruan Jadwal</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-600">
                {totalStats.activeProposalsCount}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Pemberitahuan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA: LIST VIEW vs DETAIL VIEW */}
      <AnimatePresence mode="wait">
        {!selectedEskul ? (
          /* ========================================================== */
          /* VIEW A: LIST EKSTRAKURIKULER YANG DIIKUTI                  */
          /* ========================================================== */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ekstrakurikuler, pembina, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-[#00B884] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Enrolled Eskuls */}
            {filteredEskuls.length > 0 ? (
              <div className="space-y-3.5">
                {filteredEskuls.map((eskul) => {
                  // Calculate attendance percentage for this eskul
                  const eskulRecords = attendanceHistory.filter(
                    (h) =>
                      h.eskulId === eskul.id ||
                      h.namaEskul?.toLowerCase() === eskul.namaEskul?.toLowerCase()
                  );
                  const attendedCount = eskulRecords.filter((h) => h.status === 'HADIR').length;
                  const attendancePercent =
                    eskulRecords.length > 0
                      ? Math.round((attendedCount / eskulRecords.length) * 100)
                      : student?.kehadiranRataRata || 96;

                  // Check if there are schedule proposals for this eskul
                  const eskulProposals = jadwalProposals.filter(
                    (p) =>
                      p.eskulId === eskul.id ||
                      p.namaEskul?.toLowerCase() === eskul.namaEskul?.toLowerCase()
                  );
                  const latestProposal = eskulProposals[0];

                  // Find latest completed session to show latest material
                  const latestSession = sessions
                    .filter(
                      (s) =>
                        s.eskulId === eskul.id ||
                        s.namaEskul?.toLowerCase() === eskul.namaEskul?.toLowerCase()
                    )
                    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];

                  const catStyle = getCategoryBadge(eskul.kategori);

                  return (
                    <div
                      key={eskul.id}
                      onClick={() => setSelectedEskulId(eskul.id)}
                      className="group bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Left Accent Bar on Hover */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00B884] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* 1. Left Details */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs group-hover:scale-105 group-hover:bg-[#00B884] group-hover:text-white transition-all">
                            <Volleyball className="w-6 h-6 transition-colors" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            {/* Title & Category & Proposal Notice */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
                                {eskul.namaEskul}
                              </h3>
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${catStyle}`}>
                                {eskul.kategori}
                              </span>

                              {latestProposal && (
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${
                                  latestProposal.status === 'DISETUJUI'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  <CalendarClock className="w-3 h-3" />
                                  <span>
                                    {latestProposal.status === 'DISETUJUI'
                                      ? 'Ada Jadwal Baru'
                                      : 'Pengajuan Jadwal Sedang Diproses'}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Pembina Info */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400 font-medium">Dibina oleh:</span>
                              <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 inline-flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-[#00B884]" />
                                <span>{eskul.pembinaNama || 'Guru Pembina'}</span>
                              </span>
                            </div>

                            {/* Schedule & Location */}
                            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 pt-0.5">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Setiap {eskul.jadwalHari || '-'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{eskul.jamMulai || '15:30'} - {eskul.jamSelesai || '17:00'} WIB</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[200px]">{eskul.lokasi}</span>
                              </div>
                            </div>

                            {/* Latest Session & Material snippet if available */}
                            {latestSession?.materi && (
                              <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/60 flex items-start gap-2 text-xs mt-2">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-700">Materi Terakhir: </span>
                                  <span className="text-slate-500 line-clamp-1">{latestSession.materi}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. Right Section: Attendance Percentage & Detail Button */}
                        <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0 lg:min-w-[170px]">
                          <div className="text-left lg:text-right">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Kehadiran
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-[#00B884] leading-tight">
                              {attendancePercent}%
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {attendedCount} dari {eskulRecords.length || 1} sesi
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEskulId(eskul.id);
                            }}
                            className="px-4 py-2 bg-emerald-50 hover:bg-[#00B884] text-[#00B884] hover:text-white group-hover:bg-[#00B884] group-hover:text-white font-bold text-xs rounded-md border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Lihat Detail</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-xs space-y-3">
                <div className="size-12 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Volleyball className="size-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Tidak ada ekstrakurikuler ditemukan</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery || filterCategory !== 'SEMUA'
                    ? 'Tidak ada data ekstrakurikuler yang sesuai dengan filter pencarian Anda.'
                    : 'Anda belum terdaftar dalam cabang ekstrakurikuler aktif apapun.'}
                </p>
                {(searchQuery || filterCategory !== 'SEMUA') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('SEMUA');
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition-all cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* ========================================================== */
          /* VIEW B: DETAIL ESKUL (JADWAL, PERUBAHAN JADWAL & MATERI)    */
          /* ========================================================== */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <button
                onClick={() => setSelectedEskulId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md border border-slate-200 transition-all cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Kembali ke Daftar Eskul</span>
              </button>

              <div className="text-xs font-semibold text-slate-400">
                Detail Eskul: <span className="text-slate-900 font-bold">{selectedEskul.namaEskul}</span>
              </div>
            </div>

            {/* Eskul Header & KPI Bento Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs font-bold">
                    <Volleyball className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {selectedEskul.namaEskul}
                      </h2>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getCategoryBadge(selectedEskul.kategori)}`}>
                        {selectedEskul.kategori}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl">
                      {selectedEskul.deskripsi || 'Kegiatan ekstrakurikuler resmi SMK Al Amanah.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="text-slate-400">Guru Pembina:</span>
                      <span className="font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-[#00B884]" />
                        <span>{selectedEskul.pembinaNama || 'Guru Pembina'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Attendance Percentage */}
                <div className="bg-emerald-50/80 rounded-md p-4 border border-emerald-200 text-center md:text-right shrink-0 min-w-[160px]">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Kehadiran
                  </span>
                  <div className="text-3xl font-black text-[#00B884] leading-tight">
                    {selectedEskulData?.stats.percent}%
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    {selectedEskulData?.stats.hadirCount} Hadir dari {selectedEskulData?.stats.totalCount} Sesi
                  </span>
                </div>
              </div>

              {/* 4 KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 block">Total Pertemuan</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">
                    {selectedEskulData?.stats.totalCount} Sesi
                  </span>
                </div>
                <div className="bg-emerald-50/70 rounded-md p-3.5 border border-emerald-200">
                  <span className="text-[11px] font-medium text-emerald-800 block">Hadir</span>
                  <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
                    {selectedEskulData?.stats.hadirCount} Sesi
                  </span>
                </div>
                <div className="bg-amber-50/70 rounded-md p-3.5 border border-amber-200">
                  <span className="text-[11px] font-medium text-amber-800 block">Izin / Sakit</span>
                  <span className="text-lg font-bold text-amber-800 mt-0.5 block">
                    {selectedEskulData?.stats.izinSakitCount} Sesi
                  </span>
                </div>
                <div className="bg-rose-50/60 rounded-md p-3.5 border border-rose-200">
                  <span className="text-[11px] font-medium text-rose-700 block">Alpa / Tidak Hadir</span>
                  <span className="text-lg font-bold text-rose-700 mt-0.5 block">
                    {selectedEskulData?.stats.alpaCount} Sesi
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* SEKSI 1: INFORMASI & PERUBAHAN JADWAL                       */}
            {/* ========================================================== */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <CalendarClock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Jadwal & Pembaruan Jadwal Latihan
                    </h3>
                    <p className="text-xs text-slate-400">
                      Jadwal rutin mingguan dan informasi perubahan jadwal resmi dari pembina
                    </p>
                  </div>
                </div>
              </div>

              {/* Jadwal Rutin Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white text-[#00B884] flex items-center justify-center shadow-xs border border-slate-200/60">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Hari Rutin
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      Setiap {selectedEskul.jadwalHari || '-'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white text-[#00B884] flex items-center justify-center shadow-xs border border-slate-200/60">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Jam Latihan
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {selectedEskul.jamMulai || '15:30'} - {selectedEskul.jamSelesai || '17:00'} WIB
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white text-[#00B884] flex items-center justify-center shadow-xs border border-slate-200/60">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Lokasi / Ruangan
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 truncate block max-w-[200px]">
                      {selectedEskul.lokasi || 'Lingkungan Sekolah'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Perubahan Jadwal (Jadwal Proposals) */}
              {selectedEskulData?.proposals && selectedEskulData.proposals.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    <span>Riwayat & Status Perubahan Jadwal</span>
                  </h4>

                  {selectedEskulData.proposals.map((prop) => {
                    const isApproved = prop.status === 'DISETUJUI';
                    const isPending = prop.status === 'MENUNGGU_VALIDASI';

                    return (
                      <div
                        key={prop.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isApproved
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                                isApproved
                                  ? 'bg-emerald-600 text-white'
                                  : isPending
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {isApproved
                                ? '✓ PERUBAHAN DISETUJUI RESMI'
                                : isPending
                                ? '⏳ MENUNGGU VALIDASI KOORDINATOR'
                                : '✕ PENGAJUAN DITOLAK'}
                            </span>
                            <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              Sifat: {prop.jenisPerubahan || 'SEMENTARA'}
                            </span>
                          </div>

                          {prop.tanggalEfektif && (
                            <span className="text-xs text-slate-500">
                              Efektif: <strong className="text-slate-700">{prop.tanggalEfektif}</strong>
                            </span>
                          )}
                        </div>

                        {/* Detail Perubahan: Hari & Jam Lama vs Baru */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                          <div className="bg-white/80 p-3 rounded-md border border-slate-200/60">
                            <span className="text-[10px] font-semibold text-slate-400 block">Jadwal Lama:</span>
                            <p className="text-xs font-bold text-slate-600 line-through mt-0.5">
                              {prop.hariLama}, {prop.jamMulaiLama} - {prop.jamSelesaiLama} WIB ({prop.lokasiLama})
                            </p>
                          </div>

                          <div className="bg-white p-3 rounded-md border border-emerald-300 shadow-xs">
                            <span className="text-[10px] font-bold text-emerald-600 block">Jadwal Baru:</span>
                            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                              {prop.hariBaru}, {prop.jamMulaiBaru} - {prop.jamSelesaiBaru} WIB ({prop.lokasiBaru || prop.lokasiLama})
                            </p>
                          </div>
                        </div>

                        {/* Alasan & Catatan Koordinator */}
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="font-semibold text-slate-500">Alasan Perubahan: </span>
                            <span className="text-slate-800 font-medium">{prop.alasan}</span>
                          </div>

                          {prop.catatanKoordinator && (
                            <div className="bg-white/60 p-2.5 rounded-lg border border-slate-200/50">
                              <span className="font-semibold text-emerald-800">Catatan Koordinator: </span>
                              <span className="text-slate-700">{prop.catatanKoordinator}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/60 flex items-center gap-3 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Jadwal latihan berjalan normal sesuai agenda rutin mingguan sekolah. Belum ada permohonan perubahan jadwal khusus.
                  </span>
                </div>
              )}
            </div>

            {/* ========================================================== */}
            {/* SEKSI 2: RIWAYAT PRESENSI & MATERI YANG TELAH BERLALU       */}
            {/* ========================================================== */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-md bg-emerald-50 border border-emerald-200 text-[#00B884] flex items-center justify-center">
                    <BookOpen className="size-4 text-[#00B884]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Riwayat Presensi & Materi Sesi Latihan
                    </h3>
                    <p className="text-xs text-slate-400">
                      Daftar pertemuan yang telah berlangsung, status kehadiran Anda, dan materi pelajaran yang dibahas
                    </p>
                  </div>
                </div>

                {/* Filter Status Presensi */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(
                    [
                      { key: 'SEMUA', label: 'Semua Sesi' },
                      { key: 'HADIR', label: 'Hadir' },
                      { key: 'IZIN_SAKIT', label: 'Izin / Sakit' },
                      { key: 'ALPA', label: 'Alpa' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setAttendanceFilter(f.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        attendanceFilter === f.key
                          ? 'bg-[#00B884] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sessions List */}
              {filteredSessions.length > 0 ? (
                <div className="space-y-4">
                  {filteredSessions.map((sesi, idx) => {
                    const isHadir = sesi.attendanceStatus === 'HADIR';
                    const isIzin = sesi.attendanceStatus === 'IZIN';
                    const isSakit = sesi.attendanceStatus === 'SAKIT';
                    const isAlpa =
                      sesi.attendanceStatus === 'ALPA' || sesi.attendanceStatus === 'BELUM_PRESENSI';

                    return (
                      <div
                        key={sesi.id || idx}
                        className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-3.5"
                      >
                        {/* Top Bar: Sesi Header & Attendance Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                              #{filteredSessions.length - idx}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                                  {sesi.judul}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{sesi.tanggal}</span>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{sesi.jamMulai} - {sesi.jamSelesai} WIB</span>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{sesi.lokasi}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Attendance Status Badge */}
                          <div className="shrink-0">
                            {isHadir && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>HADIR</span>
                              </div>
                            )}

                            {isIzin && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300/80 rounded-full font-bold text-xs">
                                <FileText className="w-4 h-4 text-slate-600" />
                                <span>IZIN</span>
                              </div>
                            )}

                            {isSakit && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-xs">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span>SAKIT</span>
                              </div>
                            )}

                            {isAlpa && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-xs">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>ALPA / TIDAK HADIR</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* MATERI PERTEMUAN (Agenda & Pembahasan Latihan) */}
                        <div className="bg-slate-50/90 rounded-lg p-4 border border-slate-200/80 space-y-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Materi Pertemuan:
                            </h4>
                          </div>

                          <div className="pl-6 space-y-1">
                            <p className="text-sm font-extrabold text-slate-900 leading-snug">
                              {sesi.materi || sesi.judul}
                            </p>
                            {sesi.deskripsi && (
                              <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                                {sesi.deskripsi}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Attendance Log Details (Scan Time & Keaktifan jika hadir) */}
                        {isHadir && (sesi.waktuScan || sesi.nilaiKeaktifan) && (
                          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Tercatat:</span>
                              <span className="font-semibold text-slate-700">
                                {sesi.waktuScan || `Pukul ${sesi.jamMulai} WIB`}
                              </span>
                              {sesi.metode && (
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {sesi.metode === 'DYNAMIC_QR'
                                    ? 'Dynamic QR'
                                    : sesi.metode === 'SCAN_QR_SISWA'
                                    ? 'Kartu Siswa'
                                    : sesi.metode}
                                </span>
                              )}
                            </div>

                            {sesi.nilaiKeaktifan !== undefined && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">Nilai Keaktifan:</span>
                                <span className="font-black text-[#00B884] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {sesi.nilaiKeaktifan} ({sesi.ratingKeaktifan || 'Sangat Baik'})
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200/80 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">Tidak ada data sesi pertemuan</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    {attendanceFilter !== 'SEMUA'
                      ? 'Tidak ada riwayat pertemuan dengan status filter kehadiran ini.'
                      : 'Belum ada agenda pertemuan yang dilaksanakan untuk cabang ekstrakurikuler ini.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
