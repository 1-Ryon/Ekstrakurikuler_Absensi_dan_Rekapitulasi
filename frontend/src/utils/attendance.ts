import { Eskul, SesiPertemuan, PresensiRecord, StudentProfile } from '../types';

export function filterStudentAttendanceRecords(
  logs: PresensiRecord[],
  student?: StudentProfile | null
): PresensiRecord[] {
  if (!student) return [];
  const studentId = student.id;
  const studentNis = student.nis || student.nomorInduk || student.username;
  const studentNisn = student.nomorInduk || student.nis;

  return (logs || []).filter((p) => {
    if (studentId && p.siswaId === studentId) return true;
    if (studentNis && p.nisn && (p.nisn === studentNis || p.nisn === studentNisn)) return true;
    if (student.namaLengkap && p.namaSiswa && p.namaSiswa.toLowerCase() === student.namaLengkap.toLowerCase()) {
      return true;
    }
    return false;
  });
}

export function calculateEskulAttendance(
  eskul: { id: string; namaEskul: string },
  student: StudentProfile | null | undefined,
  sessions: SesiPertemuan[] = [],
  studentRecords: PresensiRecord[] = []
) {
  const eskulSessions = (sessions || []).filter(
    (s) =>
      s.eskulId === eskul.id ||
      (eskul.namaEskul && s.namaEskul?.toLowerCase() === eskul.namaEskul.toLowerCase())
  );

  const filteredRecords = filterStudentAttendanceRecords(studentRecords, student);
  const eskulRecords = filteredRecords.filter(
    (r) =>
      r.eskulId === eskul.id ||
      (eskul.namaEskul && r.namaEskul?.toLowerCase() === eskul.namaEskul.toLowerCase())
  );

  const sessionMap = new Map<string, any>();

  eskulSessions.forEach((sesi) => {
    const matchRecord = eskulRecords.find(
      (r) => r.sesiId === sesi.id || (r.tanggal && sesi.tanggal && r.tanggal.includes(sesi.tanggal))
    );

    let status = 'BELUM_PRESENSI';
    if (matchRecord) {
      status = matchRecord.status;
    } else if (sesi.isLibur) {
      status = 'LIBUR';
    } else if (sesi.status === 'SELESAI') {
      status = 'ALPA';
    }

    sessionMap.set(sesi.id, {
      id: sesi.id,
      statusSesi: sesi.status,
      attendanceStatus: status,
      isLibur: Boolean(sesi.isLibur),
    });
  });

  eskulRecords.forEach((rec) => {
    if (!sessionMap.has(rec.sesiId)) {
      sessionMap.set(rec.sesiId || rec.id, {
        id: rec.sesiId || rec.id,
        statusSesi: 'SELESAI',
        attendanceStatus: rec.status,
        isLibur: false,
      });
    }
  });

  const combined = Array.from(sessionMap.values());
  const effectiveSessions = combined.filter((s) => s.attendanceStatus !== 'LIBUR');
  const hadirCount = effectiveSessions.filter((s) => s.attendanceStatus === 'HADIR').length;
  const izinSakitCount = effectiveSessions.filter(
    (s) => s.attendanceStatus === 'IZIN' || s.attendanceStatus === 'SAKIT'
  ).length;
  const alpaCount = effectiveSessions.filter(
    (s) => s.attendanceStatus === 'ALPA' || s.attendanceStatus === 'BELUM_PRESENSI'
  ).length;
  const totalCount = effectiveSessions.length;

  const percent = totalCount > 0 ? Math.round((hadirCount / totalCount) * 100) : 0;

  return {
    percent,
    hadirCount,
    izinSakitCount,
    alpaCount,
    totalCount,
    hasSessions: totalCount > 0,
  };
}

export function calculateOverallAttendance(
  enrolledEskuls: Eskul[] = [],
  student: StudentProfile | null | undefined,
  sessions: SesiPertemuan[] = [],
  studentRecords: PresensiRecord[] = []
): number {
  if (!enrolledEskuls || enrolledEskuls.length === 0) {
    return student?.kehadiranRataRata || 100;
  }

  let totalSessions = 0;
  let totalHadir = 0;

  enrolledEskuls.forEach((eskul) => {
    const stats = calculateEskulAttendance(eskul, student, sessions, studentRecords);
    totalSessions += stats.totalCount;
    totalHadir += stats.hadirCount;
  });

  if (totalSessions > 0) {
    return Math.round((totalHadir / totalSessions) * 100);
  }

  return student?.kehadiranRataRata || 100;
}
