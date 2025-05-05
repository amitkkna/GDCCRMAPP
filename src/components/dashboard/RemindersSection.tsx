"use client";

import React from 'react';
import { Enquiry } from '@/types/database.types';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RemindersSectionProps {
  enquiries: Enquiry[];
  assignee: 'Amit' | 'Prateek';
}

export default function RemindersSection({ enquiries, assignee }: RemindersSectionProps) {
  // Filter enquiries with reminders for today
  const today = new Date().toISOString().split('T')[0];

  const reminders = enquiries.filter(
    (e) => e.reminder_date === today && e.assigned_to === assignee
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-gray-100 text-gray-800';
      case 'Enquiry':
        return 'bg-blue-100 text-blue-800';
      case 'Formal Meeting':
        return 'bg-purple-100 text-purple-800';
      case 'Quote':
        return 'bg-yellow-100 text-yellow-800';
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Loss':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-500 mr-3" />
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Today's Reminders</h3>
          </div>
          <div className="text-sm text-gray-500">{today}</div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {reminders.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reminders for today</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reminder.status)} mr-2`}>
                        {reminder.status}
                      </span>
                      <h4 className="text-sm font-medium text-gray-900">{reminder.customer_name}</h4>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{reminder.location}</p>
                    {reminder.requirement_details && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{reminder.requirement_details}</p>
                    )}
                  </div>
                  <Link
                    href={`/enquiries?edit=${reminder.id}`}
                    className="ml-4 flex-shrink-0 bg-white rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reminders.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Link
            href="/enquiries"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all enquiries <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
