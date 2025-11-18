
import React, { useState, FormEvent } from 'react';
import type { Page, Booking, UserProfile } from '../types';
import ReceiptModal from './ReceiptModal';
import LineIcon from './LineIcon';

interface ProfilePageProps {
  currentUser: UserProfile | null;
  onLogin: (credentials: { email: string, password: string }) => void;
  onRegister: (newCustomerData: { name: string, email: string, phone: string, lineId: string, password: string }) => void;
  onLogout: () => void;
  onLineLogin: () => void;
  setCurrentPage: (page: Page) => void;
  userBookings: Booking[];
  wasRedirected: boolean;
  onUpdateProfile: (data: Partial<Omit<UserProfile, 'uid' | 'profilePicture' | 'email' | 'role'>> & { currentPassword?: string, newPassword?: string }) => Promise<boolean>;
  authDomainError?: string | null;
}

const LoginPage: React.FC<Omit<ProfilePageProps, 'currentUser'|'userBookings' | 'setCurrentPage' | 'onUpdateProfile'>> = ({ onLogin, onRegister, onLineLogin, wasRedirected, authDomainError }) => {
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        onLogin({ email, password });
    };

    const handleRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const lineId = formData.get('lineId') as string;

        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }

        onRegister({ name, email, phone, password, lineId });
    }

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-md">
                {authDomainError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-red-800 font-bold text-lg mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            ต้องตั้งค่า Firebase
                        </h3>
                        <p className="text-red-700 text-sm mb-3">
                            โดเมนของหน้าเว็บนี้ยังไม่ได้รับอนุญาตให้เข้าสู่ระบบ โปรดนำชื่อโดเมนด้านล่างไปเพิ่มใน Firebase Console
                        </p>
                        <div className="bg-white border border-red-300 rounded p-3 flex items-center justify-between mb-3">
                            <code className="text-red-600 font-mono font-bold text-sm break-all select-all">{authDomainError}</code>
                        </div>
                        <div className="text-xs text-red-600">
                            <p className="font-semibold mb-1">วิธีแก้ไข:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>ไปที่ <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-red-800">Firebase Console</a></li>
                                <li>เลือกโปรเจกต์ <strong>chailainails-booking</strong></li>
                                <li>เมนู <strong>Authentication</strong> &gt; <strong>Settings</strong></li>
                                <li>หัวข้อ <strong>Authorized domains</strong> &gt; กด <strong>Add domain</strong></li>
                                <li>วางชื่อโดเมนด้านบนแล้วกด Add</li>
                            </ol>
                        </div>
                    </div>
                )}
                
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    {isRegistering ? (
                        <>
                            <h1 className="text-3xl font-bold text-black mb-6 text-center">สมัครสมาชิก</h1>
                             {wasRedirected && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-4 text-center">
                                    <p>สมัครสมาชิกเพื่อดำเนินการจองต่อ</p>
                                </div>
                            )}
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <input type="text" name="name" required placeholder="ชื่อ-นามสกุล" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="email" name="email" required placeholder="อีเมล" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="tel" name="phone" required placeholder="เบอร์โทรศัพท์" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="text" name="lineId" required placeholder="Line ID" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="password" name="password" required placeholder="รหัสผ่าน" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="password" name="confirmPassword" required placeholder="ยืนยันรหัสผ่าน" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <button type="submit" className="w-full bg-pink-500 text-white py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors text-lg">สมัครสมาชิก</button>
                            </form>
                             <div className="my-6 flex items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-sm text-gray-500">หรือ</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                             <button
                                onClick={onLineLogin}
                                className="w-full bg-[#06C755] text-white py-3 rounded-full font-semibold hover:bg-[#05a546] transition-colors text-lg flex items-center justify-center gap-2">
                                <LineIcon className="h-6 w-6" />
                                สมัครสมาชิกด้วย LINE
                            </button>
                            <p className="text-center text-sm text-black mt-4">
                                มีบัญชีอยู่แล้ว? <button onClick={() => setIsRegistering(false)} className="font-semibold text-black hover:underline">เข้าสู่ระบบที่นี่</button>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-black mb-6 text-center">เข้าสู่ระบบ</h1>
                            {wasRedirected && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-4 text-center">
                                    <p>กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                                </div>
                            )}
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <input type="email" name="email" required placeholder="อีเมล" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <input type="password" name="password" required placeholder="รหัสผ่าน" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                                <button type="submit" className="w-full bg-pink-500 text-white py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors text-lg">เข้าสู่ระบบ</button>
                            </form>
                            <div className="my-6 flex items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-sm text-gray-500">หรือ</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                             <button
                                onClick={onLineLogin}
                                className="w-full bg-[#06C755] text-white py-3 rounded-full font-semibold hover:bg-[#05a546] transition-colors text-lg flex items-center justify-center gap-2">
                                <LineIcon className="h-6 w-6" />
                                เข้าสู่ระบบด้วย LINE
                            </button>
                            <p className="text-center text-sm text-black mt-4">
                                ยังไม่มีบัญชี? <button onClick={() => setIsRegistering(true)} className="font-semibold text-black hover:underline">สมัครสมาชิกที่นี่</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogin, onRegister, onLogout, onLineLogin, setCurrentPage, userBookings, wasRedirected, onUpdateProfile, authDomainError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Booking | null>(null);

  if (!currentUser) {
    return <LoginPage onLogin={onLogin} onRegister={onRegister} onLogout={onLogout} onLineLogin={onLineLogin} wasRedirected={wasRedirected} authDomainError={authDomainError} />;
  }
  
  const handleProfileUpdateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        lineId: formData.get('lineId') as string,
    };
    if(await onUpdateProfile(updatedData)) {
        setIsEditing(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) {
        alert('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
    }

    if(await onUpdateProfile({ currentPassword, newPassword })) {
        (e.target as HTMLFormElement).reset();
    }
  };


  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black">โปรไฟล์ของฉัน</h1>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
               <img src={currentUser.profilePicture} alt="Profile" className="w-24 h-24 rounded-full" />
               <div className="flex-grow text-center md:text-left">
                  {!isEditing ? (
                      <>
                          <h2 className="text-2xl font-bold text-black">{currentUser.name}</h2>
                          <p className="text-black">อีเมล: {currentUser.email}</p>
                          <p className="text-black">เบอร์โทร: {currentUser.phone}</p>
                          <p className="text-black">Line ID: {currentUser.lineId}</p>
                      </>
                  ) : (
                      <form id="profile-edit-form" onSubmit={handleProfileUpdateSubmit} className="space-y-3">
                          <input type="text" name="name" defaultValue={currentUser.name} required className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                          <input type="tel" name="phone" defaultValue={currentUser.phone} required className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                          <input type="text" name="lineId" defaultValue={currentUser.lineId} required className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
                      </form>
                  )}
               </div>
               <div className="flex flex-col space-y-2 self-center md:self-start mt-4 md:mt-0">
                   {isEditing ? (
                      <>
                          <button form="profile-edit-form" type="submit" className="bg-pink-500 text-white py-2 px-4 rounded-full font-semibold hover:bg-pink-600 transition-colors">บันทึก</button>
                          <button onClick={() => setIsEditing(false)} className="bg-stone-100 text-black py-2 px-4 rounded-full font-semibold hover:bg-stone-200 transition-colors">ยกเลิก</button>
                      </>
                   ) : (
                      <>
                          <button onClick={() => setIsEditing(true)} className="bg-stone-100 text-black py-2 px-4 rounded-full font-semibold hover:bg-stone-200 transition-colors">แก้ไขโปรไฟล์</button>
                          <button onClick={onLogout} className="text-sm text-black hover:underline">ออกจากระบบ</button>
                      </>
                   )}
               </div>
          </div>
        </div>
        
        {/* Change Password Section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-black mb-4">เปลี่ยนรหัสผ่าน</h3>
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-sm">
              <input type="password" name="currentPassword" required placeholder="รหัสผ่านปัจจุบัน" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
              <input type="password" name="newPassword" required placeholder="รหัสผ่านใหม่" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
              <input type="password" name="confirmNewPassword" required placeholder="ยืนยันรหัสผ่านใหม่" className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-black" />
              <button type="submit" className="bg-pink-500 text-white py-2 px-5 rounded-full font-semibold hover:bg-pink-600 transition-colors">
                  เปลี่ยนรหัสผ่าน
              </button>
          </form>
        </div>

        <h2 className="text-3xl font-bold text-black mb-6">ประวัติการจอง</h2>
        <div className="space-y-4">
          {userBookings.length > 0 ? (
            userBookings.map(booking => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="font-bold text-black">{booking.service.name}</p>
                  <p className="text-sm text-black">{booking.date.toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : booking.status === 'pending' ? 'รอตรวจสอบ' : booking.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                  </span>
                  {booking.status === 'completed' && (
                      <button
                        onClick={() => setViewingReceipt(booking)}
                        className="mt-2 block text-sm text-blue-600 hover:underline w-full"
                      >
                        ดูใบเสร็จ
                      </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-black text-center bg-white p-8 rounded-lg">
              <p>ยังไม่มีประวัติการจอง</p>
              <button 
                onClick={() => setCurrentPage('availability')}
                className="mt-4 bg-pink-500 text-white py-2 px-5 rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                จองบริการเลย
              </button>
            </div>
          )}
        </div>
      </div>
      {viewingReceipt && <ReceiptModal booking={viewingReceipt} onClose={() => setViewingReceipt(null)} />}
    </div>
  );
};

export default ProfilePage;
