import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Award, 
  Mail, 
  UserCheck, 
  Check, 
  BellRing, 
  Filter,
  ExternalLink,
  Eye
} from 'lucide-react';
import { 
  getSavedNotifications, 
  markAllNotificationsRead, 
  markNotificationAsRead,
  requestPushPermission, 
  pushSystemNotification, 
  SystemNotification 
} from '../../utils/notificationService';
import { Role, User } from '../../types';
import { FullViewMessageModal } from './FullViewMessageModal';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  currentRole?: Role;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
}) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'JADWAL' | 'PENDAFTARAN' | 'PESAN'>('ALL');
  const [fullViewMessage, setFullViewMessage] = useState<SystemNotification | null>(null);

  const loadNotifications = () => {
    const list = getSavedNotifications(currentRole, currentUser?.id);
    setNotifications(list);
  };

  const handleOpenFullView = (n: SystemNotification) => {
    markNotificationAsRead(n.id);
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setFullViewMessage(n);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, [isOpen, currentRole, currentUser?.id]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead(currentRole, currentUser?.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
    if (granted) {
      pushSystemNotification({
        title: 'Notifikasi Layar Aktif',
        desc: 'Perangkat Anda kini siap menerima pembaruan jadwal latihan, pesan resmi, dan status pendaftaran secara langsung.',
        time: 'Baru saja',
        type: 'success',
        category: 'SISTEM',
      });
      loadNotifications();
    } else {
      alert('Izin notifikasi ditolak oleh peramban. Anda dapat mengaktifkannya melalui setelan izin browser.');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'ALL') return notifications;
    if (activeCategory === 'JADWAL') return notifications.filter(n => n.category === 'JADWAL');
    if (activeCategory === 'PENDAFTARAN') return notifications.filter(n => n.category === 'PENDAFTARAN');
    if (activeCategory === 'PESAN') return notifications.filter(n => n.category === 'PESAN');
    return notifications;
  }, [notifications, activeCategory]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  const getCategoryIcon = (category?: string, type?: string) => {
    switch (category) {
      case 'JADWAL':
        return <Calendar className="size-4 text-emerald-600" />;
      case 'PENDAFTARAN':
        return <Award className="size-4 text-blue-600" />;
      case 'PESAN':
        return <Mail className="size-4 text-purple-600" />;
      default:
        if (type === 'success') return <CheckCircle2 className="size-4 text-emerald-600" />;
        if (type === 'warning') return <AlertTriangle className="size-4 text-amber-600" />;
        return <Info className="size-4 text-slate-500" />;
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'JADWAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Jadwal</span>;
      case 'PENDAFTARAN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Pendaftaran</span>;
      case 'PESAN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Pesan / Dispensasi</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Sistem</span>;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[94vw] max-w-lg p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Bell className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Pusat Notifikasi & Pesan</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full leading-none flex items-center justify-center">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Pemberitahuan perubahan jadwal, pengesahan pendaftaran eskul, dan pesan resmi sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {!pushEnabled && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg mb-3 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <BellRing className="size-4 text-amber-600 shrink-0" />
              <span>Aktifkan notifikasi pop-up di layar perangkat Anda?</span>
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

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'ALL'
                ? 'bg-[#00B884] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('JADWAL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'JADWAL'
                ? 'bg-[#00B884] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Jadwal ({notifications.filter(n => n.category === 'JADWAL').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('PENDAFTARAN')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'PENDAFTARAN'
                ? 'bg-[#00B884] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pendaftaran ({notifications.filter(n => n.category === 'PENDAFTARAN').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('PESAN')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'PESAN'
                ? 'bg-[#00B884] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pesan & Surat ({notifications.filter(n => n.category === 'PESAN').length})
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-2.5 overflow-y-auto max-h-[52vh] pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="size-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Tidak ada pemberitahuan pada kategori ini.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Notifikasi baru akan otomatis muncul saat ada aktivitas jadwal atau pendaftaran.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const icon = getCategoryIcon(n.category, n.type);
              const badge = getCategoryBadge(n.category);

              return (
                <div
                  key={n.id}
                  onClick={() => handleOpenFullView(n)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer group hover:shadow-xs ${
                    n.read 
                      ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-600' 
                      : 'bg-emerald-50/40 border-emerald-300/80 hover:border-emerald-500/80 text-slate-800 shadow-2xs ring-1 ring-emerald-400/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:border-emerald-300 transition-colors">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {badge}
                          <span className="font-bold text-xs text-slate-900 leading-tight group-hover:text-[#00B884] transition-colors">
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {n.time}
                        </span>
                      </div>

                      {n.senderName && (
                        <div className="text-[11px] font-semibold text-slate-700 mt-1 flex items-center gap-1">
                          <span className="text-slate-400 font-normal">Dari:</span>
                          <span>{n.senderName}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-white/70 p-2 rounded border border-slate-200/60 break-words">
                        {n.desc}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Eye className="size-3 text-slate-400" />
                          <span>Klik untuk lihat detail pesan</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#00B884] group-hover:underline">
                          <span>Full View</span>
                          <ExternalLink className="size-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-bold text-[#00B884] hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline flex items-center gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Tandai Semua Dibaca</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      <FullViewMessageModal
        isOpen={!!fullViewMessage}
        onClose={() => setFullViewMessage(null)}
        message={fullViewMessage}
        onMarkRead={(id) => markNotificationAsRead(id)}
      />
    </div>
  );
};
