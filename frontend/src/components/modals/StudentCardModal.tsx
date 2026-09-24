import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, ShieldCheck, Sparkles, Smartphone, Award } from 'lucide-react';
import { StudentProfile, Eskul } from '../../types';
import { SchoolLogo } from '../SchoolLogo';

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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Controls (Hidden when printing via @media print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {isBatchMode ? `Cetak Massal Kartu QR Siswa (${allStudents.length} Siswa)` : 'Kartu Presensi Siswa Ber-QR Code'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBatchMode 
                  ? 'Format lembar cetak A4 siap print & laminasi untuk seluruh siswa.' 
                  : 'Bisa langsung ditunjukkan dari layar HP siswa atau dicetak/disimpan ke PDF.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Cards Area */}
        <div className="my-4 overflow-y-auto flex-1 pr-1">
          {/* Instructions Banner (hidden on print) */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl mb-5 flex items-center justify-between gap-3 text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Dua Cara Penggunaan:</strong> Siswa bisa screenshot/buka kartu ini di HP untuk di-scan guru, ATAU dicetak dalam bentuk ID Card fisik (ukuran kartu saku).
              </span>
            </div>
          </div>

          {/* Cards Grid: 1 or 2 per row for comfortable viewing & printing */}
          <div className={`grid gap-6 ${isBatchMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
            {studentsToRender.map((stu) => {
              const enrolledEskuls = eskulList.filter((e) => stu.enrolledEskulIds.includes(e.id));
              // Token format containing student ID and unique verification payload
              const studentQrPayload = `SMK-AMANAH:STUDENT:${stu.nomorInduk}:${stu.id}:2026`;

              return (
                <div
                  key={stu.id}
                  className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-md p-5 flex flex-col justify-between relative overflow-hidden break-inside-avoid print:border-emerald-600 print:shadow-none"
                  style={{ minHeight: '340px' }}
                >
                  {/* Decorative background curves */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00B884]/10 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#00B884]/5 rounded-full blur-xl pointer-events-none" />

                  {/* Card Header: School Crest */}
                  <div className="flex items-center justify-between border-b-2 border-emerald-500/20 pb-3 mb-3">
                    <SchoolLogo size="sm" showText={true} />
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-extrabold text-[#00B884] block tracking-wider">
                        KARTU PRESENSI
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 block">
                        TP 2026/2027
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Student Info + QR Code */}
                  <div className="flex items-center gap-4 my-auto">
                    {/* Left: Avatar & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <img
                          src={stu.avatarUrl}
                          alt={stu.namaLengkap}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#00B884] shadow-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-800 leading-tight truncate">
                            {stu.namaLengkap}
                          </h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded-md">
                            {stu.kelas}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-[11px] text-slate-500">
                          <span>NISN: </span>
                          <strong className="font-mono text-slate-800">{stu.nomorInduk}</strong>
                        </div>

                        {/* Eskul Badges */}
                        <div className="mt-2">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1">
                            Ekstrakurikuler:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {enrolledEskuls.length > 0 ? (
                              enrolledEskuls.map((e) => (
                                <span
                                  key={e.id}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B884] border border-emerald-200"
                                >
                                  {e.namaEskul}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Anggota Umum</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: High-Res QR Code */}
                    <div className="bg-white p-2.5 rounded-2xl border-2 border-emerald-500/30 shadow-xs flex flex-col items-center shrink-0">
                      <QRCodeSVG
                        value={studentQrPayload}
                        size={105}
                        level="H"
                        includeMargin={false}
                      />
                      <span className="text-[8px] font-mono font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">
                        SCAN UNTUK HADIR
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Security Watermark & Signature line */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                    <div className="flex items-center gap-1 font-semibold text-emerald-700">
                      <ShieldCheck className="w-3 h-3 text-[#00B884]" />
                      <span>Sistem Presensi Resmi SMK Al Amanah</span>
                    </div>
                    <span className="font-mono text-[8px] text-slate-300">
                      ID: {stu.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 print:hidden shrink-0">
          <span>Gunakan kertas tebal (Art Paper 260gr) atau laminasi untuk kartu fisik tahan lama.</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
