"use client";

import React from 'react';
import { Enquiry } from '@/types/database.types';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface StatusSummaryCardProps {
  enquiries: Enquiry[];
}

export default function StatusSummaryCard({ enquiries }: StatusSummaryCardProps) {
  // Get today's date with time set to 00:00:00
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count today's reminders
  const todayRemindersCount = enquiries.filter(e => {
    if (!e.reminder_date) return false;

    const reminderDate = new Date(e.reminder_date);
    reminderDate.setHours(0, 0, 0, 0);

    return (
      reminderDate.getTime() === today.getTime() &&
      e.status !== 'Won' &&
      e.status !== 'Loss'
    );
  }).length;

  // Count upcoming reminders (next 7 days)
  const upcomingRemindersCount = enquiries.filter(e => {
    if (!e.reminder_date) return false;

    const reminderDate = new Date(e.reminder_date);
    reminderDate.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return (
      reminderDate.getTime() > today.getTime() &&
      reminderDate.getTime() <= nextWeek.getTime() &&
      e.status !== 'Won' &&
      e.status !== 'Loss'
    );
  }).length;

  // Count enquiries marked for notification
  const notificationCount = enquiries.filter(e => {
    // Check database field first - must be explicitly true
    if (e.show_in_notification === true) {
      return true;
    }

    // Check localStorage as a fallback, but only if database field is not false
    if (e.show_in_notification !== false && typeof window !== 'undefined') {
      const key = `notification_${e.id}`;
      const isMarked = localStorage.getItem(key) === 'true';
      if (isMarked) {
        return true;
      }
    }

    return false;
  }).length;

  // Get icon and colors based on counts
  const getIconAndColors = () => {
    if (notificationCount > 0) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-pink-600',
        iconBgColor: 'bg-pink-100',
        textColor: 'text-pink-700',
        bgColor: 'bg-pink-50'
      };
    } else if (todayRemindersCount > 0) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50'
      };
    } else if (upcomingRemindersCount > 0) {
      return {
        icon: Clock,
        iconColor: 'text-indigo-600',
        iconBgColor: 'bg-indigo-100',
        textColor: 'text-indigo-700',
        bgColor: 'bg-indigo-50'
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
  const totalCount = todayRemindersCount + upcomingRemindersCount + notificationCount;

  return (
    <div className={`bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-full p-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Task Alerts</dt>
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
            <span className="text-green-600">No pending tasks</span>
          ) : (
            <>
              {todayRemindersCount > 0 && (
                <span className="text-blue-600 font-medium">
                  {todayRemindersCount} for today
                </span>
              )}
              {todayRemindersCount > 0 && upcomingRemindersCount > 0 && (
                <span className="text-gray-500"> • </span>
              )}
              {upcomingRemindersCount > 0 && (
                <span className="text-indigo-600 font-medium">
                  {upcomingRemindersCount} upcoming
                </span>
              )}
              {(todayRemindersCount > 0 || upcomingRemindersCount > 0) && notificationCount > 0 && (
                <span className="text-gray-500"> • </span>
              )}
              {notificationCount > 0 && (
                <span className="text-pink-600 font-medium">
                  {notificationCount} notification{notificationCount !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
