import React, { useState } from 'react';
import type { Booking } from '../types';

interface CompleteBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (bookingId: string, finalPrice: number) => void;
}

const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({ booking, onClose, onConfirm }) => {
  const initialPrice = booking.service.price;
  const [finalPrice, setFinalPrice] = useState<string>(initialPrice.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(finalPrice);
    if (isNaN(price) || price < 0) {
      alert('กรุณากรอกราคาที่ถูกต้อง');
      return;
    }
    onConfirm(booking.id, price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 id="modal-title" className="text-2xl font-bold text-black mb-2">ยืนยันการจบงานและราคา</h2>
        <p className="text-black mb-6">
          ลูกค้า: <span className="font-semibold">{booking.customerName}</span><br/>
          บริการ: <span className="font-semibold">{booking.service.name}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="finalPrice" className="block text-sm font-medium text-black">
                ราคาสุทธิ (บาท)
              </label>
              <p className="text-xs text-gray-500 mb-1">ราคาเดิม: {initialPrice.toLocaleString()} บาท สามารถแก้ไขได้หากมีบริการเพิ่มเติม</p>
              <input
                type="number"
                id="finalPrice"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="mt-1 block w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
                required
                step="1"
                min="0"
              />
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
              className="bg-green-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              ยืนยันการจบงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteBookingModal;