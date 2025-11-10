import React, { useState, useMemo } from 'react';
import Calendar from './Calendar';
import type { Booking, AvailabilityBlock, Employee } from '../types';
import { TIME_SLOTS } from '../constants';

interface AvailabilityPageProps {
  navigateToBooking: (date: Date) => void;
  bookings: Booking[];
  availabilityBlocks: AvailabilityBlock[];
  employees: Employee[];
}

const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AvailabilityPage: React.FC<AvailabilityPageProps> = ({ navigateToBooking, bookings, availabilityBlocks, employees }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes, 0, 0);
    navigateToBooking(bookingDate);
  }

  const timeSlotStatus = useMemo(() => {
    const totalTechnicians = employees.length > 0 ? employees.length : 1;
    const dateKey = getLocalDateKey(selectedDate);

    const bookingsOnDate = bookings.filter(booking => 
        getLocalDateKey(booking.date) === dateKey && 
        (booking.status === 'confirmed' || booking.status === 'pending')
    );
    const blocksOnDate = availabilityBlocks.filter(block => getLocalDateKey(block.date) === dateKey);

    const status: {[time: string]: {isBooked: boolean}} = {};

    TIME_SLOTS.forEach(time => {
        const bookingsAtTime = bookingsOnDate.filter(b => b.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) === time).length;
        const blocksAtTime = blocksOnDate.filter(b => b.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) === time).length;
        
        const unavailableCount = bookingsAtTime + blocksAtTime;
        
        status[time] = { isBooked: unavailableCount >= totalTechnicians };
    });

    return status;
  }, [selectedDate, bookings, availabilityBlocks, employees]);


  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black">ตรวจสอบคิวว่าง</h1>
        <p className="text-black mt-2">เลือกวันและเวลาที่ท่านสะดวกเพื่อทำการจอง</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-8 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">เลือกวันที่</h2>
          <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">
            เวลาว่างสำหรับวันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TIME_SLOTS.map(time => {
              const isBooked = timeSlotStatus[time]?.isBooked ?? false;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  disabled={isBooked}
                  className={`p-3 rounded-lg text-center font-semibold transition-colors ${
                    isBooked
                      ? 'bg-red-100 text-red-400 cursor-not-allowed'
                      : 'bg-green-100 text-black hover:bg-green-500 hover:text-white'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <div className="mt-6 text-sm text-black">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200 mr-2"></div>
              <span>ว่าง (Available)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
              <span>ไม่ว่าง (Booked)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;