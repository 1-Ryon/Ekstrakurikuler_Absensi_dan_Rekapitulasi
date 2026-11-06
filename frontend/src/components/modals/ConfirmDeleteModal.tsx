import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  itemType?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Penghapusan Data',
  itemName,
  itemType = 'Data',
  description = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan data yang telah dihapus tidak dapat dipulihkan kembali.',
  confirmText = 'Ya, Hapus Data',
  cancelText = 'Batal',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-[92vw] max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-100 relative">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Tutup dialog"
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-2xs">
                  <Trash2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 id="confirm-delete-title" className="text-base font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-xs text-rose-600 font-medium mt-0.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Peringatan Tindakan Kritis</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p id="confirm-delete-desc" className="text-xs text-slate-600 leading-relaxed">
                {description}
              </p>

              {itemName && (
                <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200/70 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                      {itemType}
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {itemName}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="h-9 px-4 text-xs font-semibold"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onConfirm}
                disabled={isLoading}
                className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmText}</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
