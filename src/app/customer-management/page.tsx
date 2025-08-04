'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
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
  
  const [newPeminjamData, setNewPeminjamData] = useState<Partial<DataPeminjam>>({});
  const [newPeminjamFiles, setNewPeminjamFiles] = useState<FileState>({});

  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [leasings, setLeasings] = useState<Leasing[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;

    // Decode token untuk mendapatkan email pengguna
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      const userEmail = decodedToken.sub;

      const fetchData = async () => {
        setLoading(true);
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

          // Cari dan atur pengguna yang sedang login
          const loggedInUser = userData.find(user => user.email === userEmail);
          setCurrentUser(loggedInUser || null);

        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } catch (error) {
      console.error("Token tidak valid:", error);
      setError("Sesi Anda tidak valid. Silakan login kembali.");
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Untuk relasi, kita buat objeknya
    if (name === "status" || name === "leasing") {
        const idKey = name === "status" ? "idstatus" : "idleasing";
        const nameKey = name === "status" ? "namastatus" : "namaleasing";
        setNewPeminjamData(prev => ({ ...prev, [name]: { [idKey]: value, [nameKey]: "" } }));
    } else {
        setNewPeminjamData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setNewPeminjamFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser) {
        setError("Tidak dapat menambahkan data, pengguna tidak ditemukan.");
        return;
    };

    const formData = new FormData();
    // Tambahkan user yang sedang login ke data
    const finalData = { ...newPeminjamData, user: { iduser: currentUser.iduser, namauser: currentUser.namauser, email: currentUser.email } };
    formData.append('data', JSON.stringify(finalData));

    Object.entries(newPeminjamFiles).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/datapeminjam`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menambahkan data baru.');
      }

      const newData: DataPeminjam = await response.json();
      setData(prev => [...prev, newData]);
      setIsModalOpen(false);
      setNewPeminjamData({});
      setNewPeminjamFiles({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };


  if (loading) {
    return <div className="container mx-auto p-4">Memuat data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Card untuk area yang diminta */}
      <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
            Tambah Data
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Tambah Data Peminjam Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Kolom Input Teks dan Tanggal */}
                <input name="nik" placeholder="NIK" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="namapeminjam" placeholder="Nama Peminjam" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="nohp" placeholder="No. HP" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="aset" placeholder="Aset" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="tahunaset" placeholder="Tahun Aset" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="alamat" placeholder="Alamat" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="kota" placeholder="Kota" onChange={handleInputChange} className="p-2 border rounded" />
                <input name="kecamatan" placeholder="Kecamatan" onChange={handleInputChange} className="p-2 border rounded" />
                <div>
                    <label className="text-sm">Tgl Input</label>
                    <input type="date" name="tglinput" onChange={handleInputChange} className="p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="text-sm">Tgl Penerimaan</label>
                    <input type="date" name="tglpenerimaan" onChange={handleInputChange} className="p-2 border rounded w-full" />
                </div>
                <div>
                    <label className="text-sm">Tgl Pencairan</label>
                    <input type="date" name="tglpencairan" onChange={handleInputChange} className="p-2 border rounded w-full" />
                </div>
                <textarea name="keterangan" placeholder="Keterangan" onChange={handleInputChange} className="p-2 border rounded md:col-span-2 lg:col-span-3" />
                
                {/* Pilihan Select */}
                <select name="status" onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Pilih Status</option>
                  {statuses.map(status => <option key={status.idstatus} value={status.idstatus}>{status.namastatus}</option>)}
                </select>
                <select name="leasing" onChange={handleInputChange} className="p-2 border rounded">
                  <option value="">Pilih Leasing</option>
                  {leasings.map(leasing => <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>)}
                </select>

                {/* Kolom Input File */}
                <div><label>Foto KTP</label><input type="file" name="fotoktp" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto BPKB</label><input type="file" name="fotobpkb" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto STNK</label><input type="file" name="fotostnk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Foto KK</label><input type="file" name="fotokk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Rekening Koran</label><input type="file" name="fotorekeningkoran" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Rekening Listrik</label><input type="file" name="fotorekeninglistrik" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Buku Nikah</label><input type="file" name="fotobukunikah" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
                <div><label>Sertifikat</label><input type="file" name="fotosertifikat" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  Batal
                </button>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Wrapper untuk Tabel */}
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
                <th className="py-3 px-4 text-left">Alamat</th>
                <th className="py-3 px-4 text-left">Kota</th>
                <th className="py-3 px-4 text-left">Kecamatan</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Leasing</th>
                <th className="py-3 px-4 text-left">Tgl Input</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.nik || index} className="hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{item.nik}</td>
                    <td className="py-2 px-4">{item.namapeminjam}</td>
                    <td className="py-2 px-4">{item.user?.namauser}</td>
                    <td className="py-2 px-4">{item.nohp}</td>
                    <td className="py-2 px-4">{item.aset}</td>
                    <td className="py-2 px-4">{item.tahunaset}</td>
                    <td className="py-2 px-4">{item.alamat}</td>
                    <td className="py-2 px-4">{item.kota}</td>
                    <td className="py-2 px-4">{item.kecamatan}</td>
                    <td className="py-2 px-4">{item.status?.namastatus}</td>
                    <td className="py-2 px-4">{item.leasing?.namaleasing}</td>
                    <td className="py-2 px-4">{new Date(item.tglinput).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-4 px-4 text-center">Tidak ada data untuk ditampilkan.</td>
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