import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  Award, 
  Info, 
  AlertTriangle, 
  ExternalLink,
  Building2,
  FileText
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { Button } from '../ui/button';

export interface FullViewMessageData {
  id: string;
  title: string;
  desc: string;
  time?: string;
  senderName?: string;
  senderRole?: string;
  category?: 'JADWAL' | 'PENDAFTARAN' | 'PESAN' | 'SISTEM' | string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
}

export interface FullViewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: FullViewMessageData | null;
  onMarkRead?: (id: string) => void;
}

export const FullViewMessageModal: React.FC<FullViewMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  onMarkRead,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen || !message) return null;

  const handleCopy = () => {
    const fullText = `[${message.title}]\nDari: ${message.senderName || 'Sistem Sekolah'}\nWaktu: ${message.time || 'Hari ini'}\n\n${message.desc}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'JADWAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Calendar className="size-3" />
            <span>Jadwal Latihan</span>
          </span>
        );
      case 'PENDAFTARAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Award className="size-3" />
            <span>Pendaftaran Eskul</span>
          </span>
        );
      case 'PESAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Mail className="size-3" />
            <span>Pesan &amp; Dispensasi</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="size-3" />
            <span>Pemberitahuan Sistem</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullview-message-title"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-[94vw] max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-lg bg-emerald-50 text-[#00B884] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  Tampilan Pesan Lengkap (Full View)
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  Portal Sistem Informasi Presensi &amp; Ekstrakurikuler SMK Al Amanah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pesan"
              className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* Meta Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {getCategoryBadge(message.category)}
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>{message.time || 'Waktu tercatat'}</span>
                </div>
              </div>

              <h2 id="fullview-message-title" className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {message.title}
              </h2>

              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                <UserAvatar
                  name={message.senderName || 'Admin'}
                  className="size-9 ring-2 ring-white text-xs shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {message.senderName || 'Pusat Informasi SMK Al Amanah'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {message.senderRole || 'Petugas Resmi Sekolah'}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Letterhead Body */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 relative">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-[#00B884]" />
                  <span>SMK Al Amanah Kota Tangerang Selatan</span>
                </span>
                <span>Pesan Sistem Terverifikasi</span>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap py-1">
                {message.desc}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status Keterbacaan:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                  <CheckCircle2 className="size-3" />
                  <span>Telah Terverifikasi</span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-slate-500" />
                  <span>Salin Pesan</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold"
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold gap-1.5"
              >
                <span>Tutup Pesan</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
