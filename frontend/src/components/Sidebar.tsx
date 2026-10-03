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
  FileCheck,
  GraduationCap,
  CreditCard,
  UserCheck,
  ChevronDown,
  CalendarClock,
  UserPlus,
  ClipboardCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchoolLogo } from './SchoolLogo';
import { Role } from '../types';

export type NavItemKey = 
  | 'beranda'
  | 'eskul'
  | 'pembina'
  | 'guru'
  | 'siswa'
  | 'kelas'
  | 'laporan'
  | 'pengaturan'
  | 'dynamic-qr'
  | 'scanner-guru'
  | 'live-presensi'
  | 'penilaian'
  | 'scanner-siswa'
  | 'kartu-siswa'
  | 'khn-siswa'
  | 'validasi-jadwal'
  | 'validasi-pendaftaran'
  | 'pembina-pendaftaran'
  | 'alur-absensi';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  currentRole: Role;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
  pendingJadwalCount?: number;
  pendingPendaftaranCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  isDesktopOpen = true,
  onToggleDesktop,
  pendingJadwalCount = 0,
  pendingPendaftaranCount = 0,
}) => {
  const [isValidasiDropdownOpen, setIsValidasiDropdownOpen] = React.useState(
    activeTab === 'validasi-jadwal' || activeTab === 'validasi-pendaftaran'
  );

  React.useEffect(() => {
    if (activeTab === 'validasi-jadwal' || activeTab === 'validasi-pendaftaran') {
      setIsValidasiDropdownOpen(true);
    }
  }, [activeTab]);
  const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
  const isPembina = currentRole === 'PEMBINA';
  const isWaliKelas = currentRole === 'WALI_KELAS';
  const isSiswa = currentRole === 'SISWA';

  const handleTabClick = (tab: NavItemKey) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Content of navigation menus
  const renderNavItems = () => (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1.5 space-y-4 my-1 flex flex-col justify-start" style={{ scrollbarWidth: 'thin' }}>
      {/* 1. MENU KOORDINATOR / ADMIN UTAMA */}
      {isKoordinator && (
        <>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
              {currentRole === 'ADMIN' ? 'MENU ADMINISTRATOR' : 'MENU KOORDINATOR'}
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('beranda')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'beranda'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'beranda' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <LayoutGrid className={`w-5 h-5 shrink-0 ${activeTab === 'beranda' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Beranda</span>
              </button>

              <button
                onClick={() => handleTabClick('eskul')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'eskul'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'eskul' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <Volleyball className={`w-5 h-5 shrink-0 ${activeTab === 'eskul' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Kelola Eskul</span>
              </button>

              <button
                onClick={() => handleTabClick('pembina')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'pembina'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'pembina' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <UserCheck className={`w-5 h-5 shrink-0 ${activeTab === 'pembina' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Data Pembina</span>
              </button>

              <button
                onClick={() => handleTabClick('guru')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'guru'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'guru' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <UsersRound className={`w-5 h-5 shrink-0 ${activeTab === 'guru' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Guru & Wali</span>
              </button>

              <button
                onClick={() => handleTabClick('siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <Contact className={`w-5 h-5 shrink-0 ${activeTab === 'siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Data Siswa</span>
              </button>

              <button
                onClick={() => handleTabClick('kelas')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'kelas'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'kelas' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <GraduationCap className={`w-5 h-5 shrink-0 ${activeTab === 'kelas' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Kelas & Rombel</span>
              </button>

              <button
                onClick={() => handleTabClick('laporan')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'laporan'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'laporan' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <FileSpreadsheet className={`w-5 h-5 shrink-0 ${activeTab === 'laporan' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Laporan & Rekap</span>
              </button>
            </nav>
          </div>

          {/* MENU VALIDASI & PERSETUJUAN (DROPDOWN) */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3 flex items-center justify-between">
              <span>VALIDASI & PERSETUJUAN</span>
              {(pendingJadwalCount + pendingPendaftaranCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setIsValidasiDropdownOpen(!isValidasiDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'validasi-jadwal' || activeTab === 'validasi-pendaftaran'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <FileCheck className={`w-5 h-5 shrink-0 ${activeTab === 'validasi-jadwal' || activeTab === 'validasi-pendaftaran' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                  <span className="truncate">Menu Validasi</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(pendingJadwalCount + pendingPendaftaranCount > 0) && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                      {pendingJadwalCount + pendingPendaftaranCount}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: isValidasiDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              {/* Dropdown Subitems */}
              <AnimatePresence initial={false}>
                {isValidasiDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden pl-4 pr-1 space-y-1 pt-1"
                  >
                    <button
                      onClick={() => handleTabClick('validasi-jadwal')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'validasi-jadwal'
                          ? 'text-[#00B884] bg-emerald-100/70 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CalendarClock className={`w-4 h-4 shrink-0 ${activeTab === 'validasi-jadwal' ? 'text-[#00B884]' : 'text-slate-400'}`} />
                        <span className="truncate">Validasi Jadwal</span>
                      </div>
                      {pendingJadwalCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {pendingJadwalCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleTabClick('validasi-pendaftaran')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'validasi-pendaftaran'
                          ? 'text-[#00B884] bg-emerald-100/70 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'validasi-pendaftaran' ? 'text-[#00B884]' : 'text-slate-400'}`} />
                        <span className="truncate">Validasi Pendaftaran</span>
                      </div>
                      {pendingPendaftaranCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {pendingPendaftaranCount}
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
              PEMANTAUAN
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('live-presensi')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'live-presensi'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'live-presensi' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <UsersRound className={`w-5 h-5 shrink-0 ${activeTab === 'live-presensi' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <div className="text-left flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Presensi Langsung</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                </div>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* 2. MENU GURU PEMBINA ESKUL */}
      {isPembina && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
              MENU UTAMA
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('beranda')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'beranda'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'beranda' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <LayoutGrid className={`w-5 h-5 shrink-0 ${activeTab === 'beranda' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Beranda</span>
              </button>

              <button
                onClick={() => handleTabClick('siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <Contact className={`w-5 h-5 shrink-0 ${activeTab === 'siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Daftar Siswa</span>
              </button>

              <button
                onClick={() => handleTabClick('pembina-pendaftaran')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'pembina-pendaftaran'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'pembina-pendaftaran' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <UserPlus className={`w-5 h-5 shrink-0 ${activeTab === 'pembina-pendaftaran' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Pendaftaran Siswa</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3 flex items-center justify-between">
              <span>PRESENSI & NILAI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">GURU</span>
            </div>
            <nav className="space-y-1">
              {/* Alur Presensi Multi-Tahap (Utama) */}
              <button
                onClick={() => handleTabClick('alur-absensi')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'alur-absensi'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'alur-absensi' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <ClipboardCheck className={`w-5 h-5 shrink-0 ${activeTab === 'alur-absensi' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate text-left">Alur Presensi 4-Tahap</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full ml-1 shrink-0">Resmi</span>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('dynamic-qr')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'dynamic-qr'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'dynamic-qr' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <QrCode className={`w-5 h-5 shrink-0 ${activeTab === 'dynamic-qr' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate text-left">QR Proyektor</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full ml-1 shrink-0">15s</span>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('scanner-guru')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'scanner-guru'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'scanner-guru' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <ScanLine className={`w-5 h-5 shrink-0 ${activeTab === 'scanner-guru' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Pindai Presensi</span>
              </button>

              <button
                onClick={() => handleTabClick('live-presensi')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'live-presensi'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'live-presensi' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <UsersRound className={`w-5 h-5 shrink-0 ${activeTab === 'live-presensi' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Presensi Langsung</span>
              </button>

              <button
                onClick={() => handleTabClick('penilaian')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'penilaian'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'penilaian' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <Award className={`w-5 h-5 shrink-0 ${activeTab === 'penilaian' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Nilai Rapor</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 3. MENU WALI KELAS */}
      {isWaliKelas && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
              MENU WALI KELAS
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('beranda')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'beranda'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'beranda' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <LayoutGrid className={`w-5 h-5 shrink-0 ${activeTab === 'beranda' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Beranda</span>
              </button>

              <button
                onClick={() => handleTabClick('siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <Contact className={`w-5 h-5 shrink-0 ${activeTab === 'siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Siswa Kelas</span>
              </button>

              <button
                onClick={() => handleTabClick('laporan')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'laporan'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'laporan' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <FileSpreadsheet className={`w-5 h-5 shrink-0 ${activeTab === 'laporan' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Rekap Nilai</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 4. MENU SISWA */}
      {isSiswa && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
              MENU SISWA
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('beranda')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'beranda'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'beranda' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <LayoutGrid className={`w-5 h-5 shrink-0 ${activeTab === 'beranda' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Jadwal Eskul</span>
              </button>

              <button
                onClick={() => handleTabClick('kartu-siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'kartu-siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'kartu-siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <CreditCard className={`w-5 h-5 shrink-0 ${activeTab === 'kartu-siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Kartu Digital</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3 flex items-center justify-between">
              <span>PRESENSI & HASIL</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">SISWA</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('scanner-siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'scanner-siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'scanner-siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <ScanLine className={`w-5 h-5 shrink-0 ${activeTab === 'scanner-siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Pindai QR Presensi</span>
              </button>

              <button
                onClick={() => handleTabClick('khn-siswa')}
                className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative cursor-pointer ${
                  activeTab === 'khn-siswa'
                    ? 'text-[#00B884] font-bold bg-emerald-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {activeTab === 'khn-siswa' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#00B884] rounded-r-md -ml-5" />
                )}
                <FileCheck className={`w-5 h-5 shrink-0 ${activeTab === 'khn-siswa' ? 'text-[#00B884]' : 'text-slate-500'}`} />
                <span className="truncate text-left">Nilai Rapor (KHN)</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );

  // Bottom section: pinned UMUM (Pengaturan & Keluar)
  const renderBottomSection = () => (
    <div className="pt-3 border-t border-slate-200/80 shrink-0 bg-[#F8F9FA]">
      <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
        UMUM
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => handleTabClick('pengaturan')}
          className={`w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'pengaturan'
              ? 'text-[#00B884] font-bold bg-emerald-50/70'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-500 shrink-0" />
          <span className="truncate text-left">Pengaturan</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-start text-left gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-slate-500 shrink-0" />
          <span className="truncate text-left">Keluar</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP STICKY SIDEBAR (Animated Spring Collapse / Expand) */}
      <AnimatePresence initial={false}>
        {isDesktopOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="hidden lg:flex overflow-hidden bg-[#F8F9FA] h-screen sticky top-0 border-r border-slate-200/80 flex-col justify-between select-none shrink-0 z-40"
          >
            <div className="w-64 h-full flex flex-col justify-between p-5 shrink-0">
              {/* School Branding */}
              <div className="pb-5 pt-1 px-1 shrink-0 flex items-center justify-between">
                <SchoolLogo size="md" showText={true} />
              </div>

              {/* Scrollable Navigation Area */}
              {renderNavItems()}

              {/* Settings & Logout (Pinned Bottom - never scrolls out of view!) */}
              {renderBottomSection()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MOBILE SLIDE-OUT DRAWER WITH BACKDROP (Visible on mobile when isMobileOpen is true) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Slide-in Mobile Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#F8F9FA] h-screen flex flex-col justify-between p-5 z-50 shadow-2xl lg:hidden select-none"
            >
              {/* Header with Logo and Close Button */}
              <div className="flex items-center justify-between pb-4 pt-1 px-1 shrink-0 border-b border-slate-200/60">
                <SchoolLogo size="sm" showText={true} />
                <button
                  onClick={onCloseMobile}
                  aria-label="Tutup Menu"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Area */}
              {renderNavItems()}

              {/* Pinned Bottom Controls */}
              {renderBottomSection()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
