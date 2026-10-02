import React, { useState } from 'react';
import { X, GraduationCap, School, Mail, Phone } from 'lucide-react';
import { Kelas } from '../../types';

interface AddGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelasList: Kelas[];
  onSave: (data: {
    namaLengkap: string;
    nip?: string;
    jenisKelamin?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    username?: string;
    password?: string;
    isWaliKelas?: boolean;
    assignedKelasId?: string;
  }) => void;
}

export const AddGuruModal: React.FC<AddGuruModalProps> = ({
  isOpen,
  onClose,
  kelasList,
  onSave,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nip, setNip] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [assignedKelasId, setAssignedKelasId] = useState('');

  if (!isOpen) return null;

  const generatedUsername = namaLengkap
    ? namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.').slice(0, 25)
    : 'nama.guru';
  const defaultPassword = `guru_${generatedUsername}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    onSave({
      namaLengkap: namaLengkap.trim(),
      nip: nip.trim() || undefined,
      jenisKelamin,
      noHp: noHp.trim() || undefined,
      email: email.trim() || undefined,
      spesialisasi: spesialisasi.trim() || (assignedKelasId ? 'Wali Kelas & Guru Mata Pelajaran' : 'Guru Pengajar'),
      username: generatedUsername,
      password: defaultPassword,
      isWaliKelas: Boolean(assignedKelasId),
      assignedKelasId: assignedKelasId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Tambah Guru & Wali Kelas Baru
            </h3>
            <p className="text-xs text-slate-500">
              Daftarkan tenaga pendidik baru dan tentukan penugasan kelas bila ada.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Lengkap Guru *
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Siti Nurhaliza, M.Pd."
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
                placeholder="19870321 201301 2 006"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
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
                placeholder="guru@smk-alamanah.sch.id"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Spesialisasi / Mata Pelajaran
            </label>
            <input
              type="text"
              value={spesialisasi}
              onChange={(e) => setSpesialisasi(e.target.value)}
              placeholder="Contoh: Guru Matematika & Wali Kelas"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tugaskan Sebagai Wali Kelas (Opsional)
            </label>
            <select
              value={assignedKelasId}
              onChange={(e) => setAssignedKelasId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              <option value="">-- Belum Ditugaskan / Guru Pengajar Saja --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.jurusan}) {k.waliKelasId ? `(Saat ini: ${k.waliKelas?.namaLengkap || 'Ada Wali'})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Info Auto-Credential */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
            <School className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600">
              <span className="font-bold text-emerald-800">Akun Login Otomatis Dibuat:</span>
              <div className="mt-0.5 font-mono text-[10px] text-slate-700">
                Nama Pengguna: <strong>{generatedUsername}</strong> | Kata Sandi: <strong>{defaultPassword}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00B884] hover:bg-[#009E71] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Simpan Data Guru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
