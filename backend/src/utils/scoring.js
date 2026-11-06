
export function calculatePredicate(score) {
  const rounded = Math.round(Number(score) * 100) / 100;
  if (rounded >= 85.0) return 'A';
  if (rounded >= 75.0) return 'B';
  if (rounded >= 65.0) return 'C';
  return 'D';
}

export function getPredicateDescription(predicate) {
  switch (predicate) {
    case 'A':
      return 'Sangat Baik';
    case 'B':
      return 'Baik';
    case 'C':
      return 'Cukup';
    case 'D':
    default:
      return 'Perlu Pembinaan';
  }
}

export function calculatePrestasiPoints(tingkat = 'KOTA', peringkat = 'JUARA_1') {
  const t = String(tingkat).toUpperCase();
  const p = String(peringkat).toUpperCase();

  if (p === 'JUARA_1') {
    if (t === 'INTERNASIONAL') return 20.0;
    if (t === 'NASIONAL') return 15.0;
    if (t === 'PROVINSI') return 12.0;
    return 10.0;
  }

  if (p === 'JUARA_2') {
    if (t === 'INTERNASIONAL') return 15.0;
    if (t === 'NASIONAL') return 12.0;
    if (t === 'PROVINSI') return 10.0;
    return 8.0;
  }

  if (p === 'JUARA_3') {
    if (t === 'INTERNASIONAL') return 12.0;
    if (t === 'NASIONAL') return 10.0;
    if (t === 'PROVINSI') return 8.0;
    return 6.0;
  }

  if (p === 'HARAPAN_1' || p === 'FINALIS') {
    return 5.0;
  }

  return 5.0;
}

export function computeFinalScore({
  nilaiKehadiran = 0,
  nilaiKeaktifan = 0,
  nilaiKinerja = 0,
  poinPrestasi = 0,
}) {
  const rawKehadiran = Math.min(100, Math.max(0, Number(nilaiKehadiran) || 0));
  const rawKeaktifan = Math.min(100, Math.max(0, Number(nilaiKeaktifan) || 0));
  const rawKinerja = Math.min(100, Math.max(0, Number(nilaiKinerja) || 0));
  const rawPrestasi = Math.max(0, Number(poinPrestasi) || 0);

  const weightedTotal =
    rawKehadiran * 0.40 +
    rawKeaktifan * 0.25 +
    rawKinerja * 0.25 +
    rawPrestasi;

  const clamped = Math.min(100.0, Math.max(0.0, Math.round(weightedTotal * 10) / 10));
  const predikat = calculatePredicate(clamped);

  return {
    nilaiKehadiran: rawKehadiran,
    nilaiKeaktifan: rawKeaktifan,
    nilaiKinerja: rawKinerja,
    poinPrestasi: rawPrestasi,
    nilaiAkhir: clamped,
    predikat,
    keteranganPredikat: getPredicateDescription(predikat),
  };
}
