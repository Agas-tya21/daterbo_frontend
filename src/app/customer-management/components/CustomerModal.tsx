'use client';

import { FormEvent } from 'react';
import { DataPeminjam, Status, Leasing, Pic, Surveyor } from '@/app/types';

interface CustomerModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: (e: FormEvent) => void;
  editingId: string | null;
  formData: Partial<DataPeminjam>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statuses: Status[];
  leasings: Leasing[];
  pics: Pic[];
  surveyors: Surveyor[];
  isSubmitting: boolean;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  editingId,
  formData,
  handleInputChange,
  handleFileChange,
  statuses,
  leasings,
  pics,
  surveyors,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Data Peminjam' : 'Tambah Data Peminjam Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input name="nik" placeholder="NIK" value={formData.nik || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="namapeminjam" placeholder="Nama Peminjam" value={formData.namapeminjam || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="nohp" placeholder="No. HP" value={formData.nohp || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="aset" placeholder="Aset" value={formData.aset || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="tahunaset" placeholder="Tahun Aset" value={formData.tahunaset || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="alamat" placeholder="Alamat" value={formData.alamat || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="kota" placeholder="Kota" value={formData.kota || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <input name="kecamatan" placeholder="Kecamatan" value={formData.kecamatan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
            <div><label className="text-sm">Tgl Input</label><input type="date" name="tglinput" value={formData.tglinput || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
            <div><label className="text-sm">Tgl Penerimaan</label><input type="date" name="tglpenerimaan" value={formData.tglpenerimaan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
            <div><label className="text-sm">Tgl Pencairan</label><input type="date" name="tglpencairan" value={formData.tglpencairan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
            <textarea name="keterangan" placeholder="Keterangan" value={formData.keterangan || ''} onChange={handleInputChange} className="p-2 border rounded md:col-span-2 lg:col-span-3" />
            <select name="status" value={formData.status?.idstatus || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih Status</option>{statuses.map(status => <option key={status.idstatus} value={status.idstatus}>{status.namastatus}</option>)}</select>
            <select name="leasing" value={formData.leasing?.idleasing || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih Leasing</option>{leasings.map(leasing => <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>)}</select>
            <select name="pic" value={formData.pic?.idpic || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih PIC</option>{pics.map(pic => <option key={pic.idpic} value={pic.idpic}>{pic.namapic}</option>)}</select>
            <select name="surveyor" value={formData.surveyor?.id || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih Surveyor</option>{surveyors.map(s => <option key={s.id} value={s.id}>{s.namasurveyor}</option>)}</select>
            <div><label>Foto KTP</label><input type="file" name="fotoktp" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Foto BPKB</label><input type="file" name="fotobpkb" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Foto STNK</label><input type="file" name="fotostnk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Foto KK</label><input type="file" name="fotokk" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Rekening Koran</label><input type="file" name="fotorekeningkoran" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Rekening Listrik</label><input type="file" name="fotorekeninglistrik" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Buku Nikah</label><input type="file" name="fotobukunikah" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
            <div><label>Sertifikat</label><input type="file" name="fotosertifikat" onChange={handleFileChange} className="p-2 border rounded w-full" /></div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" disabled={isSubmitting}>Batal</button>
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;