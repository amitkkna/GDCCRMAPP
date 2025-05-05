"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Enquiry, Customer } from '@/types/database.types';
import { getEnquiries, createEnquiry, updateEnquiry, getCustomers } from '@/lib/api';
import MainLayout from '../layout/MainLayout';
import EnquiryList from './EnquiryList';
import EnquiryForm from './EnquiryForm';
import { PlusCircle, AlertCircle, Filter, Calendar, Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function EnquiriesPageContent() {
  const searchParams = useSearchParams();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [currentEnquiry, setCurrentEnquiry] = useState<Enquiry | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<'Amit' | 'Prateek' | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEnquiries();
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [enquiries, assigneeFilter, statusFilter, customerFilter, fromDateFilter, toDateFilter]);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
      setFilteredEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please check your Supabase configuration.');
      setEnquiries([]);
      setFilteredEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...enquiries];

    // Filter by assignee
    if (assigneeFilter !== 'All') {
      filtered = filtered.filter(e => e.assigned_to === assigneeFilter);
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Filter by customer
    if (customerFilter !== 'All') {
      filtered = filtered.filter(e => e.customer_id === customerFilter);
    }

    // Filter by date range - from date
    if (fromDateFilter) {
      filtered = filtered.filter(e => {
        const enquiryDate = new Date(e.date);
        const fromDate = new Date(fromDateFilter);
        return enquiryDate >= fromDate;
      });
    }

    // Filter by date range - to date
    if (toDateFilter) {
      filtered = filtered.filter(e => {
        const enquiryDate = new Date(e.date);
        const toDate = new Date(toDateFilter);
        // Set time to end of day for inclusive filtering
        toDate.setHours(23, 59, 59, 999);
        return enquiryDate <= toDate;
      });
    }

    setFilteredEnquiries(filtered);
  };

  const clearFilters = () => {
    setAssigneeFilter('All');
    setStatusFilter('All');
    setCustomerFilter('All');
    setFromDateFilter('');
    setToDateFilter('');
  };

  const handleCreateEnquiry = async (data: Omit<Enquiry, 'id' | 'created_at'>) => {
    try {
      console.log('Creating new enquiry with data:', data);

      // Validate required fields before submission
      if (!data.customer_id) {
        console.error('Missing required field: customer_id');
        setError('Customer ID is required to create an enquiry.');
        return;
      }

      const newEnquiry = await createEnquiry(data);
      console.log('Response from createEnquiry:', newEnquiry);

      if (newEnquiry) {
        console.log('Enquiry created successfully, updating state');
        // Refresh the enquiries list to ensure we have the latest data
        fetchEnquiries();
        setShowForm(false);
      } else {
        console.error('Failed to create enquiry - no data returned');
        setError('Failed to create enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error creating enquiry:', error);
      setError('An error occurred while creating the enquiry. Please try again.');
    }
  };

  const handleUpdateEnquiry = async (data: Omit<Enquiry, 'created_at'>) => {
    try {
      console.log('Updating enquiry with data:', data);
      const updatedEnquiry = await updateEnquiry(data.id, data);
      console.log('Response from updateEnquiry:', updatedEnquiry);

      if (updatedEnquiry) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === updatedEnquiry.id ? updatedEnquiry : item))
        );
        setShowForm(false);
        setCurrentEnquiry(null);
      } else {
        console.error('Update failed: No enquiry returned from API');
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
    }
  };

  const handleEditEnquiry = (enquiry: Enquiry) => {
    setCurrentEnquiry(enquiry);
    setShowForm(true);
  };

  const handleNewEnquiry = () => {
    setCurrentEnquiry(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentEnquiry(null);
  };

  const handleSubmit = (data: Omit<Enquiry, 'id' | 'created_at'>) => {
    console.log('Form submitted with data:', data);

    if (currentEnquiry) {
      // Ensure all fields are included in the update
      const updateData = {
        ...data,
        id: currentEnquiry.id,
        // Explicitly include status to ensure it's updated
        status: data.status
      };
      console.log('Preparing to update with:', updateData);
      handleUpdateEnquiry(updateData);
    } else {
      handleCreateEnquiry(data);
    }
  };

  return (
    <MainLayout title="Enquiries" subtitle="Manage your enquiries">
      {error && (
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
      )}

      {!showForm && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {showFilters ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Hide advanced filters
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-1" />
                      Show advanced filters
                    </>
                  )}
                </button>
              </div>

              {/* Basic filters - always visible */}
              <div className="flex flex-wrap gap-4">
                <select
                  className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value as 'Amit' | 'Prateek' | 'All')}
                >
                  <option value="All">All Assignees</option>
                  <option value="Amit">Amit</option>
                  <option value="Prateek">Prateek</option>
                </select>
                <select
                  className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Lead">Lead</option>
                  <option value="Enquiry">Enquiry</option>
                  <option value="Quote">Quote</option>
                  <option value="Won">Won</option>
                  <option value="Loss">Loss</option>
                </select>
              </div>

              {/* Advanced filters - toggled visibility */}
              {showFilters && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Customer filter */}
                    <div>
                      <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Customer
                      </label>
                      <select
                        id="customer-filter"
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                      >
                        <option value="All">All Customers</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* From date filter */}
                    <div>
                      <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="from-date"
                          className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={fromDateFilter}
                          onChange={(e) => setFromDateFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* To date filter */}
                    <div>
                      <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="to-date"
                          className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={toDateFilter}
                          onChange={(e) => setToDateFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNewEnquiry}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
              New Enquiry
            </button>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentEnquiry ? 'Edit Enquiry' : 'New Enquiry'}
          </h2>
          <EnquiryForm
            initialData={currentEnquiry || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          {/* Active filters summary */}
          {(assigneeFilter !== 'All' || statusFilter !== 'All' || customerFilter !== 'All' || fromDateFilter || toDateFilter) && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Filter className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium">Active filters:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assigneeFilter !== 'All' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assignee: {assigneeFilter}
                      </span>
                    )}
                    {statusFilter !== 'All' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Status: {statusFilter}
                      </span>
                    )}
                    {customerFilter !== 'All' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Customer: {customers.find(c => c.id === customerFilter)?.name || 'Unknown'}
                      </span>
                    )}
                    {fromDateFilter && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        From: {fromDateFilter}
                      </span>
                    )}
                    {toDateFilter && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        To: {toDateFilter}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-700 hover:text-red-900"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading enquiries...</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Enquiries</h3>
                    <p className="text-sm text-gray-500">
                      Showing {filteredEnquiries.length} of {enquiries.length} enquiries
                    </p>
                  </div>
                </div>
                <EnquiryList
                  enquiries={filteredEnquiries}
                  onEdit={handleEditEnquiry}
                />
              </>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnquiriesPageContent />
    </Suspense>
  );
}
