import React from 'react';
import { X, Mail, Send, User } from 'lucide-react';
import { PEMBINA_LIST } from '../../data/mockData';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MailModal: React.FC<MailModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const messages = [
    {
      id: 'm1',
      sender: 'Abdul Jabbar, S.Kom., M.Kom.',
      role: 'Guru Computer Club',
      subject: 'Dispensasi Siswa Lomba LKS',
      snippet: 'Mohon izin untuk siswa Muhammad Rizky Pratama karena sedang mempersiapkan modul LKS...',
      time: '14:20 WIB',
      avatar: PEMBINA_LIST[0].avatarUrl,
    },
    {
      id: 'm2',
      sender: 'Ahmad Syafii, S.Pd.',
      role: 'Guru Futsal',
      subject: 'Laporan Sesi Latihan Hari Ini',
      snippet: 'Sesi futsal telah selesai dengan kehadiran 38 dari 42 siswa. Siswa lainnya berhalangan izin.',
      time: '12:05 WIB',
      avatar: PEMBINA_LIST[3].avatarUrl,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Pesan & Surat Dispensasi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start gap-3"
            >
              <img
                src={m.avatar}
                alt={m.sender}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 truncate">{m.sender}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{m.time}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#00B884] truncate">{m.subject}</div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.snippet}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#00B884] hover:underline"
          >
            Tutup Pesan
          </button>
        </div>
      </div>
    </div>
  );
};
