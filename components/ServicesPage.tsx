import React, { useState, useMemo } from 'react';
import ServiceCard from './ServiceCard';
import type { Page, Service } from '../types';

interface ServicesPageProps {
  setCurrentPage: (page: Page) => void;
  services: Service[];
}

const ServicesPage: React.FC<ServicesPageProps> = ({ setCurrentPage, services }) => {
  // Combine nail and spa services into one list for filtering
  const bookableServices = useMemo(() => services.filter(s => s.category !== 'คอร์สเรียน'), [services]);
  const courseServices = useMemo(() => services.filter(s => s.category === 'คอร์สเรียน'), [services]);

  // Create categories from the combined list and define a sort order
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(bookableServices.map(s => s.category))];
    const desiredOrder = ['ทาเล็บเจล', 'สปา'];
    return uniqueCategories.sort((a, b) => desiredOrder.indexOf(a as string) - desiredOrder.indexOf(b as string));
  }, [bookableServices]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');

  // Filter services based on the active category
  const filteredServices = useMemo(() => {
    if (!activeCategory) { // Handle case where there are no categories
        return bookableServices;
    }
    return bookableServices.filter(service => service.category === activeCategory);
  }, [activeCategory, bookableServices]);
  
  const handleBookService = (service: Service) => {
    // For both booking a service and applying for a course,
    // we navigate to the availability page to select a date.
    // The booking page can handle the logic for course deposits.
    setCurrentPage('availability');
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Services Section */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-pink-600 uppercase tracking-wider">บริการยอดนิยม</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">จองบริการได้เลย</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            เลือกบริการที่ต้องการ จากนั้นกดปุ่มจอง ระบบจะพาไปยังหน้าเลือกวันเวลาและช่าง
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center items-center mb-12">
          <div className="bg-gray-200 p-1.5 rounded-lg flex flex-wrap justify-center space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-white/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} onBook={handleBookService} />
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>ไม่พบบริการในหมวดหมู่นี้</p>
          </div>
        )}

        {/* Divider */}
        <div className="my-16 sm:my-20 border-t border-gray-200"></div>

        {/* Nail Courses Section */}
        {courseServices.length > 0 && (
          <>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-pink-600 uppercase tracking-wider">ปั้นอาชีพช่างทำเล็บ</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">คอร์สเรียนทำเล็บ</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
                เริ่มต้นเส้นทางสู่การเป็นช่างทำเล็บมืออาชีพกับหลักสูตรที่เข้มข้นและใช้งานได้จริง
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {courseServices.map(service => (
                <ServiceCard key={service.id} service={service} onBook={handleBookService} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;