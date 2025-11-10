
import React, { useState } from 'react';
import type { Service, Booking } from '../types';

interface BookingModalProps {
  time: string;
  date: Date;
  employeeId: string;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id' | 'status' | 'service'>) => void;
  services: Service[];
}

const BookingModal: React.FC<BookingModalProps> = ({ time, date, employeeId, onClose, onSave, services }) => {
  const [customerName, setCustomerName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === selectedServiceId);
    if (!customerName || !service) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const bookingDate = new Date(date);
    bookingDate.setHours(hours, minutes, 0, 0);

    onSave({
        customerName: `${customerName} (Walk-in)`,
        serviceId: service.id,
        employeeId: employeeId,
        date: bookingDate,
        deposit: 0,
        type: 'walk-in',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 id="modal-title" className="text-2xl font-bold text-black mb-2">เพิ่มการจอง Walk-in</h2>
        <p className="text-black mb-6">เวลา {time} - {date.toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-black">ชื่อลูกค้า</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-black">บริการ</label>
              <select
                id="service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                required
              >
                <option value="" disabled>-- เลือกบริการ --</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name} ({service.price} ฿)</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-100 text-black py-2 px-4 rounded-full font-semibold hover:bg-stone-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-pink-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-pink-700 transition-colors"
            >
              บันทึกการจอง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;