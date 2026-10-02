import React, { useState, useEffect } from 'react';
import { X, Volleyball, Check, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    if (pembina) {
      setNamaLengkap(pembina.namaLengkap || '');
      setNip(pembina.nip && pembina.nip !== '-' ? pembina.nip : '');
      setNoHp(pembina.noHp && pembina.noHp !== '-' ? pembina.noHp : '');
      setEmail(pembina.email && pembina.email !== '-' ? pembina.email : '');
      setSpesialisasi(pembina.spesialisasi || '');
      setStatusAktif(pembina.statusAktif !== false);
      
      // Ambil SEMUA eskul yang saat ini dibina oleh pembina ini (Multi-Eskul)
      const coachedIds = eskulList
        .filter(e => e.pembinaId === pembina.id || (pembina.eskulDiampu && pembina.eskulDiampu.some(ed => ed.id === e.id)))
        .map(e => e.id);
      
      setAssignedEskulIds(coachedIds);
      setNewPassword('');
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
    setAssignedEskulIds(eskulList.map(e => e.id));
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <UserAvatar name={namaLengkap || pembina.namaLengkap} size="lg" className="ring-2 ring-emerald-500/20" />
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">
                Ubah Data Guru Pembina
              </h3>
              <p className="text-xs text-slate-500">
                Perbarui profil pembina, cabang binaan multi-eskul, dan kredensial akun login.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Lengkap Pembina *
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                NIP / NUPTK
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19840112 200902 1 001"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Status Akun
              </label>
              <select
                value={statusAktif ? 'AKTIF' : 'NON_AKTIF'}
                onChange={(e) => setStatusAktif(e.target.value === 'AKTIF')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value="AKTIF">Aktif</option>
                <option value="NON_AKTIF">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pembina@smk-alamanah.sch.id"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Spesialisasi / Keahlian
            </label>
            <input
              type="text"
              value={spesialisasi}
              onChange={(e) => setSpesialisasi(e.target.value)}
              placeholder="Contoh: Guru Olahraga & Pembina Futsal"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            />
          </div>

          {/* Penugasan Cabang Eskul (Multi-Select) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volleyball className="w-4 h-4 text-[#00B884]" />
                <label className="font-bold text-slate-800 text-xs">
                  Tugaskan ke Cabang Eskul
                </label>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#00B884] font-bold text-[10px]">
                  {assignedEskulIds.length} Eskul Dipilih
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllEskul}
                  className="text-[#00B884] hover:underline font-semibold cursor-pointer"
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

            {/* List Eskul */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {eskulList.map((e) => {
                const isSelected = assignedEskulIds.includes(e.id);
                const isOtherPembina = e.pembinaId && e.pembinaId !== pembina.id;

                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEskulSelection(e.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 border-[#00B884] shadow-2xs ring-1 ring-[#00B884]/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#00B884] text-white'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
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
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ganti Kata Sandi Akun (Opsional)
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
