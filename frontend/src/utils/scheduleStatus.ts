import { Eskul, SesiPertemuan } from '../types';

/**
 * Daftar Hari Libur Nasional & Cuti Bersama Indonesia (2025 - 2027)
 * Format: YYYY-MM-DD
 */
export const INDONESIA_HOLIDAYS: Record<string, string> = {
  // Tahun 2025
  '2025-01-01': 'Tahun Baru 2025 Masehi',
  '2025-01-27': 'Isra Mi\'raj Nabi Muhammad SAW',
  '2025-01-29': 'Tahun Baru Imlek 2576 Kongzili',
  '2025-03-29': 'Hari Suci Nyepi (Tahun Baru Saka 1947)',
  '2025-03-31': 'Hari Raya Idul Fitri 1446 H',
  '2025-04-01': 'Hari Raya Idul Fitri 1446 H (Hari Kedua)',
  '2025-04-18': 'Wafat Yesus Kristus',
  '2025-04-20': 'Kebangkitan Yesus Kristus (Paskah)',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Hari Raya Waisak 2569 BE',
  '2025-05-29': 'Kenaikan Yesus Kristus',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-07': 'Hari Raya Idul Adha 1446 H',
  '2025-06-27': '1 Muharram (Tahun Baru Islam 1447 H)',
  '2025-08-17': 'Proklamasi Kemerdekaan RI Ke-80',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',

  // Tahun 2026
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Mi\'raj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-19': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-03-20': 'Hari Raya Idul Fitri 1447 H',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H (Hari Kedua)',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Proklamasi Kemerdekaan RI Ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',

  // Tahun 2027
  '2027-01-01': 'Tahun Baru 2027 Masehi',
  '2027-02-06': 'Tahun Baru Imlek 2578 Kongzili',
  '2027-03-10': 'Hari Raya Idul Fitri 1448 H',
  '2027-05-01': 'Hari Buruh Internasional',
  '2027-06-01': 'Hari Lahir Pancasila',
  '2027-08-17': 'Proklamasi Kemerdekaan RI Ke-82',
  '2027-12-25': 'Hari Raya Natal',
};

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Mendapatkan nama hari bahasa Indonesia dari objek Date
 */
export const getIndonesianDayName = (date: Date = new Date()): string => {
  return INDONESIAN_DAYS[date.getDay()] || 'Senin';
};

/**
 * Format tanggal ke format YYYY-MM-DD standar
 */
export const formatDateToYmd = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format tanggal bahasa Indonesia lengkap (e.g. "Senin, 13 Oktober 2025")
 */
export const formatIndonesianFullDate = (date: Date = new Date()): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayName = getIndonesianDayName(date);
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

/**
 * Memeriksa apakah tanggal yang diberikan merupakan Hari Libur Nasional / Tanggal Merah
 */
export const checkIsIndonesianHoliday = (
  date: Date = new Date()
): { isHoliday: boolean; holidayName?: string; isWeekendHoliday: boolean } => {
  const ymd = formatDateToYmd(date);
  const holidayName = INDONESIA_HOLIDAYS[ymd];
  const isSunday = date.getDay() === 0;

  if (holidayName) {
    return { isHoliday: true, holidayName, isWeekendHoliday: isSunday };
  }

  // Hari Minggu selalu tanggal merah
  if (isSunday) {
    return { isHoliday: true, holidayName: 'Hari Libur Akhir Pekan (Minggu)', isWeekendHoliday: true };
  }

  return { isHoliday: false, isWeekendHoliday: false };
};

/**
 * Parse string jam "HH:mm" atau "HH.mm" ke menit dari awal hari (0-1439)
 */
export const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const sanitized = timeStr.replace('.', ':').trim();
  const parts = sanitized.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  return hours * 60 + minutes;
};

export type EskulScheduleStatusKey =
  | 'NON_AKTIF'
  | 'LIBUR'
  | 'BERLANGSUNG'
  | 'HARI_INI_MENUNGGU'
  | 'HARI_INI_SELESAI'
  | 'TERJADWAL';

export interface EskulRealtimeStatusInfo {
  key: EskulScheduleStatusKey;
  label: string;
  badgeText: string;
  detail: string;
  badgeClass: string;
  dotColor: string;
  isLive: boolean;
  priority: number; // untuk sorting / filter
}

export interface StatusEvaluationOptions {
  currentDate?: Date;
  sessions?: SesiPertemuan[];
  forceHoliday?: boolean;
  holidayReason?: string;
}

/**
 * Menghitung status real-time ekstrakurikuler berdasarkan jadwal, jam sekarang, sesi aktif, dan tanggal merah
 */
