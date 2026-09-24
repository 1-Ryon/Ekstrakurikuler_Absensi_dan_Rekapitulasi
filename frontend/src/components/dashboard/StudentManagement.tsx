import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Check, 
  Edit, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  QrCode,
  Printer
} from 'lucide-react';
import { StudentProfile, Eskul } from '../../types';
import { StudentCardModal } from '../modals/StudentCardModal';

interface StudentManagementProps {
  students: StudentProfile[];
  eskulList: Eskul[];
  onAssignEskul: (studentId: string, eskulIds: string[]) => void;
  onAddStudent: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  eskulList,
  onAssignEskul,
  onAddStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedEskulFilter, setSelectedEskulFilter] = useState('Semua');
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [selectedEskulsForEdit, setSelectedEskulsForEdit] = useState<string[]>([]);

  // Student Card Modal States
  const [cardModalStudent, setCardModalStudent] = useState<StudentProfile | null>(null);
  const [isBatchCardModalOpen, setIsBatchCardModalOpen] = useState(false);

  const classes = ['Semua', 'X RPL 1', 'X RPL 2', 'X AKL 1', 'XI RPL 1', 'XI TKJ 2', 'XI OTKP 1', 'XII RPL 1', 'XII BDP 2'];

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomorInduk.includes(searchTerm);
    const matchesClass = selectedClass === 'Semua' || s.kelas === selectedClass;
    const matchesEskul = selectedEskulFilter === 'Semua' || s.enrolledEskulIds.includes(selectedEskulFilter);
    return matchesSearch && matchesClass && matchesEskul;
  });

  const openAssignModal = (student: StudentProfile) => {
    setEditingStudent(student);
    setSelectedEskulsForEdit([...student.enrolledEskulIds]);
  };

  const handleToggleEskulSelect = (eskulId: string) => {
    if (selectedEskulsForEdit.includes(eskulId)) {
      setSelectedEskulsForEdit(selectedEskulsForEdit.filter(id => id !== eskulId));
    } else {
      setSelectedEskulsForEdit([...selectedEskulsForEdit, eskulId]);
    }
  };

  const handleSaveAssignment = () => {
    if (editingStudent) {
      onAssignEskul(editingStudent.id, selectedEskulsForEdit);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
            Kelola Data Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Database siswa terdaftar, status keanggotaan, dan kartu presensi QR Code siswa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Cetak Massal Kartu Siswa */}
          <button
            onClick={() => setIsBatchCardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#00B884] hover:bg-[#00B884]/5 text-[#00B884] font-semibold text-sm rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu Siswa (Massal PDF)</span>
          </button>

          <button
            onClick={onAddStudent}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan NISN atau Nama Siswa..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B884]/20 focus:border-[#00B884]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Filter Eskul:</span>
            <select
              value={selectedEskulFilter}
              onChange={(e) => setSelectedEskulFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
            >
              <option value="Semua">Semua Eskul</option>
              {eskulList.map(e => <option key={e.id} value={e.id}>{e.namaEskul}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Eskul Terdaftar</th>
                <th className="py-3.5 px-4 text-center">Kehadiran</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.map((student) => {
                const enrolledEskuls = eskulList.filter(e => student.enrolledEskulIds.includes(e.id));

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Siswa */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.namaLengkap}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{student.namaLengkap}</div>
                          <div className="text-xs text-slate-400">@{student.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* NISN */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">
                      {student.nomorInduk}
                    </td>

                    {/* Kelas */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                        {student.kelas}
                      </span>
                    </td>

                    {/* Eskul Terdaftar */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {enrolledEskuls.length > 0 ? (
                          enrolledEskuls.map(e => (
                            <span
                              key={e.id}
                              className="px-2 py-0.5 bg-emerald-50 text-[#00B884] text-[11px] font-medium rounded-full border border-emerald-100"
                            >
                              {e.namaEskul}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum assign eskul</span>
                        )}
                      </div>
                    </td>

                    {/* Kehadiran */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-full">
                        {student.kehadiranRataRata}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {student.statusAktif ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Cuti
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Cetak / Tampilkan Kartu QR Siswa */}
                        <button
                          onClick={() => setCardModalStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                          title="Lihat & Cetak Kartu Presensi QR Siswa"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#00B884]" />
                          <span>Kartu QR</span>
                        </button>

                        <button
                          onClick={() => openAssignModal(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00B884]/10 hover:bg-[#00B884]/20 text-[#00B884] font-semibold text-xs rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Assign Eskul</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredStudents.length} dari {students.length} Siswa Terdaftar</span>
          <span className="font-medium text-slate-700">Tahun Ajaran 2026/2027</span>
        </div>
      </div>

      {/* Modal Multi-Select Assign Eskul */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={editingStudent.avatarUrl}
                  alt={editingStudent.namaLengkap}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Assign Cabang Eskul
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingStudent.namaLengkap} ({editingStudent.kelas} - {editingStudent.nomorInduk})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Pilih satu atau lebih ekstrakurikuler yang diikuti oleh siswa ini:
            </p>

            {/* Checkboxes List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {eskulList.map((eskul) => {
                const isSelected = selectedEskulsForEdit.includes(eskul.id);
                return (
                  <div
                    key={eskul.id}
                    onClick={() => handleToggleEskulSelect(eskul.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00B884] bg-emerald-50/60'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>{eskul.namaEskul}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-normal">
                          {eskul.kategori}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Pembina: {eskul.pembinaNama} • {eskul.jadwalHari}, {eskul.jamMulai} WIB
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-[#00B884] border-[#00B884] text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAssignment}
                className="px-5 py-2 bg-[#00B884] hover:bg-[#009e70] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Kartu QR Satuan Siswa */}
      <StudentCardModal
        isOpen={cardModalStudent !== null}
        onClose={() => setCardModalStudent(null)}
        student={cardModalStudent}
        eskulList={eskulList}
        isBatchMode={false}
      />

      {/* Modal Cetak Massal Lembar A4 (Batch PDF) */}
      <StudentCardModal
        isOpen={isBatchCardModalOpen}
        onClose={() => setIsBatchCardModalOpen(false)}
        student={null}
        allStudents={filteredStudents}
        eskulList={eskulList}
        isBatchMode={true}
      />
    </div>
  );
};
