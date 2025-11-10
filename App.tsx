

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import type { Page, Booking, Payment, BookingDetails, AvailabilityBlock, Customer, Employee, Service, UserProfile, ActiveUser } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import AvailabilityPage from './components/AvailabilityPage';
import BookingPage from './components/BookingPage';
import ProfilePage from './components/ProfilePage';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import AIAssistant from './components/AIAssistant';
import * as db from './data/database';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authIsReady, setAuthIsReady] = useState(false);
  const [postLoginRedirect, setPostLoginRedirect] = useState<Page | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Data state from Firestore
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);

  // Subscribe to Firebase Auth and Firestore data
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userProfile = await db.getUserProfile(user.uid);
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      setAuthIsReady(true);
    });

    const unsubServices = db.onServicesUpdate(setServices);
    // Fix: `onUsersUpdate` expects a single callback function. This passes a function that sets both customers and employees.
    const unsubUsers = db.onUsersUpdate((customers, employees) => {
      setCustomers(customers);
      setEmployees(employees);
    });
    const unsubBookings = db.onBookingsUpdate(setBookings);
    const unsubPayments = db.onPaymentsUpdate(setPayments);
    const unsubBlocks = db.onAvailabilityBlocksUpdate(setAvailabilityBlocks);
    
    return () => {
      unsubAuth();
      unsubServices();
      unsubUsers();
      unsubBookings();
      unsubPayments();
      unsubBlocks();
    };
  }, []);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    service: null,
    date: null,
  });

  const navigate = (page: Page) => {
    const protectedPages: Page[] = ['availability', 'booking'];
    if (protectedPages.includes(page) && !currentUser) {
      alert('กรุณาเข้าสู่ระบบเพื่อทำการจอง');
      setPostLoginRedirect(page);
      setCurrentPage('profile');
    } else {
      window.scrollTo(0, 0);
      setCurrentPage(page);
    }
  };

  const handleLogin = async (credentials: { email: string, password: string }) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const userProfile = await db.getUserProfile(userCredential.user.uid);
        if (userProfile) {
            if (postLoginRedirect) {
                navigate(postLoginRedirect);
                setPostLoginRedirect(null);
            } else {
                if (userProfile.role === 'admin') navigate('adminDashboard');
                else if (userProfile.role === 'technician') navigate('technicianDashboard');
                else navigate('home');
            }
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };
  
  const handleRegister = async (newUserData: Omit<Customer, 'uid' | 'profilePicture' | 'role'> & { password: string }) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, newUserData.email, newUserData.password);
        const { uid, email } = userCredential.user;
        if (!email) throw new Error("Email not found on user credential");

        const newUserProfile: Omit<UserProfile, 'uid'> = {
            email,
            name: newUserData.name,
            phone: newUserData.phone,
            lineId: newUserData.lineId,
            profilePicture: `https://picsum.photos/seed/${uid}/100/100`,
            role: 'customer'
        };
        
        await db.addUserProfile(uid, newUserProfile);

        if(postLoginRedirect) {
            navigate(postLoginRedirect);
            setPostLoginRedirect(null);
        } else {
            navigate('profile');
        }
      } catch(error: any) {
          if (error.code === 'auth/email-already-in-use') {
              alert('อีเมลนี้ถูกใช้งานแล้ว');
          } else {
              console.error("Registration Error:", error);
              alert('เกิดข้อผิดพลาดในการสมัครสมาชิก');
          }
      }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('home');
  };
  
  const handleNavigateToBooking = (date: Date) => {
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบเพื่อทำการจอง');
        setPostLoginRedirect('availability');
        navigate('profile');
        return;
    }
    setBookingDetails(prev => ({ ...prev, date }));
    navigate('booking');
  };
  
  const handleAddBooking = async (
    newBooking: Omit<Booking, 'id' | 'service'>, 
    newPayment: Omit<Payment, 'id' | 'bookingId'>
  ) => {
      await db.addBookingWithPayment(newBooking, newPayment);
  };
  
  const handleDeleteBooking = async (bookingId: string) => {
      await db.deleteBooking(bookingId);
  }
  
  const handleAddBlock = async (newBlock: Omit<AvailabilityBlock, 'id'>) => {
      await db.addBlock(newBlock);
  }
  
  const handleRemoveBlock = async (blockId: string) => {
      await db.removeBlock(blockId);
  }
  
  const handleUpdateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    await db.updateBooking(bookingId, updates);
  };
  
  const handleAddWalkInBooking = async (newBookingData: Omit<Booking, 'id' | 'status' | 'service'>) => {
    const fullBookingData = { ...newBookingData, status: 'confirmed' as const };
    await db.addWalkInBooking(fullBookingData);
}

  // Admin-specific CRUD
  const handleAdminAddCustomer = async (data: any) => { /* Not implemented for brevity */ };
  const handleUpdateUser = async (uid: string, data: Partial<UserProfile>) => await db.updateUserProfile(uid, data);
  const handleDeleteUser = async (uid: string) => await db.deleteUserProfile(uid);
  const handleAddEmployee = async (newEmployee: any) => { /* Not implemented for brevity */ };
  const handleAddService = async (newService: Omit<Service, 'id'>) => await db.addService(newService);
  const handleUpdateService = async (id: string, updatedService: Partial<Service>) => await db.updateService(id, updatedService);
  const handleDeleteService = async (serviceId: string) => await db.deleteService(serviceId);

  const handleUpdateProfile = async (data: Partial<Omit<Customer, 'uid' | 'profilePicture'>> & { currentPassword?: string, newPassword?: string }): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) return false;
    try {
      if (data.currentPassword && data.newPassword) {
        if (!currentUser.email) {
          alert('ไม่พบอีเมลผู้ใช้');
          return false;
        }
        const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, data.newPassword);
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
      } else {
        const profileUpdates: Partial<UserProfile> = {
          name: data.name,
          phone: data.phone,
          lineId: data.lineId,
        };
        Object.keys(profileUpdates).forEach(key => (profileUpdates as any)[key] === undefined && delete (profileUpdates as any)[key]);
        if (Object.keys(profileUpdates).length > 0) {
          await db.updateUserProfile(currentUser.uid, profileUpdates);
          setCurrentUser(prev => prev ? { ...prev, ...profileUpdates } : null);
          alert('อัปเดตข้อมูลโปรไฟล์สำเร็จ');
        }
      }
      return true;
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      alert('เกิดข้อผิดพลาด: ' + (error.code === 'auth/wrong-password' ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง' : error.message));
      return false;
    }
  };

  const userBookings = currentUser
    ? bookings.filter(booking => booking.customerId === currentUser.uid)
    : [];

  const renderPage = () => {
    if (!authIsReady) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={navigate} services={services} />;
      case 'about':
        return <AboutPage employees={employees} setCurrentPage={navigate} />;
      case 'services':
        return <ServicesPage setCurrentPage={navigate} services={services} />;
      case 'availability':
        return <AvailabilityPage 
                    navigateToBooking={handleNavigateToBooking} 
                    bookings={bookings} 
                    availabilityBlocks={availabilityBlocks}
                    employees={employees}
                />;
      case 'booking':
        return <BookingPage 
                    bookingDetails={bookingDetails} 
                    currentUser={currentUser as Customer | null} 
                    setBookingDetails={setBookingDetails}
                    setCurrentPage={navigate}
                    onAddBooking={handleAddBooking}
                    services={services}
                    employees={employees}
                    bookings={bookings}
                    availabilityBlocks={availabilityBlocks}
                />;
      case 'profile':
        return <ProfilePage 
                    currentUser={currentUser} 
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onLogout={handleLogout} 
                    setCurrentPage={navigate} 
                    userBookings={userBookings}
                    wasRedirected={!!postLoginRedirect}
                    onUpdateProfile={handleUpdateProfile}
                />;
      case 'technicianDashboard':
        return <TechnicianDashboard 
                    currentEmployee={currentUser as Employee | null}
                    bookings={bookings}
                    availabilityBlocks={availabilityBlocks}
                    onDeleteBooking={handleDeleteBooking}
                    onAddBooking={handleAddWalkInBooking}
                    onAddBlock={handleAddBlock}
                    onRemoveBlock={handleRemoveBlock}
                    onUpdateBooking={handleUpdateBooking}
                    services={services}
                />;
      case 'adminDashboard':
        return <AdminDashboard
                    customers={customers}
                    employees={employees}
                    bookings={bookings}
                    services={services}
                    payments={payments}
                    onAdminAddCustomer={handleAdminAddCustomer}
                    onUpdateCustomer={handleUpdateUser}
                    onDeleteCustomer={handleDeleteUser}
                    onAddEmployee={handleAddEmployee}
                    onUpdateEmployee={handleUpdateUser}
                    onDeleteEmployee={handleDeleteUser}
                    onAddService={handleAddService}
                    onUpdateService={handleUpdateService}
                    onDeleteService={handleDeleteService}
                    onUpdateBooking={handleUpdateBooking}
                    onDeleteBooking={handleDeleteBooking}
                />;
      default:
        return <HomePage setCurrentPage={navigate} services={services} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header setCurrentPage={navigate} currentUser={currentUser as ActiveUser} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-6 right-6 bg-pink-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 z-40"
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      <AIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
        services={services}
      />
    </div>
  );
};

export default App;