import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
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
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [eskulFilter, setEskulFilter] = useState('Semua');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nisn.includes(searchTerm) ||
      log.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || log.status === statusFilter;
    const matchesEskul = eskulFilter === 'Semua' || log.namaEskul === eskulFilter;
    return matchesSearch && matchesStatus && matchesEskul;
  });

  const eskulOptions = ['Semua', ...Array.from(new Set(logs.map(l => l.namaEskul)))];

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
            <span>Live Attendance Log</span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Pencatatan kehadiran instan hasil scan Dynamic QR & koreksi manual guru pembina.
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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Filter Eskul:</span>
            <select
              value={eskulFilter}
              onChange={(e) => setEskulFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              {eskulOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              <option value="Semua">Semua Status</option>
              <option value="HADIR">HADIR</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="ALPA">ALPA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Waktu Scan</th>
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
                  {/* Waktu Scan */}
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
                      <span>{log.metode === 'DYNAMIC_QR' ? 'Dynamic QR (TOTP Valid)' : 'Dispensasi Manual'}</span>
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
          <span className="font-semibold text-emerald-700">Waktu Server: Real-time Synchronized</span>
        </div>
      </div>
    </div>
  );
};
