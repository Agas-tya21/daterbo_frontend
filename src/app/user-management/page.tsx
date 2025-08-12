'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { User, Role } from '@/app/types';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useAuth(); // Ambil fungsi logout
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const [userResponse, roleResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/roles`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (userResponse.status === 401 || userResponse.status === 403 || roleResponse.status === 401 || roleResponse.status === 403) {
        logout();
        return;
      }

      if (!userResponse.ok || !roleResponse.ok) {
        throw new Error('Gagal mengambil data.');
      }
      const userData: User[] = await userResponse.json();
      const roleData: Role[] = await roleResponse.json();
      setUsers(userData);
      setRoles(roleData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModalForCreate = () => {
    setIsEditing(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: User) => {
    setIsEditing(true);
    setFormData({
      ...user,
      role: { idrole: user.role?.idrole || '', namarole: ''}
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") {
        setFormData(prev => ({ ...prev, [name]: { idrole: value, namarole: "" } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = isEditing ? `${API_BASE_URL}/users/${formData.iduser}` : `${API_BASE_URL}/users/register`;
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

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menyimpan data pengguna.');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (iduser: string) => {
    if (!token) return;

    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${iduser}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }

        if (!response.ok) throw new Error('Gagal menghapus pengguna.');
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  if (loading) return <div className="container mx-auto p-4">Memuat data...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

  return (
    // ... JSX tetap sama
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[20px] shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button onClick={openModalForCreate} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700">
            Tambah User
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Tambah User Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Nama User</label>
                <input name="namauser" placeholder="Nama User" value={formData.namauser || ''} onChange={handleInputChange} className="p-2 border rounded w-full" required />
              </div>
              <div>
                <label>Email</label>
                <input type="email" name="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} className="p-2 border rounded w-full" required />
              </div>
              <div>
                <label>Password</label>
                <input type="password" name="password" placeholder={isEditing ? 'Kosongkan jika tidak ingin diubah' : 'Password'} onChange={handleInputChange} className="p-2 border rounded w-full" required={!isEditing} />
              </div>
              <div>
                <label>Role</label>
                <select name="role" value={formData.role?.idrole || ''} onChange={handleInputChange} className="p-2 border rounded w-full">
                  <option value="">Pilih Role</option>
                  {roles.map(role => (
                    <option key={role.idrole} value={role.idrole}>{role.namarole}</option>
                  ))}
                </select>
              </div>
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
                <th className="py-3 px-4 text-left">Nama User</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.iduser} className="hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{user.namauser}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.role?.namarole || 'N/A'}</td>
                    <td className="py-2 px-4 flex space-x-2">
                        <button onClick={() => openModalForEdit(user)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                            Update
                        </button>
                        <button onClick={() => handleDelete(user.iduser)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Delete
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-center">Tidak ada data pengguna.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
    return (
        <PrivateRoute>
            <UserManagementContent />
        </PrivateRoute>
    );
}