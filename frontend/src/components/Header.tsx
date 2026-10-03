import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  Menu, 
  LogOut, 
  X, 
  Volleyball, 
  Users, 
  Building2, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Lock,
  LayoutGrid,
  FileSpreadsheet,
  Award,
  CreditCard,
  ScanLine,
  Phone,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, User, Eskul, StudentProfile, Guru, Kelas } from '../types';
import { NavItemKey } from './Sidebar';
import { UserAvatar } from './common/UserAvatar';
import { ProfileModal } from './modals/ProfileModal';

interface HeaderProps {
  currentUser?: User | null;
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  canSwitchRole?: boolean;
  onSearch: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenMail: () => void;
  onToggleMobileMenu?: () => void;
  onToggleDesktopSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
  onLogout?: () => void;
  // Global Search Data & Navigation Callbacks
  eskulList?: Eskul[];
  students?: StudentProfile[];
  guruList?: Guru[];
  kelasList?: Kelas[];
  onNavigateTab?: (tab: NavItemKey) => void;
  onSelectEskul?: (eskul: Eskul) => void;
  onSelectStudent?: (student: StudentProfile) => void;
}

interface SystemMenuItem {
  id: string;
  tab: NavItemKey;
  label: string;
  desc: string;
  roles: Role[];
  icon: React.ComponentType<{ className?: string }>;
}

