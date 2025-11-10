import React, { useState, useEffect, useMemo } from 'react';
import type { Page, BookingDetails, Service, Customer, Booking, Payment, Employee, AvailabilityBlock, UserProfile } from '../types';

interface BookingPageProps {
  bookingDetails: BookingDetails;
  currentUser: UserProfile | null;
  setBookingDetails: (details: BookingDetails) => void;
  setCurrentPage: (page: Page) => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'service'>, payment: Omit<Payment, 'id' | 'bookingId'>) => Promise<void>;
  services: Service[];
  employees: Employee[];
  bookings: Booking[];
  availabilityBlocks: AvailabilityBlock[];
}

const BookingPage: React.FC<BookingPageProps> = ({ bookingDetails, currentUser, setBookingDetails, setCurrentPage, onAddBooking, services, employees, bookings, availabilityBlocks }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(bookingDetails.service);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setSelectedService(bookingDetails.service);
  }, [bookingDetails.service]);

  useEffect(() => {
    if (!currentUser) {
      setCurrentPage('profile');
    }
  }, [currentUser, setCurrentPage]);

  const availableEmployees = useMemo(() => {
    if (!bookingDetails.date) return [];

    const bookingTime = bookingDetails.date.getTime();

    const bookedEmployeeIds = new Set([
      ...bookings
        .filter(b => b.date.getTime() === bookingTime && (b.status === 'confirmed' || b.status === 'pending'))
        .map(b => b.employeeId),
      ...availabilityBlocks
        .filter(b => b.date.getTime() === bookingTime)
        .map(b => b.employeeId)
    ]);

    return employees.filter(emp => !bookedEmployeeIds.has(emp.uid));

  }, [bookingDetails.date, bookings, availabilityBlocks, employees]);

  const depositAmount = useMemo(() => {
    if (!selectedService) return 0;
    if (selectedService.name.includes('คอร์สเรียน')) return selectedService.price / 2;
    return 150;
  }, [selectedService]);
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-black">กรุณาเข้าสู่ระบบ</h1>
        <p className="text-black mt-2">กำลังนำท่านไปยังหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (!bookingDetails.date) {
    return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-3xl font-bold text-black">เกิดข้อผิดพลาด</h1>
            <p className="text-black mt-4">กรุณาเลือกวันและเวลาก่อนทำการจอง</p>
            <button
                onClick={() => setCurrentPage('availability')}
                className="mt-6 bg-pink-500 text-white py-2 px-6 rounded-full font-semibold hover:bg-pink-600 transition-colors"
            >
                กลับไปหน้าเลือกคิว
            </button>
        </div>
    );
  }

  if (isConfirmed) {
      return (
        <div className="container mx-auto px-6 py-12 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-3xl font-bold text-black mt-4">การจองเสร็จสมบูรณ์!</h1>
                <p className="text-black mt-2">เราได้รับการจองของคุณแล้ว และจะทำการตรวจสอบสลิปการโอนเงิน จากนั้นจะส่งข้อความยืนยันให้ท่านอีกครั้ง</p>
                <button
                    onClick={() => setCurrentPage('home')}
                    className="mt-8 bg-pink-500 text-white py-2 px-6 rounded-full font-semibold hover:bg-pink-600 transition-colors"
                >
                    กลับสู่หน้าแรก
                </button>
            </div>
        </div>
      )
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value;
    const service = services.find(s => s.id === serviceId) || null;
    setSelectedService(service);
    setBookingDetails({ ...bookingDetails, service });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSlipPreviewUrl(null);
      return;
    }

    setIsProcessing(true); // Start processing
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
             setIsProcessing(false);
             alert('ไม่สามารถประมวลผลรูปภาพได้');
             return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL(file.type, 0.75); // Compress to 75% quality
        setSlipPreviewUrl(dataUrl);
        setIsProcessing(false); // Done processing
      };
      img.onerror = () => {
          setIsProcessing(false);
          alert('ไม่สามารถโหลดไฟล์รูปภาพได้');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
        setIsProcessing(false);
        alert('ไม่สามารถอ่านไฟล์ได้');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService && slipPreviewUrl && bookingDetails.date && selectedEmployeeId && currentUser) {
        setIsProcessing(true);
        const newBooking: Omit<Booking, 'id' | 'service'> = {
            customerId: currentUser.uid,
            customerName: currentUser.name,
            serviceId: selectedService.id,
            employeeId: selectedEmployeeId,
            date: bookingDetails.date,
            status: 'pending',
            deposit: depositAmount,
            type: 'online',
        };

        const newPayment: Omit<Payment, 'id' | 'bookingId'> = {
            paymentChannel: 'QR Transfer',
            amount: depositAmount,
            verificationStatus: 'pending',
            proofImageUrl: slipPreviewUrl,
        };
        
        try {
            await onAddBooking(newBooking, newPayment);
            setIsConfirmed(true);
        } catch (error) {
            console.error("Booking failed:", error);
            alert("การจองล้มเหลว กรุณาลองอีกครั้ง");
        } finally {
            setIsProcessing(false);
        }
    } else {
        alert('กรุณาเลือกบริการ, เลือกช่าง และแนบสลิปการโอนเงิน');
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-black text-center mb-8">ยืนยันการจองและชำระเงินมัดจำ</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b pb-2">รายละเอียดการจอง</h2>
            <p className="text-lg font-semibold text-black">{bookingDetails.date.toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' })}</p>
            <select 
              id="service"
              value={selectedService?.id || ''}
              onChange={handleServiceChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black"
              required
            >
              <option value="" disabled>-- กรุณาเลือกบริการ --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name} ({service.price} ฿)</option>
              ))}
            </select>
             {selectedService && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">เลือกช่างทำเล็บ</label>
                  {availableEmployees.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {availableEmployees.map(employee => (
                        <label key={employee.uid} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedEmployeeId === employee.uid ? 'border-pink-500 bg-rose-50 ring-2 ring-pink-500' : 'border-gray-300 bg-white hover:border-pink-300'}`}>
                          <input
                            type="radio"
                            name="employee"
                            value={employee.uid}
                            checked={selectedEmployeeId === employee.uid}
                            onChange={() => setSelectedEmployeeId(employee.uid)}
                            className="sr-only"
                          />
                          <img src={employee.profilePicture} alt={employee.name} className="w-12 h-12 rounded-full mr-4" />
                          <div>
                            <p className="font-semibold text-black">{employee.name}</p>
                            <p className="text-sm text-black">{employee.position}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black text-center bg-gray-100 p-4 rounded-lg">ขออภัย ไม่มีช่างว่างในเวลานี้</p>
                  )}
                </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b pb-2">ชำระเงินมัดจำ</h2>
            {selectedService && (
                <div className="bg-rose-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between"><span className="text-black">ค่าบริการ:</span><span className="font-semibold text-black">{selectedService.price.toLocaleString()} ฿</span></div>
                  <div className="flex justify-between"><span className="text-black">ค่ามัดจำ:</span><span className="font-semibold text-black">{depositAmount.toLocaleString()} ฿</span></div>
                </div>
            )}
            <img src="https://picsum.photos/300/300?random=qr" alt="QR Code" className="mx-auto rounded-lg shadow-md" />
             <div className="mt-4 text-center bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
                <p className="font-semibold">{selectedService?.name.includes('คอร์สเรียน') ? 'คอร์สเรียนต้องชำระเงินมัดจำ 50%' : 'ทุกบริการต้องชำระเงินมัดจำ 150 บาท'}</p>
                <p>ถ้าลูกค้าไม่มาตามเวลาที่จอง ทางร้านจะไม่คืนเงินมัดจำ</p>
            </div>
             <div>
              <label htmlFor="slip" className="block text-sm font-medium text-black">แนบสลิปโอนเงิน</label>
              <input type="file" id="slip" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-black hover:file:bg-pink-100" required />
              {slipPreviewUrl && <img src={slipPreviewUrl} alt="ตัวอย่างสลิป" className="rounded-md max-h-48 mx-auto mt-4 border p-2" />}
            </div>
             <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-pink-700 transition-colors disabled:bg-stone-300 disabled:cursor-wait"
                disabled={!selectedService || !slipPreviewUrl || !selectedEmployeeId || isProcessing}
              >
                {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;