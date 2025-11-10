import React, { useState, useRef, useEffect } from 'react';
import type { Booking } from '../types';

type Status = Booking['status'];

// Exporting for use in other components like the confirmation dialog
export const getStatusLabel = (status: Status): string => {
    switch(status) {
        case 'pending': return 'รอตรวจสอบ';
        case 'confirmed': return 'ยืนยันแล้ว';
        case 'completed': return 'เสร็จสิ้น';
        case 'cancelled': return 'ยกเลิก';
        default: return status;
    }
};

const getButtonStyle = (status: Status): string => {
    switch(status) {
        case 'confirmed': return 'bg-green-100 text-green-800 border-green-400';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        case 'completed': return 'bg-blue-100 text-blue-800 border-blue-400';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-400';
        default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
};

interface StatusDropdownProps {
  currentStatus: Status;
  onChange: (newStatus: Status) => void;
}

const ALL_STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status: Status) => {
    setIsOpen(false);
    if (status !== currentStatus) {
      onChange(status);
    }
  };

  return (
    <div className="relative inline-block text-left w-full min-w-[130px]" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`w-full inline-flex justify-between items-center rounded-lg border shadow-sm px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors ${getButtonStyle(currentStatus)}`}
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{getStatusLabel(currentStatus)}</span>
          <svg className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {ALL_STATUSES.map((status) => (
              <a
                href="#"
                key={status}
                className={`block px-4 py-2 text-sm text-black ${currentStatus === status ? 'bg-gray-100 font-bold' : 'font-medium'} hover:bg-blue-100`}
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  handleStatusSelect(status);
                }}
              >
                {getStatusLabel(status)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
