"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    positive: boolean;
  };
  iconColor: string;
  iconBgColor: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  iconColor,
  iconBgColor
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-full p-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
          <div className="text-sm">
            <span
              className={`font-medium ${
                change.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.positive ? '↑' : '↓'} {change.value}
            </span>{' '}
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
      )}
    </div>
  );
}
