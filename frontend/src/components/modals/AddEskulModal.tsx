import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, MapPin, Users, Award } from 'lucide-react';
import { Eskul } from '../../types';
import { PEMBINA_LIST } from '../../data/mockData';

interface AddEskulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEskul: Omit<Eskul, 'id' | 'jumlahSiswa'>) => void;
}

export const AddEskulModal: React.FC<AddEskulModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [namaEskul, setNamaEskul] = useState('');
  const [pembinaId, setPembinaId] = useState(PEMBINA_LIST[0].id);
  const [jadwalHari, setJadwalHari] = useState('Kamis');
  const [jamMulai, setJamMulai] = useState('15:30');
  const [jamSelesai, setJamSelesai] = useState('17:00');
  const [lokasi, setLokasi] = useState('Lapangan Olahraga Utama');
  const [kuota, setKuota] = useState<number | ''>(35);
  const [kategori, setKategori] = useState<Eskul['kategori']>('Olahraga');
  const [deskripsi, setDeskripsi] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPembina = PEMBINA_LIST.find(p => p.id === pembinaId) || PEMBINA_LIST[0];
    const resolvedKuota = typeof kuota === 'number' && kuota > 0 ? kuota : (parseInt(String(kuota), 10) || 35);

    onSave({
      namaEskul,
      pembinaId: selectedPembina.id,
      pembinaNama: selectedPembina.namaLengkap,
      pembinaAvatar: selectedPembina.avatarUrl,
      jadwalHari,
      jamMulai,
      jamSelesai,
      lokasi,
      kuota: resolvedKuota,
      kategori,
      status: 'Aktif',
      deskripsi: deskripsi || `Kegiatan pembinaan ${namaEskul} SMK Al Amanah.`,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Tambah Ekstrakurikuler Baru
            </h3>
            <p className="text-xs text-slate-500">
              Daftarkan cabang ekstrakurikuler baru untuk semester aktif.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nama Eskul */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nama Ekstrakurikuler
            </label>
            <input
              type="text"
              required
              value={namaEskul}
              onChange={(e) => setNamaEskul(e.target.value)}
              placeholder="Contoh: Eskul Robotik & IoT"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          {/* Kategori & Kuota */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kategori Eskul</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as Eskul['kategori'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              >
                <option value="Olahraga">Olahraga</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Seni & Budaya">Seni & Budaya</option>
                <option value="Keagamaan">Keagamaan</option>
                <option value="Kepemimpinan">Kepemimpinan</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">Kapasitas Kuota Siswa</label>
                <span className="text-[10px] text-slate-400">Min 5 siswa</span>
              </div>
              <input
                type="number"
                min={5}
                max={200}
                required
                value={kuota}
                placeholder="Contoh: 35"
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setKuota('');
                  } else {
                    const num = parseInt(val, 10);
                    setKuota(isNaN(num) ? '' : num);
                  }
                }}
                onBlur={() => {
                  if (kuota === '' || Number(kuota) < 1) {
                    setKuota(35);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
          </div>

          {/* Pembina */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Guru / Pembina Terdaftar
            </label>
            <select
              value={pembinaId}
              onChange={(e) => setPembinaId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            >
              {PEMBINA_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaLengkap} ({p.spesialisasi})
                </option>
              ))}
            </select>
          </div>

          {/* Jadwal & Waktu */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hari Rutin</label>
              <select
                value={jadwalHari}
                onChange={(e) => setJadwalHari(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Mulai</label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Selesai</label>
              <input
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Lokasi Latihan / Ruangan</label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Lab Komputer RPL 1 / Lapangan Utama"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deskripsi & Tujuan Kegiatan</label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan silabus singkat atau capaian eskul..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00B884] hover:bg-emerald-600 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Simpan Ekstrakurikuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
