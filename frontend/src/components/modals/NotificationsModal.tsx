import React from 'react';
import { X, Bell, CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Presensi Sesi Eskul Futsal Dibuka',
      desc: 'Pak Ahmad telah mengaktifkan Dynamic QR Code di Lapangan Olahraga Utama.',
      time: '5 Menit yang lalu',
      type: 'info',
    },
    {
      id: '2',
      title: 'Tingkat Kehadiran Mencapai 92%',
      desc: 'Rata-rata presensi ekstrakurikuler pekan ini meningkat dibandingkan bulan lalu.',
      time: '1 Jam yang lalu',
      type: 'success',
    },
    {
      id: '3',
      title: 'Pengisian Nilai Rapor Semester',
      desc: 'Batas akhir rekapitulasi penilaian kompetensi ekstrakurikuler tanggal 30 September 2026.',
      time: '3 Jam yang lalu',
      type: 'warning',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Pemberitahuan Sistem</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-800">{n.title}</span>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#00B884] hover:underline"
          >
            Tandai Semua Sudah Dibaca
          </button>
        </div>
      </div>
    </div>
  );
};
