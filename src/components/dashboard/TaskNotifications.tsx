"use client";

import React from 'react';
import { Enquiry } from '@/types/database.types';
import { Bell, CheckCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TaskNotificationsProps {
  enquiries: Enquiry[];
  assignee: 'Amit' | 'Prateek';
}

export default function TaskNotifications({ enquiries, assignee }: TaskNotificationsProps) {
  // Filter enquiries with reminders for today
  const getTodayReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return enquiries.filter(e => {
      if (!e.reminder_date) return false;

      const reminderDate = new Date(e.reminder_date);
      reminderDate.setHours(0, 0, 0, 0);

      return (
        reminderDate.getTime() === today.getTime() &&
        e.status !== 'Won' &&
        e.status !== 'Loss'
      );
    });
  };

  // Filter enquiries with upcoming reminders (next 7 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return enquiries.filter(e => {
      if (!e.reminder_date) return false;

      const reminderDate = new Date(e.reminder_date);
      reminderDate.setHours(0, 0, 0, 0);

      return (
        reminderDate.getTime() > today.getTime() &&
        reminderDate.getTime() <= nextWeek.getTime() &&
        e.status !== 'Won' &&
        e.status !== 'Loss'
      );
    });
  };

  // Filter enquiries with pending actions
  const getPendingActions = () => {
    return enquiries.filter(e => {
      return (
        (e.status === 'Lead' || e.status === 'Enquiry' || e.status === 'Formal Meeting' || e.status === 'Quote') &&
        !e.reminder_date
      );
    });
  };

  // Get enquiries marked for notification
  const getMarkedForNotification = () => {
    console.log('Checking for marked notifications among', enquiries.length, 'enquiries');

    // Log all enquiries to see their notification status
    enquiries.forEach(e => {
      console.log(`Enquiry ${e.id} (${e.customer_name}): show_in_notification = ${e.show_in_notification}`);
    });

    // STRICT FILTERING: Only include enquiries that have show_in_notification explicitly set to true
    let markedEnquiries = enquiries.filter(e => {
      // Check database field first - must be explicitly true
      if (e.show_in_notification === true) {
        console.log('Enquiry marked in database (true):', e.id, e.customer_name);
        return true;
      }

      // Check localStorage as a fallback, but only if database field is not false
      if (e.show_in_notification !== false && typeof window !== 'undefined') {
        const key = `notification_${e.id}`;
        const isMarked = localStorage.getItem(key) === 'true';
        if (isMarked) {
          console.log('Enquiry marked in localStorage:', e.id, e.customer_name);
          return true;
        }
      }

      return false;
    });

    console.log('Found', markedEnquiries.length, 'marked notifications');

    // Log the final list of marked enquiries
    if (markedEnquiries.length > 0) {
      console.log('Final list of marked enquiries:');
      markedEnquiries.forEach(e => {
        console.log(`- ${e.customer_name} (${e.id}): ${e.show_in_notification}`);
      });
    } else {
      console.log('No marked enquiries found');
    }

    return markedEnquiries;
  };

  // Calculate overdue days
  const getOverdueDays = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const todayReminders = getTodayReminders();
  const upcomingReminders = getUpcomingReminders();
  const pendingActions = getPendingActions();
  const markedNotifications = getMarkedForNotification();

  const totalNotifications = todayReminders.length + upcomingReminders.length + pendingActions.length + markedNotifications.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (totalNotifications === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Task Notifications</h3>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No pending tasks or reminders for today!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Task Notifications</h3>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
              {totalNotifications} {totalNotifications === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {todayReminders.length > 0 && (
          <div className="p-5 bg-blue-50">
            <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Today's Reminders ({todayReminders.length})
            </h4>
            <ul className="space-y-3">
              {todayReminders.map((enquiry) => (
                <li key={enquiry.id} className="pl-4 border-l-4 border-blue-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-700 font-medium">{enquiry.customer_name}</span>
                      <span className="text-gray-600"> - {enquiry.status}</span>
                    </div>
                    <Link
                      href={`/enquiries?edit=${enquiry.id}`}
                      className="text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {enquiry.requirement_details || 'No details provided'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {upcomingReminders.length > 0 && (
          <div className="p-5 bg-indigo-50">
            <h4 className="text-sm font-medium text-indigo-800 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Reminders ({upcomingReminders.length})
            </h4>
            <ul className="space-y-3">
              {upcomingReminders.map((enquiry) => (
                <li key={enquiry.id} className="pl-4 border-l-4 border-indigo-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-indigo-700 font-medium">{enquiry.customer_name}</span>
                      <span className="text-gray-600"> - {formatDate(enquiry.reminder_date || '')}</span>
                    </div>
                    <Link
                      href={`/enquiries?edit=${enquiry.id}`}
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {enquiry.requirement_details || 'No details provided'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingActions.length > 0 && (
          <div className="p-5 bg-purple-50">
            <h4 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Pending Actions ({pendingActions.length})
            </h4>
            <ul className="space-y-3">
              {pendingActions.slice(0, 5).map((enquiry) => (
                <li key={enquiry.id} className="pl-4 border-l-4 border-purple-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-purple-700 font-medium">{enquiry.customer_name}</span>
                      <span className="text-gray-600"> - {enquiry.status}</span>
                    </div>
                    <Link
                      href={`/enquiries?edit=${enquiry.id}`}
                      className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {enquiry.requirement_details || 'No details provided'}
                  </p>
                </li>
              ))}
              {pendingActions.length > 5 && (
                <li className="text-center text-sm text-purple-700">
                  <Link href="/enquiries" className="hover:underline">
                    View {pendingActions.length - 5} more pending actions
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

        {markedNotifications.length > 0 && (
          <div className="p-5 bg-pink-50">
            <h4 className="text-sm font-medium text-pink-800 mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Enquiry Notifications ({markedNotifications.length})
            </h4>
            <ul className="space-y-3">
              {markedNotifications.map((enquiry) => (
                <li key={enquiry.id} className="pl-4 border-l-4 border-pink-400 py-3 px-4 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-1 rounded-full mr-2">
                        {formatDate(enquiry.date)}
                      </div>
                      <span className="text-pink-700 font-medium">{enquiry.customer_name}</span>
                    </div>
                    <Link
                      href={`/enquiries?edit=${enquiry.id}`}
                      className="text-xs font-medium text-pink-700 hover:text-pink-900 bg-pink-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-md mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Requirement:</span> {enquiry.requirement_details || 'No details provided'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-pink-800 bg-pink-100 px-2.5 py-1 rounded-full">
                      Overdue: {getOverdueDays(enquiry.date)} days
                    </span>
                    <span className="text-xs text-gray-500">
                      {enquiry.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
