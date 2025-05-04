"use client";

import React from 'react';

interface SegmentPieChartProps {
  data: {
    segment: string;
    count: number;
    color: string;
  }[];
}

export default function SegmentPieChart({ data }: SegmentPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  // Simple SVG pie chart
  const createPieChart = () => {
    const radius = 60;
    const centerX = 75;
    const centerY = 75;
    let startAngle = 0;

    return data.map((item, index) => {
      const percentage = item.count / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // Calculate the SVG path for the pie slice
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = percentage > 0.5 ? 1 : 0;

      const pathData = [
        `M ${centerX},${centerY}`,
        `L ${x1},${y1}`,
        `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
        'Z',
      ].join(' ');

      const path = (
        <path
          key={item.segment}
          d={pathData}
          fill={item.color}
          stroke="#fff"
          strokeWidth="1"
        />
      );

      startAngle = endAngle;
      return path;
    });
  };

  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">Enquiries by Segment</h3>
        <div className="mt-6 flex flex-col items-center">
          <div className="relative w-[180px] h-[180px] transform transition-transform duration-500 hover:scale-105">
            <svg viewBox="0 0 150 150" className="drop-shadow-md">{createPieChart()}</svg>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 w-full">
            {data.map((item) => (
              <div key={item.segment} className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                <div
                  className="w-5 h-5 rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.segment}</p>
                  <p className="text-sm text-gray-500">
                    {item.count} ({((item.count / total) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
