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
  filePreviews: { [key: string]: string };
  statuses: Status[];
  leasings: Leasing[];
  pics: Pic[];
  surveyors: Surveyor[];
  isSubmitting: boolean;
  isAdmin: boolean; // <-- TAMBAHKAN PROPERTI INI
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  setIsOpen,
  handleSubmit,
  editingId,
  formData,
  handleInputChange,
  handleFileChange,
  filePreviews,
  statuses,
  leasings,
  pics,
  surveyors,
  isSubmitting,
  isAdmin, // <-- TERIMA PROPERTI INI
}) => {
  if (!isOpen) return null;

  const renderFileInput = (name: keyof DataPeminjam, label: string) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 border rounded-lg p-2 space-y-2">
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
          {filePreviews[name] ? (
            <img src={filePreviews[name]} alt={`${label} preview`} className="h-full w-full object-contain rounded" />
          ) : (
            <span className="text-xs text-gray-500">Preview</span>
          )}
        </div>
        <input type="file" name={name} onChange={handleFileChange} className="w-full text-xs" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Data Peminjam' : 'Tambah Data Peminjam Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <div><label className="text-sm">NIK</label><input name="nik" value={formData.nik || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Nomor HP</label><input name="nohp" value={formData.nohp || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Tahun Aset</label><input name="tahunaset" value={formData.tahunaset || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Kota</label><input name="kota" value={formData.kota || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Tanggal Input</label><input type="date" name="tglinput" value={formData.tglinput || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Tanggal Pencairan</label><input type="date" name="tglpencairan" value={formData.tglpencairan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div><label className="text-sm">Nama</label><input name="namapeminjam" value={formData.namapeminjam || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div></div> {/* Spacer */}
              <div><label className="text-sm">Aset</label><input name="aset" value={formData.aset || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Alamat</label><input name="alamat" value={formData.alamat || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Kecamatan</label><input name="kecamatan" value={formData.kecamatan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
              <div><label className="text-sm">Tanggal Penerimaan</label><input type="date" name="tglpenerimaan" value={formData.tglpenerimaan || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-sm">Keterangan</label>
            <textarea name="keterangan" value={formData.keterangan || ''} onChange={handleInputChange} className="p-2 border rounded w-full min-h-[80px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm">Status</label>
              <select name="status" value={formData.status?.idstatus || ''} onChange={handleInputChange} className="p-2 border rounded w-full">
                <option value="">Pilih Status</option>
                {/* MODIFIKASI DIMULAI DI SINI */}
                {statuses
                  .filter(status => isAdmin || (status.namastatus !== 'BATAL' && status.namastatus !== 'PROSES PENCARIAN' && status.namastatus !== 'CAIR'))
                  .map(status => (
                    <option key={status.idstatus} value={status.idstatus}>{status.namastatus}</option>
                ))}
                {/* MODIFIKASI SELESAI DI SINI */}
              </select>
            </div>
            <div><label className="text-sm">Leasing</label><select name="leasing" value={formData.leasing?.idleasing || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih Leasing</option>{leasings.map(leasing => <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>)}</select></div>
            <div><label className="text-sm">PIC</label><select name="pic" value={formData.pic?.idpic || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih PIC</option>{pics.map(pic => <option key={pic.idpic} value={pic.idpic}>{`${pic.namapic} - ${pic.namaleasing} (${pic.asalleasing})`}</option>)}</select></div>
            <div><label className="text-sm">Surveyor</label><select name="surveyor" value={formData.surveyor?.id || ''} onChange={handleInputChange} className="p-2 border rounded w-full"><option value="">Pilih Surveyor</option>{surveyors.map(s => <option key={s.id} value={s.id}>{`${s.namasurveyor} - ${s.namaleasing} (${s.asalleasing})`}</option>)}</select></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {renderFileInput('fotoktp', 'Foto KTP')}
            {renderFileInput('fotobpkb', 'Foto BPKB')}
            {renderFileInput('fotostnk', 'Foto STNK')}
            {renderFileInput('fotokk', 'Foto KK')}
            {renderFileInput('fotorekeningkoran', 'Foto Rekening Koran')}
            {renderFileInput('fotorekeninglistrik', 'Foto Rekening Listrik')}
            {renderFileInput('fotobukunikah', 'Foto Buku Nikah')}
            {renderFileInput('fotosertifikat', 'Foto Sertifikat')}
            {renderFileInput('fotoktppenjamin', 'Foto KTP Penjamin')}
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