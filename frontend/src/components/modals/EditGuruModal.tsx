import React, { useState, useEffect } from 'react';
import { X, GraduationCap, School, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import { Guru, Kelas } from '../../types';

interface EditGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  guru: Guru | null;
  kelasList: Kelas[];
  onSave: (id: string, data: {
    namaLengkap: string;
    nip?: string;
    noHp?: string;
    email?: string;
    spesialisasi?: string;
    statusAktif?: boolean;
    isWaliKelas?: boolean;
    assignedKelasId?: string;
    password?: string;
  }) => void;
}

export const EditGuruModal: React.FC<EditGuruModalProps> = ({
  isOpen,
  onClose,
  guru,
  kelasList,
  onSave,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nip, setNip] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  const [assignedKelasId, setAssignedKelasId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (guru) {
      setNamaLengkap(guru.namaLengkap || '');
      setNip(guru.nip && guru.nip !== '-' ? guru.nip : '');
      setNoHp(guru.noHp && guru.noHp !== '-' ? guru.noHp : '');
      setEmail(guru.email && guru.email !== '-' ? guru.email : '');
      setSpesialisasi(guru.spesialisasi || '');
      setStatusAktif(guru.statusAktif !== false);
      const assigned = kelasList.find(k => k.waliKelasId === guru.id);
      setAssignedKelasId(assigned?.id || '');
      setNewPassword('');
    }
  }, [guru, isOpen, kelasList]);

  if (!isOpen || !guru) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    onSave(guru.id, {
      namaLengkap: namaLengkap.trim(),
      nip: nip.trim() || undefined,
      noHp: noHp.trim() || undefined,
      email: email.trim() || undefined,
      spesialisasi: spesialisasi.trim() || undefined,
      statusAktif,
      isWaliKelas: Boolean(assignedKelasId),
      assignedKelasId: assignedKelasId || '',
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
        className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Ubah Data Guru / Wali Kelas
            </h3>
            <p className="text-xs text-slate-500">
              Perbarui biodata, penugasan rombel kelas, dan status akun login.
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
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nama Lengkap Guru *
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Status Keaktifan Akun
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Spesialisasi / Bidang
            </label>
            <input
              type="text"
              value={spesialisasi}
              onChange={(e) => setSpesialisasi(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Tugas Wali Kelas
            </label>
            <select
              value={assignedKelasId}
              onChange={(e) => setAssignedKelasId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
            >
              <option value="">-- Tidak Ada / Kosongkan --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.jurusan}) {k.waliKelasId && k.waliKelasId !== guru.id ? `(Saat ini: ${k.waliKelas?.namaLengkap})` : ''}
                </option>
              ))}
            </select>
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
