'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { DataPeminjam } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';
import PrivateRoute from '@/app/components/PrivateRoute';
import jsPDF from 'jspdf';

function CustomerDetailPageContent() {
  const { id } = useParams();
  const { token, user: authUser } = useAuth();
  const router = useRouter();
  const [customer, setCustomer] = useState<DataPeminjam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loggedInUserNohp = authUser?.nohp;

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

  const handleExportToPdf = async () => {
    if (!customer) return;
    setIsExporting(true);

    const doc = new jsPDF();
    const imageUrls = [
      { label: 'Foto KTP', url: customer.fotoktp },
      { label: 'Foto BPKB', url: customer.fotobpkb },
      { label: 'Foto STNK', url: customer.fotostnk },
      { label: 'Foto KK', url: customer.fotokk },
      { label: 'Rekening Koran', url: customer.fotorekeningkoran },
      { label: 'Rekening Listrik', url: customer.fotorekeninglistrik },
      { label: 'Buku Nikah', url: customer.fotobukunikah },
      { label: 'Sertifikat', url: customer.fotosertifikat },
      { label: 'KTP Penjamin', url: customer.fotoktppenjamin },
    ].filter(item => item.url);

    for (let i = 0; i < imageUrls.length; i++) {
      const { label, url } = imageUrls[i];
      try {
        const response = await fetch(url!, { headers: { 'Authorization': `Bearer ${token}` } });
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise<void>(resolve => {
          reader.onload = (e) => {
            if (i > 0) doc.addPage();
            doc.text(label, 10, 10);
            doc.addImage(e.target!.result as string, 'JPEG', 10, 20, 180, 160);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error(`Gagal memuat gambar ${label}:`, error);
        if (i > 0) doc.addPage();
        doc.text(`Gagal memuat gambar: ${label}`, 10, 10);
      }
    }

    const safeFilename = (customer.namapeminjam || "DataPeminjam").replace(/[^a-zA-Z0-9 ]/g, "_");
    doc.save(`Dokumen_${safeFilename}.pdf`);

    setIsExporting(false);
  };

  if (loading) return <div className="container mx-auto p-4">Memuat data pelanggan...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!customer) return <div className="container mx-auto p-4">Pelanggan tidak ditemukan.</div>;
  
  const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold">{value || '-'}</p>
    </div>
  );

  const PhotoPreview = ({ label, url }: { label: string; url?: string | null }) => (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full aspect-video rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
          <img src={url} alt={label} className="object-cover w-full h-full" />
        </a>
      ) : (
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-500 shadow-sm">
          Tidak Ada Gambar
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-xl font-bold">Detail Data Peminjam</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DetailItem label="NIK" value={customer.nik} />
          <DetailItem label="Nama" value={customer.namapeminjam} />
          <DetailItem label="User Input" value={customer.user?.namauser} />
          <DetailItem label="Aset" value={`${customer.aset} / ${customer.tahunaset}`} />
          <DetailItem label="Status" value={customer.status?.namastatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DetailItem label="Tanggal Input" value={customer.tglinput ? new Date(customer.tglinput).toLocaleDateString() : '-'} />
          <DetailItem label="Tanggal Update Terakhir" value={customer.tglpenerimaan ? new Date(customer.tglpenerimaan).toLocaleDateString() : '-'} />
          <DetailItem label="Tanggal Pencairan" value={customer.tglpencairan ? new Date(customer.tglpencairan).toLocaleDateString() : '-'} />
        </div>

        <div>
          <DetailItem label="Keterangan" value={customer.keterangan} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <PhotoPreview label="Foto KTP" url={customer.fotoktp} />
            <PhotoPreview label="Foto BPKB" url={customer.fotobpkb} />
            <PhotoPreview label="Foto STNK" url={customer.fotostnk} />
            <PhotoPreview label="Foto KK" url={customer.fotokk} />
            <PhotoPreview label="Foto Rekening Koran" url={customer.fotorekeningkoran} />
            <PhotoPreview label="Foto Rekening Listrik" url={customer.fotorekeninglistrik} />
            <PhotoPreview label="Foto Buku Nikah" url={customer.fotobukunikah} />
            <PhotoPreview label="Foto Sertifikat" url={customer.fotosertifikat} />
            <PhotoPreview label="Foto KTP Penjamin" url={customer.fotoktppenjamin} />
        </div>
        
        <div className="flex justify-end pt-4 space-x-2">
            <button 
              onClick={handleExportToPdf}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              disabled={isExporting}
            >
              {isExporting ? 'Mengekspor...' : 'Export to PDF'}
            </button>
            <button 
              onClick={() => router.push('/customer-management')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600"
            >
              Kembali
            </button>
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