'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { Admin } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function AdminManagementContent() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Admin>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data admin.');
      }
      const data: Admin[] = await response.json();
      setAdmins(data);
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

  const openModalForEdit = (admin: Admin) => {
    setIsEditing(true);
    setFormData(admin);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = isEditing ? `${API_BASE_URL}/admin/${formData.email}` : `${API_BASE_URL}/admin/register`;
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
        throw new Error(errorText || 'Gagal menyimpan data admin.');
      }

      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (email: string) => {
    if (!token) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/${email}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Gagal menghapus admin.');
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
      <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <button onClick={openModalForCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
            Tambah Admin
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Admin' : 'Tambah Admin Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Nama Admin</label>
                <input name="namaadmin" placeholder="Nama Admin" value={formData.namaadmin || ''} onChange={handleInputChange} className="p-2 border rounded w-full" required />
              </div>
              <div>
                <label>Email</label>
                <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} className="p-2 border rounded w-full" required disabled={isEditing} />
              </div>
              <div>
                <label>Password</label>
                <input type="password" name="password" placeholder={isEditing ? 'Kosongkan jika tidak ingin diubah' : 'Password'} onChange={handleInputChange} className="p-2 border rounded w-full" required={!isEditing} />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Batal</button>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-md p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#fe0000] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nama Admin</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{admin.namaadmin}</td>
                    <td className="py-2 px-4">{admin.email}</td>
                    <td className="py-2 px-4 flex space-x-2">
                        <button onClick={() => openModalForEdit(admin)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                            Update
                        </button>
                        <button onClick={() => handleDelete(admin.email)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Delete
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-center">Tidak ada data admin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagementPage() {
    return (
        <PrivateRoute>
            <AdminManagementContent />
        </PrivateRoute>
    );
}