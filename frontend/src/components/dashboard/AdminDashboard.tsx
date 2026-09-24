import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Upload, 
  Laptop, 
  Activity, 
  Users, 
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PEMBINA_LIST, WEEKLY_ATTENDANCE_DATA } from '../../data/mockData';
import { NavItemKey } from '../Sidebar';

interface AdminDashboardProps {
  onOpenAddEskul: () => void;
  onOpenImport: () => void;
  onNavigate: (tab: NavItemKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAddEskul,
  onOpenImport,
  onNavigate,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG dimensions for exact line chart replication
  const chartWidth = 900;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Chart data points coordinates
  const points = WEEKLY_ATTENDANCE_DATA.map((d, i) => {
    const x = paddingX + (i / (WEEKLY_ATTENDANCE_DATA.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (d.value / 100) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
  }, '');

  return (
    <div className="space-y-6 pb-8">
      {/* Title & Top Action Buttons strictly matching the screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Beranda Utama
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-normal">
            Pantau kehadiran siswa, kelola kegiatan eskul, dan rekap nilai dengan mudah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* + Tambah Eskul (Solid Emerald Button) */}
          <button
            onClick={onOpenAddEskul}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Tambah Eskul</span>
          </button>

          {/* Import Data (Outlined Emerald Button) */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 active:scale-[0.98] text-[#00B884] font-medium text-sm rounded-xl shadow-xs transition-all"
          >
            <Upload className="w-4 h-4 stroke-[2]" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Grid strictly matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Green Active Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => onNavigate('eskul')}
          className="bg-[#00B884] text-white p-5 rounded-2xl shadow-sm cursor-pointer relative overflow-hidden flex flex-col justify-between h-44"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-white/95">
              Total Ekstrakurikuler
            </span>
            <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-white/90">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-4xl font-extrabold tracking-tight text-white">
              12
            </span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium rounded-full">
              12 Eskul Aktif Semester Ini
            </span>
          </div>
        </motion.div>

        {/* Card 2: Total Siswa Terdaftar */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => onNavigate('siswa')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer flex flex-col justify-between h-44"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-700">
              Total Siswa Terdaftar
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-800">
              450
            </span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full">
              12 Eskul Aktif Semester Ini
            </span>
          </div>
        </motion.div>

        {/* Card 3: Rata-Rata Kehadiran */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => onNavigate('laporan')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer flex flex-col justify-between h-44"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-700">
              Rata-Rata Kehadiran
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-800">
              92%
            </span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full">
              Meningkat dari Bulan Lalu
            </span>
          </div>
        </motion.div>

        {/* Card 4: Sesi Eskul Hari Ini */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          onClick={() => onNavigate('dynamic-qr')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer flex flex-col justify-between h-44"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-700">
              Sesi Eskul Hari Ini
            </span>
            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-auto py-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-800">
              4
            </span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full truncate max-w-full">
              Pramuka, Futsal, Rohis, IT Club
            </span>
          </div>
        </motion.div>
      </div>

      {/* Chart Section: "Grafik Kehadiran Mingguan" matching screenshot */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            Grafik Kehadiran Mingguan
          </h2>
          <span className="text-xs text-slate-400">
            Skala Persentase (0 - 100%)
          </span>
        </div>

        {/* Custom SVG Line Chart matching screenshot grid & line */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 select-none overflow-visible"
            >
              {/* Horizontal Grid lines (100, 75, 50, 25, 0) */}
              {[100, 75, 50, 25, 0].map((val) => {
                const y = chartHeight - paddingY - (val / 100) * innerHeight;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 12}
                      y={y + 4}
                      fill="#64748B"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="inherit"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Grid lines (0 to 6) */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={chartHeight - paddingY}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={p.x}
                    y={chartHeight - paddingY + 16}
                    fill="#64748B"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    {p.dayIndex}
                  </text>
                </g>
              ))}

              {/* Connecting Green Line (#00B884 or #10B981) */}
              <path
                d={pathD}
                fill="none"
                stroke="#00B884"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint === idx ? 6 : 3.5}
                    fill="#FFFFFF"
                    stroke="#00B884"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="transition-all duration-150"
                  />
                </g>
              ))}
            </svg>

            {/* Tooltip on hover */}
            {hoveredPoint !== null && (
              <div
                className="absolute z-20 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / chartHeight) * 100}%`,
                  marginTop: '-12px',
                }}
              >
                <div className="font-bold text-[#00B884]">
                  {points[hoveredPoint].label}
                </div>
                <div>{points[hoveredPoint].detail}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section (2 Columns) strictly matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: "Daftar Pembina / Guru Eskul" */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">
                Daftar Pembina / Guru Eskul
              </h2>
              <button 
                onClick={() => onNavigate('eskul')}
                className="text-xs text-[#00B884] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Item 1: Abdul Jabbar, S.Kom., M.Kom. */}
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <img
                    src={PEMBINA_LIST[0].avatarUrl}
                    alt={PEMBINA_LIST[0].namaLengkap}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                  />
                  <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#00B884] transition-colors">
                    {PEMBINA_LIST[0].namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {PEMBINA_LIST[0].spesialisasi}
                  </p>
                </div>
              </div>

              {/* Item 2: Rahman, Lc. */}
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <img
                    src={PEMBINA_LIST[1].avatarUrl}
                    alt={PEMBINA_LIST[1].namaLengkap}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                  />
                  <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#00B884] transition-colors">
                    {PEMBINA_LIST[1].namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {PEMBINA_LIST[1].spesialisasi}
                  </p>
                </div>
              </div>

              {/* Item 3: Miftah Farid, S.Pd.I. */}
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <img
                    src={PEMBINA_LIST[2].avatarUrl}
                    alt={PEMBINA_LIST[2].namaLengkap}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                  />
                  <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#00B884] transition-colors">
                    {PEMBINA_LIST[2].namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {PEMBINA_LIST[2].spesialisasi}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>6 Pembina Ekstrakurikuler Aktif</span>
            <span className="text-emerald-600 font-medium">100% Terverifikasi</span>
          </div>
        </div>

        {/* Right Card: "Status Eskul Aktif Hari Ini" */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">
                Status Eskul Aktif Hari Ini
              </h2>
              <span className="text-xs text-slate-400">
                Kamis, 24 September 2026
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1: Eskul Futsal (Light blue pill card matching screenshot) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onNavigate('dynamic-qr')}
                className="p-3.5 bg-[#E8F4FD] rounded-2xl flex items-center gap-3.5 cursor-pointer border border-[#D0E9FD] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-sky-700 leading-snug">
                    Eskul Futsal
                  </h3>
                  <p className="text-xs text-sky-600/90 truncate">
                    Pembina: Pak Ahmad (Sesi Berlangsung)
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              </motion.div>

              {/* Item 2: Eskul IT Club (Light orange pill card matching screenshot) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onNavigate('dynamic-qr')}
                className="p-3.5 bg-[#FFF4E6] rounded-2xl flex items-center gap-3.5 cursor-pointer border border-[#FFE4C4] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-orange-700 leading-snug">
                    Eskul IT Club
                  </h3>
                  <p className="text-xs text-orange-600/90 truncate">
                    Pembina: Bu Dina (Belum Dimulai)
                  </p>
                </div>
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              </motion.div>

              {/* Item 3: Eskul Paskibra (Light green pill card matching screenshot) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onNavigate('live-presensi')}
                className="p-3.5 bg-[#ECFDF5] rounded-2xl flex items-center gap-3.5 cursor-pointer border border-[#D1FAE5] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-emerald-700 leading-snug">
                    Eskul Paskibra
                  </h3>
                  <p className="text-xs text-emerald-600/90 truncate">
                    Pembina: Pak Budi (Selesai)
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </motion.div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Presensi Terkoneksi Real-time</span>
            <button
              onClick={() => onNavigate('live-presensi')}
              className="text-[#00B884] font-semibold hover:underline"
            >
              Buka Live Log Presensi →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
