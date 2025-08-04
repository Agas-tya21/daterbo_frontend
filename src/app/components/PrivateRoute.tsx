// Lokasi: src/app/components/PrivateRoute.tsx

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa jika masih loading state autentikasi
    if (isLoading) {
      return;
    }
    
    // Jika loading selesai dan tidak ada token, arahkan ke halaman login
    if (!token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);
  
  // Tampilkan loading spinner atau null saat status autentikasi sedang diperiksa
  if (isLoading || !token) {
    return <div>Loading authentication...</div>;
  }
  
  // Jika pengguna sudah terautentikasi, tampilkan children (konten halaman)
  return <>{children}</>;
};

export default PrivateRoute;