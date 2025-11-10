import React, { useRef } from 'react';
import type { Booking } from '../types';
import { CHAI_LAI_LOGO_BASE64 } from '../constants';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const service = booking.service;
  const issueDate = new Date();

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>ใบเสร็จ - ChaiLai Nails & Spa</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write(`
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Sarabun', sans-serif; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            @page {
              size: A5;
              margin: 0;
            }
          </style>
        `);
        printWindow.document.write('</head><body class="bg-white">');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
      }
    }
  };

  const finalPrice = booking.finalPrice ?? service.price;
  const remainingBalance = finalPrice - booking.deposit;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
    >
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Printable Area */}
        <div ref={receiptRef} className="p-8 text-gray-800 bg-white m-2 rounded-md">
          {/* Header */}
          <header className="flex justify-between items-start pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.456L12.75 18l1.177-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.177a3.375 3.375 0 002.456 2.456L20.25 18l-1.177.398a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <div>
                <img src={CHAI_LAI_LOGO_BASE64} alt="ChaiLai Nails & Spa Logo" className="h-12 w-auto mb-1" />
                <p className="text-xs text-gray-500">777/88 ซ.บรมไตรโลกนารถ 18, ต.ในเมือง, อ.เมือง, จ.พิษณุโลก 65000</p>
              </div>
            </div>
            <div className="text-right">
              <h2 id="receipt-title" className="text-2xl font-bold text-gray-900">ใบเสร็จ</h2>
              <p className="text-sm text-gray-500">Receipt</p>
            </div>
          </header>

          {/* Customer and Receipt Details */}
          <section className="grid grid-cols-2 gap-8 py-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">ลูกค้า</p>
              <p className="font-medium text-gray-900">{booking.customerName}</p>
            </div>
            <div className="text-right">
               <p className="text-sm font-semibold text-gray-500">เลขที่ใบเสร็จ: <span className="font-medium text-gray-900">{booking.id}</span></p>
               <p className="text-sm font-semibold text-gray-500">วันที่ออก: <span className="font-medium text-gray-900">{issueDate.toLocaleDateString('th-TH')}</span></p>
               <p className="text-sm font-semibold text-gray-500">วันที่รับบริการ: <span className="font-medium text-gray-900">{booking.date.toLocaleDateString('th-TH')}</span></p>
            </div>
          </section>

          {/* Line Items */}
          <section className="py-6 border-y border-gray-200">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500 mb-3">
              <p>รายการ</p>
              <p>จำนวนเงิน</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="font-medium text-gray-900">{finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} บาท</p>
            </div>
          </section>

          {/* Totals */}
          <section className="pt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-500">ยอดรวม (แก้ไข):</p>
                <p className="font-medium text-gray-900">{finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} บาท</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">เงินมัดจำ (ชำระแล้ว):</p>
                <p className="font-medium text-gray-900">{booking.deposit > 0 ? `- ${booking.deposit.toLocaleString('en-US', {minimumFractionDigits: 2})}` : '0.00'} บาท</p>
              </div>
               <div className="flex justify-between">
                <p className="text-gray-500">ยอดชำระเพิ่ม:</p>
                <p className="font-medium text-gray-900">{remainingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})} บาท</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
                <p className="text-base font-bold text-gray-900">ยอดชำระทั้งหมด:</p>
                <p className="text-xl font-bold text-pink-600">{finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})} บาท</p>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="text-center text-xs text-gray-400 mt-12">
            <p>ขอบคุณที่ใช้บริการ ChaiLai Nails & Spa</p>
          </footer>
        </div>

        {/* Action Buttons (Not part of printable area) */}
        <div className="bg-gray-100 p-4 flex justify-end items-center space-x-3 rounded-b-lg">
           <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 py-2 px-5 rounded-full text-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            ปิด
          </button>
          <button
            onClick={handlePrint}
            className="bg-pink-600 text-white py-2 px-6 rounded-full text-sm font-semibold hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            พิมพ์
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;