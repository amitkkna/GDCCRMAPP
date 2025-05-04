"use client";

import React from 'react';

interface StatusChartProps {
  data: {
    status: string;
    count: number;
    color: string;
  }[];
  total: number;
}

export default function StatusChart({ data, total }: StatusChartProps) {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">Enquiry Status</h3>
        <div className="mt-6">
          <div className="relative h-10 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
            {data.map((item, index) => {
              // Calculate width percentage
              const width = (item.count / total) * 100;
              // Calculate left position based on previous items
              const left = data
                .slice(0, index)
                .reduce((acc, curr) => acc + (curr.count / total) * 100, 0);

              return (
                <div
                  key={item.status}
                  className="absolute top-0 h-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${width}%`,
                    left: `${left}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {data.map((item) => (
              <div key={item.status} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.status}</p>
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
