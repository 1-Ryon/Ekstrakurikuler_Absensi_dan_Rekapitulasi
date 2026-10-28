import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  ShieldCheck,
  Check,
  BellRing
} from 'lucide-react';
import { 
  getSavedNotifications, 
  markAllNotificationsRead, 
  requestPushPermission, 
  pushSystemNotification,
  SystemNotification 
} from '../../utils/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setNotifications(getSavedNotifications());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
    if (granted) {
      pushSystemNotification({
        title: 'Notifikasi Layar Aktif',
        desc: 'Perangkat ini kini akan menerima pembaruan status validasi pendaftaran dan presensi secara langsung.',
        time: 'Baru saja',
        type: 'success',
      });
      setNotifications(getSavedNotifications());
    } else {
      alert('Izin notifikasi ditolak oleh browser. Anda dapat mengaktifkannya melalui pengaturan peramban.');
    }
  };

  const handleSimulateStatus = (status: 'DITERIMA' | 'DITOLAK') => {
    if (status === 'DITERIMA') {
      pushSystemNotification({
        title: 'Pendaftaran Eskul DITERIMA!',
        desc: 'Selamat! Pendaftaran Anda di Ekstrakurikuler Futsal telah resmi divalidasi dan diterima oleh Pembina & Koordinator.',
        time: 'Baru saja',
        type: 'success',
      });
    } else {
      pushSystemNotification({
        title: 'Pendaftaran Eskul DITOLAK',
        desc: 'Mohon maaf, pendaftaran Anda belum dapat diterima dikarenakan kuota kelas telah terpenuhi.',
        time: 'Baru saja',
        type: 'warning',
      });
    }
    setNotifications(getSavedNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-[92vw] max-w-md p-4 sm:p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Bell className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pemberitahuan Sistem</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {!pushEnabled && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-3 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <BellRing className="size-4 text-amber-600 shrink-0" />
              <span>Dapatkan pop-up notifikasi langsung di layar HP/Laptop?</span>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-md shrink-0 cursor-pointer transition-colors"
            >
              Aktifkan
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Bell className="size-8 mx-auto text-slate-300 mb-2" />
              <p>Belum ada notifikasi baru.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const icon = n.type === 'success' 
                ? <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                : n.type === 'warning'
                ? <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                : <Info className="size-3.5 text-blue-600 shrink-0 mt-0.5" />;

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-md border transition-colors ${
                    n.read 
                      ? 'bg-slate-50/60 border-slate-200 text-slate-600' 
                      : 'bg-emerald-50/40 border-emerald-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-xs leading-tight">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Simulation helper for testing and bottom bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Uji Coba Validasi:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateStatus('DITERIMA')}
                className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold cursor-pointer"
              >
                + Simulasi Diterima
              </button>
              <button
                type="button"
                onClick={() => handleSimulateStatus('DITOLAK')}
                className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-semibold cursor-pointer"
              >
                + Simulasi Ditolak
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#00B884] hover:underline cursor-pointer"
            >
              Tandai Semua Sudah Dibaca
            </button>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
