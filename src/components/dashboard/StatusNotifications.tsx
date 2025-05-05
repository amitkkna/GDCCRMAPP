"use client";

import React from 'react';
import { Enquiry } from '@/types/database.types';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface StatusNotificationsProps {
  enquiries: Enquiry[];
}

export default function StatusNotifications({ enquiries }: StatusNotificationsProps) {
  // Calculate days since date
  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter enquiries based on status and days
  const getOverdueLeads = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Lead' && daysSince > 7;
    });
  };

  const getWarningLeads = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Lead' && daysSince >= 5 && daysSince <= 7;
    });
  };

  const getOverdueEnquiries = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Enquiry' && daysSince > 7;
    });
  };

  const getWarningEnquiries = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Enquiry' && daysSince >= 5 && daysSince <= 7;
    });
  };

  const getOverdueQuotes = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Quote' && daysSince > 15;
    });
  };

  const getWarningQuotes = () => {
    return enquiries.filter(e => {
      const daysSince = getDaysSince(e.date);
      return e.status === 'Quote' && daysSince >= 12 && daysSince <= 15;
    });
  };

  const overdueLeads = getOverdueLeads();
  const warningLeads = getWarningLeads();
  const overdueEnquiries = getOverdueEnquiries();
  const warningEnquiries = getWarningEnquiries();
  const overdueQuotes = getOverdueQuotes();
  const warningQuotes = getWarningQuotes();

  const totalOverdue = overdueLeads.length + overdueEnquiries.length + overdueQuotes.length;
  const totalWarning = warningLeads.length + warningEnquiries.length + warningQuotes.length;
  const totalNotifications = totalOverdue + totalWarning;

  if (totalNotifications === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Status Notifications</h3>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">All enquiries are on track! No pending actions required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Status Notifications</h3>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
              {totalNotifications} {totalNotifications === 1 ? 'item' : 'items'} need attention
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {totalOverdue > 0 && (
          <div className="p-5 bg-red-50">
            <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Overdue Items ({totalOverdue})
            </h4>
            <ul className="space-y-3">
              {overdueLeads.length > 0 && (
                <li className="pl-4 border-l-4 border-red-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-red-700 font-medium">{overdueLeads.length} Lead{overdueLeads.length !== 1 ? 's' : ''}</span>
                      <span className="text-gray-600"> past 7-day conversion window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-red-700 hover:text-red-900 bg-red-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
              {overdueEnquiries.length > 0 && (
                <li className="pl-4 border-l-4 border-red-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-red-700 font-medium">{overdueEnquiries.length} Enquir{overdueEnquiries.length !== 1 ? 'ies' : 'y'}</span>
                      <span className="text-gray-600"> past 7-day quote window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-red-700 hover:text-red-900 bg-red-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
              {overdueQuotes.length > 0 && (
                <li className="pl-4 border-l-4 border-red-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-red-700 font-medium">{overdueQuotes.length} Quote{overdueQuotes.length !== 1 ? 's' : ''}</span>
                      <span className="text-gray-600"> past 15-day decision window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-red-700 hover:text-red-900 bg-red-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

        {totalWarning > 0 && (
          <div className="p-5 bg-amber-50">
            <h4 className="text-sm font-medium text-amber-800 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Approaching Deadline ({totalWarning})
            </h4>
            <ul className="space-y-3">
              {warningLeads.length > 0 && (
                <li className="pl-4 border-l-4 border-amber-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-amber-700 font-medium">{warningLeads.length} Lead{warningLeads.length !== 1 ? 's' : ''}</span>
                      <span className="text-gray-600"> approaching 7-day conversion window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
              {warningEnquiries.length > 0 && (
                <li className="pl-4 border-l-4 border-amber-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-amber-700 font-medium">{warningEnquiries.length} Enquir{warningEnquiries.length !== 1 ? 'ies' : 'y'}</span>
                      <span className="text-gray-600"> approaching 7-day quote window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
              {warningQuotes.length > 0 && (
                <li className="pl-4 border-l-4 border-amber-400 py-2 px-3 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-amber-700 font-medium">{warningQuotes.length} Quote{warningQuotes.length !== 1 ? 's' : ''}</span>
                      <span className="text-gray-600"> approaching 15-day decision window</span>
                    </div>
                    <Link
                      href="/enquiries"
                      className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="mb-1"><span className="font-medium">Rules:</span></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Leads should be converted to Enquiry or Formal Meeting within 7 days</li>
            <li>Enquiries should be converted to Quote or Loss within 7 days</li>
            <li>Formal Meetings should be converted to Quote or Loss within 7 days</li>
            <li>Quotes should be converted to Won or Loss within 15 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
