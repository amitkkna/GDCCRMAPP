"use client";

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/database.types';
import { getCustomers, createCustomer, updateCustomer } from '@/lib/api';
import { exportCustomersToExcel } from '@/lib/excelExport';
import MainLayout from '../layout/MainLayout';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import { PlusCircle, AlertCircle, Search, Download } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.number.includes(searchTerm) ||
          customer.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers. Please check your Supabase configuration.');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const newCustomer = await createCustomer(data);
      if (newCustomer) {
        setCustomers((prev) => [newCustomer, ...prev]);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setShowForm(true);
  };

  const handleNewCustomer = () => {
    setCurrentCustomer(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentCustomer(null);
  };

  const handleUpdateCustomer = async (data: Omit<Customer, 'created_at'>) => {
    try {
      const updatedCustomer = await updateCustomer(data.id, data);
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.map((item) => (item.id === updatedCustomer.id ? updatedCustomer : item))
        );
        setShowForm(false);
        setCurrentCustomer(null);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleSubmit = (data: Omit<Customer, 'id' | 'created_at'>) => {
    if (currentCustomer) {
      handleUpdateCustomer({ ...data, id: currentCustomer.id });
    } else {
      handleCreateCustomer(data);
    }
  };

  const handleExportToExcel = () => {
    try {
      console.log('Starting customer Excel export...');
      console.log('Total customers:', customers.length);
      console.log('Filtered customers:', filteredCustomers.length);
      console.log('Search term:', searchTerm);

      // Use filtered customers if search is applied, otherwise use all customers
      const customersToExport = searchTerm ? filteredCustomers : customers;

      console.log('Customers to export:', customersToExport.length);

      // Add search term to filename if applicable
      const filename = searchTerm
        ? `customers_search_${searchTerm}_${new Date().toISOString().split('T')[0]}.xlsx`
        : undefined;

      console.log('Export filename:', filename);

      exportCustomersToExcel(customersToExport, filename);

      // Show success message
      alert('Excel file has been downloaded successfully!');
    } catch (error) {
      console.error('Error exporting customers to Excel:', error);
      console.error('Error details:', error);
      alert(`Failed to export data to Excel. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <MainLayout title="Customers" subtitle="View your customer database">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md shadow-sm">
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

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Customer data is automatically created from the Enquiry section. This list is for viewing purposes only.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="relative rounded-md shadow-sm max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleExportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Export customers to Excel"
          >
            <Download className="-ml-1 mr-2 h-5 w-5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading customers...</p>
          </div>
        ) : (
          <CustomerList
            customers={filteredCustomers}
            onEdit={null} // Set to null to disable editing
          />
        )}
      </div>
    </MainLayout>
  );
}
