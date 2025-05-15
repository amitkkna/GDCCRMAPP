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
  const [formData, setFormData] = useState<Partial<Enquiry & { meeting_person?: string }>>({
    date: new Date().toISOString().split('T')[0],
    segment: '',
    customer_name: '',
    number: '',
    location: '',
    meeting_person: '',
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
    { value: 'Formal Meeting', label: 'Formal Meeting' },
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
            meeting_person: customer.meeting_person || '',
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
    console.log('Starting handleCreateCustomer with formData:', formData);

    if (!formData.customer_name || !formData.number) {
      const newErrors = {
        ...errors,
        customer_name: !formData.customer_name ? 'Customer name is required' : '',
        number: !formData.number ? 'Number is required' : '',
      };
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      return false;
    }

    setIsCreatingCustomer(true);
    setApiError(null);

    try {
      // First check if customer with this number already exists
      console.log('Checking if customer exists with number:', formData.number);
      const existingCustomer = await getCustomerByNumber(formData.number);
      console.log('Existing customer check result:', existingCustomer);

      if (existingCustomer) {
        // If customer exists, use that instead of creating a new one
        console.log('Customer found, using existing customer:', existingCustomer);
        setFormData((prev) => {
          const updated = {
            ...prev,
            customer_id: existingCustomer.id,
            customer_name: existingCustomer.name,
            location: existingCustomer.location,
            meeting_person: existingCustomer.meeting_person || prev.meeting_person || '',
          };
          console.log('Updated form data with existing customer:', updated);
          return updated;
        });
        setCustomerFound(true);
        setCustomerCreated(false);
        return true;
      } else {
        // If customer doesn't exist, create a new one
        console.log('Customer not found, creating new customer with:', {
          name: formData.customer_name,
          number: formData.number,
          location: formData.location,
        });

        const newCustomer = await createCustomer({
          name: formData.customer_name,
          number: formData.number,
          location: formData.location,
          meeting_person: formData.meeting_person,
        });

        console.log('New customer creation result:', newCustomer);

        if (newCustomer) {
          setFormData((prev) => {
            const updated = {
              ...prev,
              customer_id: newCustomer.id,
            };
            console.log('Updated form data with new customer:', updated);
            return updated;
          });
          setCustomerCreated(true);
          setCustomerFound(false);
          return true;
        } else {
          console.error('Failed to create customer - no data returned');
          setApiError('Failed to create customer. Please try again.');
          return false;
        }
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error);
      setApiError('Failed to create customer. Please check your Supabase configuration.');
      return false;
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
    // Location is now optional
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.assigned_to) newErrors.assigned_to = 'Assignee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create customer if not found before submitting the form
  const ensureCustomerExists = async (): Promise<boolean> => {
    console.log('Ensuring customer exists, current state:', {
      customer_id: formData.customer_id,
      customerCreated
    });

    // If customer already exists or was just created, we're good
    if (formData.customer_id) {
      console.log('Customer ID already exists in form data, proceeding with submission');
      return true;
    }

    if (customerCreated) {
      console.log('Customer was created, but customer_id might be missing due to state update timing');
      // Try to find the customer by number to ensure we have the ID
      try {
        const customer = await getCustomerByNumber(formData.number);
        if (customer) {
          console.log('Found customer by number:', customer);
          // Update form data with customer ID
          setFormData(prev => ({
            ...prev,
            customer_id: customer.id
          }));
          return true;
        }
      } catch (error) {
        console.error('Error finding customer by number:', error);
      }
    }

    // Otherwise, create the customer first
    console.log('Customer does not exist, creating customer first');
    const result = await handleCreateCustomer();

    console.log('Customer creation result:', result);
    console.log('Updated form data after customer creation:', formData);

    // Double-check that we have a customer_id after creation
    if (result && !formData.customer_id) {
      console.log('Customer created but ID not in form data, fetching customer again');
      try {
        const customer = await getCustomerByNumber(formData.number);
        if (customer) {
          console.log('Found customer after creation:', customer);
          // Update form data with customer ID
          setFormData(prev => ({
            ...prev,
            customer_id: customer.id
          }));
        }
      } catch (error) {
        console.error('Error finding customer after creation:', error);
        return false;
      }
    }

    // Return true if customer was created successfully
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    // First ensure customer exists in database
    setIsLoading(true);
    try {
      const customerExists = await ensureCustomerExists();

      if (!customerExists) {
        console.log('Failed to ensure customer exists');
        setApiError('Failed to create or find customer. Please try again.');
        return;
      }

      // Get the latest form data after customer creation
      // This is crucial because React state updates are asynchronous
      // and the formData might not reflect the latest changes
      let finalData;

      // If we don't have a customer_id in the current formData, try to get it directly
      if (!formData.customer_id) {
        console.log('No customer_id in form data, attempting to retrieve it');
        try {
          const customer = await getCustomerByNumber(formData.number);
          if (customer) {
            console.log('Found customer for final submission:', customer);
            finalData = {
              ...formData,
              customer_id: customer.id
            };
          } else {
            console.error('Could not find customer by number for final submission');
            setApiError('Could not find customer information. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error finding customer for final submission:', error);
          setApiError('Error retrieving customer information. Please try again.');
          return;
        }
      } else {
        finalData = { ...formData };
      }

      console.log('Preparing to submit enquiry with data:', finalData);

      // Final check for required fields
      if (!finalData.customer_id) {
        console.error('Missing customer_id in final submission data');
        setApiError('Customer ID is missing. Please try again.');
        return;
      }

      if (!finalData.date) {
        console.error('Missing date in final submission data');
        setApiError('Date is required. Please try again.');
        return;
      }

      if (!finalData.status) {
        console.error('Missing status in final submission data');
        setApiError('Status is required. Please try again.');
        return;
      }

      if (!finalData.assigned_to) {
        console.error('Missing assigned_to in final submission data');
        setApiError('Assignee is required. Please try again.');
        return;
      }

      // Include the meeting_person field in the submission
      const submissionData = {
        ...finalData,
        // Ensure meeting_person is included even if it's optional
        meeting_person: finalData.meeting_person || ''
      };
      console.log('Submitting final form data:', submissionData);
      onSubmit(submissionData as Omit<Enquiry, 'id' | 'created_at'>);
    } catch (error) {
      console.error('Error in form submission:', error);
      setApiError('An error occurred during submission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-base text-red-700">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {customerFound && (
        <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-base text-green-700">
                Customer found! Details have been auto-filled.
              </p>
            </div>
          </div>
        </div>
      )}

      {customerCreated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserPlus className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-base text-blue-700">
                New customer has been created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="date" className="block text-base font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.date ? 'border-red-300' : ''
              }`}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            {errors.date && <p className="mt-2 text-sm font-medium text-red-600">{errors.date}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="segment" className="block text-base font-medium text-gray-700 mb-2">
            Segment <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="segment"
              name="segment"
              value={formData.segment || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.segment ? 'border-red-300' : ''
              }`}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="">Select Segment</option>
              {segmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.segment && <p className="mt-2 text-sm font-medium text-red-600">{errors.segment}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="number" className="block text-base font-medium text-gray-700 mb-2">
            Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="number"
              id="number"
              value={formData.number || ''}
              onChange={handleNumberChange}
              className={`pl-12 focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.number ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer number to search"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            {errors.number && <p className="mt-2 text-sm font-medium text-red-600">{errors.number}</p>}
            {!customerFound && !customerCreated && formData.number && formData.number.length >= 10 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  disabled={isCreatingCustomer}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {isCreatingCustomer ? 'Creating...' : 'Create New Customer'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="customer_name" className="block text-base font-medium text-gray-700 mb-2">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="customer_name"
              id="customer_name"
              value={formData.customer_name || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.customer_name ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer name"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            {errors.customer_name && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.customer_name}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="location" className="block text-base font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.location ? 'border-red-300' : ''
              }`}
              placeholder="Enter location"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            {errors.location && <p className="mt-2 text-sm font-medium text-red-600">{errors.location}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="meeting_person" className="block text-base font-medium text-gray-700 mb-2">
            Meeting Person Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="meeting_person"
              id="meeting_person"
              value={formData.meeting_person || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
              placeholder="Enter meeting person name"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="requirement_details" className="block text-base font-medium text-gray-700 mb-2">
            Details of Requirement
          </label>
          <div className="mt-1">
            <textarea
              id="requirement_details"
              name="requirement_details"
              rows={4}
              value={formData.requirement_details || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
              placeholder="Enter requirement details"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="status" className="block text-base font-medium text-gray-700 mb-2">
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
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.status ? 'border-red-300' : ''
              }`}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="">Select Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-2 text-sm font-medium text-red-600">{errors.status}</p>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="assigned_to" className="block text-base font-medium text-gray-700 mb-2">
            Assigned To <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                errors.assigned_to ? 'border-red-300' : ''
              }`}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="">Select Assignee</option>
              {assigneeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.assigned_to && (
              <p className="mt-2 text-sm font-medium text-red-600">{errors.assigned_to}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reminder_date" className="block text-base font-medium text-gray-700 mb-2">
            Reminder Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="reminder_date"
              id="reminder_date"
              value={formData.reminder_date || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="remarks" className="block text-base font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <div className="mt-1">
            <textarea
              id="remarks"
              name="remarks"
              rows={4}
              value={formData.remarks || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
              placeholder="Enter remarks"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-center mt-4">
            <input
              id="show_in_notification"
              name="show_in_notification"
              type="checkbox"
              checked={formData.show_in_notification || false}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  show_in_notification: e.target.checked
                });
              }}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="show_in_notification" className="ml-3 block text-base font-medium text-gray-700">
              Show in Notifications (will display Date, Customer, Requirement Details, and Overdue Days)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 px-6 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : initialData?.id ? 'Update Enquiry' : 'Create Enquiry'}
        </button>
      </div>
    </form>
  );
}
