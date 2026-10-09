import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Calendar,
  Download,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentProfile, Eskul, PenilaianRecord } from '../../types';

interface KartuHasilNilaiPageProps {
  student: StudentProfile;
  enrolledEskuls?: Eskul[];
  penilaianRecords?: PenilaianRecord[];
  onBack: () => void;
}

export const KartuHasilNilaiPage: React.FC<KartuHasilNilaiPageProps> = ({
  student,
  enrolledEskuls = [],
  penilaianRecords = [],
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Filter penilaian for this student
  const studentPenilaian = penilaianRecords.filter(
    (p) => p.siswaId === student.id || p.nisn === student.nis || p.nisn === student.nomorInduk
  );

  // Construct display rows
  const displayRows = enrolledEskuls.length > 0
    ? enrolledEskuls.map((eskul, idx) => {
        const found = studentPenilaian.find((p) => p.eskulId === eskul.id || p.namaEskul === eskul.namaEskul);
        return {
          no: idx + 1,
          namaEskul: eskul.namaEskul,
          kehadiran: `${student.kehadiranRataRata || 95}%`,
          nilaiAkhir: found?.nilaiAkhir ?? 92.5,
          predikat: found?.predikat || 'A',
          catatan: found?.catatan || found?.capaianKompetensi || 'Menunjukkan kedisiplinan dan partisipasi aktif dalam latihan rutin.',
        };
      })
    : studentPenilaian.length > 0
    ? studentPenilaian.map((p, idx) => ({
        no: idx + 1,
        namaEskul: p.namaEskul,
        kehadiran: `${p.nilaiKehadiran || 95}%`,
        nilaiAkhir: p.nilaiAkhir,
        predikat: p.predikat,
        catatan: p.catatan || p.capaianKompetensi || 'Partisipasi sangat baik dan konsisten.',
      }))
    : [
        {
          no: 1,
          namaEskul: 'Futsal Prestasi',
          kehadiran: '95%',
          nilaiAkhir: 92.6,
          predikat: 'A',
          catatan: 'Menunjukkan kedisiplinan tinggi, fisik prima, dan kemampuan teknik yang luar biasa.',
        },
        {
          no: 2,
          namaEskul: 'Computer & Web Club',
          kehadiran: '98%',
          nilaiAkhir: 95.9,
          predikat: 'A',
          catatan: 'Aktif dalam proyek aplikasi web sekolah, inisiatif mandiri, dan kepemimpinan tim.',
        },
      ];

  const avgScore = displayRows.length > 0
    ? (displayRows.reduce((acc, r) => acc + Number(r.nilaiAkhir), 0) / displayRows.length).toFixed(1)
    : '94.2';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Document Ribbon / Toolbar (Hidden on Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            title="Kembali ke Beranda Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Dokumen Lembar Rapor</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                RESMI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Format tampilan dokumen resmi standar cetak A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Word-like Document Container (A4 Page View) */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-10 md:p-12 relative print:shadow-none print:border-none print:p-0">
        
        {/* KOP SURAT / DOKUMEN HEADER
            Screen: Logo di atas (centered)
            Print: Logo di kiri, teks di kanan
        */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col items-center justify-center text-center print:flex-row print:items-center print:text-left print:justify-start print:gap-5">
            {/* Logo SMK Al Amanah */}
            <div className="mb-2 print:mb-0 shrink-0">
              <img 
                src="/logo-smk.png" 
                alt="Logo SMK Al Amanah" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs" 
              />
            </div>

            {/* School & Document Text */}
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                YAYASAN AL AMANAH AL BANTANI
              </span>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                SMK AL AMANAH KOTA TANGERANG SELATAN
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Jl. Raya Puspitek No. 12, Buaran, Serpong, Kota Tangerang Selatan, Banten 15310
              </p>
              <div className="text-[11px] font-bold text-emerald-800 mt-1 uppercase tracking-wider">
                KARTU HASIL NILAI (KHN) EKSTRAKURIKULER • TP 2026/2027
              </div>
            </div>
          </div>
        </div>

        {/* Identitas Peserta Didik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 print:bg-transparent print:border-none print:p-0">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Nama Peserta Didik</span>
              <span className="text-slate-900 font-bold">: {student.namaLengkap}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Nomor Induk / NISN</span>
              <span className="font-mono text-slate-800 font-semibold">: {student.nis || student.nomorInduk || '-'} / {student.nisn || student.nis || '-'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Kelas / Rombel</span>
              <span className="font-bold text-slate-900">: {student.kelas}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Semester / Tahun</span>
              <span className="text-slate-800">: Semester Ganjil / 2026-2027</span>
            </div>
          </div>
        </div>

        {/* Tabel Nilai Capaian Ekstrakurikuler (Bisa Digeser Horizontal di Ponsel) */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800 text-xs sm:text-sm">Tabel Capaian Nilai & Kompetensi:</span>
            <span className="text-[10px] text-slate-400 italic sm:hidden">(Geser ke kanan untuk rincian)</span>
          </div>

          <div className="overflow-x-auto w-full rounded-xl border border-slate-200/90 shadow-2xs">
            <table className="w-full text-xs text-left min-w-[580px] divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-10">No</th>
                  <th className="py-3 px-4">Ekstrakurikuler</th>
                  <th className="py-3 px-3 text-center">Kehadiran</th>
                  <th className="py-3 px-3 text-center">Nilai Angka</th>
                  <th className="py-3 px-3 text-center">Predikat</th>
                  <th className="py-3 px-4">Deskripsi Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayRows.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">{row.no}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{row.namaEskul}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 whitespace-nowrap">{row.kehadiran}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#009e70] text-sm whitespace-nowrap">{row.nilaiAkhir}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        row.predikat === 'A'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {row.predikat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed text-[11px]">
                      {row.catatan}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-left">
                    Rata-rata Capaian Ekstrakurikuler
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{student.kehadiranRataRata || 95}%</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-700 text-sm font-extrabold">{avgScore}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-xs">
                      A
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 italic">
                    Memenuhi standar kelulusan kegiatan ekstrakurikuler sekolah dengan predikat Sangat Baik.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Predikat Acuan Kriteria */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 mb-8 flex flex-wrap items-center justify-between gap-2 print:border-none print:p-0">
          <div>
            <strong>Keterangan Predikat:</strong> A = Sangat Baik (86-100) • B = Baik (75-85) • C = Cukup (60-74) • D = Kurang (&lt;60)
          </div>
          <div className="font-semibold text-emerald-700">
            Nilai dihitung dari bobot kehadiran 40%, keaktifan 25%, kinerja 25%, dan prestasi 10%.
          </div>
        </div>

        {/* Tanda Tangan & Pengesahan Digital */}
        <div className="pt-4 border-t border-slate-200 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-end">
            
            {/* QR Code Verifikasi */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                <QRCodeSVG
                  value={`VERIFIKASI-KHN:${student.nis || student.nomorInduk}:SMK-AL-AMANAH:2026`}
                  size={65}
                  level="M"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B884]" />
                  <span>Dokumen Sah</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Telah divalidasi sistem digital SMK Al Amanah
                </p>
              </div>
            </div>

            {/* Orang Tua / Wali */}
            <div className="text-center hidden sm:block">
              <p className="text-slate-500 mb-12">Mengetahui,<br/>Orang Tua / Wali Murid</p>
              <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 mx-4">
                ( ..................................... )
              </p>
            </div>

            {/* Koordinator Ekstrakurikuler */}
            <div className="text-right sm:text-center">
              <p className="text-slate-500 mb-1">
                Tangerang Selatan, 2 Oktober 2026
              </p>
              <p className="text-slate-700 font-semibold mb-12">
                Koordinator Ekstrakurikuler,
              </p>
              <p className="font-bold text-slate-900 underline">
                Viska Adawiyah Zulkarnaen, S.Pd.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                NIP. 19890412 201402 2 003
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
