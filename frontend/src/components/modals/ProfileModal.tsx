import React from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  KeyRound, 
  Calendar, 
  Award,
  Layers,
  LogOut,
  BadgeCheck
} from 'lucide-react';
import { User, Role } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { SchoolLogo } from '../SchoolLogo';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  currentRole: Role;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onLogout,
}) => {
  if (!isOpen) return null;

  const role = currentUser?.role || currentRole;
  const namaLengkap = currentUser?.namaLengkap || 'Administrator Sistem';
  const username = currentUser?.username || 'admin';
  const nomorInduk = currentUser?.nomorInduk || 'ADM-ALAMANAH-01';
  const spesialisasi = currentUser?.spesialisasi || (role === 'ADMIN' ? 'Super Administrator & Pengelola Sistem IT PKM' : 'Staf SMK Al Amanah');
  const email = currentUser?.email || `${username.toLowerCase()}@smk-alamanah.sch.id`;
  const noHp = currentUser?.noHp || '0812-3456-7890';
  const statusAktif = currentUser?.statusAktif ?? true;

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'ADMIN':
        return {
          label: 'Administrator Sistem',
          desc: 'Super Administrator & Pengelola Sistem Utama',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgeBg: 'bg-emerald-600',
          icon: ShieldCheck,
        };
      case 'KOORDINATOR':
        return {
          label: 'Koordinator Ekstrakurikuler',
          desc: 'Pengelola Data Eskul, Pembina & Pemantauan Sekolah',
          color: 'bg-teal-50 text-teal-800 border-teal-200',
          badgeBg: 'bg-teal-600',
          icon: Award,
        };
      case 'PEMBINA':
        return {
          label: 'Guru Pembina Eskul',
          desc: 'Pembuat QR Dinamis Presensi, Pemindai & Penilai Siswa',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          badgeBg: 'bg-blue-600',
          icon: UserCheck,
        };
      case 'WALI_KELAS':
        return {
          label: 'Wali Kelas',
          desc: 'Pemantau Rekapitulasi Nilai & Kehadiran Kelas Binaan',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
          badgeBg: 'bg-purple-600',
          icon: GraduationCap,
        };
      case 'SISWA':
        return {
          label: 'Siswa / Siswi',
          desc: 'Peserta Kegiatan Eskul & Pemegang Kartu KHN Digital',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeBg: 'bg-amber-600',
          icon: Smartphone,
        };
    }
  };

  const roleInfo = getRoleBadge(role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" showText={false} />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                Detail Profil Akun Pengguna
              </h3>
              <p className="text-[11px] text-slate-400">
                Sistem Informasi Ekstrakurikuler SMK Al Amanah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Hero Profile Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-[#00B884]/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <UserAvatar
                  name={namaLengkap}
                  className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-white/20 shadow-md text-xl font-bold"
                />
                {statusAktif && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-white truncate">
                    {namaLengkap}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00B884] text-white">
                    <BadgeCheck className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  @{username}
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {spesialisasi}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                    <Building2 className="w-3.5 h-3.5 text-[#00B884]" />
                    SMK Al Amanah Kota Tangerang Selatan
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Status: {statusAktif ? 'Aktif Terverifikasi' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Informasi Identitas */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/60">
                <RoleIcon className="w-4 h-4 text-[#00B884]" />
                <span>Identitas & Kepegawaian</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nomor Induk (NIP / NISN)</span>
                  <span className="font-semibold text-slate-800 font-mono">{nomorInduk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Peran Sistem</span>
                  <span className="font-semibold text-slate-800">{roleInfo.label}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jabatan / Bidang Tugas</span>
                  <span className="font-semibold text-slate-800">{spesialisasi}</span>
                </div>
                {currentUser?.kelas && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kelas Binaan / Rombel</span>
                    <span className="font-semibold text-slate-800">{currentUser.kelas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Kontak & Akses */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/60">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Kontak & Akun</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Resmi</span>
                  <span className="font-semibold text-slate-800">{email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nomor WhatsApp / HP</span>
                  <span className="font-semibold text-slate-800">{noHp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tipe Login Akun</span>
                  <span className="font-semibold text-slate-800">Autentikasi Terenkripsi (Hash)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Otoritas</span>
                  <span className="inline-block font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                    Diizinkan Akses Penuh Sesuai Peran
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Box 3: Deskripsi Otoritas & Fitur Peran */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-emerald-50/40 text-xs space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Wewenang & Hak Akses Fitur:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {roleInfo.desc}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Keluar dari Akun</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
