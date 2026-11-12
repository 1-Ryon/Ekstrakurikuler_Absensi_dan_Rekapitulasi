import React, { useState, useEffect, useMemo } from 'react';
import { X, Volleyball, Check, Sparkles, Search } from 'lucide-react';
import { Guru, Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface EditPembinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pembina: Guru | null;
  eskulList: Eskul[];
  onSave: (id: string, data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    statusAktif?: boolean;
    assignedEskulId?: string;
    assignedEskulIds?: string[];
    password?: string;
  }) => void;
}

export const EditPembinaModal: React.FC<EditPembinaModalProps> = ({
  isOpen,
  onClose,
  pembina,
  eskulList,
  onSave,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nip, setNip] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  const [assignedEskulIds, setAssignedEskulIds] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [eskulSearch, setEskulSearch] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    eskulList.forEach(e => {
      if (e.kategori) set.add(e.kategori);
    });
    return Array.from(set);
  }, [eskulList]);

  const filteredEskuls = useMemo(() => {
    const q = eskulSearch.trim().toLowerCase();
    return eskulList.filter((e) => {
      const matchSearch =
        !q ||
        e.namaEskul.toLowerCase().includes(q) ||
        (e.kategori && e.kategori.toLowerCase().includes(q)) ||
        (e.jadwalHari && e.jadwalHari.toLowerCase().includes(q)) ||
        (e.pembinaNama && e.pembinaNama.toLowerCase().includes(q));

      const matchKategori =
        selectedKategoriFilter === 'ALL' || e.kategori === selectedKategoriFilter;

      return matchSearch && matchKategori;
    });
  }, [eskulList, eskulSearch, selectedKategoriFilter]);

  useEffect(() => {
    if (pembina) {
      setNamaLengkap(pembina.namaLengkap || '');
      setNip(pembina.nip && pembina.nip !== '-' ? pembina.nip : '');
      setNoHp(pembina.noHp && pembina.noHp !== '-' ? pembina.noHp : '');
      setEmail(pembina.email && pembina.email !== '-' ? pembina.email : '');
      setSpesialisasi(pembina.spesialisasi || '');
      setStatusAktif(pembina.statusAktif !== false);
      
      const coachedIds = eskulList
        .filter(e => e.pembinaId === pembina.id || (pembina.eskulDiampu && pembina.eskulDiampu.some(ed => ed.id === e.id)))
        .map(e => e.id);
      
      setAssignedEskulIds(coachedIds);
      setNewPassword('');
      setEskulSearch('');
      setSelectedKategoriFilter('ALL');
    }
  }, [pembina, isOpen, eskulList]);

  if (!isOpen || !pembina) return null;

  const toggleEskulSelection = (eskulId: string) => {
    setAssignedEskulIds(prev => 
      prev.includes(eskulId) 
        ? prev.filter(id => id !== eskulId) 
        : [...prev, eskulId]
    );
  };

  const handleSelectAllEskul = () => {
    if (eskulSearch.trim() || selectedKategoriFilter !== 'ALL') {
      const combined = Array.from(new Set([...assignedEskulIds, ...filteredEskuls.map(e => e.id)]));
      setAssignedEskulIds(combined);
    } else {
      setAssignedEskulIds(eskulList.map(e => e.id));
    }
  };

  const handleClearAllEskul = () => {
    setAssignedEskulIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    onSave(pembina.id, {
      namaLengkap: namaLengkap.trim(),
      nip: nip.trim() || undefined,
      noHp: noHp.trim() || undefined,
      email: email.trim() || undefined,
      spesialisasi: spesialisasi.trim() || undefined,
      statusAktif,
      assignedEskulIds,
      assignedEskulId: assignedEskulIds[0] || undefined,
      password: newPassword.trim() || undefined,
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
        className="bg-white rounded-lg w-[92vw] max-w-xl p-4 sm:p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <UserAvatar name={namaLengkap || pembina.namaLengkap} size="lg" className="ring-2 ring-emerald-500/20" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Ubah Data Guru Pembina
              </h3>
              <p className="text-xs text-slate-500">
                Perbarui profil pembina, cabang binaan multi-eskul, dan kredensial akun login.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nama Lengkap Pembina *
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                NIP / NUPTK
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19840112 200902 1 001"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Status Akun
              </label>
              <select
                value={statusAktif ? 'AKTIF' : 'NON_AKTIF'}
                onChange={(e) => setStatusAktif(e.target.value === 'AKTIF')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              >
                <option value="AKTIF">Aktif</option>
                <option value="NON_AKTIF">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pembina@smk-alamanah.sch.id"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Spesialisasi / Keahlian
            </label>
            <input
              type="text"
              value={spesialisasi}
              onChange={(e) => setSpesialisasi(e.target.value)}
              placeholder="Contoh: Guru Olahraga & Pembina Futsal"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volleyball className="w-4 h-4 text-emerald-600" />
                <label className="font-semibold text-slate-800 text-xs">
                  Tugaskan ke Cabang Eskul
                </label>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  {assignedEskulIds.length} Eskul Dipilih
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllEskul}
                  className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAllEskul}
                  className="text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Centang cabang ekstrakurikuler yang akan dibina oleh {namaLengkap || 'guru ini'}. Pembina dapat mengampu lebih dari 1 cabang eskul sekaligus.
            </p>

            {/* Searchbar & Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={eskulSearch}
                  onChange={(e) => setEskulSearch(e.target.value)}
                  placeholder="Cari cabang eskul (contoh: Futsal, Tari, Web Club, Basket)..."
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
                />
                {eskulSearch && (
                  <button
                    type="button"
                    onClick={() => setEskulSearch('')}
                    className="w-4 h-4 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {categories.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedKategoriFilter('ALL')}
                    className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                      selectedKategoriFilter === 'ALL'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({eskulList.length})
                  </button>
                  {categories.map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setSelectedKategoriFilter(kat)}
                      className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                        selectedKategoriFilter === kat
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredEskuls.map((e) => {
                const isSelected = assignedEskulIds.includes(e.id);
                const isOtherPembina = e.pembinaId && e.pembinaId !== pembina.id;

                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEskulSelection(e.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 border-[#00B884] shadow-2xs ring-1 ring-[#00B884]/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#00B884] text-white'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-semibold text-xs truncate ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                          {e.namaEskul}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                          {e.kategori}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {e.jadwalHari} • {e.jamMulai} WIB
                      </div>
                      {isOtherPembina && !isSelected && (
                        <div className="text-[10px] text-amber-600 truncate mt-0.5">
                          Saat ini: {e.pembinaNama}
                        </div>
                      )}
                      {isSelected && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Ditugaskan ke pembina ini</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredEskuls.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-md bg-white">
                  <Search className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                  <span>Tidak ada cabang eskul yang cocok dengan "{eskulSearch}".</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEskulSearch('');
                      setSelectedKategoriFilter('ALL');
                    }}
                    className="block mx-auto text-emerald-600 text-[11px] font-semibold mt-1 hover:underline cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Ganti Kata Sandi Akun (Opsional)
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00B884] hover:bg-emerald-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
