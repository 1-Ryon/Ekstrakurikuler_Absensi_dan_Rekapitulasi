import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  Users, 
  Sparkles, 
  Clock, 
  Plus, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Badge, Button } from '../ui';
import { Eskul } from '../../types';

export interface DayScheduleItem {
  dayIndex: number;
  dayName: string;
  shortDay: string;
  jumlahEskul: number;
  kehadiranPercent: number;
  isToday: boolean;
  keterangan: string;
  eskulList: {
    id: string;
    namaEskul: string;
    kategori: string;
    jamMulai: string;
    jamSelesai: string;
    lokasi: string;
    pembinaNama: string;
    kuota: number;
    jumlahSiswa: number;
    rawEskul?: Eskul;
  }[];
}

interface WeeklyScheduleChartProps {
  weeklySchedule: DayScheduleItem[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  totalWeeklySessions: number;
  peakDays: string;
  todayDayName: string;
  onOpenAddEskul?: () => void;
}

export const WeeklyScheduleChart: React.FC<WeeklyScheduleChartProps> = ({
  weeklySchedule,
  selectedDayIndex,
  onSelectDay,
  totalWeeklySessions,
  peakDays,
  todayDayName,
  onOpenAddEskul,
}) => {
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const selectedDay = weeklySchedule[selectedDayIndex] || weeklySchedule[0];
  const activeDayForTooltip = hoveredDayIndex !== null 
    ? weeklySchedule[hoveredDayIndex] 
    : selectedDay;

  const svgWidth = 760;
  const svgHeight = 225;
  const paddingLeft = 58;
  const paddingRight = 36;
  const paddingTop = 32;
  const paddingBottom = 42;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight;

  const maxEskulCount = Math.max(...weeklySchedule.map(d => d.jumlahEskul), 0);
  const chartMaxVal = useMemo(() => {
    if (maxEskulCount <= 1) return 2;
    if (maxEskulCount <= 3) return 4;
    if (maxEskulCount <= 5) return 6;
    if (maxEskulCount <= 8) return 10;
    return Math.ceil((maxEskulCount + 2) / 2) * 2;
  }, [maxEskulCount]);

  const plotInnerLeft = 104;
  const plotInnerRight = 704;

  const xCoords = useMemo(() => {
    const span = plotInnerRight - plotInnerLeft;
    return [0, 1, 2, 3, 4, 5, 6].map(i => plotInnerLeft + (i / 6) * span);
  }, [plotInnerLeft, plotInnerRight]);

  const points = useMemo(() => {
    return weeklySchedule.map((d, i) => {
      const x = xCoords[i];
      const y = paddingTop + plotHeight - (d.jumlahEskul / chartMaxVal) * plotHeight;
      return { x, y, day: d, index: i };
    });
  }, [weeklySchedule, xCoords, paddingTop, plotHeight, chartMaxVal]);

  const straightLinePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  const barColumns = useMemo(() => {
    const slotWidth = plotWidth / 7;
    const barWidth = 44;
    return weeklySchedule.map((day, i) => {
      const colCenter = paddingLeft + (i + 0.5) * slotWidth;
      const barX = colCenter - barWidth / 2;
      const fillHeight = day.jumlahEskul > 0 
        ? Math.max(32, Math.round((day.jumlahEskul / chartMaxVal) * plotHeight))
        : 0;
      const fillY = baselineY - fillHeight;
      return {
        day,
        index: i,
        colCenter,
        barX,
        barWidth,
        fillHeight,
        fillY,
      };
    });
  }, [weeklySchedule, plotWidth, paddingLeft, chartMaxVal, plotHeight, baselineY]);

  const getBarColor = (day: DayScheduleItem, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) {
      return '#00B884';
    }
    if (day.isToday) {
      return '#00B884';
    }
    if (day.jumlahEskul === 0) {
      return '#cbd5e1';
    }
    const palette = [
      '#334155',
      '#00B884',
      '#1e293b',
      '#0d9488',
      '#00B884',
      '#334155',
      '#94a3b8',
    ];
    return palette[day.dayIndex % palette.length];
  };