const SYSTEM_MENUS: SystemMenuItem[] = [
  { 
    id: 'menu-beranda', 
    tab: 'beranda', 
    label: 'Beranda / Dashboard', 
    desc: 'Halaman ringkasan, jadwal, dan aktivitas utama',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA', 'WALI_KELAS', 'SISWA'],
    icon: Sparkles
  },
  { 
    id: 'menu-eskul', 
    tab: 'eskul', 
    label: 'Kelola Ekstrakurikuler', 
    desc: 'Pengaturan master eskul, kuota, pembina, dan jadwal latihan',
    roles: ['ADMIN', 'KOORDINATOR'],
    icon: Volleyball
  },
  { 
    id: 'menu-pembina', 
    tab: 'pembina', 
    label: 'Data Guru Pembina', 
    desc: 'Manajemen akun dan penugasan guru pembina eskul',
    roles: ['ADMIN', 'KOORDINATOR'],
    icon: UserCheck
  },
  { 
    id: 'menu-guru', 
    tab: 'guru', 
    label: 'Data Guru & Wali Kelas', 
    desc: 'Manajemen tenaga pendidik dan wali kelas rombel',
    roles: ['ADMIN', 'KOORDINATOR'],
    icon: Users
  },
  { 
    id: 'menu-siswa', 
    tab: 'siswa', 
    label: 'Data Anggota & Siswa', 
    desc: 'Daftar profil siswa, nomor induk, dan eskul pilihan',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA', 'WALI_KELAS'],
    icon: GraduationCap
  },
  { 
    id: 'menu-kelas', 
    tab: 'kelas', 
    label: 'Kelas & Rombel', 
    desc: 'Struktur kelas rombel dan penugasan wali kelas',
    roles: ['ADMIN', 'KOORDINATOR'],
    icon: Building2
  },
  { 
    id: 'menu-laporan', 
    tab: 'laporan', 
    label: 'Laporan & Rekap Nilai', 
    desc: 'Statistik kehadiran, rekapitulasi nilai rapor eskul',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA', 'WALI_KELAS'],
    icon: Layers
  },
  { 
    id: 'menu-live', 
    tab: 'live-presensi', 
    label: 'Presensi Langsung (Live)', 
    desc: 'Pemantauan absensi real-time kompleks sekolah',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA'],
    icon: Users
  },
  { 
    id: 'menu-qr', 
    tab: 'dynamic-qr', 
    label: 'Dynamic QR Proyektor', 
    desc: 'Generator QR code terenkripsi untuk presensi proyektor',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA'],
    icon: Sparkles
  },
  { 
    id: 'menu-scanner-guru', 
    tab: 'scanner-guru', 
    label: 'Pindai Kartu Siswa (Kamera)', 
    desc: 'Pemindai kamera pembina untuk scan ID Card fisik',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA'],
    icon: Sparkles
  },
  { 
    id: 'menu-penilaian', 
    tab: 'penilaian', 
    label: 'Penilaian Rapor Ekstrakurikuler', 
    desc: 'Input nilai predikat dan deskripsi capaian rapor',
    roles: ['ADMIN', 'KOORDINATOR', 'PEMBINA'],
    icon: Sparkles
  },
  { 
    id: 'menu-scanner-siswa', 
    tab: 'scanner-siswa', 
    label: 'Pindai QR Presensi Siswa', 
    desc: 'Kamera scanner siswa untuk scan QR proyektor',
    roles: ['SISWA'],
    icon: Smartphone
  },
  { 
    id: 'menu-kartu-siswa', 
    tab: 'kartu-siswa', 
    label: 'Kartu Pelajar Digital Siswa', 
    desc: 'ID Card digital siswa dengan barcode/QR identitas',
    roles: ['SISWA'],
    icon: Smartphone
  },
  { 
    id: 'menu-khn-siswa', 
    tab: 'khn-siswa', 
    label: 'Kartu Hasil Nilai (KHN)', 
    desc: 'Lembar hasil evaluasi dan nilai ekstrakurikuler siswa',
    roles: ['SISWA'],
    icon: Smartphone
  },
];

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const cleanQ = query.trim();
  if (!cleanQ) return text;
  const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === cleanQ.toLowerCase() ? (
          <mark key={i} className="bg-[#00B884]/20 text-[#008f66] font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  canSwitchRole = (currentUser?.role === 'ADMIN' || currentUser?.username === 'admin'),
  onSearch,
  onOpenNotifications,
  onOpenMail,
  onToggleMobileMenu,
  onToggleDesktopSidebar,
  isDesktopSidebarOpen = true,
  onLogout,
  eskulList = [],
  students = [],
  guruList = [],
  kelasList = [],
  onNavigateTab,
  onSelectEskul,
  onSelectStudent,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'menu' | 'eskul' | 'guru' | 'siswa' | 'kelas'>('all');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [previewDetail, setPreviewDetail] = useState<{
    type: 'eskul' | 'guru' | 'siswa' | 'kelas';
    item: any;
  } | null>(null);

  const isKoordinator = currentRole === 'ADMIN' || currentRole === 'KOORDINATOR';
  const isPembina = currentRole === 'PEMBINA';
  const isWaliKelas = currentRole === 'WALI_KELAS';
  const isSiswa = currentRole === 'SISWA';

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const query = searchVal.trim().toLowerCase();

  // Search Results Calculation (Strictly Filtered by Current Role Access)
  const results = useMemo(() => {
    if (!query) {
      return { menus: [], eskuls: [], gurus: [], students: [], kelas: [], total: 0 };
    }

    // 0. System Menus: ONLY match menus permitted for the current user's role!
    const matchedMenus = SYSTEM_MENUS.filter((m) => {
      if (!m.roles.includes(currentRole)) return false;
      return (
        m.label.toLowerCase().includes(query) ||
        m.desc.toLowerCase().includes(query) ||
        m.tab.toLowerCase().includes(query)
      );
    });

    const matchedEskuls = eskulList.filter((e) =>
      e.namaEskul.toLowerCase().includes(query) ||
      (e.kategori && e.kategori.toLowerCase().includes(query)) ||
      (e.pembinaNama && e.pembinaNama.toLowerCase().includes(query)) ||
      (e.lokasi && e.lokasi.toLowerCase().includes(query)) ||
      (e.jadwalHari && e.jadwalHari.toLowerCase().includes(query))
    );

    const matchedGurus = guruList.filter((g) =>
      g.namaLengkap.toLowerCase().includes(query) ||
      (g.nip && g.nip.toLowerCase().includes(query)) ||
      (g.spesialisasi && g.spesialisasi.toLowerCase().includes(query)) ||
      (g.username && g.username.toLowerCase().includes(query))
    );

    const matchedStudents = students.filter((s) =>
      s.namaLengkap.toLowerCase().includes(query) ||
      (s.nis && s.nis.toLowerCase().includes(query)) ||
      (s.nisn && s.nisn.toLowerCase().includes(query)) ||
      (s.kelas && s.kelas.toLowerCase().includes(query))
    );

    const matchedKelas = kelasList.filter((k) =>
      k.namaKelas.toLowerCase().includes(query) ||
      (k.jurusan && k.jurusan.toLowerCase().includes(query)) ||
      (k.waliKelas?.namaLengkap && k.waliKelas.namaLengkap.toLowerCase().includes(query))
    );

    const total = matchedMenus.length + matchedEskuls.length + matchedGurus.length + matchedStudents.length + matchedKelas.length;
    return {
      menus: matchedMenus,
      eskuls: matchedEskuls,
      gurus: matchedGurus,
      students: matchedStudents,
      kelas: matchedKelas,
      total,
    };
  }, [query, currentRole, eskulList, guruList, students, kelasList]);

  // Keyboard shortcut Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
    if (!isSearchOpen) setIsSearchOpen(true);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    onSearch('');
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  const handleItemClick = (action: () => void) => {
    action();
    setIsSearchOpen(false);
    setSearchVal('');
    onSearch('');
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', fullLabel: 'Administrator Sistem', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck };
      case 'KOORDINATOR':
        return { label: 'Koordinator', fullLabel: 'Koordinator Eskul', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: ShieldCheck };
      case 'PEMBINA':
        return { label: 'Pembina', fullLabel: 'Guru Pembina', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserCheck };
      case 'WALI_KELAS':
        return { label: 'Wali Kelas', fullLabel: 'Wali Kelas', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCheck };
      case 'SISWA':
        return { label: 'Siswa', fullLabel: 'Siswa', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Smartphone };
    }
  };

  const badge = getRoleBadge(currentRole);
  const IconComponent = badge.icon;

  return (
    <header className="w-full bg-[#EEF1F5] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Left: Mobile Hamburger & Interactive Global Search Input */}
      <div className="flex items-center gap-2.5 flex-1 max-w-lg relative" ref={searchContainerRef}>
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Buka Menu Navigasi"
            className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Sidebar Toggle Button */}
        {onToggleDesktopSidebar && (
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            aria-label="Sembunyikan / Tampilkan Menu Sidebar"
            title={isDesktopSidebarOpen ? "Sembunyikan Menu Sidebar" : "Tampilkan Menu Sidebar"}
            className="hidden lg:flex p-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-[#00B884] hover:bg-slate-50 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer items-center justify-center"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Interactive Global Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchVal}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchVal.trim()) setIsSearchOpen(true);
            }}
            placeholder="Cari eskul, siswa, pembina, kelas..."
            className="w-full pl-9 sm:pl-10 pr-20 py-2 bg-white border border-slate-200/90 rounded-full text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B884]/30 focus:border-[#00B884] shadow-xs transition-all"
          />

          {/* Right Action within Search Input */}
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchVal ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Hapus pencarian"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Real-time Global Search Floating Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchVal.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute left-0 right-0 sm:-right-20 top-full mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 flex flex-col max-h-[460px] animate-in"
              >
                {/* Header Summary & Category Filters */}
                <div className="p-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#00B884]" />
                    <span>Ditemukan <strong className="text-slate-900">{results.total}</strong> hasil</span>
                  </div>

                  {/* Filter Pills */}
                  {results.total > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFilterCategory('all')}
                        className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          filterCategory === 'all'
                            ? 'bg-[#00B884] text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                        }`}
                      >
                        Semua ({results.total})
                      </button>
                      {results.menus.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterCategory('menu')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            filterCategory === 'menu'
                              ? 'bg-[#00B884] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                          }`}
                        >
                          Menu ({results.menus.length})
                        </button>
                      )}
                      {results.eskuls.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterCategory('eskul')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            filterCategory === 'eskul'
                              ? 'bg-[#00B884] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                          }`}
                        >
                          Eskul ({results.eskuls.length})
                        </button>
                      )}
                      {results.gurus.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterCategory('guru')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            filterCategory === 'guru'
                              ? 'bg-[#00B884] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                          }`}
                        >
                          Guru ({results.gurus.length})
                        </button>
                      )}
                      {results.students.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterCategory('siswa')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            filterCategory === 'siswa'
                              ? 'bg-[#00B884] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                          }`}
                        >
                          Siswa ({results.students.length})
                        </button>
                      )}
                      {results.kelas.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterCategory('kelas')}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            filterCategory === 'kelas'
                              ? 'bg-[#00B884] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/70'
                          }`}
                        >
                          Kelas ({results.kelas.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                  {results.total === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2.5">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Tidak ada hasil untuk "{searchVal}"</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Coba cari berdasarkan nama menu, cabang eskul, pembina, nama siswa, atau kelas.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 0. KATEGORI MENU SISTEM (Hanya menu yang diizinkan untuk role saat ini) */}
                      {(filterCategory === 'all' || filterCategory === 'menu') && results.menus.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-[#00B884]" />
                            <span>Menu & Navigasi Cepat ({results.menus.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {results.menus.map((menu) => {
                              const MenuIcon = menu.icon || Sparkles;
                              return (
                                <button
                                  key={menu.id}
                                  type="button"
                                  onClick={() => handleItemClick(() => {
                                    onNavigateTab?.(menu.tab);
                                  })}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200/60 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00B884] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                      <MenuIcon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#00B884] transition-colors truncate">
                                        {highlightMatch(menu.label, query)}
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                        {highlightMatch(menu.desc, query)}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-semibold text-[#00B884] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0 flex items-center gap-1">
                                    Buka Menu <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 1. KATEGORI ESKUL */}
                      {(filterCategory === 'all' || filterCategory === 'eskul') && results.eskuls.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Volleyball className="w-3 h-3 text-[#00B884]" />
                            <span>Cabang Ekstrakurikuler ({results.eskuls.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {results.eskuls.map((eskul) => (
                              <button
                                key={`eskul-${eskul.id}`}
                                type="button"
                                onClick={() => handleItemClick(() => {
                                  if (isKoordinator) {
                                    onNavigateTab?.('eskul');
                                    onSelectEskul?.(eskul);
                                  } else {
                                    setPreviewDetail({ type: 'eskul', item: eskul });
                                  }
                                })}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-100 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                    <Volleyball className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#00B884] transition-colors truncate">
                                      {highlightMatch(eskul.namaEskul, query)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                      <span className="font-medium text-slate-600">Pembina: {highlightMatch(eskul.pembinaNama, query)}</span>
                                      <span>•</span>
                                      <span>{eskul.jadwalHari} {eskul.jamMulai}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                                  {isKoordinator ? 'Kelola Eskul' : 'Lihat Detail'} <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. KATEGORI GURU & PEMBINA */}
                      {(filterCategory === 'all' || filterCategory === 'guru') && results.gurus.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                            <span>Guru & Pembina ({results.gurus.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {results.gurus.map((guru) => (
                              <button
                                key={`guru-${guru.id}`}
                                type="button"
                                onClick={() => handleItemClick(() => {
                                  if (isKoordinator) {
                                    onNavigateTab?.(guru.isPembina ? 'pembina' : 'guru');
                                  } else {
                                    setPreviewDetail({ type: 'guru', item: guru });
                                  }
                                })}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <UserAvatar
                                    name={guru.namaLengkap}
                                    className="w-8 h-8 rounded-lg ring-1 ring-blue-200 text-xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                      {highlightMatch(guru.namaLengkap, query)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                      <span>{highlightMatch(guru.spesialisasi || 'Guru Pendidik', query)}</span>
                                      {guru.nip && guru.nip !== '-' && (
                                        <span className="ml-1.5 font-mono text-[9px] text-slate-400">
                                          NIP: {highlightMatch(guru.nip, query)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0 flex items-center gap-1">
                                  {isKoordinator ? (guru.isPembina ? 'Kelola Pembina' : 'Kelola Guru') : 'Profil Guru'} <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. KATEGORI SISWA */}
                      {(filterCategory === 'all' || filterCategory === 'siswa') && results.students.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <GraduationCap className="w-3 h-3 text-amber-500" />
                            <span>Data Siswa ({results.students.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {results.students.map((student) => (
                              <button
                                key={`student-${student.id}`}
                                type="button"
                                onClick={() => handleItemClick(() => {
                                  if (isKoordinator) {
                                    onNavigateTab?.('siswa');
                                    onSelectStudent?.(student);
                                  } else if (isSiswa) {
                                    if (student.nis === currentUser?.username || student.id === currentUser?.id) {
                                      onNavigateTab?.('kartu-siswa');
                                    } else {
                                      setPreviewDetail({ type: 'siswa', item: student });
                                    }
                                  } else {
                                    // Pembina & Wali Kelas: navigate to siswa (safe view) or preview
                                    onNavigateTab?.('siswa');
                                    onSelectStudent?.(student);
                                  }
                                })}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-100 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <UserAvatar
                                    name={student.namaLengkap}
                                    className="w-8 h-8 rounded-lg ring-1 ring-amber-200 text-xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                                      {highlightMatch(student.namaLengkap, query)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                      <span className="bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded text-[9px]">
                                        {highlightMatch(student.kelas || '-', query)}
                                      </span>
                                      <span className="font-mono text-[9px] text-slate-400">
                                        NIS: {highlightMatch(student.nis || student.nomorInduk || '-', query)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 flex items-center gap-1">
                                  {isKoordinator || isPembina ? 'Profil Siswa' : 'Lihat Data'} <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. KATEGORI KELAS */}
                      {(filterCategory === 'all' || filterCategory === 'kelas') && results.kelas.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-purple-500" />
                            <span>Kelas & Rombel ({results.kelas.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {results.kelas.map((kls) => (
                              <button
                                key={`kelas-${kls.id}`}
                                type="button"
                                onClick={() => handleItemClick(() => {
                                  if (isKoordinator) {
                                    onNavigateTab?.('kelas');
                                  } else {
                                    setPreviewDetail({ type: 'kelas', item: kls });
                                  }
                                })}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-100 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                                      {highlightMatch(kls.namaKelas, query)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                      <span>Jurusan: {highlightMatch(kls.jurusan, query)}</span>
                                      {kls.waliKelas?.namaLengkap && (
                                        <span className="ml-1 text-slate-400">• Wali: {kls.waliKelas.namaLengkap}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 shrink-0 flex items-center gap-1">
                                  {isKoordinator ? 'Kelola Kelas' : 'Rincian Kelas'} <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Tip */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Hasil disaring otomatis berdasarkan hak akses peran aktif</span>
                  <span>Esc untuk menutup</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right controls: Role Selector, Action Buttons, and User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Selector Simulator Pill - Khusus Admin Testing */}
        {canSwitchRole && (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              title="Simulasi Tampilan Role (Khusus Admin Testing)"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold shadow-xs transition-all cursor-pointer ${badge.bg}`}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Simulasi:</span>
              <span>{badge.label}</span>
              <span className="text-[10px] opacity-60">▼</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Pilih Simulasi Peran</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">UJI COBA ADMIN</span>
                </div>
                <button
                  onClick={() => { onRoleChange('ADMIN'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentRole === 'ADMIN' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-medium">Administrator Sistem</div>
                    <div className="text-[10px] text-slate-400">Super Admin & Kelola Sistem PKM</div>
                  </div>
                </button>
                <button
                  onClick={() => { onRoleChange('KOORDINATOR'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentRole === 'KOORDINATOR' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <div className="font-medium">Koordinator Eskul</div>
                    <div className="text-[10px] text-slate-400">Viska Adawiyah Z. - Kelola Eskul & Pembina</div>
                  </div>
                </button>
                <button
                  onClick={() => { onRoleChange('PEMBINA'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentRole === 'PEMBINA' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-medium">Guru Pembina Eskul</div>
                    <div className="text-[10px] text-slate-400">QR Dinamis & Masukkan Nilai</div>
                  </div>
                </button>
                <button
                  onClick={() => { onRoleChange('WALI_KELAS'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentRole === 'WALI_KELAS' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-medium">Wali Kelas</div>
                    <div className="text-[10px] text-slate-400">Rekap Nilai Siswa Binaan Kelas</div>
                  </div>
                </button>
                <button
                  onClick={() => { onRoleChange('SISWA'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentRole === 'SISWA' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-medium">Siswa</div>
                    <div className="text-[10px] text-slate-400">Pindai QR Presensi & Lihat KHN</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mail Icon Button */}
        <button
          onClick={onOpenMail}
          aria-label="Pesan Masuk"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#00B884] rounded-full ring-2 ring-white"></span>
        </button>

        {/* Bell / Notification Icon Button */}
        <button
          onClick={onOpenNotifications}
          aria-label="Pemberitahuan"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* Profile Area with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 cursor-pointer group text-left focus:outline-none"
          >
            <div className="relative">
              <UserAvatar
                name={currentUser?.namaLengkap || 'User'}
                className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-[#00B884] shadow-xs group-hover:ring-[#00B884]/80 text-xs sm:text-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00B884] border-2 border-white rounded-full"></span>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-[#00B884] transition-colors truncate max-w-[130px]">
                {currentUser?.namaLengkap || 'Administrator'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-normal text-slate-500 leading-none truncate max-w-[130px]">
                {currentUser?.spesialisasi || (currentRole === 'ADMIN' ? 'Administrator Sistem' : 'Koordinator Eskul')}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-95">
              {/* Header Info Card */}
              <div className="p-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    name={currentUser?.namaLengkap || 'Administrator'}
                    className="w-10 h-10 ring-2 ring-[#00B884]/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {currentUser?.namaLengkap || 'Administrator'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">@{currentUser?.username || 'admin'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wide">
                    {currentUser?.role || currentRole}
                  </span>
                  {currentUser?.nomorInduk && (
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      ID: {currentUser.nomorInduk}
                    </span>
                  )}
                </div>
              </div>

              {/* Data Summary Rows */}
              <div className="py-2.5 px-1 space-y-1.5 text-[11px] text-slate-600 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jabatan:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">
                    {currentUser?.spesialisasi || (currentRole === 'ADMIN' ? 'Administrator Sistem' : 'Koordinator Eskul')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Unit Kerja:</span>
                  <span className="font-medium text-slate-800">SMK Al Amanah</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Akun:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif Terverifikasi
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#00B884]" />
                  <span>Lihat Rincian Profil Lengkap</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar dari Akun</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Detail Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={onLogout}
      />

      {/* Read-Only Search Detail Preview Modal for Non-Admin */}
      {previewDetail && (
        <SearchDetailModal
          preview={previewDetail}
          onClose={() => setPreviewDetail(null)}
        />
      )}
    </header>
  );
};

// ==========================================
// Read-Only Search Detail Preview Modal
// Strictly prevents unauthorized navigation to Admin modules
// ==========================================
interface SearchDetailModalProps {
  preview: {
    type: 'eskul' | 'guru' | 'siswa' | 'kelas';
    item: any;
  };
  onClose: () => void;
}

const SearchDetailModal: React.FC<SearchDetailModalProps> = ({ preview, onClose }) => {
  const { type, item } = preview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00B884]/10 text-[#00B884]">
              {type === 'eskul' && <Volleyball className="w-5 h-5" />}
              {type === 'guru' && <UserCheck className="w-5 h-5" />}
              {type === 'siswa' && <GraduationCap className="w-5 h-5" />}
              {type === 'kelas' && <Building2 className="w-5 h-5" />}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pratinjau Data Informasi
              </span>
              <h3 className="text-base font-bold text-slate-800">
                {type === 'eskul' && 'Rincian Ekstrakurikuler'}
                {type === 'guru' && 'Profil Tenaga Pendidik'}
                {type === 'siswa' && 'Data Profil Siswa'}
                {type === 'kelas' && 'Rombongan Belajar (Rombel)'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {type === 'eskul' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-extrabold text-slate-900">{item.namaEskul}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00B884] text-white">
                    {item.kategori || 'Ekstrakurikuler'}
                  </span>
                </div>
                <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                  {item.deskripsi || 'Kegiatan ekstrakurikuler pembinaan bakat dan minat siswa SMK Al Amanah.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Guru Pembina</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#00B884]" />
                    <span>{item.pembinaNama || '-'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Jadwal Latihan</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{item.jadwalHari}, {item.jamMulai} - {item.jamSelesai}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Lokasi Kegiatan</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{item.lokasi || 'Lingkungan SMK Al Amanah'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Pengaturan jadwal dan penetapan pembina eskul ini dikelola terpusat oleh Koordinator Ekstrakurikuler.
                </span>
              </div>
            </div>
          )}

          {type === 'guru' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <UserAvatar name={item.namaLengkap} className="w-14 h-14 ring-2 ring-blue-300 text-base shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-base">{item.namaLengkap}</h4>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">{item.spesialisasi || 'Guru Pendidik'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {item.isPembina ? 'Guru Pembina Eskul' : 'Wali Kelas / Guru Mata Pelajaran'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">NIP Resmi:</span>
                  <span className="font-mono font-bold text-slate-800">{item.nip || '-'}</span>
                </div>
                {item.email && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Email Satuan Pendidikan:</span>
                    <span className="font-medium text-slate-800">{item.email}</span>
                  </div>
                )}
                {item.noHp && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Kontak WhatsApp:</span>
                    <span className="font-medium text-slate-800">{item.noHp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'siswa' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <UserAvatar name={item.namaLengkap} className="w-14 h-14 ring-2 ring-emerald-300 text-base shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-base">{item.namaLengkap}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="font-semibold text-slate-800">{item.kelas || '-'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">NIS: {item.nis || item.nomorInduk || '-'}</span>
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Siswa Aktif Terdaftar
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">NISN</span>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">{item.nisn || '-'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Jenis Kelamin</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {item.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-Laki'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Kredensial dan sandi login dilindungi ketat demi privasi data siswa.</span>
              </div>
            </div>
          )}

          {type === 'kelas' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-900">{item.namaKelas}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                    Tingkat {item.tingkat || 10}
                  </span>
                </div>
                <p className="text-xs text-purple-700 font-medium mt-1">
                  Kompetensi Keahlian: {item.jurusan || 'Teknologi & Bisnis'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Wali Kelas</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>{item.waliKelas?.namaLengkap || 'Belum Ditugaskan'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};

