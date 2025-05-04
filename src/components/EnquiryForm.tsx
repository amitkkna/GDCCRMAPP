"use client";

import React, { useState, useEffect } from 'react';
import { Enquiry, Segment, Status } from '@/types/database.types';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import DatePicker from './ui/DatePicker';
import Button from './ui/Button';
import { getCustomerByNumber } from '@/lib/api';

interface EnquiryFormProps {
  initialData?: Partial<Enquiry>;
  onSubmit: (data: Omit<Enquiry, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  assignedTo: 'Amit' | 'Prateek';
}

export default function EnquiryForm({
  initialData,
  onSubmit,
  onCancel,
  assignedTo
}: EnquiryFormProps) {
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
    assigned_to: assignedTo,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, number: value }));

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
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setApiError('Failed to fetch customer data. Please check your Supabase configuration.');
      } finally {
        setIsLoading(false);
      }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData as Omit<Enquiry, 'id' | 'created_at'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{apiError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          id="date"
          name="date"
          label="Date"
          value={formData.date || ''}
          onChange={handleChange}
          required
          error={errors.date}
        />

        <Select
          id="segment"
          name="segment"
          label="Segment"
          options={segmentOptions}
          value={formData.segment || ''}
          onChange={handleChange}
          required
          error={errors.segment}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="customer_name"
          name="customer_name"
          label="Customer Name"
          value={formData.customer_name || ''}
          onChange={handleChange}
          required
          error={errors.customer_name}
        />

        <Input
          id="number"
          name="number"
          label="Number"
          value={formData.number || ''}
          onChange={handleNumberChange}
          required
          error={errors.number}
        />
      </div>

      <Input
        id="location"
        name="location"
        label="Location"
        value={formData.location || ''}
        onChange={handleChange}
        required
        error={errors.location}
      />

      <Textarea
        id="requirement_details"
        name="requirement_details"
        label="Details of Requirement"
        value={formData.requirement_details || ''}
        onChange={handleChange}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="status"
          name="status"
          label="Status"
          options={statusOptions}
          value={formData.status || ''}
          onChange={handleChange}
          required
          error={errors.status}
        />

        <DatePicker
          id="reminder_date"
          name="reminder_date"
          label="Reminder Date"
          value={formData.reminder_date || ''}
          onChange={handleChange}
        />
      </div>

      <Textarea
        id="remarks"
        name="remarks"
        label="Remarks"
        value={formData.remarks || ''}
        onChange={handleChange}
        rows={3}
      />

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : initialData?.id ? 'Update Enquiry' : 'Create Enquiry'}
        </Button>
      </div>
    </form>
  );
}