  const getTimelineDotColor = (day: DayScheduleItem, barColor: string, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) return '#00B884';
    if (day.isToday) return '#f59e0b';
    if (day.jumlahEskul === 0) return '#cbd5e1';
    return barColor;
  };

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = chartMaxVal <= 4 ? 1 : chartMaxVal <= 8 ? 2 : Math.ceil(chartMaxVal / 5);
    for (let val = 0; val <= chartMaxVal; val += step) {
      const y = paddingTop + plotHeight - (val / chartMaxVal) * plotHeight;
      ticks.push({ val, y });
    }
    return ticks;
  }, [chartMaxVal, paddingTop, plotHeight]);

  const averageDaily = (totalWeeklySessions / 7).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="brand" className="text-xs font-semibold gap-1">
              <span>Jadwal Mingguan</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Total {totalWeeklySessions} Sesi Terjadwal / Pekan
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Grafik Kegiatan Eskul & Guru Pembina
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualisasi kegiatan eskul dan guru pembina. Pilih titik atau hari untuk melihat kegiatan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-border flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setChartMode('line')}
              className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                chartMode === 'line'
                  ? 'text-emerald-950 dark:text-emerald-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {chartMode === 'line' && (
                <motion.div
                  layoutId="chartModePill"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-[#00B884]" />
                <span>Tren Garis</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                chartMode === 'bar'
                  ? 'text-emerald-950 dark:text-emerald-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {chartMode === 'bar' && (
                <motion.div
                  layoutId="chartModePill"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-[#00B884]" />
                <span>Diagram Batang</span>
              </span>
            </button>
          </div>

          <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold border-emerald-200 bg-emerald-50/50 text-emerald-900">
            Hari : <strong className="text-[#00B884] ml-1">{selectedDay.dayName}</strong> ({selectedDay.jumlahEskul} Eskul)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Total Sesi Pekanan</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{totalWeeklySessions} Kegiatan</span>
          </div>
          <div className="size-8 rounded-md bg-emerald-50 text-[#00B884] flex items-center justify-center font-bold">
            <Calendar className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-border flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] text-muted-foreground font-medium block">Hari Sibuk</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block" title={peakDays}>
              {peakDays}
            </span>
          </div>
          <div className="size-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Rata-rata Harian</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{averageDaily} Eskul / Hari</span>
          </div>
          <div className="size-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Status Hari Ini ({todayDayName})</span>
            <span className="text-xs sm:text-sm font-bold text-[#00B884]">
              {weeklySchedule.find(d => d.isToday)?.jumlahEskul || 0} Eskul Aktif
            </span>
          </div>
          <div className="size-8 rounded-md bg-emerald-100/70 text-[#00B884] flex items-center justify-center font-bold">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
      </div>

      <div className="p-2.5 px-3.5 rounded-lg bg-gradient-to-r from-emerald-500/10 via-slate-50 to-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00B884] animate-pulse"></span>
          <span className="text-slate-600">
            Data Pada Hari     <strong className="text-slate-900 font-semibold">{activeDayForTooltip.dayName}</strong>
            {activeDayForTooltip.isToday && <span className="ml-1.5 text-[10px] text-[#00B884] font-bold uppercase">(Hari Ini)</span>}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-[#00B884]">
            {activeDayForTooltip.jumlahEskul > 0 
              ? `${activeDayForTooltip.jumlahEskul} Cabang Eskul Terjadwal` 
              : 'Tidak Ada Kegiatan Estrakurikuler pada hari ini'}
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground truncate">
          {activeDayForTooltip.eskulList.length > 0 ? (
            <span>Cabang: <strong className="text-slate-700">{activeDayForTooltip.eskulList.map(e => e.namaEskul).join(', ')}</strong></span>
          ) : (
            <span>Klik hari lain pada grafik untuk melihat pembina & jam latihan</span>
          )}
        </div>
      </div>

      <div className="relative bg-white dark:bg-slate-900/60 rounded-xl border border-border p-3 sm:p-5 shadow-2xs overflow-hidden">
        {totalWeeklySessions === 0 && (
          <div className="absolute inset-x-4 top-4 z-20 p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs shadow-xs backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-amber-600 shrink-0" />
              <span>Belum ada kegiatan eskul terjadwal di basis data. Garis grafik menampilkan garis dasar 0 eskul.</span>
            </div>
            {onOpenAddEskul && (
              <Button
                size="sm"
                variant="brand"
                onClick={onOpenAddEskul}
                className="h-7 text-xs font-semibold shrink-0 gap-1"
              >
                <Plus className="size-3" />
                <span>Tambah Eskul</span>
              </Button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {chartMode === 'line' ? (
            <motion.div
              key="line-chart-mode"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="w-full select-none"
            >
              <div className="relative w-full aspect-[760/225]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  {yTicks.map(({ val, y }) => (
                    <g key={val} className="text-slate-400">
                      <line
                        x1={56}
                        y1={y}
                        x2={724}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.14"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={38}
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-400 font-semibold select-none"
                      >
                        {val}
                      </text>
                    </g>
                  ))}

                  {points.map((pt) => (
                    <line
                      key={`vline-${pt.index}`}
                      x1={pt.x}
                      y1={paddingTop - 6}
                      x2={pt.x}
                      y2={baselineY}
                      stroke="currentColor"
                      strokeOpacity="0.10"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                      className="text-slate-400"
                    />
                  ))}

                  <text
                    x={38}
                    y={paddingTop - 14}
                    textAnchor="end"
                    className="text-[9px] font-bold fill-slate-400 uppercase tracking-wider select-none"
                  >
                    Grafik
                  </text>

                  {points.map((pt) => {
                    const isSelected = selectedDayIndex === pt.index;
                    const isHovered = hoveredDayIndex === pt.index;
                    if (!isSelected && !isHovered) return null;

                    return (
                      <line
                        key={`guide-${pt.index}`}
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={baselineY}
                        stroke="#00B884"
                        strokeOpacity={isSelected ? 0.45 : 0.25}
                        strokeDasharray="3 3"
                        strokeWidth="1.2"
                      />
                    );
                  })}

                  {straightLinePath && (
                    <motion.path
                      d={straightLinePath}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    />
                  )}

                  {points.map((pt) => {
                    const isSelected = selectedDayIndex === pt.index;
                    const isHovered = hoveredDayIndex === pt.index;
                    const isToday = pt.day.isToday;

                    return (
                      <g key={`point-${pt.index}`} className="transition-all">
                        {(isSelected || isHovered) && (
                          <motion.circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? 11 : 9}
                            fill="none"
                            stroke="#00B884"
                            strokeWidth={1.5}
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.15 }}
                          />
                        )}

                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 6.5 : isHovered ? 6 : 5.5}
                          fill="#ffffff"
                          stroke="#0f172a"
                          strokeWidth={isSelected ? 2.2 : 1.8}
                          className="transition-all"
                        />

                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 3.2 : isHovered ? 2.8 : 2.5}
                          fill={isSelected ? '#00B884' : isToday ? '#059669' : '#00B884'}
                          className="transition-all"
                        />

                        <text
                          x={pt.x}
                          y={pt.y - 11}
                          textAnchor="middle"
                          fill={isSelected ? '#00B884' : isHovered ? '#059669' : '#0f172a'}
                          fontSize="10.5"
                          fontWeight="700"
                          className="font-sans select-none tracking-tight"
                        >
                          {pt.day.jumlahEskul}
                        </text>

                        <g transform={`translate(${pt.x}, ${baselineY + 18})`}>
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            className={`text-[11px] font-bold select-none ${
                              isSelected
                                ? 'fill-[#00B884]'
                                : isToday
                                ? 'fill-emerald-700 dark:fill-emerald-400 font-extrabold'
                                : 'fill-slate-600 dark:fill-slate-300'
                            }`}
                          >
                            {pt.day.shortDay}
                          </text>

                          {isToday && (
                            <circle
                              cx="0"
                              cy="8"
                              r="2"
                              fill="#00B884"
                            />
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {points.map((pt) => (
                    <rect
                      key={`hit-${pt.index}`}
                      x={pt.x - 35}
                      y={paddingTop - 10}
                      width={70}
                      height={plotHeight + 48}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => onSelectDay(pt.index)}
                      onMouseEnter={() => setHoveredDayIndex(pt.index)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                    />
                  ))}
                </svg>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bar-chart-mode"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="w-full select-none"
            >
              <div className="relative w-full aspect-[760/225]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    {barColumns.map((col) => (
                      <clipPath key={`clip-${col.index}`} id={`barTrackClip-${col.index}`}>
                        <rect
                          x={col.barX}
                          y={paddingTop}
                          width={col.barWidth}
                          height={plotHeight}
                          rx={col.barWidth / 2}
                        />
                      </clipPath>
                    ))}
                  </defs>

                  <line
                    x1={paddingLeft + 10}
                    y1={baselineY + 16}
                    x2={svgWidth - paddingRight - 10}
                    y2={baselineY + 16}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="dark:stroke-slate-700"
                  />

                  {barColumns.map((col) => {
                    const isSelected = selectedDayIndex === col.index;
                    const isHovered = hoveredDayIndex === col.index;
                    const barColor = getBarColor(col.day, isSelected, isHovered);
                    const dotColor = getTimelineDotColor(col.day, barColor, isSelected, isHovered);

                    return (
                      <g key={`bar-col-${col.index}`}>
                        <rect
                          x={col.barX}
                          y={paddingTop}
                          width={col.barWidth}
                          height={plotHeight}
                          rx={col.barWidth / 2}
                          fill="#e2e8f0"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          className="dark:fill-slate-800 dark:stroke-slate-700 transition-colors"
                        />

                        {[0.25, 0.5, 0.75].map((ratio) => (
                          <line
                            key={ratio}
                            x1={col.barX + 2}
                            y1={paddingTop + plotHeight * ratio}
                            x2={col.barX + col.barWidth - 2}
                            y2={paddingTop + plotHeight * ratio}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeOpacity="0.9"
                            className="dark:stroke-slate-700/80"
                          />
                        ))}

                        {col.fillHeight > 0 && (
                          <g clipPath={`url(#barTrackClip-${col.index})`}>
                            <rect
                              x={col.barX}
                              y={col.fillY}
                              width={col.barWidth}
                              height={col.fillHeight}
                              rx={col.barWidth / 2}
                              fill={barColor}
                              className="transition-all duration-500 ease-out"
                            />
                          </g>
                        )}

                        {(isSelected || isHovered) && (
                          <rect
                            x={col.barX - 2}
                            y={paddingTop - 2}
                            width={col.barWidth + 4}
                            height={plotHeight + 4}
                            rx={(col.barWidth + 4) / 2}
                            fill="none"
                            stroke="#00B884"
                            strokeWidth="1.5"
                            strokeOpacity={isSelected ? 0.7 : 0.3}
                          />
                        )}

                        {col.day.jumlahEskul > 0 ? (
                          <g transform={`translate(${col.colCenter}, ${col.fillY + (col.fillHeight >= 50 ? 24 : col.fillHeight / 2 + 5)})`}>
                            <text
                              x="0"
                              y="0"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="15"
                              fontWeight="800"
                              className="font-sans select-none tracking-tight"
                            >
                              {col.day.jumlahEskul}
                            </text>
                            {col.fillHeight >= 50 && (
                              <text
                                x="0"
                                y="11"
                                textAnchor="middle"
                                fill="#ffffff"
                                fillOpacity="0.9"
                                fontSize="8"
                                fontWeight="700"
                                className="select-none tracking-wider uppercase font-sans"
                              >
                                Eskul
                              </text>
                            )}
                          </g>
                        ) : (
                          <text
                            x={col.colCenter}
                            y={baselineY - 14}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="11"
                            fontWeight="700"
                            className="select-none font-sans dark:fill-slate-400"
                          >
                            0
                          </text>
                        )}

                        <circle
                          cx={col.colCenter}
                          cy={baselineY + 16}
                          r={isSelected ? 5.5 : 4}
                          fill={dotColor}
                          stroke={isSelected ? '#00B884' : '#ffffff'}
                          strokeWidth={isSelected ? 2 : 1.5}
                          className="transition-all"
                        />

                        <text
                          x={col.colCenter}
                          y={baselineY + 32}
                          textAnchor="middle"
                          className={`text-[11px] font-bold select-none ${
                            isSelected
                              ? 'fill-[#00B884]'
                              : col.day.isToday
                              ? 'fill-emerald-600 dark:fill-emerald-400 font-extrabold'
                              : 'fill-slate-600 dark:fill-slate-400'
                          }`}
                        >
                          {col.day.shortDay}
                        </text>

                        <rect
                          x={col.barX - 8}
                          y={paddingTop - 5}
                          width={col.barWidth + 16}
                          height={plotHeight + 48}
                          fill="transparent"
                          className="cursor-pointer"
                          onClick={() => onSelectDay(col.index)}
                          onMouseEnter={() => setHoveredDayIndex(col.index)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Pilih Hari (Senin — Minggu):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weeklySchedule.map((day) => {
            const isSelected = selectedDayIndex === day.dayIndex;
            const isToday = day.isToday;

            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => onSelectDay(day.dayIndex)}
                className={`relative p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? 'border-[#00B884] bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-[#00B884] shadow-xs'
                    : isToday
                    ? 'border-emerald-300 bg-white dark:bg-slate-900 hover:border-emerald-400'
                    : 'border-border bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-[#00B884]' : 'text-slate-500'
                  }`}>
                    {day.shortDay}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#00B884]/15 text-[#00B884]">
                      Hari Ini
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {day.dayName}
                  </span>
                  <span className={`text-[11px] font-bold font-mono ${
                    day.jumlahEskul > 0 ? 'text-[#00B884]' : 'text-slate-400'
                  }`}>
                    {day.jumlahEskul} Eskul
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
