"use client";

import React, { useState } from 'react';
import { Customer } from '@/types/database.types';
import { AlertCircle } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    number: '',
    location: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.number) newErrors.number = 'Number is required';
    if (!formData.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      onSubmit(formData as Omit<Customer, 'id' | 'created_at'>);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.name ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="number" className="block text-sm font-medium text-gray-700">
            Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="number"
              id="number"
              value={formData.number || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.number ? 'border-red-300' : ''
              }`}
              placeholder="Enter customer number"
            />
            {errors.number && <p className="mt-2 text-sm text-red-600">{errors.number}</p>}
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
          {isLoading ? 'Loading...' : initialData?.id ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}
