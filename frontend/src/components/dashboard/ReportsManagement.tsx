import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { Eskul, PenilaianRecord, PresensiRecord } from '../../types';

interface ReportsManagementProps {
  eskulList: Eskul[];
  penilaianList: PenilaianRecord[];
  presensiList: PresensiRecord[];
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({
  eskulList,
  penilaianList,
  presensiList,
}) => {
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026/2027');
  const [selectedEskul, setSelectedEskul] = useState('Semua');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const classes = ['Semua', 'X RPL 1', 'X RPL 2', 'X AKL 1', 'XI RPL 1', 'XI TKJ 2', 'XI OTKP 1', 'XII RPL 1', 'XII BDP 2'];

  const filteredPenilaian = penilaianList.filter((p) => {
    const matchesEskul = selectedEskul === 'Semua' || p.eskulId === selectedEskul;
    const matchesClass = selectedClass === 'Semua' || p.kelas === selectedClass;
    return matchesEskul && matchesClass;
  });

  const handleExportXLSX = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Ekstrakurikuler', 'Nilai Kehadiran', 'Nilai Keaktifan', 'Nilai Kinerja', 'Nilai Akhir', 'Predikat', 'Catatan'];
    const rows = filteredPenilaian.map((r, i) => [
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
    link.setAttribute('download', `Laporan_Rekapitulasi_SMK_Al_Amanah_${selectedSemester.replace(/[\/\s]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Laporan & Rekapitulasi Global
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Rekapitulasi semesteran kehadiran presensi QR dan nilai kompetensi non-akademik siswa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Ekspor Excel/XLSX */}
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 text-[#00B884] font-semibold text-sm rounded-xl shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2]" />
            <span>Ekspor Batch XLSX</span>
          </button>

          {/* Cetak / Preview PDF */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00B884] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Tingkat Kehadiran Rata-rata</div>
            <div className="text-2xl font-extrabold text-slate-800">92.4%</div>
            <div className="text-[11px] text-emerald-600 font-medium">Validasi Dynamic QR (Anti-Fraud)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Partisipasi Siswa</div>
            <div className="text-2xl font-extrabold text-slate-800">450 / 450</div>
            <div className="text-[11px] text-sky-600 font-medium">100% Terdaftar di Minimal 1 Eskul</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Distribusi Predikat A</div>
            <div className="text-2xl font-extrabold text-slate-800">78.5%</div>
            <div className="text-[11px] text-amber-600 font-medium">Sangat Baik (Skor Akhir &ge; 85)</div>
          </div>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Tahun Ajaran:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="Ganjil 2026/2027">Semester Ganjil 2026/2027</option>
              <option value="Genap 2025/2026">Semester Genap 2025/2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Cabang Eskul:</span>
            <select
              value={selectedEskul}
              onChange={(e) => setSelectedEskul(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="Semua">Semua Ekstrakurikuler</option>
              {eskulList.map((e) => (
                <option key={e.id} value={e.id}>{e.namaEskul}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <span className="text-xs font-medium text-slate-500">
          Data Siap Cetak & Kirim ke Dinas Pendidikan
        </span>
      </div>

      {/* Rekapitulasi Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NISN & Kelas</th>
                <th className="py-3.5 px-4">Eskul</th>
                <th className="py-3.5 px-3 text-center">Kehadiran (40%)</th>
                <th className="py-3.5 px-3 text-center">Keaktifan (30%)</th>
                <th className="py-3.5 px-3 text-center">Kinerja (30%)</th>
                <th className="py-3.5 px-3 text-center">Nilai Akhir</th>
                <th className="py-3.5 px-3 text-center">Predikat</th>
                <th className="py-3.5 px-4">Keterangan Capaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPenilaian.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {item.namaSiswa}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {item.nisn} <span className="text-slate-400 font-sans">({item.kelas})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-xs font-semibold rounded-full border border-emerald-100">
                      {item.namaEskul}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {item.nilaiKehadiran}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {item.nilaiKeaktifan}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {item.nilaiKinerja}
                  </td>
                  <td className="py-3.5 px-3 text-center font-extrabold text-[#00B884]">
                    {item.nilaiAkhir}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800">
                      {item.predikat}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate" title={item.catatan}>
                    {item.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Cetak Resmi PDF */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pratinjau Dokumen Rapor Resmi Sekolah
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official School Document Header (Kop Surat Resmi) */}
            <div className="my-6 text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
                SMK AL AMANAH KOTA TANGERANG SELATAN
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Jl. Raya Puspiptek Serpong No. 12, Tangerang Selatan, Banten • Telp: (021) 756-1234
              </p>
              <h3 className="text-sm font-bold text-slate-800 underline uppercase mt-3">
                LEMBAR REKAPITULASI NILAI EKSTRAKURIKULER SISWA
              </h3>
              <div className="text-xs text-slate-500 mt-1">
                Tahun Pelajaran 2026/2027 • Semester Ganjil
              </div>
            </div>

            {/* Content Table in Print Modal */}
            <table className="w-full text-xs text-left border border-slate-300 border-collapse mb-6">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="p-2 border-r border-slate-300 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">Nama Lengkap</th>
                  <th className="p-2 border-r border-slate-300">NISN / Kelas</th>
                  <th className="p-2 border-r border-slate-300">Ekstrakurikuler</th>
                  <th className="p-2 border-r border-slate-300 text-center">Nilai Akhir</th>
                  <th className="p-2 border-r border-slate-300 text-center">Predikat</th>
                  <th className="p-2">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPenilaian.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{item.namaSiswa}</td>
                    <td className="p-2 border-r border-slate-200">{item.nisn} ({item.kelas})</td>
                    <td className="p-2 border-r border-slate-200">{item.namaEskul}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">{item.nilaiAkhir}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">{item.predikat}</td>
                    <td className="p-2">{item.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Area (Tanda Tangan Kepala Sekolah & Koordinator) */}
            <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-slate-200 text-slate-800">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala SMK Al Amanah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
                <p className="text-slate-500">NIP. 19680315 199303 1 004</p>
              </div>

              <div>
                <p>Tangerang Selatan, 24 September 2026</p>
                <p className="font-bold">Koordinator Ekstrakurikuler</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Viska Adawiyah Zulkarnaen, S.Pd.</p>
                <p className="text-slate-500">NIP. 19890412 201402 2 003</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
