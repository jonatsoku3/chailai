import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  const chartHeight = 250;
  
  // A simple function to format currency for the Y-axis
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };
  
  const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
      const value = (maxValue / 4) * i;
      return { value, label: formatYAxisLabel(value) };
  }).reverse();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <h3 className="text-xl font-bold text-black mb-4">{title}</h3>
      <div className="flex h-[300px]">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2" style={{ height: chartHeight }}>
          {yAxisLabels.map(({ label }, index) => <div key={index} className="text-right">{label}</div>)}
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 border-l border-gray-200 pl-2 overflow-x-auto">
            <div className="flex justify-around h-full items-end gap-2">
              {data.map((item, index) => {
                const barHeightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                     <div
                      style={{ height: `${barHeightPercentage}%`}}
                      className="w-4/5 max-w-[40px] bg-pink-500 rounded-t-md transition-all duration-300 group-hover:bg-pink-600"
                    >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded-md">
                        {item.value.toLocaleString()}
                    </div>
                    </div>
                    <div className="text-xs mt-2 text-gray-500 text-center">{item.label}</div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
