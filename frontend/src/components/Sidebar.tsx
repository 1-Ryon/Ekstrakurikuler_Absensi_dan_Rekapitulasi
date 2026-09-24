import React from 'react';
import { 
  LayoutGrid, 
  Volleyball, 
  Contact, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  QrCode,
  UsersRound,
  Award,
  ScanLine,
  FileCheck
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { Role } from '../types';

export type NavItemKey = 
  | 'beranda'
  | 'eskul'
  | 'siswa'
  | 'laporan'
  | 'pengaturan'
  | 'dynamic-qr'
  | 'scanner-guru'
  | 'live-presensi'
  | 'penilaian'
  | 'scanner-siswa'
  | 'khn-siswa';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  currentRole: Role;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onLogout,
}) => {
  return (
    <aside className="w-64 bg-[#F8F9FA] min-h-screen border-r border-slate-200/80 flex flex-col justify-between p-5 select-none shrink-0">
      <div>
        {/* School Branding matching screenshot */}
        <div className="pb-7 pt-1 px-1">
          <SchoolLogo size="md" showText={true} />
        </div>

        {/* Section: MENU */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-3 px-3">
            MENU
          </div>

          <nav className="space-y-1">
            {/* Beranda */}
            <button
              onClick={() => onTabChange('beranda')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'beranda'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {/* Active Green Indicator Bar on Left */}
              {activeTab === 'beranda' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <LayoutGrid
                className={`w-5 h-5 ${
                  activeTab === 'beranda' ? 'text-[#00B884]' : 'text-slate-500'
                }`}
              />
              <span>Beranda</span>
            </button>

            {/* Eskul & Pembina */}
            <button
              onClick={() => onTabChange('eskul')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'eskul'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'eskul' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <Volleyball
                className={`w-5 h-5 ${
                  activeTab === 'eskul' ? 'text-[#00B884]' : 'text-slate-500'
                }`}
              />
              <span>Eskul & Pembina</span>
            </button>

            {/* Data Siswa */}
            <button
              onClick={() => onTabChange('siswa')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'siswa'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'siswa' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <Contact
                className={`w-5 h-5 ${
                  activeTab === 'siswa' ? 'text-[#00B884]' : 'text-slate-500'
                }`}
              />
              <span>Data Siswa</span>
            </button>

            {/* Laporan & Rekap */}
            <button
              onClick={() => onTabChange('laporan')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'laporan'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'laporan' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <FileSpreadsheet
                className={`w-5 h-5 ${
                  activeTab === 'laporan' ? 'text-[#00B884]' : 'text-slate-500'
                }`}
              />
              <span>Laporan & Rekap</span>
            </button>
          </nav>
        </div>

        {/* Section: FITUR KHUSUS PRD (Guru & Siswa workflows) */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-3 px-3 flex items-center justify-between">
            <span>FITUR OPERASIONAL</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 font-semibold">PRD</span>
          </div>

          <nav className="space-y-1">
            {/* Dynamic QR Generator */}
            <button
              onClick={() => onTabChange('dynamic-qr')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'dynamic-qr'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'dynamic-qr' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <QrCode className={`w-5 h-5 ${activeTab === 'dynamic-qr' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <div className="text-left flex-1 flex items-center justify-between">
                <span>Dynamic QR</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">15s</span>
              </div>
            </button>

            {/* Scanner Guru (Scan QR Kartu Siswa - Ide Kelompok) */}
            <button
              onClick={() => onTabChange('scanner-guru')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'scanner-guru'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'scanner-guru' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <ScanLine className={`w-5 h-5 ${activeTab === 'scanner-guru' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <div className="text-left flex-1 flex items-center justify-between">
                <span>Scan Kartu Siswa</span>
                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-full">Guru</span>
              </div>
            </button>

            {/* Live Attendance Log */}
            <button
              onClick={() => onTabChange('live-presensi')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'live-presensi'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'live-presensi' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <UsersRound className={`w-5 h-5 ${activeTab === 'live-presensi' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <div className="text-left flex-1 flex items-center justify-between">
                <span>Live Presensi</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </button>

            {/* Penilaian Akhir Semester */}
            <button
              onClick={() => onTabChange('penilaian')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'penilaian'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'penilaian' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <Award className={`w-5 h-5 ${activeTab === 'penilaian' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <span>Penilaian Rapor</span>
            </button>

            {/* Siswa QR Scanner Simulator */}
            <button
              onClick={() => onTabChange('scanner-siswa')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'scanner-siswa'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'scanner-siswa' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <ScanLine className={`w-5 h-5 ${activeTab === 'scanner-siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <span>Kamera Scan Siswa</span>
            </button>

            {/* KHN Siswa */}
            <button
              onClick={() => onTabChange('khn-siswa')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'khn-siswa'
                  ? 'text-[#00B884] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {activeTab === 'khn-siswa' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
              )}
              <FileCheck className={`w-5 h-5 ${activeTab === 'khn-siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
              <span>KHN Siswa</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Section: UMUM matching screenshot */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-3 px-3">
          UMUM
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('pengaturan')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'pengaturan'
                ? 'text-[#00B884] font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span>Pengaturan</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition-all"
          >
            <LogOut className="w-5 h-5 text-slate-500" />
            <span>Keluar</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
