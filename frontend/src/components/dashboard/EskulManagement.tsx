import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { Eskul } from '../../types';

interface EskulManagementProps {
  eskulList: Eskul[];
  onAddEskul: () => void;
  onEditEskul: (eskul: Eskul) => void;
  onDeleteEskul: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenSession: (eskul: Eskul) => void;
}

export const EskulManagement: React.FC<EskulManagementProps> = ({
  eskulList,
  onAddEskul,
  onEditEskul,
  onDeleteEskul,
  onToggleStatus,
  onOpenSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Olahraga', 'Teknologi', 'Seni & Budaya', 'Keagamaan', 'Kepemimpinan'];

  const filteredEskul = eskulList.filter((item) => {
    const matchesSearch = item.namaEskul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pembinaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header section matching style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Kelola Eskul & Pembina
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manajemen master data ekstrakurikuler, pembina terdaftar, jadwal, dan kuota siswa.
          </p>
        </div>

        <button
          onClick={onAddEskul}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Eskul Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari eskul, pembina, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        {/* Categories Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#00B884] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Eskul Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEskul.map((eskul) => {
          const quotaPercent = Math.round((eskul.jumlahSiswa / eskul.kuota) * 100);

          return (
            <div
              key={eskul.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-[#00B884] text-[11px] font-semibold rounded-full border border-emerald-100">
                    {eskul.kategori}
                  </span>
                  <button
                    onClick={() => onToggleStatus(eskul.id)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                      eskul.status === 'Aktif'
                        ? 'bg-emerald-100/70 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {eskul.status === 'Aktif' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Non-Aktif</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Eskul Title & Description */}
                <h3 className="text-lg font-bold text-slate-800 leading-snug">
                  {eskul.namaEskul}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {eskul.deskripsi}
                </p>

                {/* Pembina Profile Box */}
                <div className="flex items-center gap-3 my-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <img
                    src={eskul.pembinaAvatar}
                    alt={eskul.pembinaNama}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">
                      Pembina Terdaftar
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {eskul.pembinaNama}
                    </div>
                  </div>
                </div>

                {/* Schedule & Location */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Setiap {eskul.jadwalHari}, {eskul.jamMulai} - {eskul.jamSelesai} WIB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{eskul.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{eskul.jumlahSiswa} / {eskul.kuota} Siswa Terdaftar ({quotaPercent}%)</span>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${
                      quotaPercent >= 90 ? 'bg-amber-500' : 'bg-[#00B884]'
                    }`}
                    style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenSession(eskul)}
                  className="flex-1 py-1.5 px-3 bg-[#00B884]/10 hover:bg-[#00B884]/20 text-[#00B884] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Sesi QR</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditEskul(eskul)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Ubah Data"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEskul(eskul.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Eskul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
