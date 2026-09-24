import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, Download, AlertCircle } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessImport: (count: number) => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onSuccessImport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'SISWA' | 'PRESENSI' | 'ESKUL'>('SISWA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      onSuccessImport(25); // Simulated imported 25 records
      setTimeout(() => {
        setIsDone(false);
        setSelectedFile(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  const downloadSampleTemplate = () => {
    const templateContent = 'NISN,Nama Siswa,Kelas,Jenis Kelamin,Eskul Pilihan\n0061928374,Muhammad Rizky Pratama,XII RPL 1,L,Eskul Futsal\n0062839102,Aisyah Putri Azzahra,XI TKJ 2,P,Eskul IT Club\n';
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Import_${importType}_SMK_Al_Amanah.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Import Data Siswa / Presensi
            </h3>
            <p className="text-xs text-slate-500">
              Unggah file Excel (XLSX) atau CSV dari database sekolah.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Pilih Format Data yang Diimpor
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setImportType('SISWA')}
              className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                importType === 'SISWA' ? 'border-[#00B884] bg-emerald-50 text-[#00B884]' : 'border-slate-200 text-slate-600'
              }`}
            >
              Data Siswa
            </button>
            <button
              type="button"
              onClick={() => setImportType('ESKUL')}
              className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                importType === 'ESKUL' ? 'border-[#00B884] bg-emerald-50 text-[#00B884]' : 'border-slate-200 text-slate-600'
              }`}
            >
              Data Eskul
            </button>
            <button
              type="button"
              onClick={() => setImportType('PRESENSI')}
              className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                importType === 'PRESENSI' ? 'border-[#00B884] bg-emerald-50 text-[#00B884]' : 'border-slate-200 text-slate-600'
              }`}
            >
              Presensi Manual
            </button>
          </div>
        </div>

        {/* Drag and Drop Box */}
        <label className="border-2 border-dashed border-slate-300 hover:border-[#00B884] bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block mb-4">
          <Upload className="w-8 h-8 text-[#00B884] mb-2" />
          <span className="text-xs font-bold text-slate-700">
            {selectedFile ? selectedFile.name : 'Klik atau seret file CSV / Excel ke sini'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            Format file didukung: .xlsx, .xls, .csv (Maksimal 10 MB)
          </span>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Sample Template Link */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Belum memiliki format template?</span>
          </div>
          <button
            onClick={downloadSampleTemplate}
            className="text-[#00B884] font-bold hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Contoh</span>
          </button>
        </div>

        {/* Success Alert */}
        {isDone && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Berhasil mengimpor 25 baris data ke database SMK Al Amanah!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || isProcessing}
            className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <span>Mulai Import</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
