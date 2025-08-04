'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import { DataPeminjam, User, Status, Leasing } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import { jwtDecode } from 'jwt-decode';

// Interface untuk state file
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

// Interface untuk payload token
interface JwtPayload {
  sub: string; // Ann email pengguna
  // Properti lain yang mungkin ada di token Anda
}

function CustomerManagementContent() {
  const [data, setData] = useState<DataPeminjam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Fungsi untuk mengambil semua data
  const fetchData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const [peminjamRes, userRes, statusRes, leasingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/datapeminjam`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/leasing`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (!peminjamRes.ok || !userRes.ok || !statusRes.ok || !leasingRes.ok) {
        throw new Error('Gagal mengambil data atau sesi Anda telah berakhir.');
      }

      const peminjamData: DataPeminjam[] = await peminjamRes.json();
      const userData: User[] = await userRes.json();
      const statusData: Status[] = await statusRes.json();
      const leasingData: Leasing[] = await leasingRes.json();

      setData(peminjamData);
      setUsers(userData);
      setStatuses(statusData);
      setLeasings(leasingData);

      const decodedToken: JwtPayload = jwtDecode(token);
      const userEmail = decodedToken.sub;
      const loggedInUser = userData.find(user => user.email === userEmail);
      setCurrentUser(loggedInUser || null);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logika untuk memfilter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const statusMatch = activeStatus === 'Semua' || item.status?.namastatus === activeStatus;
      const leasingMatch = selectedLeasing === 'Semua' || item.leasing?.idleasing === selectedLeasing;
      const userMatch = selectedUser === 'Semua' || item.user?.iduser === selectedUser;
      return statusMatch && leasingMatch && userMatch;
    });
  }, [data, activeStatus, selectedLeasing, selectedUser]);
  
  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    statuses.forEach(status => {
        counts[status.namastatus] = data.filter(item => item.status?.namastatus === status.namastatus).length;
    });
    return counts;
  }, [data, statuses]);

  const openModalForCreate = () => {
    setEditingId(null);
    setFormData({});
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

    const dataToSend = new FormData();
    const finalData = { ...formData, user: { iduser: currentUser?.iduser } };
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menyimpan data.');
      }

      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleProses = async (id: string) => {
    if (!token) {
      setError("Aksi tidak diizinkan. Silakan login kembali.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/datapeminjam/${id}/proses`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memproses data.');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleBatal = async (id: string) => {
    if (!token) {
      setError("Aksi tidak diizinkan. Silakan login kembali.");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin membatalkan data ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/datapeminjam/${id}/batal`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Gagal membatalkan data.');
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const handleCair = async (id: string) => {
    if (!token) {
      setError("Aksi tidak diizinkan. Silakan login kembali.");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin mengubah status menjadi CAIR?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/datapeminjam/${id}/cair`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengubah status menjadi cair.');
        }
        
        fetchData(); // Refresh data setelah berhasil
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };


  if (loading) return <div className="container mx-auto p-4">Memuat data...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <button onClick={openModalForCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
            Tambah Data
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Data Peminjam' : 'Tambah Data Peminjam Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input name="nik" placeholder="NIK" value={formData.nik || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="namapeminjam" placeholder="Nama Peminjam" value={formData.namapeminjam || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="nohp" placeholder="No. HP" value={formData.nohp || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="aset" placeholder="Aset" value={formData.aset || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="tahunaset" placeholder="Tahun Aset" value={formData.tahunaset || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="alamat" placeholder="Alamat" value={formData.alamat || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="kota" placeholder="Kota" value={formData.kota || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <input name="kecamatan" placeholder="Kecamatan" value={formData.kecamatan || ''} onChange={handleInputChange} className="p-2 border rounded" />
                <div><label className="text-sm">Tgl Input</label><input type="date" name="tglinput" value={formData.tglinput || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                <div><label className="text-sm">Tgl Penerimaan</label><input type="date" name="tglpenerimaan" value={formData.tglpenerimaan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                <div><label className="text-sm">Tgl Pencairan</label><input type="date" name="tglpencairan" value={formData.tglpencairan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                <textarea name="keterangan" placeholder="Keterangan" value={formData.keterangan || ''} onChange={handleInputChange} className="p-2 border rounded md:col-span-2 lg:col-span-3" />
                <select name="status" value={formData.status?.idstatus || ''} onChange={handleInputChange} className="p-2 border rounded"><option value="">Pilih Status</option>{statuses.map(status => <option key={status.idstatus} value={status.idstatus}>{status.namastatus}</option>)}</select>
                <select name="leasing" value={formData.leasing?.idleasing || ''} onChange={handleInputChange} className="p-2 border rounded"><option value="">Pilih Leasing</option>{leasings.map(leasing => <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>)}</select>
                <div><label>Foto KTP</label><input type="file" name="fotoktp" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto BPKB</label><input type="file" name="fotobpkb" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto STNK</label><input type="file" name="fotostnk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto KK</label><input type="file" name="fotokk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Rekening Koran</label><input type="file" name="fotorekeningkoran" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Rekening Listrik</label><input type="file" name="fotorekeninglistrik" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Buku Nikah</label><input type="file" name="fotobukunikah" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Sertifikat</label><input type="file" name="fotosertifikat" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
              </div>
              <div className="mt-6 flex justify-end space-x-2"><button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Batal</button><button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Area Filter */}
      <div className='mb-4'>
        <div className="bg-red-600 rounded-full p-1">
            <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap p-1">
                <button onClick={() => setActiveStatus('Semua')} className={`relative inline-flex items-center flex-shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${activeStatus === 'Semua' ? 'bg-white text-red-600' : 'text-white hover:bg-red-700'}`}>
                    Semua
                    <span className="ml-2 -mt-5 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">{data.length}</span>
                </button>
                {statuses.map(status => (
                    <button key={status.idstatus} onClick={() => setActiveStatus(status.namastatus)} className={`relative inline-flex items-center flex-shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${activeStatus === status.namastatus ? 'bg-white text-red-600' : 'text-white hover:bg-red-700'}`}>
                        {status.namastatus}
                        <span className="ml-2 -mt-5 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {statusCounts[status.namastatus] || 0}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <div className='mt-4 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0'>
            <select onChange={(e) => setSelectedLeasing(e.target.value)} className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full">
                <option value="Semua">Semua Leasing</option>
                {leasings.map(leasing => (
                    <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>
                ))}
            </select>
            <select onChange={(e) => setSelectedUser(e.target.value)} className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full">
                <option value="Semua">Semua User</option>
                {users.map(user => (
                    <option key={user.iduser} value={user.iduser}>{user.namauser}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-md p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#fe0000] text-white">
              <tr>
                <th className="py-3 px-4 text-left">NIK</th>
                <th className="py-3 px-4 text-left">Nama Peminjam</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">No. HP</th>
                <th className="py-3 px-4 text-left">Aset</th>
                <th className="py-3 px-4 text-left">Tahun Aset</th>
                <th className="py-3 px-4 text-left">Kota</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Leasing</th>
                <th className="py-3 px-4 text-left">Tgl Input</th>
                <th className="py-3 px-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.iddatapeminjam} className="hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{item.nik}</td>
                    <td className="py-2 px-4">{item.namapeminjam}</td>
                    <td className="py-2 px-4">{item.user?.namauser}</td>
                    <td className="py-2 px-4">{item.nohp}</td>
                    <td className="py-2 px-4">{item.aset}</td>
                    <td className="py-2 px-4">{item.tahunaset}</td>
                    <td className="py-2 px-4">{item.kota}</td>
                    <td className="py-2 px-4">{item.status?.namastatus}</td>
                    <td className="py-2 px-4">{item.leasing?.namaleasing}</td>
                    <td className="py-2 px-4">{new Date(item.tglinput).toLocaleDateString()}</td>
                    <td className="py-2 px-4 flex space-x-2">
                        <Link href={`/customer-management/${item.iddatapeminjam}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                            Detail
                        </Link>
                        <button 
                            onClick={() => openModalForEdit(item)} 
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                            Update
                        </button>
                        {item.status?.idstatus === 'S001' && (
                            <button 
                                onClick={() => handleProses(item.iddatapeminjam)} 
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                                Proses
                            </button>
                        )}
                        {item.status?.idstatus === 'S002' && (
                            <button 
                                onClick={() => handleCair(item.iddatapeminjam)} 
                                className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                            >
                                Cair
                            </button>
                        )}
                        {(item.status?.idstatus === 'S001' || item.status?.idstatus === 'S002') && (
                            <button 
                                onClick={() => handleBatal(item.iddatapeminjam)} 
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                                Batal
                            </button>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center">Tidak ada data untuk ditampilkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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