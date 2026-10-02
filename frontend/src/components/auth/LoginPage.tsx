import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  Award,
  AlertCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { User, Role } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

interface DemoAccountItem {
  label: string;
  role: Role;
  username: string;
  password: string;
  roleBadge: string;
  personName: string;
}

const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    label: 'Administrator Sistem',
    role: 'ADMIN',
    username: 'admin',
    password: 'admin123',
    roleBadge: 'Super Admin',
    personName: 'Administrator Sistem',
  },
  {
    label: 'Koordinator Eskul',
    role: 'KOORDINATOR',
    username: 'koordinator',
    password: 'admin123',
    roleBadge: 'Koordinator Eskul',
    personName: 'Viska Adawiyah Zulkarnaen, S.Pd.',
  },
  {
    label: 'Wakasek Kesiswaan',
    role: 'KOORDINATOR',
    username: 'mulyadi',
    password: 'admin123',
    roleBadge: 'Admin Kesiswaan',
    personName: 'Drs. H. Mulyadi, M.Pd.',
  },
  {
    label: 'Admin IT Sistem PKM',
    role: 'ADMIN',
    username: 'admin.it',
    password: 'admin123',
    roleBadge: 'SysAdmin',
    personName: 'Ryon Syaputra, S.Kom.',
  },
  {
    label: 'Guru Pembina Eskul',
    role: 'PEMBINA',
    username: 'ahmad.futsal',
    password: 'pembina123',
    roleBadge: 'Pembina Futsal',
    personName: 'Ahmad Syafii, S.Pd.',
  },
  {
    label: 'Wali Kelas X RPL 1',
    role: 'WALI_KELAS',
    username: 'walikelas',
    password: 'walikelas123',
    roleBadge: 'Wali Kelas',
    personName: 'Siti Nurhaliza, M.Pd.',
  },
  {
    label: 'Siswa Mandiri',
    role: 'SISWA',
    username: '20241001',
    password: 'al_amanah_001',
    roleBadge: 'NIS: 20241001',
    personName: 'Muhammad Farhan Al-Fatih',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [selectedDemoLabel, setSelectedDemoLabel] = useState<string>('Administrator Sistem');
  const [shakeKey, setShakeKey] = useState(0);

  const handleSelectQuickAccount = (item: DemoAccountItem) => {
    setUsername(item.username);
    setPassword(item.password);
    setSelectedDemoLabel(item.label);
    setErrorMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Mohon masukkan nama pengguna dan kata sandi Anda.');
      setShakeKey(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.login(username.trim(), password.trim());
      if (response && response.user) {
        if (rememberMe) {
          localStorage.setItem('al_amanah_user_session', JSON.stringify(response.user));
          if (response.token) {
            localStorage.setItem('al_amanah_auth_token', response.token);
          }
        }
        onLoginSuccess(response.user);
      } else {
        throw new Error('Respons autentikasi dari server tidak valid.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Nama pengguna atau kata sandi tidak cocok. Silakan coba lagi.');
      setShakeKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EEF1F5] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#00B884]/20 selection:text-[#00B884]">
      {/* Background Soft Pattern Elements matching Dashboard */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#00B884]/10 blur-3xl" />
      </div>

      {/* Main Unified Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Column: Authentic School Branding & Features (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-[#E8F8F2] via-[#F4FBF8] to-[#FFFFFF] border-r border-slate-200/70 relative">
          <div>
            {/* School Emblem & Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <img
                src="/logo-smk.png"
                alt="Logo SMK Al Amanah"
                className="w-14 h-14 object-contain shrink-0 drop-shadow-sm"
              />
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#00B884] uppercase bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  SMK AL AMANAH
                </span>
                <h1 className="text-base font-bold text-slate-800 tracking-tight mt-0.5">
                  Kota Tangerang Selatan
                </h1>
                <p className="text-[11px] text-slate-500 font-normal">Yayasan Al Amanah Al Bantani</p>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 mt-8">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug">
                Sistem Presensi & Manajemen Ekstrakurikuler
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Portal resmi pemantauan kehadiran eskul real-time berbasis Dynamic QR Code, pembinaan karakter, dan pencatatan nilai rapor siswa.
              </p>
            </div>

            {/* School Feature Points */}
            <div className="space-y-2.5 mt-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#00B884]/10 text-[#00B884] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Presensi QR Dinamis</div>
                  <div className="text-[11px] text-slate-500">Presensi aman anti-titip absen 15 detik</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Akses Berbasis Peran</div>
                  <div className="text-[11px] text-slate-500">Koordinator, Pembina, Wali Kelas, & Siswa</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Rekapitulasi Nilai & Rapor</div>
                  <div className="text-[11px] text-slate-500">Predikat nilai A/B/C dan ekspor resmi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Motto */}
          <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>T.A. 2026/2027 Ganjil</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B884] inline-block animate-pulse" />
              Sistem Aktif
            </span>
          </div>
        </div>

        {/* Right Column: Clean Form Matching Website Styles */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-center">
          {/* Mobile Header (Shown on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <img
              src="/logo-smk.png"
              alt="Logo SMK Al Amanah"
              className="w-12 h-12 object-contain shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#00B884] uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                SMK AL AMANAH
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-0.5">Sistem Presensi Eskul</h2>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Silakan masuk menggunakan kredensial akun sekolah Anda.
            </p>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key={shakeKey}
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: [0, -6, 6, -4, 4, -2, 2, 0],
                }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Pengguna / NIP / NIS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau 20241001"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00B884] focus:ring-2 focus:ring-[#00B884]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400 hover:text-[#00B884] cursor-pointer transition-colors">
                  Format sandi siswa: al_amanah_xxx
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00B884] focus:ring-2 focus:ring-[#00B884]/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Lihat kata sandi"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00B884] focus:ring-0 focus:ring-offset-0 transition-colors accent-[#00B884]"
                />
                <span className="text-xs text-slate-600">Ingat sesi saya di peramban ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clean Quick Credentials Accordion / Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00B884]" />
                <span className="text-xs font-semibold text-slate-700">
                  Pilih Kredensial Cepat (Klik untuk Isi Formulir)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {selectedDemoLabel}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDemoSelector ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showDemoSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 overflow-hidden"
              >
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = username === acc.username;
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 border-[#00B884] text-slate-800'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-slate-800">{acc.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isSelected ? 'bg-[#00B884] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {acc.roleBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mb-1.5">{acc.personName}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                        <span>User: <strong className="text-slate-700">{acc.username}</strong></span>
                        <span>Pass: <strong className="text-slate-700">{acc.password}</strong></span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
