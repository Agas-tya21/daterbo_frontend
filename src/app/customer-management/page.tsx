'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import { DataPeminjam } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function CustomerManagementContent() {
  const [data, setData] = useState<DataPeminjam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return; // Jangan fetch data jika tidak ada token

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/datapeminjam`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Tambahkan token ke header
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data atau sesi Anda telah berakhir.');
        }

        const result: DataPeminjam[] = await response.json();
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="container mx-auto p-4">Memuat data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 border-b">NIK</th>
              <th className="py-2 px-4 border-b">Nama Peminjam</th>
              <th className="py-2 px-4 border-b">No. HP</th>
              <th className="py-2 px-4 border-b">Aset</th>
              <th className="py-2 px-4 border-b">Tahun Aset</th>
              <th className="py-2 px-4 border-b">Alamat</th>
              <th className="py-2 px-4 border-b">Kota</th>
              <th className="py-2 px-4 border-b">Kecamatan</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Leasing</th>
              <th className="py-2 px-4 border-b">Tgl Input</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.nik} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="py-2 px-4 border-b">{item.nik}</td>
                  <td className="py-2 px-4 border-b">{item.namapeminjam}</td>
                  <td className="py-2 px-4 border-b">{item.nohp}</td>
                  <td className="py-2 px-4 border-b">{item.aset}</td>
                  <td className="py-2 px-4 border-b">{item.tahunaset}</td>
                  <td className="py-2 px-4 border-b">{item.alamat}</td>
                  <td className="py-2 px-4 border-b">{item.kota}</td>
                  <td className="py-2 px-4 border-b">{item.kecamatan}</td>
                  <td className="py-2 px-4 border-b">{item.status?.namastatus}</td>
                  <td className="py-2 px-4 border-b">{item.leasing?.namaleasing}</td>
                  <td className="py-2 px-4 border-b">{new Date(item.tglinput).toLocaleDateString()}</td>
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