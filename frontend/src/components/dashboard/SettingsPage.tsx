import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Database,
  Building,
  Lock
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [qrExpiry, setQrExpiry] = useState<number>(15);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(100);
  const [kehadiranWeight, setKehadiranWeight] = useState<number>(40);
  const [keaktifanWeight, setKeaktifanWeight] = useState<number>(30);
  const [kinerjaWeight, setKinerjaWeight] = useState<number>(30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const totalWeight = kehadiranWeight + keaktifanWeight + kinerjaWeight;

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#00B884] tracking-tight">
          Pengaturan Sistem & Keamanan
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Konfigurasi parameter enkripsi QR dinamis, radius pembatasan wilayah (geofencing) presensi, dan formula bobot penilaian rapor.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Konfigurasi sistem berhasil diperbarui secara permanen!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Keamanan Dynamic QR & Anti-Fraud */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00B884] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Keamanan QR Dinamis & Anti-Kecurangan
              </h2>
              <p className="text-xs text-slate-400">
                Pencegahan kecurangan titip absen dan tangkapan layar (screenshot sharing).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Interval Regenerasi Token QR Dinamis (Detik)</span>
              </label>
              <select
                value={qrExpiry}
                onChange={(e) => setQrExpiry(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value={10}>10 Detik (Sangat Ketat)</option>
                <option value={15}>15 Detik (Rekomendasi PRD)</option>
                <option value={20}>20 Detik (Standar)</option>
                <option value={30}>30 Detik (Jaringan Lambat)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                QR Code payload otomatis diperbarui dengan timestamp & salt baru.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Radius Geofencing GPS Sekolah (Meter)</span>
              </label>
              <select
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              >
                <option value={50}>50 Meter (Area Inti Gedung)</option>
                <option value={100}>100 Meter (Seluruh Kompleks SMK Al Amanah)</option>
                <option value={200}>200 Meter (Toleransi Area Lapangan Luar)</option>
                <option value={0}>Nonaktifkan Geofencing</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Koordinat Sekolah: -6.34215, 106.71124 (Puspiptek Serpong)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Bobot Penilaian Rapor Semester */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Formula Bobot Penilaian Kompetensi Non-Akademik
              </h2>
              <p className="text-xs text-slate-400">
                Persentase komponen nilai untuk konversi rapor siswa (Total harus 100%).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Bobot Kehadiran (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={kehadiranWeight}
                onChange={(e) => setKehadiranWeight(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Bobot Keaktifan (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={keaktifanWeight}
                onChange={(e) => setKeaktifanWeight(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Bobot Kinerja / Keterampilan (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={kinerjaWeight}
                onChange={(e) => setKinerjaWeight(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B884]/20"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Akumulasi Bobot:</span>
            <span className={`font-bold ${totalWeight === 100 ? 'text-[#00B884]' : 'text-rose-600'}`}>
              {totalWeight}% {totalWeight === 100 ? '(Valid)' : '(Total Harus Tepat 100%)'}
            </span>
          </div>
        </div>

        {/* Card 3: Sekolah Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Profil Satuan Pendidikan
              </h2>
              <p className="text-xs text-slate-400">
                Informasi identitas sekolah untuk kop surat dan sertifikat KHN.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lembaga</label>
              <input
                type="text"
                readOnly
                defaultValue="SMK AL AMANAH KOTA TANGERANG SELATAN"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">NPSN</label>
              <input
                type="text"
                readOnly
                defaultValue="20614829"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={totalWeight !== 100}
            className="flex items-center gap-2 px-6 py-3 bg-[#00B884] hover:bg-[#009e70] active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
