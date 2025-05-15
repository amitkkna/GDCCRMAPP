import React, { useState, useEffect } from 'react';
import { Task } from '@/types/database.types';
import { createTask, updateTask, getEnquiries } from '@/lib/api';
import { Enquiry } from '@/types/database.types';
import { AlertCircle, Loader2 } from 'lucide-react';

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    enquiry_id: '',
    status: 'Pending',
    assigned_to: 'Amit',
    due_date: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        due_date: initialData.due_date || '',
      });
    }
    
    loadEnquiries();
  }, [initialData]);

  const loadEnquiries = async () => {
    setIsLoadingEnquiries(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setIsLoadingEnquiries(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.assigned_to) newErrors.assigned_to = 'Assignee is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      if (initialData?.id) {
        // Update existing task
        await updateTask(initialData.id, formData);
      } else {
        // Create new task
        await createTask(formData as Omit<Task, 'id' | 'created_at' | 'completed_at'>);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving task:', error);
      setApiError('An error occurred while saving the task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-md shadow">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData?.id ? 'Edit Task' : 'Create New Task'}
        </h2>
        
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

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title || ''}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                  errors.title ? 'border-red-300' : ''
                }`}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              {errors.title && <p className="mt-2 text-sm font-medium text-red-600">{errors.title}</p>}
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="enquiry_id" className="block text-base font-medium text-gray-700 mb-2">
              Related Enquiry
            </label>
            <div className="mt-1">
              <select
                id="enquiry_id"
                name="enquiry_id"
                value={formData.enquiry_id || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
                disabled={isLoadingEnquiries}
              >
                <option value="">None</option>
                {enquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id}>
                    {enquiry.customer_name} - {enquiry.requirement_details.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="due_date" className="block text-base font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="due_date"
                id="due_date"
                value={formData.due_date || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
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
                <option value="Amit">Amit</option>
                <option value="Prateek">Prateek</option>
              </select>
              {errors.assigned_to && (
                <p className="mt-2 text-sm font-medium text-red-600">{errors.assigned_to}</p>
              )}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="status" className="block text-base font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md ${
                  errors.status ? 'border-red-300' : ''
                }`}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              {errors.status && <p className="mt-2 text-sm font-medium text-red-600">{errors.status}</p>}
            </div>
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
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}
