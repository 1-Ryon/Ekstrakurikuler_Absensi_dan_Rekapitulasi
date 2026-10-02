import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Award, Edit3, ShieldCheck } from 'lucide-react';
import { Eskul } from '../../types';
import { PEMBINA_LIST } from '../../data/mockData';

export interface PembinaOption {
  id: string;
  namaLengkap: string;
  spesialisasi?: string;
  avatarUrl?: string;
}

interface EditEskulModalProps {
  isOpen: boolean;
  onClose: () => void;
  eskul: Eskul | null;
  onSave: (updatedEskul: Eskul) => void;
  pembinaList?: PembinaOption[];
}

export const EditEskulModal: React.FC<EditEskulModalProps> = ({
  isOpen,
  onClose,
  eskul,
  onSave,
  pembinaList,
}) => {
  const [namaEskul, setNamaEskul] = useState('');
  const [pembinaId, setPembinaId] = useState(PEMBINA_LIST[0].id);
  const [jadwalHari, setJadwalHari] = useState('Kamis');
  const [jamMulai, setJamMulai] = useState('15:30');
  const [jamSelesai, setJamSelesai] = useState('17:00');
  const [lokasi, setLokasi] = useState('Lapangan Olahraga Utama');
  const [kuota, setKuota] = useState(35);
  const [kategori, setKategori] = useState<Eskul['kategori']>('Olahraga');
  const [status, setStatus] = useState<Eskul['status']>('Aktif');
  const [deskripsi, setDeskripsi] = useState('');

  useEffect(() => {
    if (eskul) {
      setNamaEskul(eskul.namaEskul);
      setPembinaId(eskul.pembinaId || PEMBINA_LIST[0].id);
      setJadwalHari(eskul.jadwalHari || 'Kamis');
      setJamMulai(eskul.jamMulai || '15:30');
      setJamSelesai(eskul.jamSelesai || '17:00');
      setLokasi(eskul.lokasi || 'Lapangan Olahraga Utama');
      setKuota(eskul.kuota || 35);
      setKategori(eskul.kategori || 'Olahraga');
      setStatus(eskul.status || 'Aktif');
      setDeskripsi(eskul.deskripsi || '');
    }
  }, [eskul, isOpen]);

  const options = (pembinaList && pembinaList.length > 0) ? pembinaList : PEMBINA_LIST;
  const allPembinaOptions = [...options];
  if (eskul && eskul.pembinaNama && !allPembinaOptions.some(p => p.id === eskul.pembinaId || p.namaLengkap === eskul.pembinaNama)) {
    allPembinaOptions.push({
      id: eskul.pembinaId || 'current-pembina',
      namaLengkap: eskul.pembinaNama,
      spesialisasi: eskul.kategori,
      avatarUrl: eskul.pembinaAvatar,
    });
  }

  if (!isOpen || !eskul) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPembina = allPembinaOptions.find((p) => p.id === pembinaId) || {
      id: pembinaId,
      namaLengkap: eskul.pembinaNama,
      avatarUrl: eskul.pembinaAvatar,
    };

    onSave({
      ...eskul,
      namaEskul,
      pembinaId: selectedPembina.id,
      pembinaNama: selectedPembina.namaLengkap,
      pembinaAvatar: selectedPembina.avatarUrl || eskul.pembinaAvatar,
      jadwalHari,
      jamMulai,
      jamSelesai,
      lokasi,
      kuota: Number(kuota),
      kategori,
      status,
      deskripsi: deskripsi || `Kegiatan pembinaan ${namaEskul} SMK Al Amanah.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Ubah Data Ekstrakurikuler
              </h3>
              <p className="text-xs text-slate-500">
                Edit jadwal, guru pembina, kuota, atau lokasi eskul {eskul.namaEskul}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Nama Eskul */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Ekstrakurikuler
            </label>
            <input
              type="text"
              required
              value={namaEskul}
              onChange={(e) => setNamaEskul(e.target.value)}
              placeholder="Contoh: Eskul Futsal Prestasi"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            />
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as Eskul['kategori'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value="Olahraga">Olahraga</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Seni & Budaya">Seni & Budaya</option>
                <option value="Keagamaan">Keagamaan</option>
                <option value="Kepemimpinan">Kepemimpinan</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Keaktifan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Eskul['status'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Guru Pembina */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Guru Pembina Bertugas
            </label>
            <select
              value={pembinaId}
              onChange={(e) => setPembinaId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              {allPembinaOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaLengkap} {p.spesialisasi ? `(${p.spesialisasi})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Jadwal Hari & Kuota */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jadwal Hari</label>
              <select
                value={jadwalHari}
                onChange={(e) => setJadwalHari(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
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
              <label className="font-bold text-slate-700 block mb-1">Kuota Siswa</label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={kuota}
                onChange={(e) => setKuota(parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          {/* Jam Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jam Mulai</label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jam Selesai</label>
              <input
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          {/* Lokasi Fasilitas */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Lokasi / Fasilitas Sekolah
            </label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Lapangan Futsal SMK Al Amanah"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Deskripsi & Agenda Kegiatan
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi kegiatan atau kompetensi yang dikembangkan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00B884] hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
