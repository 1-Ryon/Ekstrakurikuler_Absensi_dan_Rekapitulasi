import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Download, 
  KeyRound, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Users 
} from 'lucide-react';
import { api } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';

interface ImportGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessImport: (count: number) => void;
  defaultRole?: 'PEMBINA' | 'WALI_KELAS' | 'GURU';
}

export const ImportGuruModal: React.FC<ImportGuruModalProps> = ({
  isOpen,
  onClose,
  onSuccessImport,
  defaultRole = 'PEMBINA',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);

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
    const hasHeader = 
      firstLineLower.includes('nip') || 
      firstLineLower.includes('nama') || 
      firstLineLower.includes('guru') ||
      firstLineLower.includes('spesialisasi');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      // Support tab (Excel copy-paste), semicolon, or comma
      const cols = line.includes('\t') 
        ? line.split('\t') 
        : line.includes(';') 
          ? line.split(';') 
          : line.split(',');

      const clean = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));
      const nip = clean[0] || '';
      const namaLengkap = clean[1] || '';
      const jenisKelamin = clean[2] || 'L';
      const noHp = clean[3] || '';
      const email = clean[4] || '';
      const spesialisasi = clean[5] || 'Guru Pembina & Pengajar';
      const role = clean[6] || defaultRole;
      const kelas = clean[7] || '';

      return {
        nip,
        namaLengkap,
        jenisKelamin,
        noHp,
        email,
        spesialisasi,
        role,
        kelas,
      };
    }).filter(r => r.namaLengkap);
  };

  const handleExecuteImport = async () => {
    setErrorMessage(null);
    const rows = parseCsvToRows(pastedText);

    if (rows.length === 0) {
      setErrorMessage('Tidak ada data guru yang valid. Pastikan kolom Nama Lengkap terisi.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.importGuru(rows);
      setIsProcessing(false);

      if (response && response.summary) {
        setImportSummary(response.summary);
      } else {
        const fallbackSummary = rows.map(r => ({
          namaLengkap: r.namaLengkap,
          nip: r.nip || '-',
          username: r.nip || r.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.').slice(0, 20),
          defaultPassword: `guru_${(r.nip || '123').slice(-4)}`,
          role: r.role || defaultRole,
          spesialisasi: r.spesialisasi,
        }));
        setImportSummary(fallbackSummary);
      }

      onSuccessImport(rows.length);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Gagal mengimpor data guru ke server.');
    }
  };

  const downloadSampleTemplate = () => {
    const templateContent = `NIP,Nama Lengkap Guru,Jenis Kelamin (L/P),No WhatsApp / HP,Email,Spesialisasi / Bidang,Peran (PEMBINA/WALI_KELAS/GURU),Wali Kelas (Opsional)
19910515 201802 1 004,Ahmad Syafii, S.Pd.,L,081234567801,ahmad.syafii@smk-alamanah.sch.id,Guru Olahraga & Pembina Futsal,PEMBINA,
19850210 201101 1 007,Abdul Jabbar, S.Kom., M.Kom.,L,081234567802,abdul.jabbar@smk-alamanah.sch.id,Guru IT & Pembina Computer Club,PEMBINA,
19840112 200902 1 001,Budi Santoso, S.Pd.,L,081234567803,budi.santoso@smk-alamanah.sch.id,Guru Kedisiplinan & Pembina Paskibra,PEMBINA,
19870321 201301 2 006,Siti Nurhaliza, M.Pd.,P,081234567804,siti.nurhaliza@smk-alamanah.sch.id,Guru Bahasa & Pembina Seni Tari,WALI_KELAS,X RPL 1
19900824 201704 1 005,Miftah Farid, S.Pd.I.,L,081234567805,miftah.farid@smk-alamanah.sch.id,Guru PAI & Pembina Rohis,PEMBINA,
`;
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Data_Guru_SMK_Al_Amanah.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fillSampleData = () => {
    const sample = `19910515 201802 1 004\tAhmad Syafii, S.Pd.\tL\t081234567801\tahmad.syafii@smk-alamanah.sch.id\tGuru Olahraga & Pembina Futsal\tPEMBINA\t
19850210 201101 1 007\tAbdul Jabbar, S.Kom., M.Kom.\tL\t081234567802\tabdul.jabbar@smk-alamanah.sch.id\tGuru IT & Pembina Computer Club\tPEMBINA\t
19840112 200902 1 001\tBudi Santoso, S.Pd.\tL\t081234567803\tbudi.santoso@smk-alamanah.sch.id\tGuru Kedisiplinan & Pembina Paskibra\tPEMBINA\t
19870321 201301 2 006\tSiti Nurhaliza, M.Pd.\tP\t081234567804\tsiti.nurhaliza@smk-alamanah.sch.id\tGuru Bahasa & Wali Kelas X RPL 1\tWALI_KELAS\tX RPL 1
19900824 201704 1 005\tMiftah Farid, S.Pd.I.\tL\t081234567805\tmiftah.farid@smk-alamanah.sch.id\tGuru PAI & Pembina Rohis\tPEMBINA\t`;
    setPastedText(sample);
    setUseTextInput(true);
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllCredentials = () => {
    if (!importSummary) return;
    const lines = importSummary.map(
      s => `${s.namaLengkap} | User: ${s.username} | Pass: ${s.defaultPassword} | Peran: ${s.role}`
    ).join('\n');
    navigator.clipboard.writeText(lines);
    alert('Seluruh daftar kredensial guru berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Impor Data Guru & Pembina Sekolah
                </h3>
                <p className="text-xs text-slate-500">
                  Unggah berkas Excel/CSV atau tempel tabel data guru resmi SMK Al Amanah.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panduan Akun Login Otomatis */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl mb-4 text-xs">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950">
                  Akun Login Guru Dibuat Otomatis oleh Sistem:
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  <strong>Nama Pengguna</strong> = NIP (atau nama pengguna bersih jika NIP kosong) • <strong>Kata Sandi Bawaan</strong> = <span className="font-mono bg-white/70 px-1 py-0.5 rounded border border-emerald-300">guru_XXXX</span> (4 digit akhir NIP atau nama).
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs: File Upload or Paste Excel */}
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUseTextInput(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !useTextInput 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unggah Berkas CSV / Excel
            </button>
            <button
              type="button"
              onClick={() => setUseTextInput(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                useTextInput 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tempel Langsung dari Excel
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={fillSampleData}
                className="text-[11px] text-[#00B884] hover:text-[#009E71] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Isi Contoh Data</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Unduh Templat CSV</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          {!useTextInput ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-[#00B884] rounded-2xl p-6 text-center transition-all bg-slate-50/50">
              <input
                type="file"
                id="fileGuruInput"
                accept=".csv, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="fileGuruInput" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-[#00B884] flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 block">
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih berkas CSV data guru'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mendukung format .csv atau .txt dari ekspor Dapodik / Spreadsheet
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-1">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Tempel data dari Excel di sini...\nContoh baris:\n19910515 201802 1 004\tAhmad Syafii, S.Pd.\tL\t081234567801\tahmad@smk.sch.id\tGuru Olahraga & Pembina Futsal\tPEMBINA`}
                rows={5}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
              <span className="text-[10px] text-slate-400 block">
                Tips: Salin tabel dari Excel/Google Sheets, lalu langsung tempel ke kotak di atas.
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Summary Preview After Success */}
          {importSummary && (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#00B884]" />
                  <span>{importSummary.length} Akun Guru Berhasil Dibuat & Tersimpan:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAllCredentials}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin Semua Kredensial</span>
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto divide-y divide-emerald-100 text-xs bg-white rounded-xl border border-emerald-100">
                {importSummary.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar name={item.namaLengkap} size="sm" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{item.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIP: {item.nip} • {item.role}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-[11px] font-bold text-emerald-700">Akun: {item.username}</div>
                      <div className="font-mono text-[10px] text-slate-500">Sandi: {item.defaultPassword}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            {importSummary ? 'Tutup' : 'Batal'}
          </button>
          
          {!importSummary ? (
            <button
              type="button"
              disabled={isProcessing || !pastedText.trim()}
              onClick={handleExecuteImport}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009E71] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Data Guru...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Data Sekarang</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Selesai & Muat Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
