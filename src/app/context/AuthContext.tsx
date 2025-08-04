// Lokasi: src/app/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Coba muat token dari localStorage saat komponen pertama kali dirender
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Coba login sebagai admin terlebih dahulu
    try {
      const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (adminResponse.ok) {
        // Jika login admin berhasil, kita tidak mendapatkan token, hanya pesan sukses
        // Untuk konsistensi, kita bisa membuat token dummy atau menganggapnya berhasil
        // Di sini kita asumsikan login admin tidak memerlukan token untuk frontend
        // atau Anda bisa memodifikasi backend untuk memberikan token admin jika perlu.
        
        // Untuk tujuan navigasi, kita bisa set token dummy atau state khusus admin
        const tempAdminToken = 'admin-logged-in';
        setToken(tempAdminToken);
        localStorage.setItem('authToken', tempAdminToken);
        router.push('/admin-management');
        return;
      }
    } catch (error) {
      console.error('Admin login check failed, proceeding to user login.', error);
    }

    // Jika login admin gagal, coba login sebagai user
    try {
      const userResponse = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Login sebagai user gagal');
      }

      const data = await userResponse.json();
      const newToken = data.token;

      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      router.push('/customer-management');
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Lempar kembali error untuk ditangani di halaman login
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('authToken');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};