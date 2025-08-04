// Lokasi: src/app/layout.tsx

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Daterbo App',
  description: 'Aplikasi Manajemen Daterbo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> {/* <-- WRAP aPLIKASI DENGAN AUTHPROVIDER */}
          <Navbar />
          <main className="pt-24">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}