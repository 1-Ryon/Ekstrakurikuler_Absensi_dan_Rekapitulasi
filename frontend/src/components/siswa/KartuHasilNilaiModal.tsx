import React from 'react';
import { Download, Printer, X, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentProfile } from '../../types';

interface KartuHasilNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const KartuHasilNilaiModal: React.FC<KartuHasilNilaiModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#00B884]" />
            <span>Kartu Hasil Nilai (KHN) Digital Resmi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak KHN</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate / Document Card */}
        <div className="mt-5 p-6 rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-b from-emerald-50/30 to-white relative">
          {/* Header Document */}
          <div className="flex items-center justify-center gap-3.5 border-b border-slate-200 pb-4 mb-5">
            <img src="/logo-smk.png" alt="Logo SMK Al Amanah" className="w-12 h-12 object-contain shrink-0" />
            <div className="text-center">
              <h3 className="font-extrabold text-sm uppercase text-slate-900 tracking-wider">
                SMK AL AMANAH KOTA TANGERANG SELATAN
              </h3>
              <p className="text-[11px] text-slate-500">
                KARTU HASIL NILAI (KHN) EKSTRAKURIKULER
              </p>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">
                TAHUN PELAJARAN 2026/2027 • SEMESTER GANJIL
              </div>
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-5 p-3 bg-white rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Nama Lengkap</span>
              <span className="font-bold text-slate-800">{student.namaLengkap}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">NISN / Kelas</span>
              <span className="font-mono font-bold text-slate-800">{student.nomorInduk} • {student.kelas}</span>
            </div>
          </div>

          {/* Grade Results Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-5">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5">Ekstrakurikuler</th>
                  <th className="p-2.5 text-center">Kehadiran</th>
                  <th className="p-2.5 text-center">Nilai</th>
                  <th className="p-2.5 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Eskul Futsal</td>
                  <td className="p-2.5 text-center font-mono">95%</td>
                  <td className="p-2.5 text-center font-bold text-[#00B884]">92.6</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">A</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Eskul IT Club</td>
                  <td className="p-2.5 text-center font-mono">98%</td>
                  <td className="p-2.5 text-center font-bold text-[#00B884]">95.9</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Qualitative Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 mb-5">
            <span className="font-bold block text-slate-800 mb-1">Capaian Kompetensi & Catatan Pembina:</span>
            <p className="italic">
              "Menunjukkan kedisiplinan tingkat tinggi, kepemimpinan aktif, dan keterampilan teknik yang luar biasa dalam setiap pertemuan."
            </p>
          </div>

          {/* Footer Verification with QR Auth */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <QRCodeSVG
                value={`VERIFIKASI-KHN:${student.nomorInduk}:SMK-AL-AMANAH:2026`}
                size={55}
                level="M"
              />
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dokumen Sah & Terverifikasi</span>
                </div>
                <div className="text-[10px]">Tanda Tangan Digital Tersertifikasi</div>
              </div>
            </div>

            <div className="text-right">
              <div>Tangerang Selatan, 24 September 2026</div>
              <div className="font-bold text-slate-800 mt-3">Koordinator Ekstrakurikuler</div>
              <div className="text-[10px]">Viska Adawiyah Z., S.Pd.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
