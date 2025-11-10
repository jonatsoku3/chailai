
import React, { useState, useMemo } from 'react';
import type { Booking, Employee, AvailabilityBlock, Payment, Service } from '../types';
import Calendar from './Calendar';
import BookingModal from './BookingModal';
import CompleteBookingModal from './CompleteBookingModal';
import ReceiptModal from './ReceiptModal';
import { TIME_SLOTS } from '../constants';
import { getStatusLabel } from './StatusDropdown';

interface TechnicianDashboardProps {
    currentEmployee: Employee | null;
    bookings: Booking[];
    availabilityBlocks: AvailabilityBlock[];
    services: Service[];
    onDeleteBooking: (bookingId: string) => void;
    onAddBooking: (booking: Omit<Booking, 'id' | 'status'|'service'>) => void;
    onAddBlock: (block: Omit<AvailabilityBlock, 'id'>) => void;
    onRemoveBlock: (blockId: string) => void;
    onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
}

type ScheduleItem = 
    | { type: 'booking', data: Booking }
    | { type: 'break', data: AvailabilityBlock };

const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ 
    currentEmployee, 
    bookings, 
    availabilityBlocks, 
    services,
    onDeleteBooking, 
    onAddBooking,
    onAddBlock,
    onRemoveBlock,
    onUpdateBooking,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalInfo, setModalInfo] = useState<{ time: string; date: Date } | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Booking | null>(null);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const dailySchedule = useMemo(() => {
    if (!currentEmployee) return {};
    const schedule: Record<string, ScheduleItem> = {};
    const dateKey = getLocalDateKey(selectedDate);

    bookings
      .filter(booking => 
        booking.employeeId === currentEmployee.uid &&
        getLocalDateKey(booking.date) === dateKey && 
        (booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'completed')
      )
      .forEach(booking => {
        const timeKey = booking.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        schedule[timeKey] = { type: 'booking', data: booking };
      });

    availabilityBlocks
        .filter(block =>
            block.employeeId === currentEmployee.uid &&
            getLocalDateKey(block.date) === dateKey
        )
        .forEach(block => {
            const timeKey = block.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            schedule[timeKey] = { type: 'break', data: block };
        });

    return schedule;
  }, [selectedDate, bookings, availabilityBlocks, currentEmployee]);

  const handleSaveBooking = (newBookingData: Omit<Booking, 'id' | 'status'| 'service'>) => {
    onAddBooking(newBookingData);
    setModalInfo(null);
  };

  const handleDeleteBooking = (bookingId: string) => {
      if (window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
        onDeleteBooking(bookingId);
      }
  };

  const handleAddBreak = (time: string) => {
    if (!currentEmployee) return;
    const [hours, minutes] = time.split(':').map(Number);
    const breakDate = new Date(selectedDate);
    breakDate.setHours(hours, minutes, 0, 0);

    const newBreak: Omit<AvailabilityBlock, 'id'> = {
        employeeId: currentEmployee.uid,
        date: breakDate,
        type: 'break',
    };
    onAddBlock(newBreak);
  };

  const handleRemoveBreak = (blockId: string) => {
    onRemoveBlock(blockId);
  };
  
  const handleCompleteBookingConfirm = (bookingId: string, finalPrice: number) => {
      onUpdateBooking(bookingId, { 
          status: 'completed',
          finalPrice: finalPrice 
      });
      setCompletingBooking(null);
  };
  
  if (!currentEmployee) {
      return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-black">Access Denied</h2>
            <p className="text-black mt-2">Please log in as a technician to view this page.</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black">ตารางงาน</h1>
        <p className="text-black mt-2">จัดการตารางงานและเพิ่มการจองสำหรับลูกค้า Walk-in</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg h-fit">
            <h2 className="text-2xl font-bold text-black mb-4">เลือกวันที่</h2>
            <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
           <h2 className="text-2xl font-bold text-black mb-4">
            ตารางงานวันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <div className="space-y-3">
            {TIME_SLOTS.map(time => {
                const scheduleItem = dailySchedule[time];
                return (
                    <div key={time} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center p-4 rounded-lg border border-stone-200">
                        <div className="col-span-1 font-semibold text-black text-lg">{time}</div>
                        <div className="col-span-1 sm:col-span-3">
                            {scheduleItem ? (
                                scheduleItem.type === 'booking' ? (
                                    <div className={`p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 
                                        ${scheduleItem.data.status === 'completed' ? 'bg-blue-100' : scheduleItem.data.type === 'walk-in' ? 'bg-purple-100' : 'bg-green-100'}`}>
                                        <div>
                                            <p className="font-bold text-sm text-black">{scheduleItem.data.service.name}</p>
                                            <p className="text-xs text-black">{scheduleItem.data.customerName}</p>
                                            <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block`}>{getStatusLabel(scheduleItem.data.status)}</p>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 space-x-2 self-start sm:self-center">
                                            {scheduleItem.data.status === 'confirmed' && (
                                                <button
                                                    onClick={() => setCompletingBooking(scheduleItem.data)}
                                                    className="text-xs bg-green-500 text-white py-1 px-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                                                >
                                                    เสร็จสิ้น
                                                </button>
                                            )}
                                            {scheduleItem.data.status === 'completed' && (
                                                <button
                                                    onClick={() => setViewingReceipt(scheduleItem.data)}
                                                    className="text-xs bg-blue-500 text-white py-1 px-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
                                                >
                                                    ใบเสร็จ
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteBooking(scheduleItem.data.id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg flex justify-between items-center bg-stone-200">
                                        <p className="font-bold text-sm text-black">เวลาพัก</p>
                                        <button 
                                            onClick={() => handleRemoveBreak(scheduleItem.data.id)}
                                            className="text-sm bg-stone-50 text-black py-1 px-3 rounded-full font-semibold hover:bg-white transition-colors"
                                        >
                                            ทำให้ว่าง
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                  <span className="text-sm text-stone-400 italic">ว่าง</span>
                                  <div className='flex space-x-2'>
                                  <button
                                    onClick={() => setModalInfo({ time, date: selectedDate })}
                                    className="text-sm bg-rose-100 text-black py-1 px-3 rounded-full font-semibold hover:bg-pink-500 hover:text-white transition-colors"
                                  >
                                    + Walk-in
                                  </button>
                                   <button
                                    onClick={() => handleAddBreak(time)}
                                    className="text-sm bg-stone-100 text-black py-1 px-3 rounded-full font-semibold hover:bg-stone-200 transition-colors"
                                  >
                                    พัก
                                  </button>
                                  </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
          </div>
        </div>
      </div>
      {modalInfo && <BookingModal time={modalInfo.time} date={modalInfo.date} employeeId={currentEmployee.uid} onClose={() => setModalInfo(null)} onSave={handleSaveBooking} services={services} />}
      {viewingReceipt && <ReceiptModal booking={viewingReceipt} onClose={() => setViewingReceipt(null)} />}
      {completingBooking && (
        <CompleteBookingModal 
            booking={completingBooking}
            onClose={() => setCompletingBooking(null)}
            onConfirm={handleCompleteBookingConfirm}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;