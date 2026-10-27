import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Award, 
  Trophy, 
  Medal, 
  Calendar, 
  Building, 
  User, 
  FileText, 
  Sparkles, 
  Check, 
  Search,
  ChevronDown
} from 'lucide-react';
import { Eskul, StudentProfile, PrestasiLombaRecord } from '../../types';
import { api } from '../../services/api';

interface AddPrestasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  eskulList: Eskul[];
  students?: StudentProfile[];
  onSuccess: (newPrestasi: PrestasiLombaRecord) => void;
  defaultEskulId?: string;
}

export const AddPrestasiModal: React.FC<AddPrestasiModalProps> = ({
  isOpen,
  onClose,
  eskulList,
  students = [],
  onSuccess,
  defaultEskulId = '',
}) => {
  const [selectedEskulId, setSelectedEskulId] = useState<string>(
    defaultEskulId || (eskulList[0]?.id || '')
  );
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  const [namaLomba, setNamaLomba] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [tingkat, setTingkat] = useState<'KOTA' | 'PROVINSI' | 'NASIONAL' | 'INTERNASIONAL'>('KOTA');
  const [peringkat, setPeringkat] = useState<'JUARA_1' | 'JUARA_2' | 'JUARA_3' | 'HARAPAN_1' | 'FINALIS'>('JUARA_1');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate estimated bonus points based on tingkat & peringkat
  const calculatedPoints = useMemo(() => {
    if (peringkat === 'JUARA_1') {
      return tingkat === 'INTERNASIONAL' ? 25 : tingkat === 'NASIONAL' ? 20 : tingkat === 'PROVINSI' ? 15 : 10;
    } else if (peringkat === 'JUARA_2') {
      return tingkat === 'INTERNASIONAL' ? 20 : tingkat === 'NASIONAL' ? 15 : tingkat === 'PROVINSI' ? 12 : 8;
    } else if (peringkat === 'JUARA_3') {
      return tingkat === 'INTERNASIONAL' ? 15 : tingkat === 'NASIONAL' ? 12 : tingkat === 'PROVINSI' ? 10 : 6;
    }
    return 5;
  }, [tingkat, peringkat]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.namaLengkap.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.nis && s.nis.includes(studentSearch)) ||
        (s.kelas && s.kelas.toLowerCase().includes(studentSearch.toLowerCase()));
      return matchSearch;
    }).slice(0, 30);
  }, [students, studentSearch]);

  const selectedStudentObj = useMemo(() => {
    return students.find(s => s.id === selectedSiswaId);
  }, [students, selectedSiswaId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedEskulId) {
      setErrorMsg('Pilih ekstrakurikuler yang bersangkutan.');
      return;
    }
    if (!selectedSiswaId) {
      setErrorMsg('Pilih siswa peraih prestasi.');
      return;
    }
    if (!namaLomba.trim()) {
      setErrorMsg('Nama kejuaraan atau perlombaan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createPrestasi({
        eskulId: selectedEskulId,
        siswaId: selectedSiswaId,
        namaLomba: namaLomba.trim(),
        penyelenggara: penyelenggara.trim() || 'Kemenpora / Dinas Pendidikan',
        tingkat,
        peringkat,
        tanggal,
        keterangan: keterangan.trim(),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal mencatat prestasi lomba.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan server saat menyimpan prestasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-[92vw] max-w-xl overflow-hidden my-auto max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Catat Prestasi & Kejuaraan Lomba</h2>
              <p className="text-xs text-slate-500">Mendongkrak otomatis nilai rapor siswa dengan bobot bonus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md flex items-center gap-2">
              <span className="font-semibold">Perhatian:</span> {errorMsg}
            </div>
          )}

          {/* Eskul Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cabang Ekstrakurikuler <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEskulId}
              onChange={(e) => setSelectedEskulId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
              required
            >
              {eskulList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.namaEskul} ({e.kategori})
                </option>
              ))}
            </select>
          </div>

          {/* Student Search & Selection */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Siswa Peraih Prestasi <span className="text-rose-500">*</span>
            </label>

            {selectedStudentObj ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {selectedStudentObj.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{selectedStudentObj.namaLengkap}</div>
                    <div className="text-xs text-slate-500">NIS: {selectedStudentObj.nis} • Kelas {selectedStudentObj.kelas}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSiswaId('');
                    setIsStudentDropdownOpen(true);
                  }}
                  className="text-xs text-emerald-700 font-medium hover:underline px-2 py-1"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    placeholder="Ketik nama siswa atau NIS..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSiswaId(s.id);
                            setIsStudentDropdownOpen(false);
                            setStudentSearch('');
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-none"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{s.namaLengkap}</span>
                            <span className="text-slate-400 ml-1.5">({s.nis})</span>
                          </div>
                          <span className="text-emerald-600 font-medium">{s.kelas}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Tidak ada siswa yang cocok dengan pencarian
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nama Lomba & Penyelenggara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kejuaraan / Perlombaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaLomba}
                onChange={(e) => setNamaLomba(e.target.value)}
                placeholder="Contoh: Kejuaraan Futsal Pelajar Tangsel 2026"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instansi Penyelenggara
              </label>
              <input
                type="text"
                value={penyelenggara}
                onChange={(e) => setPenyelenggara(e.target.value)}
                placeholder="Contoh: Dispora / Kemenpora / MGMP"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tingkat & Peringkat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Kejuaraan <span className="text-rose-500">*</span>
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
              >
                <option value="KOTA">Tingkat Kota / Kabupaten</option>
                <option value="PROVINSI">Tingkat Provinsi</option>
                <option value="NASIONAL">Tingkat Nasional</option>
                <option value="INTERNASIONAL">Tingkat Internasional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pencapaian / Peringkat <span className="text-rose-500">*</span>
              </label>
              <select
                value={peringkat}
                onChange={(e) => setPeringkat(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
              >
                <option value="JUARA_1">🥇 Juara 1 (Medali Emas)</option>
                <option value="JUARA_2">🥈 Juara 2 (Medali Perak)</option>
                <option value="JUARA_3">🥉 Juara 3 (Medali Perunggu)</option>
                <option value="HARAPAN_1">🎗️ Juara Harapan 1</option>
                <option value="FINALIS">⭐ Finalis / Peserta Terbaik</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Poin Bonus Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Kejuaraan
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
              />
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-2xs uppercase tracking-wider text-amber-700 font-bold block">Bonus Otomatis</span>
                <span className="text-xs text-slate-600 font-medium">Masuk ke Rapor Siswa</span>
              </div>
              <div className="text-base font-extrabold text-amber-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>+{calculatedPoints} Poin</span>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Detail Prestasi
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Best Player dan Top Scorer turnamen dengan koleksi 8 gol."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00B884] focus:bg-white transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Prestasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
