"use client";

import React, { useState, useEffect } from 'react';
import { Enquiry, Segment, Status, Customer } from '@/types/database.types';
import { getCustomerByNumber, createCustomer } from '@/lib/api';
import { AlertCircle, UserPlus, CheckCircle, Search } from 'lucide-react';

interface EnquiryFormProps {
  initialData?: Partial<Enquiry>;
  onSubmit: (data: Omit<Enquiry, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function EnquiryForm({ initialData, onSubmit, onCancel }: EnquiryFormProps) {
  // Initialize form data with default values and any provided initial data
  const [formData, setFormData] = useState<Partial<Enquiry>>({
    date: new Date().toISOString().split('T')[0],
    segment: '',
    customer_name: '',
    number: '',
    location: '',
    requirement_details: '',
    status: 'Lead',
    remarks: '',
    reminder_date: '',
    assigned_to: 'Amit',
    ...initialData,
  });

  // Log initial data for debugging
  useEffect(() => {
    if (initialData) {
      console.log('Initial data provided to form:', initialData);
      console.log('Current form data after initialization:', formData);
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [customerFound, setCustomerFound] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerCreated, setCustomerCreated] = useState(false);

  const segmentOptions = [
    { value: 'Agri', label: 'Agri' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Others', label: 'Others' },
  ];

  const statusOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Enquiry', label: 'Enquiry' },
    { value: 'Quote', label: 'Quote' },
    { value: 'Won', label: 'Won' },
    { value: 'Loss', label: 'Loss' },
  ];

  const assigneeOptions = [
    { value: 'Amit', label: 'Amit' },
    { value: 'Prateek', label: 'Prateek' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, New value: ${value}`);
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, number: value }));
    setCustomerFound(false);
    setCustomerCreated(false);

    if (value.length >= 10) {
      setIsLoading(true);
      setApiError(null);
      try {
        const customer = await getCustomerByNumber(value);

        if (customer) {
          setFormData((prev) => ({
            ...prev,
            customer_id: customer.id,
            customer_name: customer.name,
            location: customer.location,
          }));
          setCustomerFound(true);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setApiError('Failed to fetch customer data. Please check your Supabase configuration.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateCustomer = async () => {
    if (!formData.customer_name || !formData.number || !formData.location) {
      setErrors({
        ...errors,
        customer_name: !formData.customer_name ? 'Customer name is required' : '',
        number: !formData.number ? 'Number is required' : '',
        location: !formData.location ? 'Location is required' : '',
      });
      return;
    }

    setIsCreatingCustomer(true);
    setApiError(null);

    try {
      // First check if customer with this number already exists
      const existingCustomer = await getCustomerByNumber(formData.number);

      if (existingCustomer) {
        // If customer exists, use that instead of creating a new one
        setFormData((prev) => ({
          ...prev,
          customer_id: existingCustomer.id,
          customer_name: existingCustomer.name,
          location: existingCustomer.location,
        }));
        setCustomerFound(true);
        setCustomerCreated(false);
      } else {
        // If customer doesn't exist, create a new one
        const newCustomer = await createCustomer({
          name: formData.customer_name,
          number: formData.number,
          location: formData.location,
        });

        if (newCustomer) {
          setFormData((prev) => ({
            ...prev,
            customer_id: newCustomer.id,
          }));
          setCustomerCreated(true);
          setCustomerFound(false);
        }
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error);
      setApiError('Failed to create customer. Please check your Supabase configuration.');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.segment) newErrors.segment = 'Segment is required';
    if (!formData.customer_name) newErrors.customer_name = 'Customer name is required';
    if (!formData.number) newErrors.number = 'Number is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.assigned_to) newErrors.assigned_to = 'Assignee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create customer if not found before submitting the form
  const ensureCustomerExists = async (): Promise<boolean> => {
    // If customer already exists or was just created, we're good
    if (formData.customer_id || customerCreated) {
      return true;
    }

    // Otherwise, create the customer first
    await handleCreateCustomer();

    // Return true if customer was created successfully
    return customerCreated;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (validateForm()) {
      // First ensure customer exists in database
      setIsLoading(true);
      const customerExists = await ensureCustomerExists();
      setIsLoading(false);

      if (customerExists) {
        console.log('Submitting final form data:', formData);
        onSubmit(formData as Omit<Enquiry, 'id' | 'created_at'>);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {customerFound && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Customer found! Details have been auto-filled.
              </p>
            </div>
          </div>
        </div>
      )}

      {customerCreated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserPlus className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                New customer has been created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.date ? 'border-red-300' : ''
              }`}
            />
            {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="segment" className="block text-sm font-medium text-gray-700">
            Segment <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="segment"
              name="segment"
              value={formData.segment || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.segment ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select Segment</option>
              {segmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.segment && <p className="mt-2 text-sm text-red-600">{errors.segment}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="number" className="block text-sm font-medium text-gray-700">
            Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="number"
              id="number"
              value={formData.number || ''}
              onChange={handleNumberChange}
              className={`pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.number ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer number to search"
            />
            {errors.number && <p className="mt-2 text-sm text-red-600">{errors.number}</p>}
            {!customerFound && !customerCreated && formData.number && formData.number.length >= 10 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  disabled={isCreatingCustomer}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {isCreatingCustomer ? 'Creating...' : 'Create New Customer'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="customer_name"
              id="customer_name"
              value={formData.customer_name || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.customer_name ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer name"
            />
            {errors.customer_name && (
              <p className="mt-2 text-sm text-red-600">{errors.customer_name}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.location ? 'border-red-300' : ''
              }`}
              placeholder="Enter location"
            />
            {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="requirement_details" className="block text-sm font-medium text-gray-700">
            Details of Requirement
          </label>
          <div className="mt-1">
            <textarea
              id="requirement_details"
              name="requirement_details"
              rows={3}
              value={formData.requirement_details || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter requirement details"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status || ''}
              onChange={(e) => {
                console.log('Status changed to:', e.target.value);
                handleChange(e);
              }}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.status ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
            Assigned To <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.assigned_to ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select Assignee</option>
              {assigneeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.assigned_to && (
              <p className="mt-2 text-sm text-red-600">{errors.assigned_to}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reminder_date" className="block text-sm font-medium text-gray-700">
            Reminder Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="reminder_date"
              id="reminder_date"
              value={formData.reminder_date || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <div className="mt-1">
            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              value={formData.remarks || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter remarks"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : initialData?.id ? 'Update Enquiry' : 'Create Enquiry'}
        </button>
      </div>
    </form>
  );
}
