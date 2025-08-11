'use client';

import DatePicker from 'react-datepicker';
import { Status, Leasing, User, DataPeminjam } from '@/app/types';

interface FilterSectionProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  baseFilteredData: DataPeminjam[];
  statuses: Status[];
  statusCounts: { [key: string]: number };
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  datesWithData: Set<string>;
  canViewAllData: boolean;
  leasings: Leasing[];
  setSelectedLeasing: (leasing: string) => void;
  users: User[];
  setSelectedUser: (user: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  activeStatus,
  setActiveStatus,
  baseFilteredData,
  statuses,
  statusCounts,
  selectedDate,
  setSelectedDate,
  datesWithData,
  canViewAllData,
  leasings,
  setSelectedLeasing,
  users,
  setSelectedUser,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className='mb-4'>
      <div className="bg-red-600 rounded-full p-1 pt-3">
        <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap p-1">
          <button onClick={() => setActiveStatus('Semua')} className={`relative inline-flex items-center flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-colors duration-300 ${activeStatus === 'Semua' ? 'bg-white text-red-600' : 'text-white hover:bg-red-700'}`}>
            Semua
            <span className="ml-2 -mt-5 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">{baseFilteredData.length}</span>
          </button>
          {statuses.map(status => (
            <button key={status.idstatus} onClick={() => setActiveStatus(status.namastatus)} className={`relative inline-flex items-center flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-colors duration-300 ${activeStatus === status.namastatus ? 'bg-white text-red-600' : 'text-white hover:bg-red-700'}`}>
              {status.namastatus}
              <span className="ml-2 -mt-5 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {statusCounts[status.namastatus] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='mt-4 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0'>
        <input
          type="text"
          placeholder="Cari NIK atau Nama Peminjam..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full text-xs"
        />
        <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dayClassName={date => 
              datesWithData.has(date.toDateString())
                ? 'highlighted-date' 
                : ''
            }
            placeholderText="Filter by tanggal input"
            isClearable
            className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full text-xs"
        />
        {canViewAllData && (
          <>
            <select onChange={(e) => setSelectedLeasing(e.target.value)} className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full text-xs">
                <option value="Semua">Semua Leasing</option>
                {leasings.map(leasing => (
                    <option key={leasing.idleasing} value={leasing.idleasing}>{leasing.namaleasing}</option>
                ))}
            </select>
            <select onChange={(e) => setSelectedUser(e.target.value)} className="w-full md:w-auto bg-gray-200 text-black font-bold py-2 px-4 rounded-full text-xs">
                <option value="Semua">Semua User</option>
                {users.map(user => (
                    <option key={user.iduser} value={user.iduser}>{user.namauser}</option>
                ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSection;