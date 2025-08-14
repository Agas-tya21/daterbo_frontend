'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DataPeminjam } from '@/app/types';

interface ActionMenuProps {
  item: DataPeminjam;
  openModalForEdit: (peminjam: DataPeminjam) => void;
  handleDataLengkap: (id: string) => void;
  handleProses: (id: string) => void;
  handleCair: (id: string) => void;
  handleBatal: (id: string) => void;
  handleDelete: (id: string) => void;
  isAdmin: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  item,
  openModalForEdit,
  handleDataLengkap,
  handleProses,
  handleCair,
  handleBatal,
  handleDelete,
  isAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-700">
          <div className="py-1">
            <Link href={`/customer-management/${item.iddatapeminjam}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Detail</Link>
            <button onClick={() => { openModalForEdit(item); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Update</button>
            {item.status?.idstatus === 'S001' && (<button onClick={() => { handleDataLengkap(item.iddatapeminjam); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Data Lengkap</button>)}
            {item.status?.idstatus === 'S005' && (<button onClick={() => { handleProses(item.iddatapeminjam); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Proses</button>)}
            {item.status?.idstatus === 'S002' && (<button onClick={() => { handleCair(item.iddatapeminjam); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Cair</button>)}
            {isAdmin && (item.status?.idstatus === 'S001' || item.status?.idstatus === 'S002' || item.status?.idstatus === 'S005') && (<button onClick={() => { handleBatal(item.iddatapeminjam); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Batal</button>)}
            {isAdmin && (<button onClick={() => { handleDelete(item.iddatapeminjam); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600">Delete</button>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;