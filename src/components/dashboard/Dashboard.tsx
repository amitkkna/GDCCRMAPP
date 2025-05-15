"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, AlertCircle, Bell, PlusCircle } from 'lucide-react';
import StatCard from './StatCard';
import StatusChart from './StatusChart';
import RecentEnquiries from './RecentEnquiries';
import SegmentPieChart from './SegmentPieChart';
import TaskNotifications from './TaskNotifications';
import StatusSummaryCard from './StatusSummaryCard';
import DashboardTabs from './DashboardTabs';
import RemindersSection from './RemindersSection';
import { getEnquiries, getEnquiriesByAssignee } from '@/lib/api';
import { Enquiry, Status, Segment } from '@/types/database.types';
import MainLayout from '../layout/MainLayout';
import Link from 'next/link';

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Amit' | 'Prateek'>('Amit');

  // Initial load and tab change
  useEffect(() => {
    console.log('Dashboard: Loading enquiries for tab:', activeTab);
    fetchEnquiries();
  }, [activeTab]);

  // Force refresh on mount
  useEffect(() => {
    console.log('Dashboard: Component mounted, forcing refresh');
    fetchEnquiries();

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refreshParam = urlParams.get('refresh');
    if (refreshParam === 'true') {
      console.log('Dashboard: Refresh parameter detected, forcing another refresh');
      setTimeout(() => {
        fetchEnquiries();
      }, 1000);
    }
  }, []);

  // Listen for notification toggle events
  useEffect(() => {
    const handleNotificationToggle = () => {
      console.log('Dashboard received notification-toggled event, refreshing data');
      fetchEnquiries();

      // Force another refresh after a delay to ensure data is up to date
      setTimeout(() => {
        console.log('Dashboard: Performing delayed refresh after notification toggle');
        fetchEnquiries();
      }, 2000);
    };

    window.addEventListener('notification-toggled', handleNotificationToggle);

    return () => {
      window.removeEventListener('notification-toggled', handleNotificationToggle);
    };
  }, []);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch enquiries for the selected assignee
      const data = await getEnquiriesByAssignee(activeTab);
      setEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please check your Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'Amit' | 'Prateek') => {
    setActiveTab(tab);
  };

  // Calculate statistics
  const totalEnquiries = enquiries.length;
  const totalCustomers = new Set(enquiries.map(e => e.customer_id)).size;
  const wonEnquiries = enquiries.filter(e => e.status === 'Won').length;
  const pendingReminders = enquiries.filter(e => {
    if (!e.reminder_date) return false;
    const reminderDate = new Date(e.reminder_date);
    const today = new Date();
    return reminderDate <= today && e.status !== 'Won' && e.status !== 'Loss';
  }).length;

  // Status data for chart
  const statusData = [
    { status: 'Lead', count: enquiries.filter(e => e.status === 'Lead').length, color: '#9CA3AF' },
    { status: 'Enquiry', count: enquiries.filter(e => e.status === 'Enquiry').length, color: '#3B82F6' },
    { status: 'Formal Meeting', count: enquiries.filter(e => e.status === 'Formal Meeting').length, color: '#8B5CF6' },
    { status: 'Quote', count: enquiries.filter(e => e.status === 'Quote').length, color: '#FBBF24' },
    { status: 'Won', count: enquiries.filter(e => e.status === 'Won').length, color: '#10B981' },
    { status: 'Loss', count: enquiries.filter(e => e.status === 'Loss').length, color: '#EF4444' },
  ];

  // Segment data for pie chart
  const segmentData = [
    { segment: 'Agri', count: enquiries.filter(e => e.segment === 'Agri').length, color: '#10B981' },
    { segment: 'Corporate', count: enquiries.filter(e => e.segment === 'Corporate').length, color: '#3B82F6' },
    { segment: 'Others', count: enquiries.filter(e => e.segment === 'Others').length, color: '#9CA3AF' },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Dashboard">
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
    <MainLayout title="Dashboard" subtitle={`${activeTab}'s Dashboard`}>
      {/* Header with tabs and new enquiry button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onRefresh={() => {
            console.log('Dashboard refresh button clicked');
            fetchEnquiries();
          }}
        />

        <Link
          href="/enquiries?new=true"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
          New Enquiry
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Enquiries"
          value={totalEnquiries}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          change={{ value: '12%', positive: true }}
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          change={{ value: '8%', positive: true }}
        />
        <StatCard
          title="Won Enquiries"
          value={wonEnquiries}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={{ value: '5%', positive: true }}
        />
        <StatusSummaryCard enquiries={enquiries} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaskNotifications enquiries={enquiries} assignee={activeTab} />
        <RemindersSection enquiries={enquiries} assignee={activeTab} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusChart data={statusData} total={totalEnquiries} />
        <SegmentPieChart data={segmentData} />
      </div>

      <div className="mt-8">
        <RecentEnquiries enquiries={enquiries.slice(0, 5)} />
      </div>
    </MainLayout>
  );
}
