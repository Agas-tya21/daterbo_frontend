'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataPeminjam } from '@/app/types';
import ActionMenu from './ActionMenu';

interface CustomerTableProps {
  filteredData: DataPeminjam[];
  openModalForEdit: (peminjam: DataPeminjam) => void;
  handleProses: (id: string) => void;
  handleCair: (id: string) => void;
  handleBatal: (id: string) => void;
  handleDelete: (id: string) => void;
  isAdmin: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  filteredData,
  openModalForEdit,
  handleProses,
  handleCair,
  handleBatal,
  handleDelete,
  isAdmin,
}) => {
  const [expandedKeteranganId, setExpandedKeteranganId] = useState<string | null>(null);

  const formatWhatsAppLink = (phone: string) => {
    if (!phone) return '';
    let cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[20px] shadow-md p-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#fe0000] text-white">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">No.</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">NIK</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Nama Peminjam</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">User</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">No. HP</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Aset</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Tahun Aset</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Kota</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Leasing</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Tgl Input</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider min-w-[200px]">Keterangan</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">PIC</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">No. HP PIC</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Surveyor</th>
              <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">No. HP Surveyor</th>
              <th className="sticky right-0 bg-[#fe0000] py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.iddatapeminjam} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="py-2 px-4 text-xs">{index + 1}</td>
                  <td className="py-2 px-4 text-xs">{item.nik}</td>
                  <td className="py-2 px-4 text-xs whitespace-nowrap">{item.namapeminjam}</td>
                  <td className="py-2 px-4 text-xs">{item.user?.namauser}</td>
                  <td className="py-2 px-4 text-xs">
                    <a 
                      href={formatWhatsAppLink(item.nohp)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {item.nohp}
                    </a>
                  </td>
                  <td className="py-2 px-4 text-xs">{item.aset}</td>
                  <td className="py-2 px-4 text-xs">{item.tahunaset}</td>
                  <td className="py-2 px-4 text-xs">{item.kota}</td>
                  <td className="py-2 px-4 text-xs">{item.status?.namastatus}</td>
                  <td className="py-2 px-4 text-xs">{item.leasing?.namaleasing}</td>
                  <td className="py-2 px-4 text-xs">{new Date(item.tglinput).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-xs">
                    {item.keterangan && (
                      <div>
                        {expandedKeteranganId === item.iddatapeminjam ? (
                          <>
                            {item.keterangan}
                            <button
                              onClick={() => setExpandedKeteranganId(null)}
                              className="text-blue-500 hover:underline ml-2 text-xs"
                            >
                              Show less
                            </button>
                          </>
                        ) : (
                          <>
                            {item.keterangan.length > 100 ? `${item.keterangan.substring(0, 100)}...` : item.keterangan}
                            {item.keterangan.length > 100 && (
                              <button
                                onClick={() => setExpandedKeteranganId(item.iddatapeminjam)}
                                className="text-blue-500 hover:underline ml-2 text-xs"
                              >
                                Read more
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 text-xs whitespace-nowrap">{item.pic ? `${item.pic.namapic} - ${item.pic.namaleasing} (${item.pic.asalleasing})` : ''}</td>
                  <td className="py-2 px-4 text-xs">
                    {item.pic?.nohp && (
                      <a 
                        href={formatWhatsAppLink(item.pic.nohp)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {item.pic.nohp}
                      </a>
                    )}
                  </td>
                  <td className="py-2 px-4 text-xs whitespace-nowrap">{item.surveyor ? `${item.surveyor.namasurveyor} - ${item.surveyor.namaleasing} (${item.surveyor.asalleasing})` : ''}</td>
                  <td className="py-2 px-4 text-xs">
                    {item.surveyor?.nowa && (
                      <a 
                        href={formatWhatsAppLink(item.surveyor.nowa)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {item.surveyor.nowa}
                      </a>
                    )}
                  </td>
                  <td className="sticky right-0 bg-white dark:bg-gray-800 py-2 px-4">
                    <ActionMenu
                      item={item}
                      openModalForEdit={openModalForEdit}
                      handleProses={handleProses}
                      handleCair={handleCair}
                      handleBatal={handleBatal}
                      handleDelete={handleDelete}
                      isAdmin={isAdmin}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={17} className="py-4 px-4 text-center text-sm">Tidak ada data untuk ditampilkan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;