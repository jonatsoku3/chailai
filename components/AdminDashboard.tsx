import React, { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import type { Customer, Employee, Service, Booking, Payment, UserProfile, Page } from '../types';
import StatusDropdown, { getStatusLabel } from './StatusDropdown';
import ReceiptModal from './ReceiptModal';
import BarChart from './BarChart';
import PieChart from './PieChart';

type AdminPage = 'summary' | 'customers' | 'employees' | 'services' | 'bookings' | 'reports';

// --- Helper function to export data to CSV ---
const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับส่งออก");
        return;
    }
    // Deep copy and format data to prevent issues with nested objects
    const formattedData = data.map(item => {
        const newItem: any = {};
        for (const key in item) {
            if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
                if (item[key] instanceof Date) {
                    newItem[key] = item[key].toLocaleString('th-TH');
                } else {
                     // Specifically flatten the 'service' object for bookings
                    if (key === 'service' && 'name' in item[key]) {
                       newItem['serviceName'] = item[key].name;
                       newItem['servicePrice'] = item[key].price;
                    } else {
                       newItem[key] = JSON.stringify(item[key]);
                    }
                }
            } else {
                newItem[key] = item[key];
            }
        }
        return newItem;
    });

    const headers = Object.keys(formattedData[0]);
    const csv = [
        headers.join(','),
        ...formattedData.map(row => 
            headers.map(fieldName => 
                JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value)
            ).join(',')
        )
    ].join('\r\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


// --- Reusable Modal Component ---
interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl';
}
const Modal: React.FC<ModalProps> = ({ title, onClose, children, size = 'lg' }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) dialog.showModal();
        return () => { if (dialog && dialog.open) dialog.close(); };
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialogRef.current) onClose();
    };
    
    return (
        <dialog 
            ref={dialogRef} 
            onCancel={onClose}
            onClick={handleBackdropClick}
            className="p-0 border-0 bg-transparent rounded-2xl shadow-xl backdrop:bg-black/50"
        >
            <div className={`bg-white rounded-2xl p-8 w-full max-w-lg relative`}>
                <h2 className="text-2xl font-bold text-black mb-6">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-black/50 hover:text-black" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {children}
            </div>
        </dialog>
    );
};

// --- Stat Card Component ---
interface StatCardProps { title: string; value: string | number; icon: React.ReactNode; }
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className="bg-pink-100 text-pink-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-black">{title}</p>
            <p className="text-2xl font-bold text-black">{value}</p>
        </div>
    </div>
);

