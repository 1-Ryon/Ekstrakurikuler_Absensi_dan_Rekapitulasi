import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  FileSpreadsheet, 
  GraduationCap, 
  Sparkles,
  Phone,
  Mail,
  User,
  Layers
} from 'lucide-react';
import { Kelas, Eskul } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelasList: Kelas[];
  eskulList: Eskul[];
  onSuccess: (message: string) => void;
  onOpenImportModal?: () => void;
}

interface QuickRow {
  id: string;
  nis: string;
  nisn: string;
  namaLengkap: string;
  kelasId: string;
  jenisKelamin: 'L' | 'P';
  noHp: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  kelasList = [],
  eskulList = [],
  onSuccess,
  onOpenImportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');

  // Single Student State
  const [singleNis, setSingleNis] = useState('');
  const [singleNisn, setSingleNisn] = useState('');
  const [singleNama, setSingleNama] = useState('');
  const [singleKelasId, setSingleKelasId] = useState(kelasList[0]?.id || '');
  const [singleJk, setSingleJk] = useState<'L' | 'P'>('L');
  const [singleNoHp, setSingleNoHp] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleSelectedEskuls, setSingleSelectedEskuls] = useState<string[]>([]);

  // Small Batch Rows State
  const [batchRows, setBatchRows] = useState<QuickRow[]>([
    { id: '1', nis: '', nisn: '', namaLengkap: '', kelasId: kelasList[0]?.id || '', jenisKelamin: 'L', noHp: '' },
    { id: '2', nis: '', nisn: '', namaLengkap: '', kelasId: kelasList[0]?.id || '', jenisKelamin: 'L', noHp: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultPasswordPreview = singleNis.trim()
    ? `al_amanah_${singleNis.trim().slice(-3) || '123'}`
    : 'al_amanah_***';

  const resetSingleForm = () => {
    setSingleNis('');
    setSingleNisn('');
    setSingleNama('');
    setSingleNoHp('');
    setSingleEmail('');
    setSingleSelectedEskuls([]);
    setErrorMessage(null);
  };

  const handleAddBatchRow = () => {
    setBatchRows(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        nis: '',
        nisn: '',
        namaLengkap: '',
        kelasId: singleKelasId || kelasList[0]?.id || '',
        jenisKelamin: 'L',
        noHp: '',
      },
    ]);
  };

  const handleRemoveBatchRow = (id: string) => {
    if (batchRows.length <= 1) return;
    setBatchRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateBatchRow = (id: string, field: keyof QuickRow, value: any) => {
    setBatchRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmitSingle = async (e?: React.FormEvent, continueAdding = false) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const nis = singleNis.trim();
    const namaLengkap = singleNama.trim();

    if (!nis) {
      setErrorMessage('Nomor Induk Siswa (NIS) wajib diisi.');
      return;
    }
    if (!namaLengkap) {
      setErrorMessage('Nama Lengkap siswa wajib diisi.');
      return;
    }

    const selectedKelasObj = kelasList.find(k => k.id === singleKelasId);

    setIsSubmitting(true);
    try {
      const res = await api.createStudent({
        nis,
        nisn: singleNisn.trim() || undefined,
        namaLengkap,
        kelasId: singleKelasId || undefined,
        kelas: selectedKelasObj?.namaKelas || undefined,
        jenisKelamin: singleJk,
        noHp: singleNoHp.trim() || undefined,
        email: singleEmail.trim() || undefined,
        eskulIds: singleSelectedEskuls,
      });

      onSuccess(res.message || `Siswa ${namaLengkap} berhasil ditambahkan!`);

      if (continueAdding) {
        resetSingleForm();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBatch = async () => {
    setErrorMessage(null);

    const validRows = batchRows.filter(r => r.nis.trim() && r.namaLengkap.trim());

    if (validRows.length === 0) {
      setErrorMessage('Minimal isi 1 baris siswa dengan NIS dan Nama Lengkap.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedStudents = validRows.map(r => {
        const kObj = kelasList.find(k => k.id === r.kelasId);
        return {
          nis: r.nis.trim(),
          nisn: r.nisn.trim() || r.nis.trim(),
          namaLengkap: r.namaLengkap.trim(),
          kelasId: r.kelasId || undefined,
          kelas: kObj?.namaKelas || 'X RPL 1',
          jenisKelamin: r.jenisKelamin,
          noHp: r.noHp.trim() || undefined,
        };
      });

      const res = await api.createStudent({
        students: formattedStudents,
      });

      onSuccess(res.message || `Berhasil menambahkan ${validRows.length} siswa baru!`);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan daftar siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[94vw] max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tambah Data Siswa Baru
              </h3>
              <p className="text-[11px] text-slate-500">
                Input formulir 1 siswa atau input cepat untuk penambahan jumlah kecil
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="size-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Tab Switcher & Mass Import Shortcut */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setActiveTab('SINGLE'); setErrorMessage(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'SINGLE'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="size-3.5" />
              <span>Formulir 1 Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('BATCH'); setErrorMessage(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'BATCH'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Input Cepat (Jumlah Kecil)</span>
            </button>
          </div>

          {onOpenImportModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenImportModal();
              }}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Impor File Spreadsheet Excel (Massal) ➔</span>
            </button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'SINGLE' ? (
            /* TAB 1: Single Student Form */
            <form id="single-student-form" onSubmit={(e) => handleSubmitSingle(e, false)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={singleNis}
                    onChange={(e) => setSingleNis(e.target.value)}
                    placeholder="Contoh: 2410114001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan sebagai Nama Pengguna (Username) login</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    NISN (Opsional)
                  </label>
                  <input
                    type="text"
                    value={singleNisn}
                    onChange={(e) => setSingleNisn(e.target.value)}
                    placeholder="Contoh: 0081234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleNama}
                  onChange={(e) => setSingleNama(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan Al-Fatih"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rombel Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={singleKelasId}
                    onChange={(e) => setSingleKelasId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas} (Tingkat {k.tingkat || 10} - {k.jurusan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSingleJk('L')}
                      className={`py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                        singleJk === 'L'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Laki-Laki (L)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSingleJk('P')}
                      className={`py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                        singleJk === 'P'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Perempuan (P)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    No. Handphone / WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    value={singleNoHp}
                    onChange={(e) => setSingleNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Siswa (Opsional)
                  </label>
                  <input
                    type="email"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    placeholder="Contoh: siswa@smk-alamanah.sch.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Ekstrakurikuler assignment (Optional) */}
              {eskulList.length > 0 && (
                <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Tugaskan Cabang Ekstrakurikuler (Opsional)
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                      {singleSelectedEskuls.length} Dipilih
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {eskulList.map((e) => {
                      const isChecked = singleSelectedEskuls.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => {
                            setSingleSelectedEskuls(prev =>
                              prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id]
                            );
                          }}
                          className={`text-left p-1.5 rounded border text-[11px] truncate transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate block">{e.namaEskul}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Credential Auto-generation Badge */}
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-blue-700 shrink-0" />
                  <span>Akun Login Otomatis: <strong>{singleNis || 'NIS'}</strong></span>
                </div>
                <div className="font-mono text-blue-800 text-[10px] bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                  Sandi: {defaultPasswordPreview}
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: Quick Multi-Row Batch for Small Numbers */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <p className="text-slate-500 text-[11px]">
                  Tambahkan beberapa siswa baru secara berurutan dalam tabel cepat:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {batchRows.filter(r => r.nis && r.namaLengkap).length} Siswa Terisi
                  </span>
                  <button
                    type="button"
                    onClick={() => setBatchRows([
                      { id: String(Date.now()), nis: '', nisn: '', namaLengkap: '', kelasId: kelasList[0]?.id || '', jenisKelamin: 'L', noHp: '' }
                    ])}
                    className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    Reset Baris
                  </button>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {batchRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 text-xs">Siswa #{idx + 1}</span>
                      {batchRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBatchRow(row.id)}
                          className="size-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">NIS *</label>
                        <input
                          type="text"
                          value={row.nis}
                          onChange={(e) => handleUpdateBatchRow(row.id, 'nis', e.target.value)}
                          placeholder="NIS (misal: 241001)"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Nama Lengkap *</label>
                        <input
                          type="text"
                          value={row.namaLengkap}
                          onChange={(e) => handleUpdateBatchRow(row.id, 'namaLengkap', e.target.value)}
                          placeholder="Nama Lengkap Siswa"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Rombel Kelas</label>
                        <select
                          value={row.kelasId}
                          onChange={(e) => handleUpdateBatchRow(row.id, 'kelasId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          {kelasList.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.namaKelas} ({k.jurusan})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Gender</label>
                          <select
                            value={row.jenisKelamin}
                            onChange={(e) => handleUpdateBatchRow(row.id, 'jenisKelamin', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">No. HP</label>
                          <input
                            type="text"
                            value={row.noHp}
                            onChange={(e) => handleUpdateBatchRow(row.id, 'noHp', e.target.value)}
                            placeholder="08..."
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBatchRow}
                className="w-full text-xs h-8 border-dashed border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 cursor-pointer gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>+ Tambah Baris Siswa Berikutnya</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs h-8 cursor-pointer"
          >
            Batal
          </Button>

          <div className="flex items-center gap-2">
            {activeTab === 'SINGLE' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting || !singleNis || !singleNama}
                  onClick={() => handleSubmitSingle(undefined, true)}
                  className="text-xs h-8 cursor-pointer border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  Simpan &amp; Tambah Lagi
                </Button>
                <Button
                  type="submit"
                  form="single-student-form"
                  variant="brand"
                  size="sm"
                  disabled={isSubmitting || !singleNis || !singleNama}
                  className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Simpan Siswa</span>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="brand"
                size="sm"
                disabled={isSubmitting || batchRows.filter(r => r.nis && r.namaLengkap).length === 0}
                onClick={handleSubmitBatch}
                className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Menyimpan Semua...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Simpan {batchRows.filter(r => r.nis && r.namaLengkap).length} Siswa</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
