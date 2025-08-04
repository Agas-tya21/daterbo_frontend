// Lokasi: src/app/customer-management/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { DataPeminjam } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import PrivateRoute from '@/app/components/PrivateRoute';

function CustomerDetailPageContent() {
  const { id } = useParams();
  const { token } = useAuth();
  const [customer, setCustomer] = useState<DataPeminjam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/datapeminjam/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data pelanggan.');
        }

        const data: DataPeminjam = await response.json();
        setCustomer(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, token]);

  if (loading) return <div className="container mx-auto p-4">Memuat data pelanggan...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!customer) return <div className="container mx-auto p-4">Pelanggan tidak ditemukan.</div>;
  
  // Fungsi untuk menampilkan gambar atau placeholder
  const renderImage = (url: string, alt: string) => {
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={alt} className="w-full h-auto rounded-lg shadow-md object-cover" />
      </a>
    ) : (
      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        Tidak Ada Gambar
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Detail Pelanggan: {customer.namapeminjam}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Informasi Teks */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div><strong>NIK:</strong> {customer.nik}</div>
            <div><strong>No. HP:</strong> {customer.nohp}</div>
            <div><strong>Aset:</strong> {customer.aset} ({customer.tahunaset})</div>
            <div className="md:col-span-2"><strong>Alamat:</strong> {`${customer.alamat}, ${customer.kecamatan}, ${customer.kota}`}</div>
            <div><strong>Status:</strong> <span className="font-semibold text-blue-600">{customer.status?.namastatus}</span></div>
            <div><strong>Leasing:</strong> {customer.leasing?.namaleasing}</div>
            <div><strong>User Input:</strong> {customer.user?.namauser}</div>
            <div><strong>Tgl Input:</strong> {new Date(customer.tglinput).toLocaleDateString()}</div>
            <div><strong>Tgl Penerimaan:</strong> {customer.tglpenerimaan ? new Date(customer.tglpenerimaan).toLocaleDateString() : '-'}</div>
            <div><strong>Tgl Pencairan:</strong> {customer.tglpencairan ? new Date(customer.tglpencairan).toLocaleDateString() : '-'}</div>
            <div className="md:col-span-3"><strong>Keterangan:</strong> <p className="mt-1 text-gray-600 dark:text-gray-300">{customer.keterangan || '-'}</p></div>
          </div>

          {/* Galeri Gambar */}
          <div className="md:col-span-2 lg:col-span-3">
             <h2 className="text-2xl font-bold mb-4 border-b pb-2">Dokumen Terlampir</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div><h3 className="font-semibold mb-2">Foto KTP</h3>{renderImage(customer.fotoktp, 'Foto KTP')}</div>
                <div><h3 className="font-semibold mb-2">Foto BPKB</h3>{renderImage(customer.fotobpkb, 'Foto BPKB')}</div>
                <div><h3 className="font-semibold mb-2">Foto STNK</h3>{renderImage(customer.fotostnk, 'Foto STNK')}</div>
                <div><h3 className="font-semibold mb-2">Foto KK</h3>{renderImage(customer.fotokk, 'Foto KK')}</div>
                <div><h3 className="font-semibold mb-2">Rekening Koran</h3>{renderImage(customer.fotorekeningkoran, 'Rekening Koran')}</div>
                <div><h3 className="font-semibold mb-2">Rekening Listrik</h3>{renderImage(customer.fotorekeninglistrik, 'Rekening Listrik')}</div>
                <div><h3 className="font-semibold mb-2">Buku Nikah</h3>{renderImage(customer.fotobukunikah, 'Buku Nikah')}</div>
                <div><h3 className="font-semibold mb-2">Sertifikat</h3>{renderImage(customer.fotosertifikat, 'Sertifikat')}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <PrivateRoute>
      <CustomerDetailPageContent />
    </PrivateRoute>
  );
}