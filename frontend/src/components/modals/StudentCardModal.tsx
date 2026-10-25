import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Smartphone, Award, User, CheckCircle2 } from 'lucide-react';
import { StudentProfile, Eskul } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { UserAvatar } from '../common/UserAvatar';

interface StudentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  allStudents?: StudentProfile[];
  eskulList: Eskul[];
  isBatchMode?: boolean;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  isOpen,
  onClose,
  student,
  allStudents = [],
  eskulList,
  isBatchMode = false,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentsToRender = isBatchMode ? allStudents : (student ? [student] : []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-4xl w-full p-5 sm:p-7 shadow-xl border border-slate-200/90 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Modal Controls (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isBatchMode ? `Cetak Massal Kartu Presensi Siswa (${allStudents.length} Siswa)` : 'Kartu Presensi & Identitas Digital Siswa'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBatchMode 
                  ? 'Format lembar cetak siap potong & laminasi untuk seluruh siswa.' 
                  : 'Bisa ditunjukkan dari layar ponsel kepada guru pembina atau dicetak ke PDF.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#00B884] hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold text-xs rounded-md shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Tutup Kartu"
              className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Cards Area */}
        <div id="printable-student-card-area" className="my-4 overflow-y-auto flex-1 pr-1">
          {/* Instructions Banner (hidden on print) */}
          <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-lg mb-4 flex items-center justify-between gap-3 text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Panduan:</strong> Tunjukkan QR Code pada kartu ini kepada Guru Pembina saat presensi tatap muka, atau simpan tangkapan layar di galeri ponsel Anda.
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-6 ${isBatchMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
            {studentsToRender.map((stu) => {
              const enrolledEskuls = eskulList.filter((e) => stu.enrolledEskulIds && stu.enrolledEskulIds.includes(e.id));
              const studentQrPayload = `SMK-AMANAH:STUDENT:${stu.nis || stu.nomorInduk || stu.id}:${stu.id}:2026`;

              return (
                <div
                  key={stu.id}
                  className="bg-white rounded-lg border-2 border-emerald-700/40 shadow-sm p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden break-inside-avoid print:border-emerald-700 print:shadow-none"
                  style={{ minHeight: '300px' }}
                >
                  {/* Top Color Accent Stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00B884]" />

                  {/* Card Header: Official School Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src="/logo-smk.png" 
                        alt="Logo SMK Al Amanah" 
                        className="w-10 h-10 object-contain shrink-0" 
                      />
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-[#00B884] tracking-wider block">
                          SMK AL AMANAH
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">
                          KARTU PRESENSI DIGITAL
                        </h4>
                        <span className="text-[9px] text-slate-500 font-medium block">
                          Kota Tangerang Selatan
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-mono">
                        TP 2026/2027
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Student Info (Clean Text without Image) + QR Code */}
                  <div className="flex items-center gap-3.5 my-auto">
                    {/* Left: Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h5 className="font-bold text-base text-slate-900 leading-tight truncate">
                          {stu.namaLengkap}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[11px] font-bold rounded border border-slate-200">
                            {stu.kelas}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            {stu.statusAktif ? 'Siswa Aktif' : 'Non-Aktif'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="text-[11px] text-slate-600 flex items-center justify-between">
                          <span className="text-slate-400">NIS / NISN:</span>
                          <strong className="font-mono text-slate-800">
                            {stu.nis || stu.nomorInduk || '-'} / {stu.nisn || stu.nis || '-'}
                          </strong>
                        </div>

                        {/* Ekstrakurikuler yang Diikuti (Clean text without aggressive green badges) */}
                        <div className="pt-1 border-t border-slate-100 mt-2">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">
                            Ekstrakurikuler Terdaftar:
                          </span>
                          <p className="text-xs font-medium text-slate-700 leading-snug">
                            {enrolledEskuls.length > 0 
                              ? enrolledEskuls.map((e) => e.namaEskul).join(', ')
                              : 'Siswa Terdaftar (Belum memilih cabang)'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: High-Resolution Clean QR Code */}
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex flex-col items-center shrink-0">
                      <QRCodeSVG
                        value={studentQrPayload}
                        size={105}
                        level="H"
                        includeMargin={false}
                      />
                      <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                        PINDAI KEHADIRAN
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Official Watermark (Clean without shield icon) */}
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                    <div className="font-medium text-slate-600">
                      <span>Sistem Presensi Resmi SMK Al Amanah</span>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 font-semibold">
                      ID: {stu.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden shrink-0">
          <span>Format resmi siap cetak untuk kartu fisik (ukuran ID Card) atau tampilan layar ponsel.</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
