import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Smartphone, 
  FileText,
  RefreshCw,
  UsersRound
} from 'lucide-react';
import { PresensiRecord } from '../../types';

interface LiveAttendanceLogProps {
  logs: PresensiRecord[];
  onUpdateStatus: (id: string, newStatus: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA') => void;
  onRefresh: () => void;
}

export const LiveAttendanceLog: React.FC<LiveAttendanceLogProps> = ({
  logs,
  onUpdateStatus,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedEskuls, setSelectedEskuls] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const eskulOptions = Array.from(new Set(logs.map(l => l.namaEskul))).filter(Boolean);
  const statusOptions = ['HADIR', 'IZIN', 'SAKIT', 'ALPA'];

  const toggleEskul = (e: string) => {
    setSelectedEskuls(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  };

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const activeFiltersCount = selectedEskuls.length + selectedStatuses.length;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nisn.includes(searchTerm) ||
      log.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(log.status);
    const matchesEskul = selectedEskuls.length === 0 || selectedEskuls.includes(log.namaEskul);
    return matchesSearch && matchesStatus && matchesEskul;
  });

  const handleExportCSV = () => {
    const headers = ['Waktu Scan', 'Nama Siswa', 'NISN', 'Kelas', 'Ekstrakurikuler', 'Status', 'Metode Validasi', 'Info Perangkat'];
    const rows = filteredLogs.map(l => [
      l.waktuScan,
      `"${l.namaSiswa}"`,
      l.nisn,
      l.kelas,
      `"${l.namaEskul}"`,
      l.status,
      l.metode,
      `"${l.deviceInfo || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_SMK_Al_Amanah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA') => {
    switch (status) {
      case 'HADIR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IZIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SAKIT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ALPA':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight flex items-center gap-3">
            <span>Log Presensi Langsung</span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sinkronisasi Langsung
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Pencatatan kehadiran instan hasil pindai QR Dinamis & koreksi manual guru pembina.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 text-[#00B884] font-semibold text-sm rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NISN, atau kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Unified Filter Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeFiltersCount > 0
                  ? 'bg-emerald-50 text-[#00B884] border-emerald-200 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00B884]" />
              <span>Filter Log Presensi</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#00B884] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Total: <strong className="text-slate-700">{filteredLogs.length}</strong> entri
            </span>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Filter Aktif:</span>

            {selectedEskuls.map((eskul) => (
              <span key={eskul} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] font-medium text-[11px] border border-emerald-100">
                Eskul: {eskul}
                <button onClick={() => toggleEskul(eskul)} className="hover:text-emerald-800 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedStatuses.map((st) => (
              <span key={st} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#00B884] font-medium text-[11px] border border-emerald-100">
                Status: {st}
                <button onClick={() => toggleStatus(st)} className="hover:text-emerald-800 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={() => {
                setSelectedEskuls([]);
                setSelectedStatuses([]);
              }}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-medium ml-1 underline decoration-dotted cursor-pointer"
            >
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Window (Multi-Choice) */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Filter Log Presensi</h3>
                    <p className="text-xs text-slate-400">Pilih satu atau lebih kriteria kehadiran (Multi-Select)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* 1. Ekstrakurikuler (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cabang Eskul {selectedEskuls.length > 0 && <span className="text-[#00B884]">({selectedEskuls.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedEskuls([...eskulOptions])}
                        className="text-[#00B884] hover:underline font-medium cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedEskuls([])}
                        className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-0.5">
                    {eskulOptions.map(opt => {
                      const isSelected = selectedEskuls.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleEskul(opt)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Status Kehadiran (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status Kehadiran {selectedStatuses.length > 0 && <span className="text-[#00B884]">({selectedStatuses.length})</span>}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedStatuses([...statusOptions])}
                        className="text-[#00B884] hover:underline font-medium cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedStatuses([])}
                        className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((st) => {
                      const isSelected = selectedStatuses.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleStatus(st)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#00B884] border-[#00B884] font-semibold shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEskuls([]);
                    setSelectedStatuses([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Waktu Pindai</th>
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">NISN & Kelas</th>
                <th className="py-3.5 px-4">Ekstrakurikuler</th>
                <th className="py-3.5 px-4">Perangkat / Validasi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Koreksi Cepat Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Waktu Pindai */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.waktuScan} WIB</span>
                    </div>
                  </td>

                  {/* Siswa */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{log.namaSiswa}</div>
                  </td>

                  {/* NISN & Kelas */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div className="font-mono">{log.nisn}</div>
                    <div className="text-slate-400">{log.kelas}</div>
                  </td>

                  {/* Eskul */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                      {log.namaEskul}
                    </span>
                  </td>

                  {/* Perangkat & Metode */}
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Smartphone className="w-3 h-3 text-[#00B884]" />
                      <span>{log.metode === 'DYNAMIC_QR' ? 'QR Dinamis (TOTP Valid)' : 'Dispensasi Manual'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                      {log.deviceInfo || 'Radius Geofencing Valid'}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </td>

                  {/* Quick Status Buttons */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                      <button
                        onClick={() => onUpdateStatus(log.id, 'HADIR')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          log.status === 'HADIR' ? 'bg-[#00B884] text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Tandai Hadir"
                      >
                        H
                      </button>
                      <button
                        onClick={() => onUpdateStatus(log.id, 'IZIN')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          log.status === 'IZIN' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Tandai Izin"
                      >
                        I
                      </button>
                      <button
                        onClick={() => onUpdateStatus(log.id, 'SAKIT')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          log.status === 'SAKIT' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Tandai Sakit"
                      >
                        S
                      </button>
                      <button
                        onClick={() => onUpdateStatus(log.id, 'ALPA')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          log.status === 'ALPA' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Tandai Alpa"
                      >
                        A
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredLogs.length} Log Presensi Hari Ini</span>
          <span className="font-semibold text-emerald-700">Waktu Server: Tersinkronisasi Langsung</span>
        </div>
      </div>
    </div>
  );
};
