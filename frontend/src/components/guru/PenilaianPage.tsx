import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Download, 
  Save, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calculator,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { PenilaianRecord, Eskul } from '../../types';

interface PenilaianPageProps {
  penilaianList: PenilaianRecord[];
  eskulList: Eskul[];
  onSavePenilaian: (records: PenilaianRecord[]) => void;
}

export const PenilaianPage: React.FC<PenilaianPageProps> = ({
  penilaianList,
  eskulList,
  onSavePenilaian,
}) => {
  const [records, setRecords] = useState<PenilaianRecord[]>(penilaianList);
  const [selectedEskul, setSelectedEskul] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  const calculateFinalGrade = (kehadiran: number, keaktifan: number, kinerja: number) => {
    // Kehadiran 40%, Keaktifan 30%, Kinerja 30%
    const score = (kehadiran * 0.4) + (keaktifan * 0.3) + (kinerja * 0.3);
    const rounded = Math.round(score * 10) / 10;

    let predikat: 'A' | 'B' | 'C' | 'D' = 'D';
    if (rounded >= 85) predikat = 'A';
    else if (rounded >= 75) predikat = 'B';
    else if (rounded >= 65) predikat = 'C';
    else predikat = 'D';

    return { score: rounded, predikat };
  };

  const handleScoreChange = (
    id: string, 
    field: 'nilaiKehadiran' | 'nilaiKeaktifan' | 'nilaiKinerja', 
    val: number
  ) => {
    const clampedVal = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;

        const updated = { ...rec, [field]: clampedVal };
        const { score, predikat } = calculateFinalGrade(
          updated.nilaiKehadiran,
          updated.nilaiKeaktifan,
          updated.nilaiKinerja
        );
        return {
          ...updated,
          nilaiAkhir: score,
          predikat,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleNoteChange = (id: string, note: string) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, catatan: note } : rec))
    );
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSavePenilaian(records);
    setHasUnsavedChanges(false);
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nisn.includes(searchTerm) ||
      r.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEskul = selectedEskul === 'Semua' || r.eskulId === selectedEskul;
    return matchesSearch && matchesEskul;
  });

  const handleExportExcel = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Ekstrakurikuler', 'Kehadiran (40%)', 'Keaktifan (30%)', 'Kinerja (30%)', 'Nilai Akhir', 'Predikat', 'Catatan Capaian Kompetensi'];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      r.nisn,
      `"${r.namaSiswa}"`,
      r.kelas,
      `"${r.namaEskul}"`,
      r.nilaiKehadiran,
      r.nilaiKeaktifan,
      r.nilaiKinerja,
      r.nilaiAkhir,
      r.predikat,
      `"${r.catatan}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Eskul_Semester_Ganjil_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Penilaian & Rekap Nilai
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Format penilaian kompetensi non-akademik akhir semester: Kehadiran (40%), Keaktifan (30%), Kinerja (30%).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel / Rapor</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              hasUnsavedChanges
                ? 'bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {savedSuccessAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Berhasil menyimpan seluruh entri nilai dan catatan naratif rapor siswa!</span>
        </div>
      )}

      {/* Formula & Weighting Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-amber-500/10 p-4 rounded-2xl border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-[#00B884] shrink-0" />
          <div>
            <span className="font-bold text-slate-800">Rumus Penilaian Kurikulum Merdeka: </span>
            <span>Nilai Akhir = (Kehadiran × 40%) + (Keaktifan × 30%) + (Kinerja/Keterampilan × 30%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white rounded-md font-bold text-emerald-700 border border-emerald-200">A: ≥ 85</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-bold text-blue-700 border border-blue-200">B: 75 - 84</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-bold text-amber-700 border border-amber-200">C: 65 - 74</span>
          <span className="px-2 py-0.5 bg-white rounded-md font-bold text-rose-700 border border-rose-200">D: &lt; 65</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa atau NISN..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Filter Eskul:</span>
          <select
            value={selectedEskul}
            onChange={(e) => setSelectedEskul(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
          >
            <option value="Semua">Semua Eskul</option>
            {eskulList.map((e) => (
              <option key={e.id} value={e.id}>{e.namaEskul}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Assessment Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">Ekstrakurikuler</th>
                <th className="py-3.5 px-3 text-center w-28">Kehadiran (40%)</th>
                <th className="py-3.5 px-3 text-center w-28">Keaktifan (30%)</th>
                <th className="py-3.5 px-3 text-center w-28">Kinerja (30%)</th>
                <th className="py-3.5 px-3 text-center w-24">Nilai Akhir</th>
                <th className="py-3.5 px-3 text-center w-16">Predikat</th>
                <th className="py-3.5 px-4 min-w-[280px]">Catatan Capaian Kompetensi (Rapor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Siswa */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{item.namaSiswa}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.nisn} • {item.kelas}</div>
                  </td>

                  {/* Eskul */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-xs font-semibold rounded-full border border-emerald-100">
                      {item.namaEskul}
                    </span>
                  </td>

                  {/* Nilai Kehadiran Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKehadiran}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKehadiran', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Keaktifan Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKeaktifan}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKeaktifan', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Kinerja Input */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilaiKinerja}
                      onChange={(e) => handleScoreChange(item.id, 'nilaiKinerja', parseFloat(e.target.value))}
                      className="w-16 mx-auto px-2 py-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/30"
                    />
                  </td>

                  {/* Nilai Akhir (Calculated) */}
                  <td className="py-3 px-3 text-center">
                    <span className="text-base font-extrabold text-slate-800">
                      {item.nilaiAkhir}
                    </span>
                  </td>

                  {/* Predikat */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-8 h-8 rounded-full font-extrabold text-sm leading-8 text-center ${
                      item.predikat === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.predikat === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : item.predikat === 'C'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.predikat}
                    </span>
                  </td>

                  {/* Catatan Naratif */}
                  <td className="py-3 px-4">
                    <textarea
                      rows={2}
                      value={item.catatan}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      placeholder="Tuliskan capaian kompetensi siswa untuk rapor..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 resize-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredRecords.length} Nilai Siswa Terdaftar untuk Semester Ganjil 2026/2027</span>
          <span className="font-semibold text-slate-700">Format Nilai Terintegrasi e-Rapor</span>
        </div>
      </div>
    </div>
  );
};
