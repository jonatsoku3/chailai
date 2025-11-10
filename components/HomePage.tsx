import React from 'react';
import type { Page, Service } from '../types';
import { CHAI_LAI_LOGO_BASE64 } from '../constants';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  services: Service[]; // Keep props for consistency, even if not used
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, services }) => {

  const locationDetails = {
    address: '777/88 ซอย บรมไตรโลกนารถ 18, ต.ในเมือง, อ.เมืองพิษณุโลก, จ.พิษณุโลก 65000',
    hours: '10:00 - 20:00 น. (ทุกวัน)',
    phone: '099-272-8998',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d352.2688850505721!2d100.24428954838372!3d16.80215690626192!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sth!2sus!4v1760544128228!5m2!1sth!2sus',
    directionsUrl: 'https://maps.app.goo.gl/7FdDVtP2M8iPVgJw6'
  };

  return (
    <div className="bg-rose-50/50">
      {/* Main Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center py-12 sm:py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Info and Actions */}
            <div className="animate-fade-in-up text-center lg:text-left">
              <img src={CHAI_LAI_LOGO_BASE64} alt="ChaiLai Nails & Spa" className="w-auto h-20 md:h-24 mx-auto lg:mx-0" />
              <p className="mt-4 text-lg text-black/80 max-w-xl mx-auto lg:mx-0">
                ให้ปลายนิ้วของคุณบอกความเป็นตัวเอง กับบริการทำเล็บที่ตั้งใจทุกขั้นตอน
              </p>
              
              <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6">
                {/* Nail Services */}
                <div>
                  <h2 className="text-2xl font-bold text-black">บริการทำเล็บ</h2>
                  <p className="mt-2 text-black/70">
                    มอบประสบการณ์ทำเล็บสุดพิเศษ ด้วยผลิตภัณฑ์คุณภาพและช่างผู้ชำนาญการ
                  </p>
                  <button
                    onClick={() => setCurrentPage('availability')}
                    className="mt-4 bg-pink-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-pink-700 transition-all transform hover:scale-105 shadow-md"
                  >
                    จองคิวออนไลน์
                  </button>
                </div>
                
                <div className="border-t border-gray-200"></div>

                {/* Nail Courses */}
                <div>
                  <h2 className="text-2xl font-bold text-black">คอร์สเรียนทำเล็บ</h2>
                  <p className="mt-2 text-black/70">
                    เริ่มต้นเส้นทางอาชีพช่างทำเล็บ สอนโดยผู้เชี่ยวชาญตัวต่อตัว
                  </p>
                  <button
                    onClick={() => setCurrentPage('services')}
                    className="mt-4 bg-gray-100 text-black py-2 px-6 rounded-full font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 border border-gray-300"
                  >
                    ดูรายละเอียดคอร์ส
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Image Collage */}
            <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 grid gap-4">
                      <img src="https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/495304605_29628534443411806_2169072492972790583_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGVvw-IIfe0K_31-SR0kfV_rInNg7_g_Lqsic2Dv-D8uqeP7JKuJBASlYeCc9nFrxmzQD5i6iz2tZcn_Um5pTCA&_nc_ohc=45DBZazGvyoQ7kNvwEhx3pm&_nc_oc=Admy1x8Ar26EcYNtRUIA720FrAfNlyk9cvQrMO2ZOW774uqmqNWbMvVf6erp9pSh7BM&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=dWm6KKmbXWvAxR1RahBQ4w&oh=00_AfdEsxOO6zTnkwnfTZr5ZNuGYN5XtN2WmapnaSVKLNhGdQ&oe=68F544A2" alt="Activity 1" className="rounded-2xl shadow-lg object-cover w-full h-full" />
                  </div>
                  <div className="col-span-1 grid gap-4">
                      <img src="https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/470197781_28068933222705277_7837807587287939408_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHI3Qm5x9No9sPROO-HnzQUEtv-CW5ZSFUS2_4JbllIVegPf7m4tY5mFgE4MVZbDcd280WLOWKFvPE3W7Ju6TW_&_nc_ohc=HcxQuvBFjcoQ7kNvwE6VZAE&_nc_oc=Adk7KpRUDUEOB2UNfMz4bQUgI9-uJ_HQMDLjqj_RA-Uw4gBftN__2BqDrb1-tEF4gXc&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=kp6tjLTYnUOcx3bzgKPzwg&oh=00_Affu9NUdT_Ogv242OGv5iE0AqqNAcBQ3Aj4FmkiTtE6EwQ&oe=68F53F3B" alt="Activity 2" className="rounded-2xl shadow-lg object-cover w-full h-full" />
                      <img src="https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/486480300_29098168856448370_8764826870664958926_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG0FUTSraczd-YztP5J7b_FIOfw-j7-FUsg5_D6Pv4VSyIVO_dVr1tNSUifNMGHhmEY2UA5v7k9inTf3xghcH8a&_nc_ohc=7M33CAMPB08Q7kNvwHtHGVT&_nc_oc=AdmOpZURlnLkVVkDKvoyFtBtdSEzm47LF1q5GmrfZExMeK4KsoA5JwxDS-pNqwYL9V4&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=hipFznzqb_7xAuwKfvmlEw&oh=00_AfcU5LtRxbKgCruXiyyazpCLxnj-w58reE2G0RbaCChY1Q&oe=68F5494B" alt="Activity 3" className="rounded-2xl shadow-lg object-cover w-full h-full" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="location-map" className="py-16 bg-white border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black">ค้นหาร้านของเรา</h2>
            <p className="text-black/70 mt-3 max-w-xl mx-auto">แวะมาสัมผัสประสบการณ์ทำเล็บสุดพิเศษได้ที่ร้านของเราในจังหวัดพิษณุโลก</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Map */}
            <div className="rounded-2xl shadow-xl overflow-hidden border-4 border-white h-80 md:h-96">
               <iframe
                src={locationDetails.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ChaiLai Nails & Spa Location"
              ></iframe>
            </div>
            {/* Address Details */}
            <div className="space-y-4">
               <div className="flex items-start">
                 <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-black">ที่อยู่</h3>
                   <p className="text-black/80">{locationDetails.address}</p>
                 </div>
               </div>
                <div className="flex items-start">
                 <div className="bg-pink-100 p-3 rounded-full mr-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-black">เวลาทำการ</h3>
                   <p className="text-black/80">{locationDetails.hours}</p>
                 </div>
               </div>
                <div className="flex items-start">
                 <div className="bg-pink-100 p-3 rounded-full mr-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-black">โทรศัพท์</h3>
                   <p className="text-black/80">{locationDetails.phone}</p>
                 </div>
               </div>
               <div className="pt-4">
                 <a
                    href={locationDetails.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-black text-white py-3 px-8 rounded-full text-md font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
                 >
                    เปิดใน Google Maps
                 </a>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;