'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const Navbar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { token, logout } = useAuth(); // Dapatkan token dan fungsi logout

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-red-600 text-white p-4 rounded-full shadow-lg z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold">
            <button
              onClick={toggleSidebar}
              className="md:hidden focus:outline-none"
              aria-label="Open sidebar"
            >
              DB
            </button>
            <Link href="/" className="hidden md:block">
              Daterbo
            </Link>
          </div>

          {/* Menu untuk Desktop */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link
              href="/"
              className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            {token && ( // Tampilkan hanya jika sudah login
              <Link
                href="/customer-management"
                className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Customer Management
              </Link>
            )}
            {token ? ( // Jika ada token, tampilkan tombol Logout
              <button
                onClick={logout}
                className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            ) : ( // Jika tidak, tampilkan link Login
              <Link
                href="/login"
                className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar untuk Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-red-600 text-white transform rounded-r-2xl shadow-lg ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 md:hidden`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-8">DB</h2>
          <nav className="flex flex-col space-y-2">
            <Link href="/" onClick={closeSidebar} className="hover:bg-red-700 p-3 rounded-lg">
              Home
            </Link>
            {token && ( // Tampilkan hanya jika sudah login
                <Link href="/customer-management" onClick={closeSidebar} className="hover:bg-red-700 p-3 rounded-lg">
                    Customer Management
                </Link>
            )}
            {token ? ( // Jika ada token, tampilkan tombol Logout
              <button onClick={handleLogout} className="text-left w-full hover:bg-red-700 p-3 rounded-lg">
                Logout
              </button>
            ) : ( // Jika tidak, tampilkan link Login
              <Link href="/login" onClick={closeSidebar} className="hover:bg-red-700 p-3 rounded-lg">
                Login
              </Link>
            )}
          </nav>
        </div>
      </aside>

      {/* Overlay saat sidebar terbuka */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
};

export default Navbar;