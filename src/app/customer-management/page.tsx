'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { DataPeminjam, User, Status, Leasing } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import { jwtDecode } from 'jwt-decode';
import FilterSection from './components/FilterSection';
import CustomerTable from './components/CustomerTable';
import CustomerModal from './components/CustomerModal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Interface for state file
interface FileState {
  fotoktp?: File;
  fotobpkb?: File;
  fotostnk?: File;
  fotokk?: File;
  fotorekeningkoran?: File;
  fotorekeninglistrik?: File;
  fotobukunikah?: File;
  fotosertifikat?: File;
}

// Interface for payload token
interface JwtPayload {
  sub: string; // Ann email pengguna
  role?: string;
}

function CustomerManagementContent() {
  const [data, setData] = useState<DataPeminjam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user: authUser, logout } = useAuth(); // Ambil fungsi logout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk data baru atau data yang sedang diedit
  const [formData, setFormData] = useState<Partial<DataPeminjam>>({});
  const [formFiles, setFormFiles] = useState<FileState>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [leasings, setLeasings] = useState<Leasing[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // State untuk filter
  const [activeStatus, setActiveStatus] = useState<string>('Semua');
  const [selectedLeasing, setSelectedLeasing] = useState<string>('Semua');
  const [selectedUser, setSelectedUser] = useState<string>('Semua');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // State baru untuk search

  // Cek apakah user adalah admin atau user yang bisa melihat semua data
  const canViewAllData = authUser?.role === 'R001' || authUser?.role === 'R002';
  const isAdmin = authUser?.role === 'R001';


  // Fungsi untuk mengambil semua data
  const fetchData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/datapeminjam`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/leasing`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      // Cek jika sesi habis
      for (const response of responses) {
        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }
      }

      if (responses.some(res => !res.ok)) {
        throw new Error('Gagal mengambil data atau sesi Anda telah berakhir.');
      }
      
      const [peminjamData, userData, statusData, leasingData] = await Promise.all(responses.map(res => res.json()));

      // Urutkan data berdasarkan tglinput (terbaru dulu)
      peminjamData.sort((a: DataPeminjam, b: DataPeminjam) => new Date(b.tglinput).getTime() - new Date(a.tglinput).getTime());

      setData(peminjamData);
      setUsers(userData);
      setStatuses(statusData);
      setLeasings(leasingData);

      const decodedToken: JwtPayload = jwtDecode(token);
      const userEmail = decodedToken.sub;
      const loggedInUser = userData.find((user: User) => user.email === userEmail);
      setCurrentUser(loggedInUser || null);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const datesWithData = useMemo(() => {
    // Menggunakan Set untuk performa yang lebih baik
    return new Set(data.map(item => new Date(item.tglinput).toDateString()));
  }, [data]);

  // Logika untuk data yang telah difilter (untuk badge dan tabel)
  const baseFilteredData = useMemo(() => {
    let filtered = [...data];

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.nik && item.nik.toLowerCase().includes(lowercasedQuery)) ||
        (item.namapeminjam && item.namapeminjam.toLowerCase().includes(lowercasedQuery))
      );
    }

    // Filter by date
    if (selectedDate) {
      const dateString = selectedDate.toDateString();
      filtered = filtered.filter(item => new Date(item.tglinput).toDateString() === dateString);
    }

    // Jika bukan admin atau user (R002), filter berdasarkan pengguna yang login
    if (!canViewAllData && currentUser) {
        filtered = filtered.filter(item => item.user?.iduser === currentUser.iduser);
    }

    // Filter berdasarkan leasing
    if (selectedLeasing !== 'Semua') {
      filtered = filtered.filter(item => item.leasing?.idleasing === selectedLeasing);
    }

    // Filter berdasarkan user (hanya untuk admin dan user R002)
    if (canViewAllData && selectedUser !== 'Semua') {
      filtered = filtered.filter(item => item.user?.iduser === selectedUser);
    }

    return filtered;
  }, [data, searchQuery, selectedDate, selectedLeasing, selectedUser, canViewAllData, currentUser]);

  // Logika untuk menghitung jumlah status pada badge berdasarkan data yang sudah difilter
  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    statuses.forEach(status => {
        counts[status.namastatus] = baseFilteredData.filter(item => item.status?.namastatus === status.namastatus).length;
    });
    return counts;
  }, [baseFilteredData, statuses]);

  // Logika untuk memfilter data akhir yang ditampilkan di tabel
  const filteredData = useMemo(() => {
    if (activeStatus === 'Semua') {
      return baseFilteredData;
    }
    return baseFilteredData.filter(item => item.status?.namastatus === activeStatus);
  }, [baseFilteredData, activeStatus]);


  const openModalForCreate = () => {
    setEditingId(null);
    const defaultKeterangan = `PIC
Nama PIC :
No HP :
Asal Leasing :

SURVEYOR
Nama Surveyor :
No HP :
Asal Leasing : 

Keterangan :
`;
    setFormData({ keterangan: defaultKeterangan });
    setFormFiles({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (peminjam: DataPeminjam) => {
    setEditingId(peminjam.iddatapeminjam);
    setFormData({
        ...peminjam,
        status: { idstatus: peminjam.status?.idstatus, namastatus: ''},
        leasing: { idleasing: peminjam.leasing?.idleasing, namaleasing: ''},
    });
    setFormFiles({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "status" || name === "leasing") {
        const idKey = name === "status" ? "idstatus" : "idleasing";
        const nameKey = name === "status" ? "namastatus" : "namaleasing";
        setFormData(prev => ({ ...prev, [name]: { [idKey]: value, [nameKey]: "" } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSubmitting(true);
    const dataToSend = new FormData();
    
    const finalData = { ...formData };
    if (!editingId && currentUser) {
      finalData.user = { iduser: currentUser.iduser, namauser: '', email: '' };
    } else {
      delete finalData.user;
    }

    dataToSend.append('data', JSON.stringify(finalData));

    Object.entries(formFiles).forEach(([key, file]) => {
      if (file) {
        dataToSend.append(key, file);
      }
    });

    const url = editingId ? `${API_BASE_URL}/datapeminjam/${editingId}` : `${API_BASE_URL}/datapeminjam`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend,
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menyimpan data.');
      }

      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !isAdmin) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/datapeminjam/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) {
          throw new Error('Gagal menghapus data.');
        }
        fetchData(); // Refresh data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };
  
  const handleStatusUpdate = async (url: string) => {
    if (!token) {
        setError("Aksi tidak diizinkan. Silakan login kembali.");
        return;
    }
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) throw new Error('Gagal memperbarui status data.');
        fetchData();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };
  
  const handleProses = (id: string) => handleStatusUpdate(`${API_BASE_URL}/datapeminjam/${id}/proses`);
  
  const handleCair = (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin mengubah status menjadi CAIR?")) {
          handleStatusUpdate(`${API_BASE_URL}/datapeminjam/${id}/cair`);
      }
  };
  
  const handleBatal = (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin membatalkan data ini?")) {
          handleStatusUpdate(`${API_BASE_URL}/datapeminjam/${id}/batal`);
      }
  };
  
  const handleExport = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const formattedData = filteredData.map(item => ({
      'NIK': item.nik,
      'Nama Peminjam': item.namapeminjam,
      'User': item.user?.namauser,
      'No. HP': item.nohp,
      'Aset': item.aset,
      'Tahun Aset': item.tahunaset,
      'Kota': item.kota,
      'Status': item.status?.namastatus,
      'Leasing': item.leasing?.namaleasing,
      'Tanggal Input': new Date(item.tglinput).toLocaleDateString(),
      'Keterangan': item.keterangan,
    }));
  
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    saveAs(data, 'filtered_data' + fileExtension);
  };


  if (loading) return <div className="container mx-auto p-4">Memuat data...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <div>
            <button 
                onClick={handleExport} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 mr-2">
              Export to Excel
            </button>
            <button 
                onClick={openModalForCreate} 
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
              Tambah Data
            </button>
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        handleSubmit={handleSubmit}
        editingId={editingId}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        statuses={statuses}
        leasings={leasings}
        isSubmitting={isSubmitting}
      />

      <FilterSection
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        baseFilteredData={baseFilteredData}
        statuses={statuses}
        statusCounts={statusCounts}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        datesWithData={datesWithData}
        canViewAllData={canViewAllData}
        leasings={leasings}
        setSelectedLeasing={setSelectedLeasing}
        users={users}
        setSelectedUser={setSelectedUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <CustomerTable
        filteredData={filteredData}
        openModalForEdit={openModalForEdit}
        handleProses={handleProses}
        handleCair={handleCair}
        handleBatal={handleBatal}
        handleDelete={handleDelete}
        isAdmin={isAdmin}
      />
    </div>
  );
}

// Bungkus komponen utama dengan PrivateRoute
export default function CustomerManagementPage() {
    return (
        <PrivateRoute>
            <CustomerManagementContent />
        </PrivateRoute>
    )
}