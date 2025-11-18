
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
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
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);

  // Data state from Firestore
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);

  // Subscribe to Firebase Auth and Firestore data
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      try {
        if (user) {
          const userProfile = await db.getUserProfile(user.uid);
          setCurrentUser(userProfile);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setCurrentUser(null);
      } finally {
        setAuthIsReady(true);
      }
    });

    const unsubServices = db.onServicesUpdate(setServices);
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

  const handlePostLoginNavigation = (userProfile: UserProfile) => {
      if (postLoginRedirect) {
          navigate(postLoginRedirect);
          setPostLoginRedirect(null);
      } else {
          if (userProfile.role === 'admin') navigate('adminDashboard');
          else if (userProfile.role === 'technician') navigate('technicianDashboard');
          else navigate('home');
      }
  };

  const handleLogin = async (credentials: { email: string, password: string }) => {
    const performLogin = async () => {
         const userCredential = await auth.signInWithEmailAndPassword(credentials.email, credentials.password);
         if (userCredential.user) {
            const userProfile = await db.getUserProfile(userCredential.user.uid);
            if (userProfile) {
                handlePostLoginNavigation(userProfile);
            }
         }
    };

    try {
        await performLogin();
    } catch (error: any) {
        if (error.code === 'auth/operation-not-supported-in-this-environment') {
             console.warn("Environment restricted, switching to memory persistence.");
             try {
                await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
                await performLogin();
                alert('แจ้งเตือน: เข้าสู่ระบบในโหมดชั่วคราว (Preview Mode) ระบบจะไม่จำการเข้าสู่ระบบหากรีเฟรชหน้าจอ');
             } catch (retryError: any) {
                if (retryError.code === 'auth/operation-not-supported-in-this-environment') {
                    console.warn("Login failed: Environment does not support this operation.");
                    alert("ไม่สามารถเข้าสู่ระบบได้ในหน้านี้ (Preview) กรุณาเปิดเว็บในหน้าต่างใหม่");
                } else {
                    console.error("Retry Login Error:", retryError);
                    alert(`ไม่สามารถเข้าสู่ระบบได้ในสภาพแวดล้อมนี้: ${retryError.message}`);
                }
             }
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else {
            console.error("Login Error:", error);
            alert(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`);
        }
    }
  };
  
  const handleRegister = async (newUserData: Omit<Customer, 'uid' | 'profilePicture' | 'role'> & { password: string }) => {
      const performRegister = async () => {
          const userCredential = await auth.createUserWithEmailAndPassword(newUserData.email, newUserData.password);
          const user = userCredential.user;
          if (!user || !user.email) throw new Error("User creation failed");
          
          const { uid, email } = user;

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
      };

      try {
        await performRegister();
      } catch(error: any) {
          if (error.code === 'auth/operation-not-supported-in-this-environment') {
             try {
                await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
                await performRegister();
                alert('แจ้งเตือน: สมัครสมาชิกในโหมดชั่วคราว (Preview Mode) ระบบจะไม่จำการเข้าสู่ระบบหากรีเฟรชหน้าจอ');
             } catch (retryError: any) {
                if (retryError.code === 'auth/operation-not-supported-in-this-environment') {
                    console.warn("Register failed: Environment does not support this operation.");
                    alert("ไม่สามารถสมัครสมาชิกได้ในหน้านี้ (Preview) กรุณาเปิดเว็บในหน้าต่างใหม่");
                } else {
                    console.error("Retry Register Error:", retryError);
                    alert(`ไม่สามารถสมัครสมาชิกได้ในสภาพแวดล้อมนี้: ${retryError.message}`);
                }
             }
          } else if (error.code === 'auth/email-already-in-use') {
              alert('อีเมลนี้ถูกใช้งานแล้ว');
          } else {
              console.error("Registration Error:", error);
              alert(`เกิดข้อผิดพลาดในการสมัครสมาชิก: ${error.message}`);
          }
      }
  };

  const processLoginResult = async (user: firebase.User) => {
    if (!user) throw new Error("No user returned");

    let userProfile = await db.getUserProfile(user.uid);

    if (!userProfile) {
        // New user, create a profile
        const newUserProfileData: Omit<UserProfile, 'uid'> = {
            email: user.email || '',
            name: user.displayName || 'LINE User',
            phone: '', // Not provided by LINE auth
            lineId: '', // Not provided by LINE auth
            profilePicture: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
            role: 'customer'
        };
        await db.addUserProfile(user.uid, newUserProfileData);
        userProfile = await db.getUserProfile(user.uid);
    }

    if (userProfile) {
        handlePostLoginNavigation(userProfile);
    }
  };

  const handleLineLogin = async () => {
    const provider = new firebase.auth.OAuthProvider('line.me');
    try {
        const result = await auth.signInWithPopup(provider);
        if (result.user) {
            await processLoginResult(result.user);
        }
    } catch (error: any) {
        if (error.code === 'auth/unauthorized-domain') {
            const currentDomain = window.location.hostname;
            setAuthDomainError(currentDomain);
            // Alert is handled by UI in ProfilePage, but good to log
            console.error("Unauthorized Domain:", currentDomain);
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
             console.warn("Popup operation restricted, attempting fallback...");
             try {
                // Fallback to memory persistence when web storage is blocked
                await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
                const result = await auth.signInWithPopup(provider);
                if (result.user) {
                     await processLoginResult(result.user);
                     alert('แจ้งเตือน: คุณกำลังใช้งานในสภาพแวดล้อมที่จำกัด (Preview Mode) การเข้าสู่ระบบจะไม่ถูกบันทึกหากคุณรีเฟรชหน้าจอ');
                }
            } catch (innerError: any) {
                 // Gracefully handle if the environment strictly forbids the operation even with memory persistence
                 if (innerError.code === 'auth/operation-not-supported-in-this-environment') {
                     console.warn("LINE Login not supported in this preview environment.");
                     alert("ขออภัย ไม่สามารถเข้าสู่ระบบด้วย LINE ในหน้า Preview นี้ได้เนื่องจากข้อจำกัดของเบราว์เซอร์ กรุณาลองใช้ 'เข้าสู่ระบบด้วยอีเมล' หรือเปิดเว็บในหน้าต่างใหม่");
                 } else {
                     console.error("Retry LINE Login Error:", innerError);
                     alert(`ไม่สามารถเข้าสู่ระบบได้: ${innerError.message}`);
                 }
            }
        } else if (error.code === 'auth/popup-closed-by-user') {
             // Do nothing, user closed the popup
        } else {
            console.error("LINE Login Error:", error);
            alert(`เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE: ${error.message}`);
        }
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
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
        const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, data.currentPassword);
        await auth.currentUser.reauthenticateWithCredential(credential);
        await auth.currentUser.updatePassword(data.newPassword);
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

  // AdminDashboard has its own layout, render it separately to make it wider.
  if (currentPage === 'adminDashboard') {
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
                currentUser={currentUser as Employee | null}
                onLogout={handleLogout}
                setCurrentPage={navigate}
            />;
  }

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
                    onLineLogin={handleLineLogin}
                    setCurrentPage={navigate} 
                    userBookings={userBookings}
                    wasRedirected={!!postLoginRedirect}
                    onUpdateProfile={handleUpdateProfile}
                    authDomainError={authDomainError}
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
