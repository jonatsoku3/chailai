import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: ChartData[];
  title: string;
}

const COLORS = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#a855f7', '#c084fc', '#d8b4fe'];

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
            <h3 className="text-xl font-bold text-black mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center text-gray-500">
                ไม่มีข้อมูลสำหรับช่วงเวลานี้
            </div>
        </div>
    );
  }

  let cumulativePercent = 0;
  const segments = data.map((item, index) => {
    const percent = (item.value / total) * 100;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 50 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      'L 0 0', // Line to center
    ].join(' ');

    return { path: pathData, color: COLORS[index % COLORS.length] };
  });

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * (percent / 100));
    const y = Math.sin(2 * Math.PI * (percent / 100));
    return [x, y];
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <h3 className="text-xl font-bold text-black mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-40 h-40 flex-shrink-0">
          <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
            {segments.map((segment, index) => (
              <path key={index} d={segment.path} fill={segment.color} />
            ))}
          </svg>
        </div>
        <div className="w-full">
          <ul className="space-y-2 text-sm">
            {data.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
