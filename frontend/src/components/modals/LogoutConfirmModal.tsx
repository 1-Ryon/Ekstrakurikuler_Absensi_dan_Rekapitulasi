import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldAlert, ArrowRight, UserCheck, ShieldCheck, Smartphone } from 'lucide-react';
import { User, Role } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser?: User | null;
  currentRole?: Role;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser,
  currentRole = 'ADMIN',
}) => {
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrator Sistem', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck };
      case 'KOORDINATOR':
        return { label: 'Koordinator Eskul', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: ShieldCheck };
      case 'PEMBINA':
        return { label: 'Guru Pembina', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserCheck };
      case 'WALI_KELAS':
        return { label: 'Wali Kelas', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCheck };
      case 'SISWA':
        return { label: 'Siswa', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Smartphone };
    }
  };

  const badge = getRoleBadge(currentRole);
  const RoleIcon = badge.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with smooth blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-desc"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10"
          >
            {/* Top Decorative Header */}
            <div className="p-6 bg-gradient-to-br from-rose-50/80 via-white to-slate-50 border-b border-rose-100/60 relative">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                  <LogOut className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 id="logout-dialog-title" className="text-base font-extrabold text-slate-900">
                    Konfirmasi Keluar Akun
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Akhiri sesi penggunaan aplikasi</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p id="logout-dialog-desc" className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin keluar dari sistem? Seluruh sesi dan otentikasi login Anda pada peramban ini akan diakhiri.
              </p>

              {/* User Account Card */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <UserAvatar
                    name={currentUser.namaLengkap}
                    className="w-10 h-10 ring-2 ring-white text-xs shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {currentUser.namaLengkap}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}>
                        <RoleIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      {currentUser.username && (
                        <span className="font-mono text-[10px] text-slate-400 truncate">
                          @{currentUser.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                Anda perlu memasukkan kembali kredensial (NIS / NIP / Username) untuk mengakses akun ini setelah keluar.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmLogout();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs shadow-rose-600/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar Akun</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
