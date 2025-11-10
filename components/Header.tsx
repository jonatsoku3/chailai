import React, { useState, useEffect } from 'react';
import type { Page, ActiveUser } from '../types';
import { CHAI_LAI_LOGO_BASE64 } from '../constants';

interface HeaderProps {
  setCurrentPage: (page: Page) => void;
  currentUser: ActiveUser | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userRole = currentUser?.role;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const getProfilePage = () => {
    switch (userRole) {
      case 'admin':
        return 'adminDashboard';
      case 'technician':
        return 'technicianDashboard';
      default:
        return 'profile';
    }
  };

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-pink-600 text-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
          <img src={CHAI_LAI_LOGO_BASE64} alt="ChaiLai Nails & Spa Logo" className="h-12 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="hover:text-pink-200 transition-colors" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>หน้าแรก</a>
          <a href="#" className="hover:text-pink-200 transition-colors" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>เกี่ยวกับเรา</a>
          <a href="#" className="hover:text-pink-200 transition-colors" onClick={(e) => { e.preventDefault(); handleNavClick('services'); }}>บริการ</a>
          
          {userRole === 'technician' && (
            <a href="#" className="font-semibold hover:text-pink-200 transition-colors" onClick={(e) => { e.preventDefault(); handleNavClick('technicianDashboard'); }}>
              ตารางงาน
            </a>
          )}
          {userRole === 'admin' && (
             <a href="#" className="font-semibold hover:text-pink-200 transition-colors" onClick={(e) => { e.preventDefault(); handleNavClick('adminDashboard'); }}>
              แดชบอร์ด
            </a>
          )}

          <div className="w-px h-6 bg-white/30 ml-4 !mr-4"></div> {/* Separator */}

          {currentUser ? (
            <div className="relative group">
               <button onClick={() => handleNavClick(getProfilePage())} className="flex items-center space-x-2">
                 <img src={currentUser.profilePicture} alt="Profile" className="w-8 h-8 rounded-full" />
                 <span>{currentUser.name}</span>
               </button>
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-black">
                 <a href="#" onClick={(e) => {e.preventDefault(); handleNavClick(getProfilePage())}} className="block px-4 py-2 text-sm hover:bg-gray-100">
                    {userRole === 'customer' ? 'โปรไฟล์' : 'แดชบอร์ด'}
                 </a>
                 <a href="#" onClick={(e) => {e.preventDefault(); handleLogoutClick()}} className="block px-4 py-2 text-sm hover:bg-gray-100">ออกจากระบบ</a>
               </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {userRole !== 'technician' && userRole !== 'admin' && (
                <button
                  onClick={() => handleNavClick('availability')}
                  className="bg-white text-pink-600 py-2 px-5 rounded-full font-semibold hover:bg-pink-100 transition-colors text-sm"
                >
                  จองคิว
                </button>
              )}
              <button
                onClick={() => handleNavClick('profile')}
                className="border border-white py-2 px-5 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-colors text-sm"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative h-6 w-6">
            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 top-2.5' : '-translate-y-1.5'}`}></span>
            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 top-2.5' : 'translate-y-1.5'}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-pink-600 md:hidden transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-6 h-full flex flex-col items-center justify-center text-center space-y-6">
            <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>หน้าแรก</a>
            <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>เกี่ยวกับเรา</a>
            <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => { e.preventDefault(); handleNavClick('services'); }}>บริการ</a>
            
            {userRole === 'technician' && (
              <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => { e.preventDefault(); handleNavClick('technicianDashboard'); }}>
                ตารางงาน
              </a>
            )}
            {userRole === 'admin' && (
                <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => { e.preventDefault(); handleNavClick('adminDashboard'); }}>
                แดชบอร์ด
              </a>
            )}

            <div className="border-t border-white/50 w-full max-w-xs my-4"></div>

            {currentUser ? (
                <>
                  <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => {e.preventDefault(); handleNavClick(getProfilePage())}}>
                      {userRole === 'customer' ? 'โปรไฟล์' : 'แดชบอร์ด'}
                  </a>
                  <a href="#" className="text-3xl font-semibold text-white hover:text-pink-200" onClick={(e) => {e.preventDefault(); handleLogoutClick()}}>ออกจากระบบ</a>
                </>
            ) : (
                <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
                    {userRole !== 'technician' && userRole !== 'admin' && (
                        <button
                            onClick={() => handleNavClick('availability')}
                            className="w-full bg-white text-pink-600 py-3 px-8 rounded-full text-xl font-semibold hover:bg-pink-100 transition-colors"
                        >
                            จองคิว
                        </button>
                    )}
                    <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full border-2 border-white text-white py-3 px-8 rounded-full text-xl font-semibold hover:bg-white hover:text-pink-600 transition-colors"
                    >
                        เข้าสู่ระบบ
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;