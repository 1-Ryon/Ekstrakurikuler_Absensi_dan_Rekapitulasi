import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  QrCode,
  ShieldCheck,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { StudentProfile, Eskul, SesiPertemuan, PresensiRecord, PenilaianRecord } from '../../types';
import { Card, Button, Badge } from '../ui';
import { QrScannerModal } from './QrScannerModal';
import { KartuHasilNilaiModal } from './KartuHasilNilaiModal';
import { StudentCardModal } from '../modals/StudentCardModal';

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

interface SiswaDashboardProps {
  currentStudent?: StudentProfile;
  enrolledEskuls: Eskul[];
  todaySessions: SesiPertemuan[];
  attendanceHistory: PresensiRecord[];
  penilaianRecords?: PenilaianRecord[];
  onNewAttendance: (studentName: string, eskulName: string, rawToken?: string) => void;
  initialOpenModal?: 'scanner' | 'khn' | 'card' | null;
  onNavigateToKhn?: () => void;
  onNavigateToCard?: () => void;
  onNavigateToHistory?: (eskulId?: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  currentStudent: rawStudent,
  enrolledEskuls,
  todaySessions,
  attendanceHistory,
  penilaianRecords = [],
  onNewAttendance,
  initialOpenModal = null,
  onNavigateToKhn,
  onNavigateToCard,
  onNavigateToHistory,
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
  const [selectedSessionToken, setSelectedSessionToken] = useState<string>('SMK-AMANAH-DEMO');

  React.useEffect(() => {
    if (initialOpenModal === 'scanner') setIsScannerOpen(true);
    if (initialOpenModal === 'khn') {
      if (onNavigateToKhn) {
        onNavigateToKhn();
      } else {
        setIsKhnOpen(true);
      }
    }
    if (initialOpenModal === 'card') {
      if (onNavigateToCard) {
        onNavigateToCard();
      } else {
        setIsCardModalOpen(true);
      }
    }
  }, [initialOpenModal, onNavigateToKhn, onNavigateToCard]);

  const handleOpenScannerForSession = (session?: SesiPertemuan) => {
    const targetSession = session || 
      todaySessions.find(s => enrolledEskuls.some(e => e.id === s.eskulId)) || 
      todaySessions[0];

    if (targetSession && targetSession.tokenAktif) {
      setSelectedSessionToken(targetSession.tokenAktif);
    } else if (targetSession) {
      setSelectedSessionToken(`SMK-AMANAH:${targetSession.id}:${Math.floor(Date.now() / 15000)}:TOKEN`);
    } else {
      setSelectedSessionToken('SMK-AMANAH:sesi-01:DEMO');
    }
    setIsScannerOpen(true);
  };

  const handleOpenKhn = () => {
    if (onNavigateToKhn) {
      onNavigateToKhn();
    } else {
      setIsKhnOpen(true);
    }
  };

  const handleOpenCard = () => {
    if (onNavigateToCard) {
      onNavigateToCard();
    } else {
      setIsCardModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. WELCOME BANNER / CARD PORTAL PRESENSI */}
      <Card className="p-6 border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Portal Presensi Siswa
              </span>
              <span className="text-xs text-slate-400 font-medium">Kelas {currentStudent.kelas}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Halo, {currentStudent.namaLengkap}!
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
              NISN: <span className="font-mono text-slate-700 font-semibold">{currentStudent.nomorInduk || currentStudent.nis}</span> • Kehadiran Semester Ini: <span className="font-semibold text-emerald-600">{currentStudent.kehadiranRataRata}%</span>
            </p>
          </div>

          {/* Action Buttons: Pindai Kamera, Kartu QR Saya, & Nilai Rapor (KHN) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
            {/* Pindai QR Kamera Aktif */}
            <Button
              onClick={() => handleOpenScannerForSession()}
              className="bg-[#00B884] hover:bg-emerald-600 text-white flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold rounded-md h-10 px-4"
              title="Buka kamera perangkat untuk memindai QR Code guru pembina"
            >
              <Camera className="w-4 h-4" />
              <span>Pindai QR Presensi</span>
            </Button>

            {/* Kartu QR Saya */}
            <Button
              variant="outline"
              onClick={handleOpenCard}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold rounded-md h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Buka QR Code kartu siswa di layar HP untuk dipindai oleh Guru"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Kartu QR Saya</span>
            </Button>

            {/* Kartu Nilai (KHN) */}
            <Button
              variant="outline"
              onClick={handleOpenKhn}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold rounded-md h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Nilai Rapor (KHN)</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. EKSTRAKURIKULER YANG ANDA IKUTI */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Ekstrakurikuler yang Anda Ikuti
              </h2>
              <p className="text-xs text-slate-500">
                Daftar cabang eskul aktif, guru pembina, jadwal rutin, dan persentase kehadiran
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold shrink-0">
            {enrolledEskuls.length} Cabang Aktif
          </Badge>
        </div>

        {enrolledEskuls.length > 0 ? (
          <div className="space-y-3">
            {enrolledEskuls.map((eskul) => {
              // Hitung persentase kehadiran eskul ini
              const eskulRecords = attendanceHistory.filter(
                (h) => h.eskulId === eskul.id || h.namaEskul?.toLowerCase() === eskul.namaEskul?.toLowerCase()
              );
              const attendedCount = eskulRecords.filter((h) => h.status === 'HADIR').length;
              const attendancePercent = eskulRecords.length > 0
                ? Math.round((attendedCount / eskulRecords.length) * 100)
                : (currentStudent.kehadiranRataRata || 96);

              const catBadgeStyle = getCategoryBadge(eskul.kategori);

              return (
                <Card
                  key={eskul.id}
                  onClick={() => onNavigateToHistory && onNavigateToHistory(eskul.id)}
                  className={`p-5 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    onNavigateToHistory ? 'cursor-pointer group' : ''
                  }`}
                >
                  {/* Sisi Kiri: Informasi Eskul, Pembina, Jadwal & Lokasi */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold group-hover:bg-[#00B884] group-hover:text-white transition-all">
                      <Award className="w-5 h-5 transition-colors" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                          {eskul.namaEskul}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${catBadgeStyle}`}>
                          {eskul.kategori}
                        </span>
                      </div>

                      {/* Dibina oleh siapa */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Dibina oleh:</span>
                        <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{eskul.pembinaNama || 'Guru Pembina'}</span>
                        </span>
                      </div>

                      {/* Jadwal & Lokasi */}
                      <div className="flex items-center gap-3.5 flex-wrap text-xs text-slate-500 pt-0.5">
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
                          <span className="truncate max-w-[240px]">{eskul.lokasi}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sisi Kanan: Persenan Kehadiran */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 md:min-w-[150px]">
                    <div className="text-left md:text-right">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Kehadiran
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-[#00B884] leading-tight">
                        {attendancePercent}%
                      </div>
                    </div>
                    <div className="w-28 sm:w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          attendancePercent >= 90 ? 'bg-[#00B884]' : attendancePercent >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(attendancePercent, 100)}%` }}
                      />
                    </div>
                    {onNavigateToHistory && (
                      <span className="text-[11px] font-semibold text-emerald-600 group-hover:underline flex items-center gap-0.5 mt-1">
                        <span>Lihat Detail & Materi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-400 border-slate-200">
            <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Belum terdaftar di ekstrakurikuler</p>
            <p className="text-xs text-slate-400 mt-1">Anda belum terdaftar dalam cabang kegiatan ekstrakurikuler apapun.</p>
          </Card>
        )}
      </div>

      {/* Real Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessScan={onNewAttendance}
        currentActiveToken={selectedSessionToken}
        studentId={currentStudent.id}
        studentName={currentStudent.namaLengkap}
      />

      {/* Kartu Hasil Nilai (KHN) Modal Fallback */}
      <KartuHasilNilaiModal
        isOpen={isKhnOpen}
        onClose={() => setIsKhnOpen(false)}
        student={currentStudent}
        enrolledEskuls={enrolledEskuls}
        penilaianRecords={penilaianRecords}
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
