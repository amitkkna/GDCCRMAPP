"use client";

import React, { useState, useEffect } from 'react';
import { Enquiry } from '@/types/database.types';
import { getEnquiries } from '@/lib/api';
import MainLayout from '../layout/MainLayout';
import { AlertCircle } from 'lucide-react';
import StatusChart from '../dashboard/StatusChart';
import SegmentPieChart from '../dashboard/SegmentPieChart';

export default function AnalyticsPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please check your Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter enquiries based on selected time frame
  const getFilteredEnquiries = () => {
    if (timeFrame === 'all') return enquiries;

    const now = new Date();
    let cutoffDate = new Date();

    switch (timeFrame) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return enquiries.filter(e => new Date(e.date) >= cutoffDate);
  };

  const filteredEnquiries = getFilteredEnquiries();
  const totalEnquiries = filteredEnquiries.length;

  // Status data for chart
  const statusData = [
    { status: 'Lead', count: filteredEnquiries.filter(e => e.status === 'Lead').length, color: '#9CA3AF' },
    { status: 'Enquiry', count: filteredEnquiries.filter(e => e.status === 'Enquiry').length, color: '#3B82F6' },
    { status: 'Quote', count: filteredEnquiries.filter(e => e.status === 'Quote').length, color: '#FBBF24' },
    { status: 'Won', count: filteredEnquiries.filter(e => e.status === 'Won').length, color: '#10B981' },
    { status: 'Loss', count: filteredEnquiries.filter(e => e.status === 'Loss').length, color: '#EF4444' },
  ];

  // Segment data for pie chart
  const segmentData = [
    { segment: 'Agri', count: filteredEnquiries.filter(e => e.segment === 'Agri').length, color: '#10B981' },
    { segment: 'Corporate', count: filteredEnquiries.filter(e => e.segment === 'Corporate').length, color: '#3B82F6' },
    { segment: 'Others', count: filteredEnquiries.filter(e => e.segment === 'Others').length, color: '#9CA3AF' },
  ];

  // Assignee data
  const assigneeData = [
    { 
      name: 'Amit', 
      total: filteredEnquiries.filter(e => e.assigned_to === 'Amit').length,
      won: filteredEnquiries.filter(e => e.assigned_to === 'Amit' && e.status === 'Won').length,
      loss: filteredEnquiries.filter(e => e.assigned_to === 'Amit' && e.status === 'Loss').length,
    },
    { 
      name: 'Prateek', 
      total: filteredEnquiries.filter(e => e.assigned_to === 'Prateek').length,
      won: filteredEnquiries.filter(e => e.assigned_to === 'Prateek' && e.status === 'Won').length,
      loss: filteredEnquiries.filter(e => e.assigned_to === 'Prateek' && e.status === 'Loss').length,
    },
  ];

  // Monthly trend data
  const getMonthlyTrendData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        date: date,
      };
    }).reverse();

    return last6Months.map(monthData => {
      const startOfMonth = new Date(monthData.date);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(monthData.date);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const monthlyEnquiries = enquiries.filter(e => {
        const enquiryDate = new Date(e.date);
        return enquiryDate >= startOfMonth && enquiryDate <= endOfMonth;
      });

      return {
        month: `${monthData.month} ${monthData.year}`,
        total: monthlyEnquiries.length,
        won: monthlyEnquiries.filter(e => e.status === 'Won').length,
        loss: monthlyEnquiries.filter(e => e.status === 'Loss').length,
      };
    });
  };

  const monthlyTrendData = getMonthlyTrendData();

  if (isLoading) {
    return (
      <MainLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Analytics">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Analytics" subtitle="Detailed insights into your business">
      <div className="mb-6">
        <div className="flex justify-end">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setTimeFrame('all')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                timeFrame === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('month')}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                timeFrame === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('quarter')}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                timeFrame === 'quarter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last Quarter
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('year')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                timeFrame === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last Year
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusChart data={statusData} total={totalEnquiries} />
        <SegmentPieChart data={segmentData} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assignee Performance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Assignee Performance</h3>
            <div className="mt-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Won
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assigneeData.map((assignee) => (
                    <tr key={assignee.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignee.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {assignee.won}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {assignee.loss}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignee.total > 0
                          ? `${((assignee.won / (assignee.won + assignee.loss)) * 100 || 0).toFixed(1)}%`
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Monthly Trend</h3>
            <div className="mt-5">
              <div className="relative h-60">
                {/* Simple bar chart */}
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {monthlyTrendData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center w-1/6">
                      <div className="relative w-full h-48 flex flex-col-reverse">
                        {/* Won */}
                        <div
                          className="w-8 bg-green-500 mx-auto"
                          style={{
                            height: `${(data.won / Math.max(...monthlyTrendData.map(d => d.total || 1))) * 100}%`,
                          }}
                        ></div>
                        {/* Loss */}
                        <div
                          className="w-8 bg-red-500 mx-auto"
                          style={{
                            height: `${(data.loss / Math.max(...monthlyTrendData.map(d => d.total || 1))) * 100}%`,
                          }}
                        ></div>
                        {/* Other */}
                        <div
                          className="w-8 bg-gray-300 mx-auto"
                          style={{
                            height: `${((data.total - data.won - data.loss) / Math.max(...monthlyTrendData.map(d => d.total || 1))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">{data.month.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-8">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 mr-2"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Won</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Loss</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