interface AdminDashboardProps {
    customers: Customer[];
    employees: Employee[];
    bookings: Booking[];
    services: Service[];
    payments: Payment[];
    onAdminAddCustomer: (customer: any) => void;
    onUpdateCustomer: (uid: string, data: Partial<Customer>) => void;
    onDeleteCustomer: (uid: string) => void;
    onAddEmployee: (employee: any) => void;
    onUpdateEmployee: (uid: string, data: Partial<Employee>) => void;
    onDeleteEmployee: (uid: string) => void;
    onAddService: (service: Omit<Service, 'id'>) => void;
    onUpdateService: (id: string, data: Partial<Service>) => void;
    onDeleteService: (id: string) => void;
    onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
    onDeleteBooking: (id: string) => void;
    currentUser: Employee | null;
    onLogout: () => void;
    setCurrentPage: (page: Page) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const {
        customers, employees, bookings, services, payments,
        onUpdateCustomer, onDeleteCustomer, onUpdateEmployee, onDeleteEmployee,
        onAddService, onUpdateService, onDeleteService,
        onUpdateBooking, onDeleteBooking,
        currentUser, onLogout, setCurrentPage
    } = props;
    const [activePage, setActivePage] = useState<AdminPage>('summary');
    const [editingItem, setEditingItem] = useState<UserProfile | Service | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewingSlip, setViewingSlip] = useState<{booking: Booking, payment: Payment} | null>(null);
    const [viewingReceipt, setViewingReceipt] = useState<Booking | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Booking['status'] | 'all'>('pending');
    const [period, setPeriod] = useState('this-month');

     const paymentsByBookingId = useMemo(() => {
        return new Map(payments.map(p => [p.bookingId, p]));
    }, [payments]);

    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        let start = new Date(now), end = new Date(now);
        switch (period) {
            case 'this-week': 
                start = new Date(now.setDate(now.getDate() - now.getDay()));
                end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                break;
            case 'last-month': 
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1); 
                end = new Date(now.getFullYear(), now.getMonth(), 0); 
                break;
            default: // this-month
                start = new Date(now.getFullYear(), now.getMonth(), 1); 
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
                break;
        }
        start.setHours(0,0,0,0); end.setHours(23,59,59,999);
        return { startDate: start, endDate: end };
    }, [period]);

    const bookingsInPeriod = useMemo(() => {
        return bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= startDate && bookingDate <= endDate;
        });
    }, [bookings, startDate, endDate]);

    const completedBookingsInPeriod = useMemo(() => {
        return bookingsInPeriod.filter(b => b.status === 'completed');
    }, [bookingsInPeriod]);

    const summaryStats = useMemo(() => {
        const totalRevenue = completedBookingsInPeriod.reduce((sum, b) => sum + (b.finalPrice ?? b.service.price), 0);
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const totalCustomers = customers.length;
        return {
            totalRevenue,
            totalCompletedBookings: completedBookingsInPeriod.length,
            pendingBookings,
            totalCustomers,
        };
    }, [completedBookingsInPeriod, bookings, customers]);

    const chartData = useMemo(() => {
        const data: { [key: string]: number } = {};
        completedBookingsInPeriod.forEach(b => {
            const day = b.date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
            if (!data[day]) data[day] = 0;
            data[day] += (b.finalPrice ?? b.service.price);
        });
        return Object.entries(data).map(([label, value]) => ({ label, value }));
    }, [completedBookingsInPeriod]);
    
    const recentBookings = useMemo(() => {
        return [...bookings].sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    }, [bookings]);

    const revenueByService = useMemo(() => {
        const data: { [key: string]: number } = {};
        completedBookingsInPeriod.forEach(b => {
            const serviceName = b.service.name;
            if (!data[serviceName]) data[serviceName] = 0;
            data[serviceName] += (b.finalPrice ?? b.service.price);
        });
        return Object.entries(data).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }, [completedBookingsInPeriod]);

    const bookingsPerTechnician = useMemo(() => {
        const data: { [key: string]: number } = {};
        completedBookingsInPeriod.forEach(b => {
            const employee = employees.find(e => e.uid === b.employeeId);
            const empName = employee?.name || 'Unknown';
            if (!data[empName]) data[empName] = 0;
            data[empName] += 1;
        });
        return Object.entries(data).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }, [completedBookingsInPeriod, employees]);
    
    const bookingTypesData = useMemo(() => {
        const online = bookingsInPeriod.filter(b => b.type === 'online').length;
        const walkIn = bookingsInPeriod.filter(b => b.type === 'walk-in').length;
        return [{ label: 'Online', value: online }, { label: 'Walk-in', value: walkIn }];
    }, [bookingsInPeriod]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch =
                booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.service.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [bookings, searchQuery, statusFilter]);

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem && !isCreating) return;

        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => { data[key] = value });
        
        // Convert string numbers to actual numbers
        if (data.price) data.price = parseFloat(data.price);
        if (data.duration) data.duration = parseInt(data.duration, 10);

        try {
            if (activePage === 'services') {
                const serviceData: Partial<Service> = { name: data.name, category: data.category, description: data.description, price: data.price, duration: data.duration, image: data.image };
                if (isCreating) {
                    await onAddService(serviceData as Omit<Service, 'id'>);
                // FIX: Add a type guard to ensure `editingItem` is a `Service` before accessing its `id` property, resolving the type error.
                } else if (editingItem && 'id' in editingItem) {
                    await onUpdateService(editingItem.id, serviceData);
                }
            } else {
                // FIX: Create specifically typed objects for customers and employees to match the `onUpdateCustomer` and `onUpdateEmployee` prop types, resolving type compatibility errors.
                if (editingItem && 'uid' in editingItem) {
                     if (activePage === 'customers') {
                        const customerData: Partial<Customer> = { name: data.name, email: data.email, phone: data.phone, lineId: data.lineId };
                        await onUpdateCustomer(editingItem.uid, customerData);
                     } else { // employees
                        const employeeData: Partial<Employee> = { name: data.name, email: data.email, phone: data.phone, lineId: data.lineId, position: data.position };
                        await onUpdateEmployee(editingItem.uid, employeeData);
                     }
                }
            }
            closeModal();
        } catch (error) {
            console.error("Error saving item:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };
    
    const handleDelete = (item: UserProfile | Service) => {
        const itemName = 'name' in item ? item.name : 'this service';
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${itemName}?`)) {
            if ('uid' in item) { // It's a UserProfile
                if (item.role === 'customer') onDeleteCustomer(item.uid);
                else onDeleteEmployee(item.uid);
            } else { // It's a Service
                onDeleteService(item.id);
            }
        }
    };
    
    const openModal = (item?: UserProfile | Service) => {
        if (item) {
            setEditingItem(item);
            setIsCreating(false);
        } else {
            setEditingItem(null);
            setIsCreating(true);
        }
    };
    
    const closeModal = () => {
        setEditingItem(null);
        setIsCreating(false);
    };

    const handleConfirmBooking = (bookingId: string) => {
        onUpdateBooking(bookingId, { status: 'confirmed' });
        setViewingSlip(null);
    };

    const renderPageContent = () => {
        const pages: { [key in AdminPage]: React.ReactNode } = {
            summary: <SummaryContent />,
            bookings: <BookingsContent />,
            customers: <UsersContent type="customer" />,
            employees: <UsersContent type="employee" />,
            services: <ServicesContent />,
            reports: <ReportsContent />
        };
        return pages[activePage];
    };

    const SummaryContent = () => {
        const promptPayId = '0992728998';
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${promptPayId}`;

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-black">สรุปภาพรวม</h2>
                    <div className="flex items-center space-x-2">
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black">
                            <option value="this-week">สัปดาห์นี้</option>
                            <option value="this-month">เดือนนี้</option>
                            <option value="last-month">เดือนที่แล้ว</option>
                        </select>
                        <button onClick={() => exportToCSV(completedBookingsInPeriod, `summary_${period}.csv`)} className="bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm">Export CSV</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="ยอดขายรวม" value={`฿${summaryStats.totalRevenue.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                    <StatCard title="การจองที่เสร็จสิ้น" value={summaryStats.totalCompletedBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="ลูกค้าทั้งหมด" value={summaryStats.totalCustomers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title="การจองรอดำเนินการ" value={summaryStats.pendingBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2"><BarChart data={chartData} title="ยอดขายรายวัน" /></div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold text-black mb-4">การจองล่าสุด</h3>
                            <div className="space-y-3">
                                {recentBookings.map(b => (
                                    <div key={b.id} className="flex justify-between items-center text-sm border-b pb-2">
                                        <div>
                                            <p className="font-semibold text-black">{b.customerName}</p>
                                            <p className="text-black">{b.service.name}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusLabel(b.status) === 'รอตรวจสอบ' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{getStatusLabel(b.status)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <h3 className="text-xl font-bold text-black mb-4">QR Code ชำระเงิน (PromptPay)</h3>
                            <div className="flex justify-center">
                                <img src={qrCodeUrl} alt="PromptPay QR Code" className="rounded-lg border-4 border-gray-200" />
                            </div>
                            <p className="mt-4 font-semibold text-black tracking-wider text-lg">{promptPayId}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
    
    const BookingsContent = () => (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">จัดการการจอง</h2>
                <button onClick={() => exportToCSV(filteredBookings, 'bookings.csv')} className="bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm">Export CSV</button>
            </div>
             <div className="flex space-x-4 mb-4">
                <input type="text" placeholder="ค้นหาลูกค้าหรือบริการ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-1/3 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black">
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="pending">รอตรวจสอบ</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                </select>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-black">
                    <thead className="text-xs text-black uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ลูกค้า</th>
                            <th scope="col" className="px-6 py-3">บริการ</th>
                            <th scope="col" className="px-6 py-3">วันที่/เวลา</th>
                            <th scope="col" className="px-6 py-3">ช่าง</th>
                            <th scope="col" className="px-6 py-3">สลิป</th>
                            <th scope="col" className="px-6 py-3">สถานะ</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => {
                            const employee = employees.find(e => e.uid === booking.employeeId);
                            const payment = paymentsByBookingId.get(booking.id);
                            return (
                                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{booking.customerName}</td>
                                    <td className="px-6 py-4">{booking.service.name}</td>
                                    <td className="px-6 py-4">{booking.date.toLocaleString('th-TH')}</td>
                                    <td className="px-6 py-4">{employee?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {payment?.proofImageUrl ? (
                                             <button onClick={() => setViewingSlip({ booking, payment })}>
                                                <img src={payment.proofImageUrl} alt="slip" className="w-12 h-12 object-cover rounded-md cursor-pointer hover:scale-110 transition-transform" />
                                            </button>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusDropdown currentStatus={booking.status} onChange={(newStatus) => onUpdateBooking(booking.id, { status: newStatus })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {booking.status === 'completed' && <button onClick={() => setViewingReceipt(booking)} className="text-blue-600 hover:underline text-xs">ใบเสร็จ</button>}
                                            <button onClick={() => onDeleteBooking(booking.id)} className="text-red-600 hover:underline text-xs">ลบ</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const UsersContent = ({ type }: { type: 'customer' | 'employee' }) => {
        const data = type === 'customer' ? customers : employees;
        const title = type === 'customer' ? 'ลูกค้า' : 'พนักงาน';
        const filteredData = data.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-black">จัดการ{title}</h2>
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder={`ค้นหา${title}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black" />
                        <button onClick={() => exportToCSV(filteredData, `${type}s.csv`)} className="bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm">Export CSV</button>
                        {/* <button onClick={() => openModal()} className="bg-pink-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-pink-700 transition-colors text-sm">เพิ่ม{title}</button> */}
                    </div>
                </div>
                 <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-black">
                        <thead className="text-xs text-black uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ชื่อ</th>
                                <th className="px-6 py-3">อีเมล</th>
                                <th className="px-6 py-3">เบอร์โทร</th>
                                {type === 'employee' && <th className="px-6 py-3">ตำแหน่ง</th>}
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(item => (
                                <tr key={item.uid} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3"><img src={item.profilePicture} alt={item.name} className="w-8 h-8 rounded-full" />{item.name}</td>
                                    <td className="px-6 py-4">{item.email}</td>
                                    <td className="px-6 py-4">{item.phone}</td>
                                    {type === 'employee' && <td className="px-6 py-4">{(item as Employee).position}</td>}
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => openModal(item)} className="text-blue-600 hover:underline text-xs">แก้ไข</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline text-xs">ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const ServicesContent = () => {
         const filteredData = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
         return (
             <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-black">จัดการบริการ</h2>
                     <div className="flex items-center space-x-2">
                        <input type="text" placeholder="ค้นหาบริการ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black" />
                        <button onClick={() => exportToCSV(filteredData, 'services.csv')} className="bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm">Export CSV</button>
                        <button onClick={() => openModal()} className="bg-pink-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-pink-700 transition-colors text-sm">เพิ่มบริการ</button>
                    </div>
                </div>
                 <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-black">
                         <thead className="text-xs text-black uppercase bg-gray-50">
                             <tr>
                                <th className="px-6 py-3">ชื่อบริการ</th>
                                <th className="px-6 py-3">หมวดหมู่</th>
                                <th className="px-6 py-3">ราคา</th>
                                <th className="px-6 py-3">ระยะเวลา (นาที)</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">{item.price}</td>
                                    <td className="px-6 py-4">{item.duration}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => openModal(item)} className="text-blue-600 hover:underline text-xs">แก้ไข</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline text-xs">ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         );
    };

    const ReportsContent = () => (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">รายงาน</h2>
                <div className="flex items-center space-x-2">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 text-black">
                        <option value="this-week">สัปดาห์นี้</option>
                        <option value="this-month">เดือนนี้</option>
                        <option value="last-month">เดือนที่แล้ว</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart data={revenueByService} title="รายได้ตามบริการ" />
                <BarChart data={bookingsPerTechnician} title="การจองตามช่าง" />
                <PieChart data={bookingTypesData} title="ประเภทการจอง" />
            </div>
        </div>
    );

    const renderModalContent = () => {
        if (!editingItem && !isCreating) return null;
        
        let fields: { name: string, label: string, type: string, required?: boolean, defaultValue?: any }[] = [];
        if (activePage === 'customers' || activePage === 'employees') {
            fields = [
                { name: 'name', label: 'ชื่อ', type: 'text', required: true, defaultValue: editingItem ? (editingItem as UserProfile).name : '' },
                { name: 'email', label: 'อีเมล', type: 'email', required: true, defaultValue: editingItem ? (editingItem as UserProfile).email : '' },
                { name: 'phone', label: 'เบอร์โทร', type: 'tel', required: true, defaultValue: editingItem ? (editingItem as UserProfile).phone : '' },
                { name: 'lineId', label: 'Line ID', type: 'text', required: true, defaultValue: editingItem ? (editingItem as UserProfile).lineId : '' },
            ];
            if(activePage === 'employees') {
                 fields.push({ name: 'position', label: 'ตำแหน่ง', type: 'text', required: true, defaultValue: editingItem ? (editingItem as Employee).position : '' });
            }
        } else if (activePage === 'services') {
             fields = [
                { name: 'name', label: 'ชื่อบริการ', type: 'text', required: true, defaultValue: editingItem ? (editingItem as Service).name : '' },
                { name: 'category', label: 'หมวดหมู่', type: 'text', required: true, defaultValue: editingItem ? (editingItem as Service).category : '' },
                { name: 'price', label: 'ราคา', type: 'number', required: true, defaultValue: editingItem ? (editingItem as Service).price : '' },
                { name: 'duration', label: 'ระยะเวลา (นาที)', type: 'number', required: true, defaultValue: editingItem ? (editingItem as Service).duration : '' },
                { name: 'description', label: 'รายละเอียด (ขึ้นบรรทัดใหม่ด้วย \\n)', type: 'textarea', required: true, defaultValue: editingItem ? (editingItem as Service).description : '' },
                { name: 'image', label: 'URL รูปภาพ', type: 'text', required: true, defaultValue: editingItem ? (editingItem as Service).image : 'https://picsum.photos/400' },
            ];
        }

        return (
             <form onSubmit={handleFormSubmit} className="space-y-4">
                {fields.map(f => (
                    <div key={f.name}>
                        <label htmlFor={f.name} className="block text-sm font-medium text-black">{f.label}</label>
                        {f.type === 'textarea' ? (
                             <textarea id={f.name} name={f.name} required={f.required} defaultValue={f.defaultValue} className="mt-1 h-24 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                        ) : (
                             <input type={f.type} id={f.name} name={f.name} required={f.required} defaultValue={f.defaultValue} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                        )}
                    </div>
                ))}
                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-pink-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-pink-700 transition-colors">
                        บันทึก
                    </button>
                </div>
            </form>
        )
    };
    
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 text-center border-b">
                    <h1 className="text-xl font-bold text-black">แผงควบคุม</h1>
                    {currentUser && <p className="text-sm text-gray-500 mt-1">{currentUser.name}</p>}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {(['summary', 'bookings', 'reports', 'customers', 'employees', 'services'] as AdminPage[]).map(page => (
                        <button 
                            key={page} 
                            onClick={() => setActivePage(page)} 
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${activePage === page ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-black hover:bg-gray-100'}`}
                        >
                            {page === 'summary' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                            {page === 'bookings' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            {page === 'reports' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            {page === 'customers' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            {page === 'employees' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            {page === 'services' && <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.456L12.75 18l1.177-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.177a3.375 3.375 0 002.456 2.456L20.25 18l-1.177.398a3.375 3.375 0 00-2.456 2.456z" /></svg>}
                            {page.charAt(0).toUpperCase() + page.slice(1).replace('summary', 'ภาพรวม').replace('bookings', 'การจอง').replace('reports', 'รายงาน').replace('customers', 'ลูกค้า').replace('employees', 'พนักงาน').replace('services', 'บริการ')}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t space-y-2">
                    <button onClick={() => setCurrentPage('home')} className="w-full text-left px-4 py-2 rounded-lg transition-colors text-black hover:bg-gray-100 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span>กลับสู่หน้าหลัก</span>
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 rounded-lg transition-colors text-black hover:bg-gray-100 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8">
                {renderPageContent()}
            </main>

            {(editingItem || isCreating) && (
                <Modal title={isCreating ? 'เพิ่มข้อมูลใหม่' : 'แก้ไขข้อมูล'} onClose={closeModal}>
                    {renderModalContent()}
                </Modal>
            )}

            {viewingSlip && (
                 <Modal title={`สลิปการจอง: ${viewingSlip.booking.customerName}`} onClose={() => setViewingSlip(null)}>
                    <div className="text-center">
                        <img src={viewingSlip.payment.proofImageUrl} alt="Payment Slip" className="max-w-full max-h-[60vh] mx-auto rounded-lg border" />
                         <div className="mt-6 flex justify-center space-x-3">
                            <button onClick={() => setViewingSlip(null)} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-full font-semibold hover:bg-gray-300">ปิด</button>
                            {viewingSlip.booking.status === 'pending' && (
                                <button onClick={() => handleConfirmBooking(viewingSlip.booking.id)} className="bg-green-600 text-white py-2 px-5 rounded-full font-semibold hover:bg-green-700">ยืนยันการจอง</button>
                            )}
                        </div>
                    </div>
                 </Modal>
            )}
             {viewingReceipt && <ReceiptModal booking={viewingReceipt} onClose={() => setViewingReceipt(null)} />}
        </div>
    );
};

export default AdminDashboard;