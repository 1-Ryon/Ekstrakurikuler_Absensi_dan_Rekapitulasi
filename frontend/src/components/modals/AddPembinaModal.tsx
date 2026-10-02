import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Mail, Phone, Award, Volleyball, Check, Sparkles } from 'lucide-react';
import { Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface AddPembinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  eskulList: Eskul[];
  onSave: (data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    username?: string;
    password?: string;
    assignedEskulId?: string;
    assignedEskulIds?: string[];
  }) => void;
}

export const AddPembinaModal: React.FC<AddPembinaModalProps> = ({
  isOpen,
  onClose,
  eskulList,
  onSave,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nip, setNip] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [assignedEskulIds, setAssignedEskulIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const generatedUsername = namaLengkap
    ? namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.').slice(0, 25)
    : 'nama.pembina';
  const defaultPassword = `pembina_${generatedUsername}`;

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

    onSave({
      namaLengkap: namaLengkap.trim(),
      nip: nip.trim() || undefined,
      noHp: noHp.trim() || undefined,
      email: email.trim() || undefined,
      spesialisasi: spesialisasi.trim() || undefined,
      username: generatedUsername,
      password: defaultPassword,
      assignedEskulIds,
      assignedEskulId: assignedEskulIds[0] || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {namaLengkap ? (
              <UserAvatar name={namaLengkap} size="lg" className="ring-2 ring-emerald-500/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00B884] flex items-center justify-center font-bold text-lg">
                <UserPlus className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">
                Buat Akun Pembina Eskul Baru
              </h3>
              <p className="text-xs text-slate-500">
                Koordinator dapat mendaftarkan guru pembina dan menugaskannya ke cabang eskul (dapat lebih dari 1).
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
              Nama Lengkap Guru Pembina *
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Ahmad Syafii, S.Pd."
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
                placeholder="19850210..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pembina@smk-alamanah.sch.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Spesialisasi / Bidang
              </label>
              <input
                type="text"
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                placeholder="Contoh: Olahraga Futsal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          {/* Penugasan Cabang Eskul (Multi-Select) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volleyball className="w-4 h-4 text-[#00B884]" />
                <label className="font-bold text-slate-800 text-xs">
                  Tugaskan ke Eskul Binaan (Opsional)
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
              Pilih satu atau lebih cabang ekstrakurikuler yang akan langsung ditugaskan kepada pembina baru ini.
            </p>

            {/* List Eskul */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {eskulList.map((e) => {
                const isSelected = assignedEskulIds.includes(e.id);

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
                      {e.pembinaNama && !isSelected && (
                        <div className="text-[10px] text-amber-600 truncate mt-0.5">
                          Saat ini: {e.pembinaNama}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Akun Kredensial Preview */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Akun Login Pembina Otomatis Dibuat:</span>
            </div>
            <div className="font-mono text-slate-700 space-y-0.5">
              <div>Nama Pengguna: <strong className="text-blue-800">{generatedUsername}</strong></div>
              <div>Kata Sandi Bawaan: <strong className="text-blue-800">{defaultPassword}</strong></div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Buat Akun Pembina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
