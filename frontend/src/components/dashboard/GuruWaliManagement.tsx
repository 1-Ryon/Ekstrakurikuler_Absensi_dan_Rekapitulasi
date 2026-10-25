import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Upload,
  Phone, 
  Mail, 
  School, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  X, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  Users,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Guru, Kelas } from '../../types';
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

interface GuruWaliManagementProps {
  guruList: Guru[];
  kelasList: Kelas[];
  onAddGuru: () => void;
  onOpenImport?: () => void;
  onEditGuru: (guru: Guru) => void;
  onDeleteGuru: (id: string) => void;
  onAssignWaliKelas: (kelasId: string, waliKelasId: string) => void;
}

export const GuruWaliManagement: React.FC<GuruWaliManagementProps> = ({
  guruList,
  kelasList,
  onAddGuru,
  onOpenImport,
  onEditGuru,
  onDeleteGuru,
  onAssignWaliKelas,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'WALI_KELAS' | 'NON_WALI'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [assigningGuru, setAssigningGuru] = useState<Guru | null>(null);
  const [selectedKelasIdToAssign, setSelectedKelasIdToAssign] = useState<string>('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Statistics
  const totalGuru = guruList.length;
  const waliKelasCount = guruList.filter(g => g.isWaliKelas || (g.kelasWali && g.kelasWali.length > 0)).length;
  const totalKelas = kelasList.length;
  const unassignedKelasCount = kelasList.filter(k => !k.waliKelasId).length;

  // Filtered List
  const filteredList = useMemo(() => {
    return guruList.filter((g) => {
      // Search
      const matchesSearch =
        g.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.spesialisasi && g.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.kelasWali && g.kelasWali.some(k => k.namaKelas.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      // Role Filter (Wali Kelas vs Guru)
      const isWali = g.isWaliKelas || (g.kelasWali && g.kelasWali.length > 0);
      if (selectedRoleFilter === 'WALI_KELAS' && !isWali) return false;
      if (selectedRoleFilter === 'NON_WALI' && isWali) return false;

      // Status Filter
      if (selectedStatusFilter === 'AKTIF' && g.statusAktif === false) return false;
      if (selectedStatusFilter === 'NON_AKTIF' && g.statusAktif !== false) return false;

      return true;
    });
  }, [guruList, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  const activeFiltersCount = (selectedRoleFilter !== 'ALL' ? 1 : 0) + (selectedStatusFilter !== 'ALL' ? 1 : 0);

  const handleOpenAssign = (guru: Guru) => {
    setAssigningGuru(guru);
    const currentlyAssigned = kelasList.find(k => k.waliKelasId === guru.id);
    setSelectedKelasIdToAssign(currentlyAssigned?.id || '');
  };

  const handleSaveAssign = () => {
    if (assigningGuru && selectedKelasIdToAssign) {
      onAssignWaliKelas(selectedKelasIdToAssign, assigningGuru.id);
      setAssigningGuru(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Data Guru & Wali Kelas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master data tenaga pendidik, penetapan wali kelas per rombel, dan manajemen akun.
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
              <Upload className="size-4 text-primary" />
              <span>Impor Data Guru</span>
            </Button>
          )}
          <Button
            variant="brand"
            size="sm"
            onClick={onAddGuru}
            className="gap-2"
          >
            <Plus className="size-4" />
            <span>Tambah Guru / Wali Kelas</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Guru Terdata
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {totalGuru} <span className="text-xs font-normal text-muted-foreground">Guru</span>
              </div>
            </div>
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="size-5 stroke-[2.2]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Wali Kelas Ditugaskan
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {waliKelasCount} <span className="text-xs font-normal text-muted-foreground">Rombel</span>
              </div>
            </div>
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 stroke-[2.2]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Kelas / Rombel
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {totalKelas} <span className="text-xs font-normal text-muted-foreground">Kelas</span>
              </div>
            </div>
            <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <School className="size-5 stroke-[2.2]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kelas Belum Ada Wali
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {unassignedKelasCount} <span className="text-xs font-normal text-muted-foreground">Kelas</span>
              </div>
            </div>
            <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle className="size-5 stroke-[2.2]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & Controls */}
      <Card>
        <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru, NIP, kelas binaan, username..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Trigger Button */}
            <Button
              variant={activeFiltersCount > 0 ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="h-9 gap-2 text-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="size-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('table')}
                className="size-8"
                title="Tampilan Tabel"
              >
                <List className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="size-8"
                title="Tampilan Kartu"
              >
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Modal Dialog */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Filter Data Guru & Wali</h3>
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
              {/* Role Penugasan Filter */}
              <div>
                <label className="font-semibold text-foreground block mb-1.5">Penugasan Wali Kelas</label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                  className="w-full h-9 px-3 bg-card border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">Semua Guru Pendidik</option>
                  <option value="WALI_KELAS">Hanya yang Bertugas Wali Kelas</option>
                  <option value="NON_WALI">Belum Ditugaskan Wali Kelas</option>
                </select>
              </div>

              {/* Status Akun Filter */}
              <div>
                <label className="font-semibold text-foreground block mb-1.5">Status Akun Login</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 bg-card border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AKTIF">Hanya Aktif</option>
                  <option value="NON_AKTIF">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRoleFilter('ALL');
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

      {/* Assign Wali Kelas Modal */}
      {assigningGuru && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Tetapkan Wali Kelas
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih rombongan belajar untuk {assigningGuru.namaLengkap}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAssigningGuru(null)}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-semibold text-foreground block">Pilih Kelas Binaan</label>
              <select
                value={selectedKelasIdToAssign}
                onChange={(e) => setSelectedKelasIdToAssign(e.target.value)}
                className="w-full h-9 px-3 bg-card border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKelas} ({k.jurusan}) {k.waliKelasId && k.waliKelasId !== assigningGuru.id ? `— Saat ini: ${k.waliKelas?.namaLengkap || 'Ada Wali Lain'}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssigningGuru(null)}
              >
                Batal
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleSaveAssign}
                disabled={!selectedKelasIdToAssign}
              >
                Simpan Penugasan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {filteredList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tidak ada data guru yang sesuai</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan daftar guru pendidik.
          </p>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="py-3 px-4 text-xs font-semibold">Guru Pendidik</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold">Tugas Wali Kelas</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold">Akun Login</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold">Kontak</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((guru) => {
                // Resolve class assigned to this guru
                const assignedClass = kelasList.find(k => k.waliKelasId === guru.id) || 
                  (guru.kelasWali && guru.kelasWali.length > 0 ? guru.kelasWali[0] : null);

                return (
                  <TableRow key={guru.id} className="hover:bg-muted/40 transition-colors">
                    {/* Name & Avatar */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={guru.namaLengkap}
                          className="size-9 ring-1 ring-border shrink-0 text-xs"
                        />
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {guru.namaLengkap}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            NIP: {guru.nip || '-'}
                          </div>
                          {guru.spesialisasi && (
                            <Badge variant="outline" className="text-[10px] mt-1 bg-purple-50 text-purple-700 border-purple-200">
                              {guru.spesialisasi}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Wali Kelas Binaan */}
                    <TableCell className="py-3.5 px-4">
                      {assignedClass ? (
                        <Badge variant="outline" className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium">
                          <School className="size-3.5" />
                          <span>{assignedClass.namaKelas}</span>
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssign(guru)}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="size-3" />
                          <span>Tugaskan Kelas</span>
                        </Button>
                      )}
                    </TableCell>

                    {/* Login Credentials */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground">
                            {guru.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <KeyRound className="size-3 text-muted-foreground shrink-0" />
                          <span className="bg-muted/50 border border-border px-1.5 py-0.5 rounded text-foreground">
                            {visiblePasswords[guru.id]
                              ? (guru.defaultPassword || guru.password || (guru.isPembina ? `pembina_${guru.username}` : `guru_${guru.username}`))
                              : '••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => togglePasswordVisibility(guru.id)}
                            className="size-5 p-0 text-muted-foreground hover:text-foreground"
                            title={visiblePasswords[guru.id] ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                          >
                            {visiblePasswords[guru.id] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          </Button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contacts */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        {guru.noHp && guru.noHp !== '-' ? (
                          <a
                            href={`https://wa.me/${guru.noHp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-foreground hover:text-emerald-600 transition-colors"
                          >
                            <Phone className="size-3 text-emerald-600" />
                            <span>{guru.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                        {guru.email && guru.email !== '-' && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="size-3" />
                            <span className="truncate max-w-[140px]">{guru.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 px-4 text-center">
                      <Badge
                        variant={guru.statusAktif !== false ? 'success' : 'outline'}
                        className="text-[11px]"
                      >
                        <span
                          className={`size-1.5 rounded-full mr-1.5 ${
                            guru.statusAktif !== false ? 'bg-emerald-500' : 'bg-muted-foreground'
                          }`}
                        />
                        {guru.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAssign(guru)}
                          className="size-8 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                          title="Tetapkan / Ganti Kelas Wali"
                        >
                          <School className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditGuru(guru)}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title="Edit Data Guru"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data guru "${guru.namaLengkap}"?`)) {
                              onDeleteGuru(guru.id);
                            }
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Hapus Guru"
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
          {filteredList.map((guru) => {
            const assignedClass = kelasList.find(k => k.waliKelasId === guru.id) || 
              (guru.kelasWali && guru.kelasWali.length > 0 ? guru.kelasWali[0] : null);

            return (
              <Card
                key={guru.id}
                className="p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={guru.namaLengkap}
                        className="size-11 ring-1 ring-border shrink-0 text-sm"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground text-sm leading-snug">
                          {guru.namaLengkap}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          NIP: {guru.nip || '-'}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={guru.statusAktif !== false ? 'success' : 'outline'}
                      className="text-[10px]"
                    >
                      <span className={`size-1.5 rounded-full mr-1 ${guru.statusAktif !== false ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {guru.statusAktif !== false ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                  </div>

                  {guru.spesialisasi && (
                    <div className="mt-3 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border">
                      <strong className="text-foreground">Bidang:</strong> {guru.spesialisasi}
                    </div>
                  )}

                  {/* Wali Kelas Badge */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Penugasan Wali Kelas:
                    </div>
                    {assignedClass ? (
                      <Badge variant="outline" className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium">
                        <School className="size-3.5" />
                        <span>Wali Kelas {assignedClass.namaKelas}</span>
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssign(guru)}
                        className="h-8 text-xs gap-1.5 w-full justify-start text-muted-foreground hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Plus className="size-3.5" />
                        <span>Tetapkan Sebagai Wali Kelas</span>
                      </Button>
                    )}
                  </div>

                  {/* Credentials & Contact */}
                  <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Username:</span>
                      <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {guru.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sandi:</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="bg-muted/50 border border-border px-1.5 py-0.5 rounded font-medium text-foreground">
                          {visiblePasswords[guru.id]
                            ? (guru.defaultPassword || guru.password || (guru.isPembina ? `pembina_${guru.username}` : `guru_${guru.username}`))
                            : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => togglePasswordVisibility(guru.id)}
                          className="size-5 p-0 text-muted-foreground hover:text-foreground"
                        >
                          {visiblePasswords[guru.id] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </Button>
                      </div>
                    </div>
                    {guru.noHp && guru.noHp !== '-' && (
                      <div className="flex items-center justify-between">
                        <span>WhatsApp:</span>
                        <a
                          href={`https://wa.me/${guru.noHp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="size-3" />
                          <span>{guru.noHp}</span>
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
                    onClick={() => handleOpenAssign(guru)}
                    className="h-8 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 gap-1.5"
                    title="Penugasan Kelas"
                  >
                    <School className="size-3.5" />
                    <span>Kelas</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditGuru(guru)}
                    className="flex-1 h-8 text-xs gap-1.5"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus data guru "${guru.namaLengkap}"?`)) {
                        onDeleteGuru(guru.id);
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
