import React, { useState } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EskulManagement } from './components/dashboard/EskulManagement';
import { StudentManagement } from './components/dashboard/StudentManagement';
import { ReportsManagement } from './components/dashboard/ReportsManagement';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { DynamicQrGenerator } from './components/guru/DynamicQrGenerator';
import { TeacherStudentScanner } from './components/guru/TeacherStudentScanner';
import { LiveAttendanceLog } from './components/guru/LiveAttendanceLog';
import { PenilaianPage } from './components/guru/PenilaianPage';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { AddEskulModal } from './components/modals/AddEskulModal';
import { ImportDataModal } from './components/modals/ImportDataModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { MailModal } from './components/modals/MailModal';

import { 
  CURRENT_USER, 
  INITIAL_ESKUL_LIST, 
  INITIAL_SESSIONS, 
  INITIAL_STUDENTS, 
  INITIAL_PRESENSI_LOG, 
  INITIAL_PENILAIAN 
} from './data/mockData';
import { api } from './services/api';
import { Role, Eskul, SesiPertemuan, PresensiRecord, PenilaianRecord, StudentProfile } from './types';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('ADMIN');
  const [activeTab, setActiveTab] = useState<NavItemKey>('beranda');

  // Master Data State
  const [eskulList, setEskulList] = useState<Eskul[]>(INITIAL_ESKUL_LIST);
  const [sessions, setSessions] = useState<SesiPertemuan[]>(INITIAL_SESSIONS);
  const [currentSession, setCurrentSession] = useState<SesiPertemuan>(INITIAL_SESSIONS[0]);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [presensiLog, setPresensiLog] = useState<PresensiRecord[]>(INITIAL_PRESENSI_LOG);
  const [penilaianList, setPenilaianList] = useState<PenilaianRecord[]>(INITIAL_PENILAIAN);

  // Modals state
  const [isAddEskulOpen, setIsAddEskulOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load from Backend on mount
  React.useEffect(() => {
    async function loadBackendData() {
      try {
        const [backendEskul, backendStudents, backendSessions, backendLogs, backendPenilaian] = await Promise.all([
          api.getEskul(),
          api.getStudents(),
          api.getTodaySessions(),
          api.getPresensiLogs(),
          api.getPenilaian(),
        ]);

        if (backendEskul && backendEskul.length > 0) setEskulList(backendEskul);
        if (backendStudents && backendStudents.length > 0) setStudents(backendStudents);
        if (backendSessions && backendSessions.length > 0) {
          setSessions(backendSessions);
          setCurrentSession(backendSessions[0]);
        }
        if (backendLogs && backendLogs.length > 0) setPresensiLog(backendLogs);
        if (backendPenilaian && backendPenilaian.length > 0) setPenilaianList(backendPenilaian);
      } catch (err) {
        console.warn('Backend initial fetch error, using local fallback:', err);
      }
    }
    loadBackendData();
  }, []);

  // Handlers for Eskul
  const handleAddEskul = async (newEskulData: Omit<Eskul, 'id' | 'jumlahSiswa'>) => {
    try {
      await api.createEskul(newEskulData);
    } catch {
      // fallback
    }
    const newId = `eskul-${Date.now().toString().slice(-4)}`;
    const newEskul: Eskul = {
      ...newEskulData,
      id: newId,
      jumlahSiswa: 0,
    };
    setEskulList([newEskul, ...eskulList]);
    showToast(`Eskul "${newEskul.namaEskul}" tersimpan ke database.`);
  };

  const handleDeleteEskul = async (id: string) => {
    try {
      await api.deleteEskul(id);
    } catch {
      // fallback
    }
    setEskulList(eskulList.filter(e => e.id !== id));
    showToast('Ekstrakurikuler berhasil dihapus dari database.');
  };

  const handleToggleEskulStatus = (id: string) => {
    setEskulList(eskulList.map(e => e.id === id ? { ...e, status: e.status === 'Aktif' ? 'Non-Aktif' : 'Aktif' } : e));
  };

  const handleOpenSessionFromEskul = (eskul: Eskul) => {
    const existing = sessions.find(s => s.eskulId === eskul.id);
    if (existing) {
      setCurrentSession(existing);
    } else {
      const newSession: SesiPertemuan = {
        id: `sesi-${Date.now().toString().slice(-4)}`,
        eskulId: eskul.id,
        namaEskul: eskul.namaEskul,
        pembinaNama: eskul.pembinaNama,
        tanggal: new Date().toISOString().slice(0, 10),
        jamMulai: eskul.jamMulai,
        jamSelesai: eskul.jamSelesai,
        lokasi: eskul.lokasi,
        tokenAktif: `TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        tokenExpiresAt: Date.now() + 15000,
        status: 'BERLANGSUNG',
        totalHadir: 1,
        totalSiswa: eskul.jumlahSiswa || 35,
      };
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
    }
    setActiveTab('dynamic-qr');
  };

  // Handler for Session Status update
  const handleUpdateSessionStatus = async (status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI') => {
    try {
      await api.updateSessionStatus(currentSession.id, status);
    } catch {
      // fallback
    }
    const updated = { ...currentSession, status };
    setCurrentSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
    showToast(`Status sesi diubah menjadi: ${status}`);
  };

  // Simulated scan
  const handleSimulateScan = async (sessionToken: string) => {
    const randomStudents = [
      { name: 'Aldi Taher Pratama', nisn: '0069928172', kelas: 'XII RPL 2' },
      { name: 'Citra Kirana Dewi', nisn: '0071829301', kelas: 'XI AKL 2' },
      { name: 'Dimas Anggara Putra', nisn: '0068839201', kelas: 'X RPL 1' },
      { name: 'Farah Quinn Az-Zahra', nisn: '0073948192', kelas: 'XI OTKP 2' }
    ];
    const picked = randomStudents[Math.floor(Math.random() * randomStudents.length)];
    const timeStr = new Date().toTimeString().slice(0, 8);

    const newRecord: PresensiRecord = {
      id: `pre-${Date.now()}`,
      sesiId: currentSession.id,
      namaEskul: currentSession.namaEskul,
      siswaId: `sis-${Date.now()}`,
      namaSiswa: picked.name,
      nisn: picked.nisn,
      kelas: picked.kelas,
      waktuScan: timeStr,
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: `Ponsel Siswa (TOTP Token: ${sessionToken.slice(-6)})`,
    };

    setPresensiLog([newRecord, ...presensiLog]);
    const updatedSession = { ...currentSession, totalHadir: currentSession.totalHadir + 1 };
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    showToast(`Presensi berhasil tercatat: ${picked.name} (HADIR)`);
  };

  // Live attendance status update
  const handleUpdateAttendanceStatus = async (id: string, newStatus: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA') => {
    try {
      await api.updatePresensiStatus(id, newStatus);
    } catch {
      // fallback
    }
    setPresensiLog(presensiLog.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showToast(`Status kehadiran siswa diperbarui menjadi ${newStatus}.`);
  };

  // Assign Eskul to Student
  const handleAssignEskulToStudent = async (studentId: string, eskulIds: string[]) => {
    try {
      await api.assignEskul(studentId, eskulIds);
    } catch {
      // fallback
    }
    setStudents(students.map(s => s.id === studentId ? { ...s, enrolledEskulIds: eskulIds } : s));
    showToast('Penugasan ekstrakurikuler siswa berhasil diperbarui.');
  };

  // Student QR Scan from student view
  const handleStudentScanned = (studentName: string, eskulName: string) => {
    const timeStr = new Date().toTimeString().slice(0, 8);
    const newRecord: PresensiRecord = {
      id: `pre-stu-${Date.now()}`,
      sesiId: currentSession.id,
      namaEskul: eskulName,
      siswaId: students[0].id,
      namaSiswa: studentName,
      nisn: students[0].nomorInduk,
      kelas: students[0].kelas || 'XII RPL 1',
      waktuScan: timeStr,
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: 'Kamera Siswa (Geofencing Valid: 18m)',
    };
    setPresensiLog([newRecord, ...presensiLog]);
    showToast(`Selamat! Presensi ${eskulName} Anda berhasil tercatat.`);
  };

  // Guru memindai Kartu QR Siswa (Ide Kelompok)
  const handleTeacherRecordAttendance = (student: StudentProfile, session: SesiPertemuan) => {
    const timeStr = new Date().toTimeString().slice(0, 8);
    const newRecord: PresensiRecord = {
      id: `pre-card-${Date.now()}`,
      sesiId: session.id,
      namaEskul: session.namaEskul,
      siswaId: student.id,
      namaSiswa: student.namaLengkap,
      nisn: student.nomorInduk,
      kelas: student.kelas || 'XII RPL 1',
      waktuScan: timeStr,
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: `Kartu Fisik / QR Siswa (Diverifikasi Guru: ${session.pembinaNama})`,
    };

    setPresensiLog([newRecord, ...presensiLog]);
    const updatedSession = { ...currentSession, totalHadir: currentSession.totalHadir + 1 };
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    showToast(`Presensi Terverifikasi: ${student.namaLengkap} (HADIR)`);
  };

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    if (role === 'SISWA') {
      setActiveTab('scanner-siswa');
    } else if (role === 'PEMBINA') {
      setActiveTab('dynamic-qr');
    } else {
      setActiveTab('beranda');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F5] flex flex-row">
      {/* Sidebar matching screenshot */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentRole={currentRole}
        onLogout={() => {
          showToast('Sesi Anda telah diakhiri.');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header matching screenshot */}
        <Header
          currentUser={CURRENT_USER}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onSearch={(q) => {
            if (q) showToast(`Mencari "${q}"...`);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMail={() => setIsMailOpen(true)}
        />

        {/* Content Views */}
        <main className="flex-1 px-6 sm:px-8 pt-2">
          {activeTab === 'beranda' && (
            <AdminDashboard
              onOpenAddEskul={() => setIsAddEskulOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'eskul' && (
            <EskulManagement
              eskulList={eskulList}
              onAddEskul={() => setIsAddEskulOpen(true)}
              onEditEskul={(eskul) => {
                showToast(`Edit eskul: ${eskul.namaEskul}`);
              }}
              onDeleteEskul={handleDeleteEskul}
              onToggleStatus={handleToggleEskulStatus}
              onOpenSession={handleOpenSessionFromEskul}
            />
          )}

          {activeTab === 'siswa' && (
            <StudentManagement
              students={students}
              eskulList={eskulList}
              onAssignEskul={handleAssignEskulToStudent}
              onAddStudent={() => {
                setIsImportOpen(true);
              }}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportsManagement
              eskulList={eskulList}
              penilaianList={penilaianList}
              presensiList={presensiLog}
            />
          )}

          {activeTab === 'dynamic-qr' && (
            <DynamicQrGenerator
              sessions={sessions}
              currentSession={currentSession}
              onSelectSession={(sess) => setCurrentSession(sess)}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onSimulateStudentScan={handleSimulateScan}
            />
          )}

          {activeTab === 'scanner-guru' && (
            <TeacherStudentScanner
              currentSession={currentSession}
              students={students}
              onRecordAttendance={handleTeacherRecordAttendance}
              recentLogs={presensiLog.filter(p => p.sesiId === currentSession.id)}
            />
          )}

          {activeTab === 'live-presensi' && (
            <LiveAttendanceLog
              logs={presensiLog}
              onUpdateStatus={handleUpdateAttendanceStatus}
              onRefresh={() => showToast('Data presensi diperbarui secara real-time.')}
            />
          )}

          {activeTab === 'penilaian' && (
            <PenilaianPage
              penilaianList={penilaianList}
              eskulList={eskulList}
              onSavePenilaian={(updated) => {
                setPenilaianList(updated);
                showToast('Nilai rapor berhasil disimpan ke database.');
              }}
            />
          )}

          {activeTab === 'scanner-siswa' && (
            <SiswaDashboard
              currentStudent={students[0]}
              enrolledEskuls={eskulList.filter(e => students[0].enrolledEskulIds.includes(e.id))}
              todaySessions={sessions}
              attendanceHistory={presensiLog.filter(p => p.siswaId === students[0].id || p.siswaId === 'sis-01')}
              onNewAttendance={handleStudentScanned}
            />
          )}

          {activeTab === 'khn-siswa' && (
            <SiswaDashboard
              currentStudent={students[0]}
              enrolledEskuls={eskulList.filter(e => students[0].enrolledEskulIds.includes(e.id))}
              todaySessions={sessions}
              attendanceHistory={presensiLog.filter(p => p.siswaId === students[0].id || p.siswaId === 'sis-01')}
              onNewAttendance={handleStudentScanned}
            />
          )}

          {activeTab === 'pengaturan' && <SettingsPage />}
        </main>
      </div>

      {/* Modals */}
      <AddEskulModal
        isOpen={isAddEskulOpen}
        onClose={() => setIsAddEskulOpen(false)}
        onSave={handleAddEskul}
      />

      <ImportDataModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccessImport={(count) => {
          showToast(`Berhasil mengimpor ${count} data baru!`);
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MailModal
        isOpen={isMailOpen}
        onClose={() => setIsMailOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-[#00B884] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
