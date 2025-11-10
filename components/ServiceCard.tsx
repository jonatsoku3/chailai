
import React from 'react';
import type { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  const isCourse = service.category === 'คอร์สเรียน';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col p-6 h-full transition-all duration-300 hover:shadow-2xl hover:border-pink-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
          <p className="text-gray-600 mt-1">เริ่มต้น <span className="font-semibold">฿{service.price.toLocaleString()}</span></p>
        </div>
        <div className="bg-rose-100 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          {service.duration > 120 ? `${Math.floor(service.duration / 60)} ชั่วโมง` : `${service.duration} นาที`}
        </div>
      </div>

      <ul className="space-y-2 text-gray-700 my-4 flex-grow">
        {service.description.split('\n').map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-pink-600 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <button
          onClick={() => onBook(service)}
          className="w-full py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 bg-pink-600 text-white hover:bg-pink-700"
        >
          {isCourse ? 'สมัครเรียน' : 'จองบริการนี้'}
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;