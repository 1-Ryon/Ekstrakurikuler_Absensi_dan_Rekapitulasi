import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  Download, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  QrCode
} from 'lucide-react';
import { StudentProfile, Eskul, SesiPertemuan, PresensiRecord } from '../../types';
import { QrScannerModal } from './QrScannerModal';
import { KartuHasilNilaiModal } from './KartuHasilNilaiModal';
import { StudentCardModal } from '../modals/StudentCardModal';

interface SiswaDashboardProps {
  currentStudent?: StudentProfile;
  enrolledEskuls: Eskul[];
  todaySessions: SesiPertemuan[];
  attendanceHistory: PresensiRecord[];
  onNewAttendance: (studentName: string, eskulName: string) => void;
  initialOpenModal?: 'scanner' | 'khn' | 'card' | null;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  currentStudent: rawStudent,
  enrolledEskuls,
  todaySessions,
  attendanceHistory,
  onNewAttendance,
  initialOpenModal = null,
}) => {
  const currentStudent: StudentProfile = rawStudent || {
    id: 'usr-sis-01',
    username: '20241001',
    role: 'SISWA',
    nis: '20241001',
    nomorInduk: '20241001',
    namaLengkap: 'Muhammad Farhan Al-Fatih',
    kelas: 'X RPL 1',
    jenisKelamin: 'L',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
    kehadiranRataRata: 96,
    enrolledEskulIds: ['eskul-01', 'eskul-02'],
    statusAktif: true,
  };

  const [isScannerOpen, setIsScannerOpen] = useState(initialOpenModal === 'scanner');
  const [isKhnOpen, setIsKhnOpen] = useState(initialOpenModal === 'khn');
  const [isCardModalOpen, setIsCardModalOpen] = useState(initialOpenModal === 'card');

  React.useEffect(() => {
    if (initialOpenModal === 'scanner') setIsScannerOpen(true);
    if (initialOpenModal === 'khn') setIsKhnOpen(true);
    if (initialOpenModal === 'card') setIsCardModalOpen(true);
  }, [initialOpenModal]);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner matching design */}
      <div className="bg-gradient-to-r from-[#00B884] to-emerald-700 text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Presensi Digital Siswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {currentStudent.namaLengkap}!
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-lg">
            {currentStudent.kelas} • NISN: {currentStudent.nomorInduk} • Kehadiran Semester Ini: {currentStudent.kehadiranRataRata}%
          </p>
        </div>

        {/* Action Buttons: Tunjukkan QR ke Guru, Scan Dynamic QR, & KHN */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Tombol Tunjukkan QR Siswa ke Guru (Ide Kelompok) */}
          <button
            onClick={() => setIsCardModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#00B884] hover:bg-slate-50 active:scale-[0.98] font-bold text-xs rounded-2xl shadow-lg transition-all"
            title="Buka QR Code kartu siswa di layar HP untuk dipindai oleh Guru"
          >
            <QrCode className="w-4 h-4" />
            <span>Kartu QR Saya (Tunjukkan ke Guru)</span>
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Pindai Layar Guru</span>
          </button>

          <button
            onClick={() => setIsKhnOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-800/60 hover:bg-emerald-800/80 text-white text-xs font-semibold rounded-2xl border border-white/20 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Kartu Nilai (KHN)</span>
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid: Eskul yang diikuti (Kartu Persentase Kehadiran Personal) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">
          Ekstrakurikuler yang Anda Ikuti
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledEskuls.map((eskul) => (
            <div
              key={eskul.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-xs font-semibold rounded-full border border-emerald-100">
                    {eskul.kategori}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Kehadiran Pribadi</span>
                    <div className="text-lg font-extrabold text-[#00B884]">
                      {currentStudent.kehadiranRataRata}%
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  {eskul.namaEskul}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pembina: {eskul.pembinaNama}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Setiap {eskul.jadwalHari}, {eskul.jamMulai} - {eskul.jamSelesai} WIB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eskul.lokasi}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Target Semester: 16 Pertemuan</span>
                <span className="text-xs font-bold text-emerald-600">14 / 16 Hadir</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sesi Eskul Hari Ini & Notifikasi Sesi */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            Jadwal & Sesi Presensi Hari Ini
          </h2>
          <span className="text-xs text-slate-400">
            Kamis, 24 September 2026
          </span>
        </div>

        <div className="space-y-3">
          {todaySessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00B884]/10 text-[#00B884] flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{session.namaEskul}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      session.status === 'BERLANGSUNG'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : session.status === 'BELUM_DIMULAI'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {session.status === 'BERLANGSUNG' ? 'Presensi Dibuka' : session.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {session.jamMulai} - {session.jamSelesai} WIB • {session.lokasi}
                  </div>
                </div>
              </div>

              {session.status === 'BERLANGSUNG' ? (
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Pindai QR Sekarang</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium">
                  {session.status === 'BELUM_DIMULAI' ? 'Menunggu Pembina Membuka Sesi' : 'Sesi Selesai'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat Presensi Personal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Riwayat Presensi Personal
          </h2>
          <span className="text-xs text-slate-400">Log Verifikasi TOTP</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {attendanceHistory.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{item.namaEskul}</div>
                  <div className="text-slate-400 font-mono">Pukul {item.waktuScan} WIB • {item.metode}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {item.status}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">
                  {item.deviceInfo || 'Radius Valid'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessScan={onNewAttendance}
        currentActiveToken="SMK-AMANAH-DEMO-TOKEN"
      />

      <KartuHasilNilaiModal
        isOpen={isKhnOpen}
        onClose={() => setIsKhnOpen(false)}
        student={currentStudent}
      />

      {/* Modal Kartu QR Siswa untuk Ditunjukkan ke Guru / Dicetak */}
      <StudentCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        student={currentStudent}
        eskulList={enrolledEskuls}
        isBatchMode={false}
      />
    </div>
  );
};