export const getEskulRealTimeStatus = (
  eskul: Eskul,
  options: StatusEvaluationOptions = {}
): EskulRealtimeStatusInfo => {
  const now = options.currentDate || new Date();
  const todayDayName = getIndonesianDayName(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. Jika Eskul Dinonaktifkan (Master Status = Non-Aktif)
  if (eskul.status === 'Non-Aktif') {
    return {
      key: 'NON_AKTIF',
      label: 'Non-Aktif',
      badgeText: 'Non-Aktif',
      detail: 'Ekstrakurikuler dinonaktifkan oleh administrator',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      dotColor: 'bg-rose-500',
      isLive: false,
      priority: 6,
    };
  }

  // 2. Cek apakah ada sesi aktif yang ditandai LIBUR hari ini
  const todaySession = options.sessions?.find(
    (s) => s.eskulId === eskul.id && (s.tanggal === formatDateToYmd(now) || !s.tanggal)
  );

  const holidayCheck = checkIsIndonesianHoliday(now);
  const isHoliday = Boolean(options.forceHoliday || holidayCheck.isHoliday || todaySession?.isLibur || todaySession?.status === 'LIBUR');
  const holidayName = options.holidayReason || todaySession?.alasanLibur || holidayCheck.holidayName || 'Hari Libur / Tanggal Merah';

  if (isHoliday) {
    return {
      key: 'LIBUR',
      label: 'Libur (Tgl Merah)',
      badgeText: 'Libur Kegiatan',
      detail: holidayName,
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      dotColor: 'bg-purple-500',
      isLive: false,
      priority: 5,
    };
  }

  // 3. Cek apakah ada Sesi yang sedang BERLANGSUNG di database / state
  const hasLiveSession = Boolean(
    options.sessions?.some(
      (s) => s.eskulId === eskul.id && s.status === 'BERLANGSUNG'
    )
  );

  // 4. Cek apakah hari ini adalah hari jadwal eskul
  const isScheduledToday = (eskul.jadwalHari || '').trim().toLowerCase() === todayDayName.trim().toLowerCase();

  const startMinutes = parseTimeToMinutes(eskul.jamMulai || '15:30');
  const endMinutes = parseTimeToMinutes(eskul.jamSelesai || '17:00');

  // Jika hari ini jadwalnya
  if (isScheduledToday) {
    // 4A. Sedang Berlangsung (Jam sekarang masuk rentang ATAU ada sesi live dibuka)
    if (hasLiveSession || (currentMinutes >= startMinutes && currentMinutes <= endMinutes)) {
      return {
        key: 'BERLANGSUNG',
        label: 'Sedang Berjalan',
        badgeText: 'Sedang Berjalan',
        detail: `Latihan berlangsung: ${eskul.jamMulai || '15:30'} - ${eskul.jamSelesai || '17:00'} WIB`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold hover:bg-emerald-100',
        dotColor: 'bg-emerald-500',
        isLive: true,
        priority: 1,
      };
    }

    // 4B. Jadwal Hari Ini tapi jam sekarang BELUM mulai
    if (currentMinutes < startMinutes) {
      return {
        key: 'HARI_INI_MENUNGGU',
        label: `Hari Ini (${eskul.jamMulai || '15:30'})`,
        badgeText: `Hari Ini • ${eskul.jamMulai || '15:30'}`,
        detail: `Jadwal hari ini, latihan dimulai pukul ${eskul.jamMulai || '15:30'} WIB`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
        dotColor: 'bg-amber-500',
        isLive: false,
        priority: 2,
      };
    }

    // 4C. Jadwal Hari Ini tapi jam latihan SUDAH selesai
    if (currentMinutes > endMinutes || todaySession?.status === 'SELESAI') {
      return {
        key: 'HARI_INI_SELESAI',
        label: 'Selesai Hari Ini',
        badgeText: 'Selesai Hari Ini',
        detail: `Sesi latihan hari ini telah selesai pada ${eskul.jamSelesai || '17:00'} WIB`,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
        dotColor: 'bg-slate-400',
        isLive: false,
        priority: 4,
      };
    }
  }

  // 5. Jika bukan hari jadwal eskul, tapi ada sesi dibuka (misal latihan tambahan / lomba)
  if (hasLiveSession) {
    return {
      key: 'BERLANGSUNG',
      label: 'Sedang Berjalan',
      badgeText: 'Sedang Berjalan',
      detail: `Sesi khusus dibuka hari ini (${todayDayName})`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold hover:bg-emerald-100',
      dotColor: 'bg-emerald-500',
      isLive: true,
      priority: 1,
    };
  }

  // 6. Terjadwal di hari lain (Aktif tapi bukan jadwal hari ini)
  const targetDay = eskul.jadwalHari || 'Jumat';
  return {
    key: 'TERJADWAL',
    label: `Jadwal: ${targetDay}`,
    badgeText: `Jadwal: ${targetDay}`,
    detail: `Aktif • Latihan rutin setiap hari ${targetDay} (${eskul.jamMulai || '15:30'} - ${eskul.jamSelesai || '17:00'})`,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    dotColor: 'bg-primary',
    isLive: false,
    priority: 3,
  };
};
