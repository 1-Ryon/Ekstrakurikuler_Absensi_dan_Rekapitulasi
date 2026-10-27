import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Upload,
  Phone, 
  Mail, 
  Award, 
  Volleyball, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  Eye,
  EyeOff
} from 'lucide-react';
import { Guru, Eskul } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui';

interface PembinaManagementProps {
  pembinaList: Guru[];
  eskulList: Eskul[];
  onAddPembina: () => void;
  onOpenImport?: () => void;
  onEditPembina: (pembina: Guru) => void;
  onDeletePembina: (id: string) => void;
}

export const PembinaManagement: React.FC<PembinaManagementProps> = ({
  pembinaList,
  eskulList,
  onAddPembina,
  onOpenImport,
  onEditPembina,
  onDeletePembina,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEskulFilter, setSelectedEskulFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute statistics
  const totalPembina = pembinaList.length;
  const activePembina = pembinaList.filter(p => p.statusAktif !== false).length;
  const coachedEskulCount = eskulList.filter(e => e.pembinaId).length;

  // Filtered list
  const filteredList = useMemo(() => {
    return pembinaList.filter((p) => {
      // Search query
      const matchesSearch = 
        p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.spesialisasi && p.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.eskulDiampu && p.eskulDiampu.some(e => e.namaEskul.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      // Eskul Filter
      if (selectedEskulFilter !== 'ALL') {
        const hasEskul = p.eskulDiampu?.some(e => e.id === selectedEskulFilter || e.namaEskul === selectedEskulFilter);
        if (!hasEskul) return false;
      }

      // Status Filter
      if (selectedStatusFilter === 'AKTIF' && p.statusAktif === false) return false;
      if (selectedStatusFilter === 'NON_AKTIF' && p.statusAktif !== false) return false;

      return true;
    });
  }, [pembinaList, searchTerm, selectedEskulFilter, selectedStatusFilter]);

  const activeFiltersCount = (selectedEskulFilter !== 'ALL' ? 1 : 0) + (selectedStatusFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              SMK Al-Amanah
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Guru Pembina
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
            Master data pembina ekstrakurikuler, penugasan cabang eskul, dan kredensial akun login.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenImport}
              className="gap-2"
            >
              <Upload className="size-4 text-emerald-600" />
              <span>Impor Data Pembina</span>
            </Button>
          )}
          <Button
            variant="brand"
            size="sm"
            onClick={onAddPembina}
            className="gap-2"
          >
            <Plus className="size-4" />
            <span> Buat Akun Pembina</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pembina Terdaftar
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {totalPembina} <span className="text-xs font-normal text-muted-foreground">Guru</span>
            </div>
          </div>
          <div className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="size-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pembina Aktif Bertugas
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {activePembina} <span className="text-xs font-normal text-muted-foreground">Akun</span>
            </div>
          </div>
          <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cabang Eskul Terbina
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {coachedEskulCount} <span className="text-xs font-normal text-muted-foreground">Cabang</span>
            </div>
          </div>
          <div className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Volleyball className="size-5" />
          </div>
        </Card>
      </div>

      {/* Search, Filter, & View Mode Bar */}
      <Card className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pembina, NIP, eskul, username..."
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Trigger Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            className={`gap-2 h-9 text-xs ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : ''
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <Badge variant="brand" className="size-4 p-0 text-[10px] flex items-center justify-center rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-md border border-border">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="size-7"
              title="Tampilan Tabel"
            >
              <List className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="size-7"
              title="Tampilan Kartu"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-foreground">Filter Data Pembina</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterModalOpen(false)}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Filter Eskul */}
              <div>
                <label className="font-medium text-foreground block mb-1.5">Cabang Eskul Binaan</label>
                <select
                  value={selectedEskulFilter}
                  onChange={(e) => setSelectedEskulFilter(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">Semua Cabang Eskul</option>
                  {eskulList.map((eskul) => (
                    <option key={eskul.id} value={eskul.namaEskul}>
                      {eskul.namaEskul} ({eskul.kategori})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div>
                <label className="font-medium text-foreground block mb-1.5">Status Akun</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full p-2 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AKTIF">Hanya Aktif</option>
                  <option value="NON_AKTIF">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEskulFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
              >
                Reset Filter
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Terapkan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content: Table or Grid */}
      {filteredList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <UserCheck className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tidak ada data pembina yang sesuai</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data pembina.
          </p>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/75 hover:bg-slate-50/75 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Guru Pembina</TableHead>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Eskul yang Dibina</TableHead>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Akun Login</TableHead>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Kontak</TableHead>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right whitespace-nowrap min-w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((pembina) => {
                // Resolve coached eskul names
                const coachedEskuls = eskulList.filter(
                  (e) => e.pembinaId === pembina.id || (e.pembinaNama && e.pembinaNama.toLowerCase() === pembina.namaLengkap.toLowerCase())
                );

                return (
                  <TableRow key={pembina.id} className="hover:bg-muted/40 transition-colors">
                    {/* Name & Avatar */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={pembina.namaLengkap}
                          className="size-9 ring-1 ring-border shrink-0 text-xs"
                        />
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {pembina.namaLengkap}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            NIP: {pembina.nip || '-'}
                          </div>
                          {pembina.spesialisasi && (
                            <Badge variant="outline" className="text-[10px] mt-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                              {pembina.spesialisasi}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Coached Eskuls */}
                    <TableCell className="py-3.5 px-4">
                      {coachedEskuls.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {coachedEskuls.map((eskul) => (
                            <Badge
                              key={eskul.id}
                              variant="outline"
                              className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium"
                            >
                              <Volleyball className="size-3" />
                              <span>{eskul.namaEskul}</span>
                            </Badge>
                          ))}
                        </div>
                      ) : pembina.eskulDiampu && pembina.eskulDiampu.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {pembina.eskulDiampu.map((e) => (
                            <Badge
                              key={e.id}
                              variant="outline"
                              className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium"
                            >
                              <Volleyball className="size-3" />
                              <span>{e.namaEskul}</span>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Belum ditugaskan</span>
                      )}
                    </TableCell>

                    {/* Login Credentials */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
                            {pembina.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <KeyRound className="size-3 text-muted-foreground shrink-0" />
                          <span className="bg-muted/50 border border-border px-1.5 py-0.5 rounded text-foreground">
                            {visiblePasswords[pembina.id]
                              ? (pembina.defaultPassword || pembina.password || `pembina_${pembina.username}`)
                              : '••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => togglePasswordVisibility(pembina.id)}
                            className="size-5 p-0 text-muted-foreground hover:text-foreground"
                            title={visiblePasswords[pembina.id] ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                          >
                            {visiblePasswords[pembina.id] ? (
                              <EyeOff className="size-3" />
                            ) : (
                              <Eye className="size-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contacts */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        {pembina.noHp && pembina.noHp !== '-' ? (
                          <a
                            href={`https://wa.me/${pembina.noHp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-foreground hover:text-emerald-600 transition-colors"
                          >
                            <Phone className="size-3 text-emerald-600" />
                            <span>{pembina.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                        {pembina.email && pembina.email !== '-' && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="size-3" />
                            <span className="truncate max-w-[140px]">{pembina.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 px-4 text-center">
                      <Badge
                        variant={pembina.statusAktif !== false ? 'success' : 'outline'}
                        className="text-[11px]"
                      >
                        <span
                          className={`size-1.5 rounded-full mr-1.5 ${
                            pembina.statusAktif !== false ? 'bg-emerald-500' : 'bg-muted-foreground'
                          }`}
                        />
                        {pembina.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 px-4 text-right whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditPembina(pembina)}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title="Edit Data Pembina"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data pembina "${pembina.namaLengkap}"?`)) {
                              onDeletePembina(pembina.id);
                            }
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Hapus Pembina"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* BENTO GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((pembina) => {
            const coachedEskuls = eskulList.filter(
              (e) => e.pembinaId === pembina.id || (e.pembinaNama && e.pembinaNama.toLowerCase() === pembina.namaLengkap.toLowerCase())
            );

            return (
              <Card
                key={pembina.id}
                className="p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={pembina.namaLengkap}
                        className="size-11 ring-1 ring-border shrink-0 text-sm"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground text-sm leading-snug">
                          {pembina.namaLengkap}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          NIP: {pembina.nip || '-'}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={pembina.statusAktif !== false ? 'success' : 'outline'}
                      className="text-[10px]"
                    >
                      <span className={`size-1.5 rounded-full mr-1 ${pembina.statusAktif !== false ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {pembina.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                  </div>

                  {pembina.spesialisasi && (
                    <div className="mt-3 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border">
                      <strong className="text-foreground">Spesialisasi:</strong> {pembina.spesialisasi}
                    </div>
                  )}

                  {/* Coached Eskuls */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cabang Eskul Binaan:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coachedEskuls.length > 0 ? (
                        coachedEskuls.map((eskul) => (
                          <Badge
                            key={eskul.id}
                            variant="outline"
                            className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium"
                          >
                            <Volleyball className="size-3" />
                            <span>{eskul.namaEskul}</span>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Belum ditugaskan</span>
                      )}
                    </div>
                  </div>

                  {/* Credentials & Contact */}
                  <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Username:</span>
                      <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {pembina.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sandi:</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="bg-muted/50 border border-border px-1.5 py-0.5 rounded font-medium text-foreground">
                          {visiblePasswords[pembina.id]
                            ? (pembina.defaultPassword || pembina.password || `pembina_${pembina.username}`)
                            : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => togglePasswordVisibility(pembina.id)}
                          className="size-5 p-0 text-muted-foreground hover:text-foreground"
                        >
                          {visiblePasswords[pembina.id] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </Button>
                      </div>
                    </div>
                    {pembina.noHp && pembina.noHp !== '-' && (
                      <div className="flex items-center justify-between">
                        <span>WhatsApp:</span>
                        <a
                          href={`https://wa.me/${pembina.noHp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="size-3" />
                          <span>{pembina.noHp}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPembina(pembina)}
                    className="flex-1 h-8 text-xs gap-1.5"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Ubah Data</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus data pembina "${pembina.namaLengkap}"?`)) {
                        onDeletePembina(pembina.id);
                      }
                    }}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Hapus"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
