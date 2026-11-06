import React, { useState, useEffect } from 'react';
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
  Award,
  LogOut,
  BadgeCheck,
  Edit2,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { User, Role } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { SchoolLogo } from '../SchoolLogo';
import { api } from '../../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  currentRole: Role;
  onLogout?: () => void;
  onUpdateCurrentUser?: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onLogout,
  onUpdateCurrentUser,
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [noHpInput, setNoHpInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);
  const [contactErrorMsg, setContactErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setEmailInput(currentUser.email || '');
      setNoHpInput(currentUser.noHp || '');
    }
    setIsEditingContact(false);
    setContactSuccessMsg(null);
    setContactErrorMsg(null);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const role = currentUser?.role || currentRole;
  const isSiswa = role === 'SISWA';
  const namaLengkap = currentUser?.namaLengkap || (isSiswa ? 'Peserta Didik' : 'Administrator Sistem');
  const username = currentUser?.username || 'admin';
  const nomorInduk = currentUser?.nomorInduk || (isSiswa ? username : 'ADM-ALAMANAH-01');
  const statusAktif = currentUser?.statusAktif ?? true;

  const userSubtitle = isSiswa
    ? `Peserta Didik SMK Al Amanah • ${currentUser?.kelas || 'Kelas Belum Ditentukan'}`
    : role === 'ADMIN'
      ? (currentUser?.spesialisasi || 'Super Administrator & Pengelola Sistem IT PKM')
      : (currentUser?.spesialisasi || 'Tenaga Pendidik / Staf SMK Al Amanah');

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

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setContactErrorMsg(null);
    setContactSuccessMsg(null);

    try {
      const res = await api.updateProfile({
        email: emailInput.trim(),
        noHp: noHpInput.trim(),
      });

      if (res && res.user && onUpdateCurrentUser) {
        onUpdateCurrentUser(res.user);
      }
      setIsEditingContact(false);
      setContactSuccessMsg('Kontak akun berhasil disimpan dan disinkronkan!');
      setTimeout(() => setContactSuccessMsg(null), 3500);
    } catch (err: any) {
      setContactErrorMsg(err.message || 'Gagal menyimpan kontak akun.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[92vw] max-w-2xl shadow-xl border border-slate-200 max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" showText={false} />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                Detail Profil Akun Pengguna
              </h3>
              <p className="text-[11px] text-slate-500">
                Absensi Ekstrakurikuler SMK Al-Amanah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="relative overflow-hidden bg-slate-50/90 rounded-lg p-5 text-slate-800 border border-slate-200 shadow-xs">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <UserAvatar
                  name={namaLengkap}
                  className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-slate-200 text-xl font-bold bg-white"
                />
                {statusAktif && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                    {namaLengkap}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#00B884] text-white shadow-xs">
                    <BadgeCheck className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  @{username}
                </p>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                  {userSubtitle}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    SMK Al Amanah Kota Tangerang Selatan
                  </span>
                  <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    Status: {statusAktif ? 'Aktif Terverifikasi' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-200/60">
                <RoleIcon className="w-4 h-4 text-emerald-600" />
                <span>{isSiswa ? 'Identitas Peserta Didik' : 'Identitas & Kepegawaian'}</span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isSiswa ? 'Nomor Induk Siswa (NIS / NISN)' : 'Nomor Induk (NIP / ADM)'}</span>
                  <span className="font-semibold text-slate-800 font-mono">{nomorInduk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Peran Sistem</span>
                  <span className="font-semibold text-slate-800">{roleInfo.label}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isSiswa ? 'Status Akademik' : 'Jabatan / Bidang Tugas'}</span>
                  <span className="font-semibold text-slate-800">
                    {isSiswa ? 'Peserta Didik Aktif' : (currentUser?.spesialisasi || 'Staf SMK Al Amanah')}
                  </span>
                </div>
                {currentUser?.kelas && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isSiswa ? 'Kelas / Rombel Siswa' : 'Kelas Binaan'}</span>
                    <span className="inline-block font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-mono mt-0.5">
                      {currentUser.kelas}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Kontak & Akun</span>
                </div>
                {!isEditingContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput(currentUser?.email || '');
                      setNoHpInput(currentUser?.noHp || '');
                      setIsEditingContact(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{currentUser?.email || currentUser?.noHp ? 'Ubah Kontak' : '+ Tambah Kontak'}</span>
                  </button>
                )}
              </div>
              
              {contactSuccessMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{contactSuccessMsg}</span>
                </div>
              )}

              {contactErrorMsg && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{contactErrorMsg}</span>
                </div>
              )}

              {isEditingContact ? (
                <form onSubmit={handleSaveContact} className="space-y-3 text-xs pt-1">
                  <div>
                    <label className="text-slate-500 block text-[10px] font-medium mb-1">
                      Email Resmi / Aktif
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="contoh@smk-alamanah.sch.id"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block text-[10px] font-medium mb-1">
                      Nomor WhatsApp / HP
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={noHpInput}
                        onChange={(e) => setNoHpInput(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingContact(false);
                        setEmailInput(currentUser?.email || '');
                        setNoHpInput(currentUser?.noHp || '');
                        setContactErrorMsg(null);
                      }}
                      disabled={isSaving}
                      className="px-2.5 py-1 text-xs border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Simpan Kontak</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Resmi</span>
                    {currentUser?.email ? (
                      <span className="font-semibold text-slate-800 break-all">{currentUser.email}</span>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 italic text-[11px] mt-0.5">
                        <span>Belum diatur</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="text-emerald-600 hover:underline not-italic font-medium ml-1 cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor WhatsApp / HP</span>
                    {currentUser?.noHp ? (
                      <span className="font-semibold text-slate-800 font-mono">{currentUser.noHp}</span>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 italic text-[11px] mt-0.5">
                        <span>Belum diatur</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="text-emerald-600 hover:underline not-italic font-medium ml-1 cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tipe Login Akun</span>
                    <span className="font-semibold text-slate-800">Autentikasi Terenkripsi (Hash)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Otoritas</span>
                    <span className="inline-block font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                      Diizinkan Akses Penuh Sesuai Peran
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-emerald-50/40 text-xs space-y-1.5">
            <div className="font-semibold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Wewenang & Hak Akses Fitur:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {roleInfo.desc}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-md transition-colors cursor-pointer"
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
