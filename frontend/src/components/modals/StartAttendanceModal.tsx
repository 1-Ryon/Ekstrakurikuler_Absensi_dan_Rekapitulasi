import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Trash2
} from 'lucide-react';
import { SesiPertemuan } from '../../types';
import { api } from '../../services/api';

interface StartAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SesiPertemuan | null;
  onStartSuccess: (updatedSession: SesiPertemuan) => void;
}

export const StartAttendanceModal: React.FC<StartAttendanceModalProps> = ({
  isOpen,
  onClose,
  session,
  onStartSuccess,
}) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoKegiatanUrl, setFotoKegiatanUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      setJudul(session.judul || `Latihan Rutin ${session.namaEskul}`);
      setDeskripsi(session.deskripsi || session.materi || 'Pemanasan, pembinaan teknik, dan evaluasi kegiatan ekstrakurikuler.');
      setFotoKegiatanUrl(session.fotoKegiatan || '');
      setImagePreview(session.fotoKegiatan || null);
      setSelectedFile(null);
      setErrorMsg(null);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Format file harus berupa gambar (JPG, PNG, atau WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5 MB.');
        return;
      }

      setErrorMsg(null);
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFotoKegiatanUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      setErrorMsg('Judul kegiatan wajib diisi sebelum memulai absensi.');
      return;
    }
    if (!deskripsi.trim()) {
      setErrorMsg('Deskripsi atau ringkasan materi kegiatan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalPhotoUrl = fotoKegiatanUrl || imagePreview || '';

      if (selectedFile) {
        try {
          const uploadRes = await api.uploadFile(selectedFile);
          if (uploadRes && uploadRes.url) {
            finalPhotoUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          // If server upload fails, fallback to data URL preview so flow is not blocked
          console.warn('Upload API fallback to data URL:', uploadErr);
          if (imagePreview) {
            finalPhotoUrl = imagePreview;
          }
        }
      }

      let res;
      try {
        if (session.id && !session.id.startsWith('sesi-auto-')) {
          res = await api.startAttendanceSession(session.id, {
            judul: judul.trim(),
            deskripsi: deskripsi.trim(),
            materi: deskripsi.trim(),
            fotoKegiatan: finalPhotoUrl,
          });
        } else {
          // Buat sesi baru di backend jika id sesi merupakan placeholder otomatis
          res = await api.createSession({
            eskulId: session.eskulId,
            judul: judul.trim(),
            deskripsi: deskripsi.trim(),
            materi: deskripsi.trim(),
            fotoKegiatan: finalPhotoUrl,
            jamMulai: session.jamMulai,
            jamSelesai: session.jamSelesai,
            lokasi: session.lokasi,
          });
        }
      } catch (callErr: any) {
        // Fallback pembuatan sesi
        if (session.id.startsWith('sesi-auto-')) {
          res = await api.createSession({
            eskulId: session.eskulId,
            judul: judul.trim(),
            deskripsi: deskripsi.trim(),
            materi: deskripsi.trim(),
            fotoKegiatan: finalPhotoUrl,
            jamMulai: session.jamMulai,
            jamSelesai: session.jamSelesai,
            lokasi: session.lokasi,
          });
        } else {
          throw callErr;
        }
      }

      let updatedSession: SesiPertemuan;
      if (res && 'data' in (res as any) && (res as any).data) {
        updatedSession = (res as any).data;
      } else if (res && 'id' in (res as any)) {
        updatedSession = res as SesiPertemuan;
      } else {
        updatedSession = {
          ...session,
          judul: judul.trim(),
          deskripsi: deskripsi.trim(),
          materi: deskripsi.trim(),
          fotoKegiatan: finalPhotoUrl,
          status: 'BERLANGSUNG' as const,
          isLocked: false,
        };
      }

      onStartSuccess(updatedSession);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memulai sesi absensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[92vw] max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Play className="size-5 fill-emerald-600 text-emerald-600 ml-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Mulai Sesi Absensi Ekstrakurikuler
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-emerald-700">{session.namaEskul}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="size-3 text-slate-400" />
                  {session.jamMulai} - {session.jamSelesai} WIB
                </span>
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

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-900 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-950">
              <Sparkles className="size-3.5 text-emerald-600" />
              <span>Syarat Verifikasi Pembukaan Presensi</span>
            </span>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Sebelum membagikan QR proyektor, memindai kartu siswa, atau mengisi presensi langsung, pembina wajib mengisi judul kegiatan hari ini dan melampirkan foto dokumentasi latihan.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Judul / Topik Kegiatan Hari Ini <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Latihan Rutin Pekanan & Pembekalan Teknik Dasar"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Rincian Materi &amp; Deskripsi Latihan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan materi yang dibahas, agenda latihan, atau instruksi pelaksanaan..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Foto Bukti / Dokumentasi Kegiatan Hari Ini <span className="text-slate-400 font-normal text-[11px]">(Opsional - Dapat diunggah saat kegiatan)</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
                <img
                  src={imagePreview}
                  alt="Bukti Kegiatan"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-md shadow hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="size-3.5 text-emerald-600" />
                    <span>Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-md shadow hover:bg-rose-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/70 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  <span>Foto Terlampir</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-2"
              >
                <div className="size-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Camera className="size-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Klik untuk Ambil Foto / Unggah Berkas Dokumentasi
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mendukung kamera langsung HP atau file foto (JPG, PNG, WebP maks 5 MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-slate-400" />
              <span>Lokasi: {session.lokasi || 'SMK Al Amanah'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B884] hover:bg-emerald-600 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Membuka Sesi...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-white text-white" />
                    <span>Mulai &amp; Buka Absensi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
