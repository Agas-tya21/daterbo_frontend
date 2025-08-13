'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  role?: string;
  nohp?: string; // Menambahkan nohp ke payload
}

interface AuthUser {
  email: string;
  role: string | null;
  nohp: string | null; // Menambahkan nohp ke user object
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateUserFromToken = useCallback((jwtToken: string | null) => {
    if (jwtToken) {
      try {
        const decoded: JwtPayload = jwtDecode(jwtToken);
        setUser({ 
          email: decoded.sub, 
          role: decoded.role || null,
          nohp: decoded.nohp || null 
        });
        setToken(jwtToken);
      } catch (error) {
        console.error("Token tidak valid:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    updateUserFromToken(storedToken);
    setIsLoading(false);
  }, [updateUserFromToken]);

  const login = async (email: string, password: string) => {
    try {
      const userResponse = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Login sebagai user gagal');
      }

      const data = await userResponse.json();
      const newToken = data.token;
      localStorage.setItem('authToken', newToken);
      updateUserFromToken(newToken);
      router.push('/customer-management');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    updateUserFromToken(null);
    router.push('/login');
  }, [router, updateUserFromToken]);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
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