"use client";

import React from 'react';
import { Enquiry, Status } from '@/types/database.types';
import { Edit, Eye } from 'lucide-react';

interface EnquiryListProps {
  enquiries: Enquiry[];
  onEdit: (enquiry: Enquiry) => void;
  onToggleNotification?: (enquiry: Enquiry, value: boolean) => void;
}

export default function EnquiryList({ enquiries, onEdit, onToggleNotification }: EnquiryListProps) {
  // Helper function to check if an enquiry is marked for notification
  const isMarkedForNotification = (enquiry: Enquiry): boolean => {
    // First check the database field
    if (enquiry.show_in_notification) {
      return true;
    }

    // If not found in database, check localStorage (our client-side workaround)
    if (typeof window !== 'undefined') {
      const key = `notification_${enquiry.id}`;
      return localStorage.getItem(key) === 'true';
    }

    return false;
  };
  const getStatusColor = (status: Status): string => {
    switch (status) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No enquiries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Segment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details of Requirement
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reminder
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notify
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(enquiry.date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{enquiry.customer_name}</div>
                <div className="text-gray-500">{enquiry.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enquiry.segment}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    enquiry.status
                  )}`}
                >
                  {enquiry.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div
                  className="max-w-xs overflow-hidden cursor-help"
                  title={enquiry.requirement_details || 'No details provided'}
                >
                  {enquiry.requirement_details ?
                    (enquiry.requirement_details.length > 50
                      ? `${enquiry.requirement_details.substring(0, 50)}...`
                      : enquiry.requirement_details)
                    : '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enquiry.assigned_to}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enquiry.reminder_date ? formatDate(enquiry.reminder_date) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                {onToggleNotification ? (
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isMarkedForNotification(enquiry)}
                      onChange={(e) => onToggleNotification(enquiry, e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      title="Show in notifications"
                    />
                  </div>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isMarkedForNotification(enquiry)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isMarkedForNotification(enquiry) ? 'Yes' : 'No'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(enquiry)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="Edit Enquiry"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-900"
                  title="View Enquiry"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
