'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { Pic } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function PicManagementContent() {
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Pic>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pic`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data PIC.');
      }
      const data: Pic[] = await response.json();
      setPics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModalForCreate = () => {
    setIsEditing(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (pic: Pic) => {
    setIsEditing(true);
    setFormData(pic);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = isEditing ? `${API_BASE_URL}/pic/${formData.idpic}` : `${API_BASE_URL}/pic`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menyimpan data PIC.');
      }

      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (idpic: string) => {
    if (!token) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus PIC ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/pic/${idpic}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Gagal menghapus PIC.');
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  if (loading) return <div className="container mx-auto p-4">Memuat data...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">PIC Management</h1>
          <button onClick={openModalForCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
            Tambah PIC
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit PIC' : 'Tambah PIC Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="namapic" placeholder="Nama PIC" value={formData.namapic || ''} onChange={handleInputChange} className="p-2 border rounded w-full" required />
              <input name="nohp" placeholder="No. HP" value={formData.nohp || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
              <input name="namaleasing" placeholder="Nama Leasing" value={formData.namaleasing || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
              <input name="asalleasing" placeholder="Asal Leasing" value={formData.asalleasing || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
              <div className="mt-6 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Batal</button>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[20px] shadow-md p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#fe0000] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nama PIC</th>
                <th className="py-3 px-4 text-left">No. HP</th>
                <th className="py-3 px-4 text-left">Nama Leasing</th>
                <th className="py-3 px-4 text-left">Asal Leasing</th>
                <th className="py-3 px-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pics.length > 0 ? (
                pics.map((pic) => (
                  <tr key={pic.idpic} className="hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{pic.namapic}</td>
                    <td className="py-2 px-4">{pic.nohp}</td>
                    <td className="py-2 px-4">{pic.namaleasing}</td>
                    <td className="py-2 px-4">{pic.asalleasing}</td>
                    <td className="py-2 px-4 flex space-x-2">
                        <button onClick={() => openModalForEdit(pic)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                            Update
                        </button>
                        <button onClick={() => handleDelete(pic.idpic)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Delete
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center">Tidak ada data PIC.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PicManagementPage() {
    return (
        <PrivateRoute>
            <PicManagementContent />
        </PrivateRoute>
    );
}