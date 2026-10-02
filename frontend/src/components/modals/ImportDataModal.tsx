import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, Download, KeyRound, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

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
  const [pastedText, setPastedText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);

      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setPastedText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const parseCsvToRows = (rawText: string) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    // Check if first line is header
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes('nis') || firstLineLower.includes('nama');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      // Support comma or semicolon or tab (Excel copy-paste)
      const cols = line.includes('\t') 
        ? line.split('\t') 
        : line.includes(';') 
          ? line.split(';') 
          : line.split(',');

      const clean = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));
      const nis = clean[0] || '';
      const namaLengkap = clean[1] || '';
      const kelas = clean[2] || 'X RPL 1';
      const jenisKelamin = clean[3] || 'L';
      const noHp = clean[4] || '';

      return {
        nis,
        nisn: nis,
        namaLengkap,
        kelas,
        jenisKelamin,
        noHp,
      };
    }).filter(r => r.nis && r.namaLengkap);
  };

  const handleExecuteImport = async () => {
    setErrorMessage(null);
    const rows = parseCsvToRows(pastedText);

    if (rows.length === 0) {
      setErrorMessage('Tidak ada data siswa yang valid ditemukan. Pastikan ada kolom NIS dan Nama Lengkap.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.importStudents(rows);
      setIsProcessing(false);
      
      const summary = rows.map(r => ({
        nis: r.nis,
        namaLengkap: r.namaLengkap,
        kelas: r.kelas,
        username: r.nis,
        defaultPassword: `al_amanah_${r.nis.slice(-3)}`,
      }));

      setImportSummary(summary);
      onSuccessImport(rows.length);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Gagal mengimpor data ke server.');
    }
  };

  const downloadSampleTemplate = () => {
    const templateContent = `NIS,Nama Siswa,Kelas,Jenis Kelamin,No Handphone\n202410011,Muhammad Fatih Al-Ayyubi,X RPL 1,L,081234567811\n202410012,Zahra Khairunnisa,X RPL 1,P,081234567812\n202410013,Rizki Dwi Ramadhan,XI TKJ 2,L,081234567813\n202410014,Salma Nafisah,XI OTKP 1,P,081234567814\n`;
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Data_Siswa_SMK_Al_Amanah.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fillSampleData = () => {
    const sample = `202410011\tMuhammad Fatih Al-Ayyubi\tX RPL 1\tL\t081234567811\n202410012\tZahra Khairunnisa\tX RPL 1\tP\t081234567812\n202410013\tRizki Dwi Ramadhan\tXI TKJ 2\tL\t081234567813\n202410014\tSalma Nafisah\tXI OTKP 1\tP\t081234567814`;
    setPastedText(sample);
    setUseTextInput(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">
                Impor Data Siswa Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis menghasilkan akun login Siswa: <strong className="text-emerald-700">Nama Pengguna = NIS</strong>, <strong className="text-emerald-700">Kata Sandi = al_amanah_NIS3</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rule Highlight Card */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl mb-4 text-xs">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block mb-0.5">
                  Aturan Akun Baru Otomatis:
                </span>
                <span className="text-emerald-800">
                  Setiap baris siswa yang diimpor akan langsung dibuatkan akun login sistem dengan nama pengguna nomor NIS dan kata sandi bawaan <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800 border border-emerald-300">al_amanah_&lt;3_digit_terakhir_nis&gt;</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Upload File / Paste Text */}
          {!importSummary && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Metode Input:</span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setUseTextInput(false)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      !useTextInput ? 'bg-[#00B884] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Unggah CSV/Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseTextInput(true)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      useTextInput ? 'bg-[#00B884] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Tempel Teks (Excel)
                  </button>
                </div>
              </div>

              {!useTextInput ? (
                /* Drag and Drop File Box */
                <label className="border-2 border-dashed border-slate-300 hover:border-[#00B884] bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block mb-4">
                  <Upload className="w-8 h-8 text-[#00B884] mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    {selectedFile ? selectedFile.name : 'Pilih atau seret berkas CSV data siswa ke sini'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Kolom: NIS, Nama Lengkap, Kelas, Jenis Kelamin, No HP
                  </span>
                  <input
                    type="file"
                    accept=".csv, text/csv, text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                /* Paste Table Text Box */
                <div className="mb-4">
                  <textarea
                    rows={4}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Tempel data langsung dari Excel (NIS, Nama, Kelas, JK, No HP)..."
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={fillSampleData}
                      className="text-[11px] text-[#00B884] font-semibold hover:underline"
                    >
                      + Isi Contoh Data Simulasi
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Template & Help */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Belum memiliki berkas format sekolah?</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="text-[#00B884] font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Templat CSV</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* Success Summary Table */}
          {importSummary && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Berhasil mengimpor {importSummary.length} siswa ke basis data sekolah!</span>
              </div>

              <div className="text-xs font-bold text-slate-700">Daftar Akun Siswa Dihasilkan:</div>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">Kelas</th>
                      <th className="p-2.5 font-mono">Nama Pengguna (NIS)</th>
                      <th className="p-2.5 font-mono">Kata Sandi Bawaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {importSummary.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-sans font-semibold text-slate-800">{item.namaLengkap}</td>
                        <td className="p-2.5 font-sans text-slate-600">{item.kelas}</td>
                        <td className="p-2.5 text-[#00B884] font-bold">{item.username}</td>
                        <td className="p-2.5 text-slate-700 font-bold bg-amber-50/50">{item.defaultPassword}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
          {importSummary ? (
            <button
              onClick={() => {
                setImportSummary(null);
                setPastedText('');
                setSelectedFile(null);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              Selesai
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={!pastedText.trim() || isProcessing}
                className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Basis Data...</span>
                  </>
                ) : (
                  <span>Proses & Simpan Data</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
