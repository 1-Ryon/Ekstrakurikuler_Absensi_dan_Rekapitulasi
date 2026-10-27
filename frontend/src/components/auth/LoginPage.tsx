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
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Button, Input, Badge } from '../ui';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Main Unified Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-4xl bg-card rounded-lg border border-border shadow-md relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Column: Authentic School Branding & Features (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-muted/30 border-r border-border relative">
          <div>
            {/* School Emblem & Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <img
                src="/logo-smk.png"
                alt="Logo SMK Al Amanah"
                className="size-12 object-contain shrink-0"
              />
              <div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 uppercase py-0 font-bold">
                  SMK AL AMANAH
                </Badge>
                <h1 className="text-base font-bold text-foreground tracking-tight mt-1">
                  Kota Tangerang Selatan
                </h1>
                <p className="text-[11px] text-muted-foreground font-normal">Yayasan Al Amanah Al Bantani</p>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 mt-8">
              <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
                Sistem Presensi & Manajemen Ekstrakurikuler
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Portal resmi pemantauan kehadiran eskul real-time berbasis Dynamic QR Code, pembinaan karakter, dan pencatatan nilai rapor siswa.
              </p>
            </div>

            {/* School Feature Points */}
            <div className="space-y-2.5 mt-8">
              <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border">
                <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <QrCode className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Presensi QR Dinamis</div>
                  <div className="text-[11px] text-muted-foreground">Presensi aman anti-titip absen 15 detik</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border">
                <div className="size-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Akses Berbasis Peran</div>
                  <div className="text-[11px] text-muted-foreground">Koordinator, Pembina, Wali Kelas, & Siswa</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border">
                <div className="size-8 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Award className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Rekapitulasi Nilai & Rapor</div>
                  <div className="text-[11px] text-muted-foreground">Predikat nilai A/B/C dan ekspor resmi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Motto */}
          <div className="pt-6 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Sistem Presensi Eskul</span>
            <span className="text-primary font-medium flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary inline-block animate-pulse" />
              Sistem Aktif
            </span>
          </div>
        </div>

        {/* Right Column: Clean Form Matching Website Styles */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-center">
          {/* Mobile Header (Shown on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-6 pb-4 border-b border-border">
            <img
              src="/logo-smk.png"
              alt="Logo SMK Al Amanah"
              className="size-10 object-contain shrink-0"
            />
            <div>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 uppercase py-0 font-bold">
                SMK AL AMANAH
              </Badge>
              <h2 className="text-base font-bold text-foreground mt-0.5">Sistem Presensi Eskul</h2>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nama Pengguna / NIP / NIS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <UserIcon className="size-4" />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau 20241001"
                  required
                  className="pl-9 h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="pl-9 pr-9 h-10 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Lihat kata sandi"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                  className="size-4 rounded border-input text-primary focus:ring-0 focus:ring-offset-0 transition-colors accent-[#00B884]"
                />
                <span className="text-xs text-muted-foreground">Ingat sesi saya di peramban ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={isLoading}
              className="w-full h-10 text-xs sm:text-sm font-semibold gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
