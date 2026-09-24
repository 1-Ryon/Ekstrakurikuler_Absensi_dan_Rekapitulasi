import React, { useState } from 'react';
import { Search, Mail, Bell, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { Role, User } from '../types';

interface HeaderProps {
  currentUser: User;
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onSearch: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenMail: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  onSearch,
  onOpenNotifications,
  onOpenMail,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin Utama', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck };
      case 'PEMBINA':
        return { label: 'Guru Pembina', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserCheck };
      case 'SISWA':
        return { label: 'Siswa / Mobile', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Smartphone };
    }
  };

  const badge = getRoleBadge(currentRole);
  const IconComponent = badge.icon;

  return (
    <header className="w-full bg-[#EEF1F5] px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Input matching screenshot */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchVal}
          onChange={handleInputChange}
          placeholder="Cari..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] shadow-sm transition-all"
        />
        {searchVal && (
          <button
            onClick={() => { setSearchVal(''); onSearch(''); }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Right controls: Role Selector, Action Buttons, and User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Selector Simulator Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Ganti Mode Tampilan (Admin / Guru / Siswa)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all ${badge.bg}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>Mode: {badge.label}</span>
            <span className="text-[10px] opacity-60">▼</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pilih Simulasi Role
              </div>
              <button
                onClick={() => { onRoleChange('ADMIN'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                  currentRole === 'ADMIN' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-medium">Admin / Pembina Utama</div>
                  <div className="text-[10px] text-slate-400">Full Dashboard & Master Data</div>
                </div>
              </button>
              <button
                onClick={() => { onRoleChange('PEMBINA'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                  currentRole === 'PEMBINA' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Guru / Pembina Eskul</div>
                  <div className="text-[10px] text-slate-400">Dynamic QR & Live Presensi</div>
                </div>
              </button>
              <button
                onClick={() => { onRoleChange('SISWA'); setShowRoleMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                  currentRole === 'SISWA' ? 'bg-[#00B884]/10 text-[#00B884] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-medium">Siswa (Mobile / Scanner)</div>
                  <div className="text-[10px] text-slate-400">Scan QR Presensi & KHN</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Mail Icon Button matching screenshot */}
        <button
          onClick={onOpenMail}
          aria-label="Pesan Masuk"
          className="relative w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
        >
          <Mail className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#00B884] rounded-full ring-2 ring-white"></span>
        </button>

        {/* Bell / Notification Icon Button matching screenshot */}
        <button
          onClick={onOpenNotifications}
          aria-label="Pemberitahuan"
          className="relative w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* Profile Area matching screenshot: photo avatar + Viska Adawiyah Zulkarnaen, S.Pd. */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.namaLengkap}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00B884] shadow-sm group-hover:ring-[#00B884]/80 transition-all"
              onError={(e) => {
                // Fallback to stylized SVG avatar
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback circle if image fails */}
            <div className="w-10 h-10 rounded-full bg-[#00B884] hidden items-center justify-center text-white font-bold text-sm shadow-sm">
              VA
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#00B884] transition-colors">
              {currentUser.namaLengkap}
            </span>
            <span className="text-[11px] font-normal text-slate-500 leading-none">
              {currentUser.spesialisasi || 'Koordinator Ekstrakurikuler'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
