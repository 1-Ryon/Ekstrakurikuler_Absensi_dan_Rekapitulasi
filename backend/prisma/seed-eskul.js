import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eskulMasterList = [
  {
    id: 'eskul-01',
    namaEskul: 'Futsal Prestasi',
    kategori: 'Olahraga',
    pembinaId: 'guru-pem-01',
    jadwalHari: 'Kamis',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    lokasi: 'Lapangan Futsal SMK Al Amanah',
    kuota: 50,
    status: 'Aktif',
    deskripsi: 'Pelatihan teknik sepak bola mini, taktik tim, dan persiapan turnamen antar SMK se-Jabodetabek.',
  },
  {
    id: 'eskul-02',
    namaEskul: 'Computer & Web Club',
    kategori: 'Teknologi',
    pembinaId: 'guru-pem-02',
    jadwalHari: 'Jumat',
    jamMulai: '13:30',
    jamSelesai: '15:30',
    lokasi: 'Lab Komputer RPL 1',
    kuota: 50,
    status: 'Aktif',
    deskripsi: 'Pengembangan web modern, React, Node.js, UI/UX, dan persiapan lomba kompetensi siswa (LKS).',
  },
  {
    id: 'eskul-03',
    namaEskul: 'Seni Hadroh & Marawis',
    kategori: 'Seni & Budaya',
    pembinaId: 'guru-pem-03',
    jadwalHari: 'Rabu',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Aula Masjid SMK Al Amanah',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Seni musik perkusi Islami dan pelestarian syiar sholawat nabi.',
  },
  {
    id: 'eskul-04',
    namaEskul: 'Tilawatil Qur’an & Tahfidz',
    kategori: 'Keagamaan',
    pembinaId: 'guru-pem-04',
    jadwalHari: 'Selasa',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Musholla Al-Ikhlas Lt. 2',
    kuota: 40,
    status: 'Aktif',
    deskripsi: 'Pelatihan seni baca Qur’an dengan kaidah tajwid, nagham, makhorijul huruf, dan hafalan juz 30.',
  },
  {
    id: 'eskul-05',
    namaEskul: 'Paskibra Satya Amanah',
    kategori: 'Kepemimpinan',
    pembinaId: 'guru-pem-05',
    jadwalHari: 'Sabtu',
    jamMulai: '07:30',
    jamSelesai: '10:30',
    lokasi: 'Plaza Upacara SMK Al Amanah',
    kuota: 50,
    status: 'Aktif',
    deskripsi: 'Latihan baris berbaris (PBB), formasi pengibaran bendera pusaka, dan pembentukan kedisiplinan.',
  },
  {
    id: 'eskul-06',
    namaEskul: 'Pramuka Penegak',
    kategori: 'Kepemimpinan',
    pembinaId: 'guru-pem-06',
    jadwalHari: 'Kamis',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    lokasi: 'Lapangan Utama & Gedung B',
    kuota: 60,
    status: 'Aktif',
    deskripsi: 'Kepanduan pramuka wajib dan penegak bantara dengan materi survival, tali temali, dan morse.',
  },
  {
    id: 'eskul-07',
    namaEskul: 'Rohis Al-Ikhlas',
    kategori: 'Keagamaan',
    pembinaId: 'guru-pem-07',
    jadwalHari: 'Jumat',
    jamMulai: '11:30',
    jamSelesai: '13:00',
    lokasi: 'Masjid SMK Al Amanah',
    kuota: 60,
    status: 'Aktif',
    deskripsi: 'Kajian keislaman, bimbingan akhlak, pembiasaan sholat dhuha, dan kepanitiaan PHBI.',
  },
  {
    id: 'eskul-08',
    namaEskul: 'Palang Merah Remaja (PMR)',
    kategori: 'Kepemimpinan',
    pembinaId: 'guru-koor-01',
    jadwalHari: 'Senin',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Ruang UKS & Lapangan',
    kuota: 45,
    status: 'Aktif',
    deskripsi: 'Pertolongan pertama (PP), evakuasi tandu darurat, donor darah, dan kesiapsiagaan medis sekolah.',
  },
  {
    id: 'eskul-09',
    namaEskul: 'Bola Voli Taruna',
    kategori: 'Olahraga',
    pembinaId: 'guru-pem-08',
    jadwalHari: 'Kamis',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    lokasi: 'Lapangan Voli Outdoor',
    kuota: 40,
    status: 'Aktif',
    deskripsi: 'Latihan servis, smash, passing atas/bawah, dan turnamen bola voli pelajar antar sekolah.',
  },
  {
    id: 'eskul-10',
    namaEskul: 'Badminton Club',
    kategori: 'Olahraga',
    pembinaId: 'guru-pem-09',
    jadwalHari: 'Selasa',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'GOR Bulutangkis Al Amanah',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Latihan teknik dasar bulutangkis, footwork, netting, smash, dan sparring rutin.',
  },
  {
    id: 'eskul-11',
    namaEskul: 'Seni Tari Tradisional',
    kategori: 'Seni & Budaya',
    pembinaId: 'guru-pem-10',
    jadwalHari: 'Rabu',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Sanggar Seni Lt. 3',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Eksplorasi ragam tari tradisional Nusantara (Jaipong, Saman, Piring) dan kreasi kontemporer.',
  },
  {
    id: 'eskul-12',
    namaEskul: 'Fotografi & Jurnalistik',
    kategori: 'Teknologi',
    pembinaId: 'guru-pem-11',
    jadwalHari: 'Sabtu',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    lokasi: 'Studio Multimedia & Lapangan',
    kuota: 40,
    status: 'Aktif',
    deskripsi: 'Teknik fotografi kamera DSLR/Mirrorless, komposisi visual, jurnalisme sekolah, dan podcast.',
  },
  {
    id: 'eskul-13',
    namaEskul: 'English Debate Club',
    kategori: 'Teknologi',
    pembinaId: 'guru-pem-12',
    jadwalHari: 'Senin',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Ruang Multimedia 2',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Pengembangan kemampuan debat bahasa Inggris format Asian & British Parliamentary, speech, dan storytelling.',
  },
  {
    id: 'eskul-14',
    namaEskul: 'Japanese Club & Manga',
    kategori: 'Seni & Budaya',
    pembinaId: 'guru-pem-13',
    jadwalHari: 'Jumat',
    jamMulai: '13:30',
    jamSelesai: '15:00',
    lokasi: 'Ruang Bahasa Lt. 2',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Belajar bahasa Jepang (Hiragana/Katakana), percakapan dasar kaiwa, origami, dan menggambar manga.',
  },
  {
    id: 'eskul-15',
    namaEskul: 'Desain Komunikasi Visual',
    kategori: 'Teknologi',
    pembinaId: 'guru-pem-14',
    jadwalHari: 'Selasa',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    lokasi: 'Lab Desain Grafis',
    kuota: 40,
    status: 'Aktif',
    deskripsi: 'Pelatihan ilustrasi digital, Photoshop, Illustrator, branding logo, dan animasi 2D.',
  },
  {
    id: 'eskul-16',
    namaEskul: 'Marching Band Gita Amanah',
    kategori: 'Seni & Budaya',
    pembinaId: 'guru-pem-15',
    jadwalHari: 'Sabtu',
    jamMulai: '14:00',
    jamSelesai: '17:00',
    lokasi: 'Plaza & GOR Indoor',
    kuota: 50,
    status: 'Aktif',
    deskripsi: 'Latihan korps musik tiup brass, perkusi pit, color guard, dan drill parade upacara.',
  },
  {
    id: 'eskul-17',
    namaEskul: 'Basket Ball Club',
    kategori: 'Olahraga',
    pembinaId: 'guru-pem-16',
    jadwalHari: 'Rabu',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    lokasi: 'Lapangan Basket Utama',
    kuota: 45,
    status: 'Aktif',
    deskripsi: 'Teknik fundamental bola basket, dribbling, shooting three-point, defence, dan sparring DBL.',
  },
  {
    id: 'eskul-18',
    namaEskul: 'Teater Seni Peran',
    kategori: 'Seni & Budaya',
    pembinaId: 'guru-pem-17',
    jadwalHari: 'Jumat',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    lokasi: 'Panggung Utama SMK Al Amanah',
    kuota: 35,
    status: 'Aktif',
    deskripsi: 'Olah vokal, keaktoran, tata panggung, monolog, dan pementasan drama musikal tahunan.',
  },
];

