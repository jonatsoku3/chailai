import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (day === null) {
        return <div key={`blank-${index}`} className="w-10 h-10"></div>;
      }
      const date = new Date(year, month, day);
      date.setHours(0,0,0,0);
      const isSelected = date.getTime() === selectedDate.getTime();
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      let classes = 'w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors ';
      if (isPast) {
        classes += 'text-stone-400 cursor-not-allowed';
      } else if (isSelected) {
        classes += 'bg-pink-500 text-white';
      } else if (isToday) {
        classes += 'bg-rose-200 text-black';
      } else {
        classes += 'text-black hover:bg-rose-100';
      }

      return (
        <div key={day} className={classes} onClick={() => !isPast && onDateChange(date)}>
          {day}
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-black hover:bg-gray-100" aria-label="เดือนก่อนหน้า">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-bold text-lg text-black">
          {displayDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-black hover:bg-gray-100" aria-label="เดือนถัดไป">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-black">
        {daysOfWeek.map(day => <div key={day} className="font-semibold">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mt-2">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;