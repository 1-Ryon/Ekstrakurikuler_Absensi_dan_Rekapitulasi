import React, { useState } from 'react';
import { X, Mail, Send, User, ExternalLink } from 'lucide-react';
import { PEMBINA_LIST } from '../../data/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { FullViewMessageModal, FullViewMessageData } from './FullViewMessageModal';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MailModal: React.FC<MailModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFullView, setSelectedFullView] = useState<FullViewMessageData | null>(null);

  if (!isOpen) return null;

  const messages = [
    {
      id: 'm1',
      sender: 'Abdul Jabbar, S.Kom., M.Kom.',
      role: 'Guru Computer Club',
      subject: 'Dispensasi Siswa Lomba LKS',
      snippet: 'Mohon izin untuk siswa Muhammad Rizky Pratama karena sedang mempersiapkan modul LKS Wilayah Tangerang Selatan.',
      fullText: 'Dengan hormat,\n\nSehubungan dengan keikutsertaan sekolah kita dalam Lomba Kompetensi Siswa (LKS) Tingkat Kota Tangerang Selatan pada bidang Web Technologies, kami memohon dispensasi ketidakhadiran bagi ananda:\n\n• Nama: Muhammad Rizky Pratama\n• Kelas: XI RPL 1\n\nSiswa tersebut akan mengikuti bimbingan intensif dan simulasi praktikum modul server di Lab RPL mulai tanggal 5 s/d 8 November 2026. Seluruh materi pelajaran yang tertinggal akan diselesaikan secara mandiri.\n\nDemikian permohonan dispensasi ini kami sampaikan. Atas perhatian dan izin dari pihak sekolah serta wali kelas, kami ucapkan terima kasih.',
      time: '14:20 WIB',
      avatar: PEMBINA_LIST[0].avatarUrl,
    },
    {
      id: 'm2',
      sender: 'Ahmad Syafii, S.Pd.',
      role: 'Guru Futsal',
      subject: 'Laporan Sesi Latihan Hari Ini',
      snippet: 'Sesi futsal telah selesai dengan kehadiran 38 dari 42 siswa. Siswa lainnya berhalangan izin.',
      fullText: 'Yth. Koordinator Ekstrakurikuler & Kesiswaan,\n\nMelaporkan pelaksanaan sesi latihan rutin Futsal Prestasi pada hari ini:\n\n• Waktu Latihan: 15:30 - 17:30 WIB\n• Lokasi: Lapangan Futsal SMK Al Amanah\n• Kehadiran: 38 Siswa Hadir (Presensi Dynamic QR), 3 Izin Resmi, 1 Sakit.\n• Catatan Lapangan: Kondisi lapangan baik, seluruh siswa mengikuti materi taktik counter-attack dengan disiplin. Nilai keaktifan sesi telah dikunci dan disinkronkan ke rekapitulasi semester.\n\nTerima kasih atas dukungan fasilitas yang diberikan.',
      time: '12:05 WIB',
      avatar: PEMBINA_LIST[3].avatarUrl,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-[92vw] max-w-md p-4 sm:p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Pesan & Surat Dispensasi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedFullView({
                id: m.id,
                title: m.subject,
                desc: m.fullText,
                senderName: m.sender,
                senderRole: m.role,
                category: 'PESAN',
                time: m.time,
                read: true,
              })}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex items-start gap-3 cursor-pointer group"
            >
              <UserAvatar
                name={m.sender}
                className="w-9 h-9 ring-2 ring-emerald-500/20 shrink-0 text-xs shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 truncate group-hover:text-[#00B884] transition-colors">{m.sender}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{m.time}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#00B884] truncate">{m.subject}</div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.snippet}</p>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#00B884] font-semibold">
                  <span>Klik untuk Full View</span>
                  <ExternalLink className="size-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#00B884] hover:underline cursor-pointer"
          >
            Tutup Pesan
          </button>
        </div>
      </div>

      <FullViewMessageModal
        isOpen={!!selectedFullView}
        onClose={() => setSelectedFullView(null)}
        message={selectedFullView}
      />
    </div>
  );
};