async function seedEskulOnly() {
  console.log('🚀 [SEED ESKUL] Memulai pengisian data ekstrakurikuler ke database...');

  // 1. Pastikan pembina tersedia (jika belum, gunakan guru pertama yang ada)
  const defaultGuru = await prisma.guru.findFirst();
  if (!defaultGuru) {
    console.error('❌ Tidak ada data guru di database. Jalankan `npm run db:seed` terlebih dahulu.');
    process.exit(1);
  }

  const existingPembinas = await prisma.guru.findMany({ select: { id: true } });
  const pembinaIdSet = new Set(existingPembinas.map((g) => g.id));

  // 2. Insert atau Upsert 18 Cabang Eskul
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of eskulMasterList) {
    const validPembinaId = pembinaIdSet.has(item.pembinaId) ? item.pembinaId : defaultGuru.id;
    const eskulData = {
      ...item,
      pembinaId: validPembinaId,
    };

    const existing = await prisma.eskul.findUnique({ where: { id: item.id } });
    if (existing) {
      await prisma.eskul.update({
        where: { id: item.id },
        data: eskulData,
      });
      updatedCount++;
    } else {
      await prisma.eskul.create({
        data: eskulData,
      });
      createdCount++;
    }
  }

  console.log(`✅ Sukses memproses 18 Ekstrakurikuler: ${createdCount} baru dibuat, ${updatedCount} diperbarui.`);

  // 3. Daftarkan keanggotaan siswa (AnggotaEskul) jika siswa ada
  const allStudents = await prisma.siswa.findMany({ select: { id: true } });
  if (allStudents.length > 0) {
    console.log(`⏳ Memetakan keanggotaan eskul untuk ${allStudents.length} siswa...`);
    let anggotaCreated = 0;

    for (let i = 0; i < allStudents.length; i++) {
      const siswa = allStudents[i];
      const eskul1 = eskulMasterList[i % eskulMasterList.length];

      try {
        await prisma.anggotaEskul.upsert({
          where: {
            eskulId_siswaId_tahunAjaran: {
              eskulId: eskul1.id,
              siswaId: siswa.id,
              tahunAjaran: '2026/2027',
            },
          },
          update: {},
          create: {
            id: `ang-${siswa.id}-${eskul1.id}`,
            eskulId: eskul1.id,
            siswaId: siswa.id,
            tahunAjaran: '2026/2027',
            jabatan: i % 25 === 0 ? 'KETUA' : 'ANGGOTA',
            status: 'AKTIF',
          },
        });
        anggotaCreated++;
      } catch {
        // ignore unique duplicate
      }
    }
    console.log(`✅ Keanggotaan siswa terpetakan (${anggotaCreated} data).`);
  }

  // 4. Buat sesi pertemuan hari ini untuk setiap eskul (agar siap dicoba absensi QR)
  const todayStr = new Date().toISOString().slice(0, 10);
  let sessionCreated = 0;

  for (let idx = 0; idx < eskulMasterList.length; idx++) {
    const e = eskulMasterList[idx];
    const sessionId = `sesi-${String(idx + 1).padStart(2, '0')}`;
    const validPembinaId = pembinaIdSet.has(e.pembinaId) ? e.pembinaId : defaultGuru.id;

    try {
      const existingSession = await prisma.sesiPertemuan.findFirst({
        where: { eskulId: e.id, tanggal: todayStr },
      });

      if (!existingSession) {
        await prisma.sesiPertemuan.create({
          data: {
            id: sessionId,
            eskulId: e.id,
            pembuatId: validPembinaId,
            tanggal: todayStr,
            jamMulai: e.jamMulai,
            jamSelesai: e.jamSelesai,
            lokasi: e.lokasi,
            judul: `Latihan Rutin ${e.namaEskul}`,
            deskripsi: `Materi pemantapan teknik lapangan, kedisiplinan, dan persiapan agenda sekolah.`,
            materi: `Modul Latihan Resmi: ${e.namaEskul}`,
            tokenAktif: `SMK-AMANAH:${e.id}:${Math.floor(Date.now() / 15000)}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            tokenExpiresAt: new Date(Date.now() + 60000),
            status: 'BERLANGSUNG',
            isLibur: false,
          },
        });
        sessionCreated++;
      }
    } catch {
      // ignore
    }
  }

  console.log(`✅ ${sessionCreated} Sesi Latihan Hari Ini siap digunakan.`);
  console.log('\n🎉 Pengisian data eskul ke database selesai dengan sukses!');
  await prisma.$disconnect();
}

seedEskulOnly().catch(async (err) => {
  console.error('❌ Gagal mengisi data eskul:', err);
  await prisma.$disconnect();
  process.exit(1);
});
