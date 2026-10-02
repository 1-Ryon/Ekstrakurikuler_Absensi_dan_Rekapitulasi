import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Printer,
  Download,
  Plus
} from 'lucide-react';
import { User, StudentProfile, Eskul, PenilaianRecord, PresensiRecord } from '../../types';
import { NavItemKey } from '../Sidebar';
import { UserAvatar } from '../common/UserAvatar';

interface WaliKelasDashboardProps {
  currentWali: User;
  students: StudentProfile[];
  eskulList: Eskul[];
  penilaianList: PenilaianRecord[];
  presensiLog: PresensiRecord[];
  onNavigate: (tab: NavItemKey) => void;
  onAssignEskul: (studentId: string, eskulIds: string[]) => void;
}

export const WaliKelasDashboard: React.FC<WaliKelasDashboardProps> = ({
  currentWali,
  students,
  eskulList,
  penilaianList,
  presensiLog,
  onNavigate,
  onAssignEskul,
}) => {
  // Determine assigned class (default to X RPL 1 or from currentWali.kelas)
  const targetClass = currentWali.kelas || 'X RPL 1';

  // Filter students in this class
  const classStudents = students.filter(
    (s) => s.kelas.toLowerCase().trim() === targetClass.toLowerCase().trim()
  );

  // Students with and without eskul
  const studentsWithEskul = classStudents.filter(
    (s) => s.enrolledEskulIds && s.enrolledEskulIds.length > 0
  );
  const studentsWithoutEskul = classStudents.filter(
    (s) => !s.enrolledEskulIds || s.enrolledEskulIds.length === 0
  );

  // Calculate participation percentage
  const participationRate = classStudents.length > 0
    ? Math.round((studentsWithEskul.length / classStudents.length) * 100)
    : 100;

  // Average attendance for class
  const avgAttendance = classStudents.length > 0
    ? Math.round(
        classStudents.reduce((acc, s) => acc + (s.kehadiranRataRata || 90), 0) /
          classStudents.length
      )
    : 92;

  // Breakdown of eskuls taken by this class
  const eskulDistribution = eskulList.map((eskul) => {
    const count = classStudents.filter(
      (s) => s.enrolledEskulIds && s.enrolledEskulIds.includes(eskul.id)
    ).length;
    return {
      ...eskul,
      studentCountInClass: count,
    };
  }).filter((e) => e.studentCountInClass > 0)
    .sort((a, b) => b.studentCountInClass - a.studentCountInClass);

  const [searchQuery, setSearchQuery] = useState('');
  const filteredStudents = classStudents.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.includes(searchQuery))
  );

  // Modal for quick assigning eskul to unassigned student
  const [assigningStudent, setAssigningStudent] = useState<StudentProfile | null>(null);
  const [selectedEskulsToAssign, setSelectedEskulsToAssign] = useState<string[]>([]);

  const handleOpenAssignModal = (student: StudentProfile) => {
    setAssigningStudent(student);
    setSelectedEskulsToAssign(student.enrolledEskulIds || []);
  };

  const handleSaveAssignment = () => {
    if (assigningStudent) {
      onAssignEskul(assigningStudent.id, selectedEskulsToAssign);
      setAssigningStudent(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Portal Wali Kelas SMK Al Amanah</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dasbor Wali Kelas — {targetClass}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Wali Kelas: <strong className="text-white">{currentWali.namaLengkap}</strong> • NIP: {currentWali.nomorInduk || '-'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('laporan')}
              className="flex items-center gap-2 px-4 py-3 bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.98] font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap Rapor Eskul Kelas</span>
            </button>
            <button
              onClick={() => onNavigate('siswa')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-900/60 hover:bg-blue-900 text-white font-semibold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Siswa Kelas</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Siswa di Kelas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {classStudents.length} Siswa
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Kelas {targetClass}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Sudah Ber-Eskul</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00B884]">
              {studentsWithEskul.length} Siswa
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {participationRate}% Partisipasi aktif
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Belum Punya Eskul</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold ${studentsWithoutEskul.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {studentsWithoutEskul.length} Siswa
            </div>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              {studentsWithoutEskul.length > 0 ? 'Perlu bimbingan wali kelas' : 'Semua siswa terdaftar'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Rata-rata Presensi</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {avgAttendance}%
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Akumulasi presensi semester 1
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner: Siswa yang belum memilih eskul */}
      {studentsWithoutEskul.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Peringatan: {studentsWithoutEskul.length} Siswa Belum Terdaftar di Ekstrakurikuler Manapun
              </h3>
              <p className="text-xs text-amber-700/90 mt-0.5">
                Setiap siswa wajib mengikuti minimal 1 ekstrakurikuler pilihan untuk pengisian nilai rapor semester.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {studentsWithoutEskul.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold"
                  >
                    <span>{s.namaLengkap}</span>
                    <button
                      onClick={() => handleOpenAssignModal(s)}
                      className="text-[#00B884] hover:underline font-bold text-[11px] cursor-pointer ml-1"
                    >
                      + Pilihkan Eskul
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Student Roster & Eskul Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Daftar Siswa Kelas Saya */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Daftar Siswa Kelas {targetClass} & Nilai Eskul
                </h3>
                <p className="text-xs text-slate-400">
                  Rekapitulasi partisipasi dan perolehan nilai rapor eskul semester 1
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 font-semibold">
                    <th className="pb-2.5">Siswa</th>
                    <th className="pb-2.5">Eskul yang Diikuti</th>
                    <th className="pb-2.5 text-center">Presensi</th>
                    <th className="pb-2.5 text-right">Nilai Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student) => {
                    const studentEskuls = eskulList.filter((e) =>
                      student.enrolledEskulIds && student.enrolledEskulIds.includes(e.id)
                    );
                    const grades = penilaianList.filter((p) => p.siswaId === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 flex items-center gap-2.5">
                          <UserAvatar
                            name={student.namaLengkap}
                            className="w-8 h-8 shrink-0 text-xs"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block truncate max-w-[140px] sm:max-w-[200px]">
                              {student.namaLengkap}
                            </span>
                            <span className="text-[10px] text-slate-400">NIS: {student.nis || student.nomorInduk}</span>
                          </div>
                        </td>

                        <td className="py-3">
                          {studentEskuls.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {studentEskuls.map((e) => (
                                <span
                                  key={e.id}
                                  className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[#00B884] text-[10px] font-semibold border border-emerald-100"
                                >
                                  {e.namaEskul}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignModal(student)}
                              className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                            >
                              + Belum Ada Eskul
                            </button>
                          )}
                        </td>

                        <td className="py-3 text-center font-bold text-emerald-600">
                          {student.kehadiranRataRata || 90}%
                        </td>

                        <td className="py-3 text-right">
                          {grades.length > 0 ? (
                            <div className="space-y-0.5 text-right">
                              {grades.map((g) => (
                                <span
                                  key={g.id}
                                  className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs ml-1"
                                >
                                  {g.predikat} ({g.nilaiAkhir})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Belum ada nilai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-400">Total {filteredStudents.length} siswa di kelas {targetClass}</span>
              <button
                onClick={() => onNavigate('laporan')}
                className="text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Lembar Rekap Nilai Semester</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Sebaran Eskul di Kelas */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#00B884]" />
                <h3 className="text-sm font-bold text-slate-800">
                  Sebaran Eskul di Kelas {targetClass}
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {eskulDistribution.map((item) => {
                const percent = Math.round((item.studentCountInClass / classStudents.length) * 100);
                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate">{item.namaEskul}</span>
                      <span className="text-xs font-semibold text-[#00B884]">{item.studentCountInClass} Siswa ({percent}%)</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00B884] h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('laporan')}
              className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Export Rapor Kelas (.xlsx / PDF)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Tugas Pokok Wali Kelas
            </span>
            <p className="text-blue-800/90 text-[11px] leading-relaxed">
              Wali kelas bertugas merekap nilai ekstrakurikuler siswa untuk dimasukkan ke Buku Laporan Hasil Belajar (Rapor) Kurikulum Merdeka di akhir semester.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Quick Assign Eskul */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div>
              <span className="text-xs font-bold text-[#00B884]">Bimbingan Wali Kelas</span>
              <h3 className="text-lg font-extrabold text-slate-800">
                Pilihkan Eskul untuk {assigningStudent.namaLengkap}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih satu atau lebih ekstrakurikuler yang sesuai dengan minat dan bakat siswa.
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {eskulList.map((eskul) => {
                const isSelected = selectedEskulsToAssign.includes(eskul.id);
                return (
                  <div
                    key={eskul.id}
                    onClick={() => {
                      setSelectedEskulsToAssign((prev) =>
                        prev.includes(eskul.id)
                          ? prev.filter((id) => id !== eskul.id)
                          : [...prev, eskul.id]
                      );
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#00B884] bg-emerald-50/60 font-bold text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block">{eskul.namaEskul}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {eskul.jadwalHari} • {eskul.kategori}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#00B884] border-[#00B884] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssigningStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAssignment}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00B884] hover:bg-emerald-600 text-white shadow-md cursor-pointer"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
