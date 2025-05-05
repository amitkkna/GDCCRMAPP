"use client";

import React from 'react';
import { Enquiry } from '@/types/database.types';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface StatusSummaryCardProps {
  enquiries: Enquiry[];
}

export default function StatusSummaryCard({ enquiries }: StatusSummaryCardProps) {
  // Calculate days since date
  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Count overdue items
  const overdueCount = enquiries.filter(e => {
    const daysSince = getDaysSince(e.date);
    return (
      (e.status === 'Lead' && daysSince > 7) ||
      (e.status === 'Enquiry' && daysSince > 7) ||
      (e.status === 'Formal Meeting' && daysSince > 7) ||
      (e.status === 'Quote' && daysSince > 15)
    );
  }).length;

  // Count warning items
  const warningCount = enquiries.filter(e => {
    const daysSince = getDaysSince(e.date);
    return (
      (e.status === 'Lead' && daysSince >= 5 && daysSince <= 7) ||
      (e.status === 'Enquiry' && daysSince >= 5 && daysSince <= 7) ||
      (e.status === 'Formal Meeting' && daysSince >= 5 && daysSince <= 7) ||
      (e.status === 'Quote' && daysSince >= 12 && daysSince <= 15)
    );
  }).length;

  // Get icon and colors based on counts
  const getIconAndColors = () => {
    if (overdueCount > 0) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBgColor: 'bg-red-100',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50'
      };
    } else if (warningCount > 0) {
      return {
        icon: Clock,
        iconColor: 'text-amber-600',
        iconBgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50'
      };
    } else {
      return {
        icon: CheckCircle,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50'
      };
    }
  };

  const { icon: Icon, iconColor, iconBgColor, textColor, bgColor } = getIconAndColors();
  const totalCount = overdueCount + warningCount;

  return (
    <div className={`bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-full p-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Status Alerts</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className={`${bgColor} px-5 py-3 border-t border-gray-100`}>
        <div className="text-sm">
          {totalCount === 0 ? (
            <span className="text-green-600">All items on track</span>
          ) : (
            <>
              {overdueCount > 0 && (
                <span className="text-red-600 font-medium">
                  {overdueCount} overdue
                </span>
              )}
              {overdueCount > 0 && warningCount > 0 && (
                <span className="text-gray-500"> • </span>
              )}
              {warningCount > 0 && (
                <span className="text-amber-600 font-medium">
                  {warningCount} approaching deadline
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
