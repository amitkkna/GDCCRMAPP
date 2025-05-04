"use client";

import React, { useState, useEffect } from 'react';
import { Enquiry } from '@/types/database.types';
import Button from './ui/Button';
import EnquiryList from './EnquiryList';
import EnquiryForm from './EnquiryForm';
import { getEnquiries, getEnquiriesByAssignee, createEnquiry, updateEnquiry } from '@/lib/api';

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState<Enquiry | null>(null);
  const [assignedTo, setAssignedTo] = useState<'Amit' | 'Prateek' | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignedTo) {
      fetchEnquiries();
    } else {
      setEnquiries([]);
      setIsLoading(false);
    }
  }, [assignedTo]);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Enquiry[];
      if (assignedTo) {
        data = await getEnquiriesByAssignee(assignedTo);
      } else {
        data = await getEnquiries();
      }
      setEnquiries(data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries. Please make sure your Supabase configuration is correct.');
      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEnquiry = async (data: Omit<Enquiry, 'id' | 'created_at'>) => {
    try {
      const newEnquiry = await createEnquiry(data);
      if (newEnquiry) {
        setEnquiries((prev) => [newEnquiry, ...prev]);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating enquiry:', error);
    }
  };

  const handleUpdateEnquiry = async (data: Omit<Enquiry, 'created_at'>) => {
    try {
      const updatedEnquiry = await updateEnquiry(data.id, data);
      if (updatedEnquiry) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === updatedEnquiry.id ? updatedEnquiry : item))
        );
        setShowForm(false);
        setCurrentEnquiry(null);
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
    if (currentEnquiry) {
      handleUpdateEnquiry({ ...data, id: currentEnquiry.id });
    } else {
      handleCreateEnquiry(data);
    }
  };

  const handleSelectAssignee = (name: 'Amit' | 'Prateek') => {
    setAssignedTo(name);
  };

  if (!assignedTo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-8">CRM Enquiry Management</h1>
          <div className="space-y-4">
            <Button
              fullWidth
              size="lg"
              onClick={() => handleSelectAssignee('Amit')}
            >
              Amit
            </Button>
            <Button
              fullWidth
              size="lg"
              onClick={() => handleSelectAssignee('Prateek')}
            >
              Prateek
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Enquiry Management</h1>
            <p className="text-gray-600">Assigned to: {assignedTo}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setAssignedTo(null)}>
              Change User
            </Button>
            {!showForm && (
              <Button onClick={handleNewEnquiry}>New Enquiry</Button>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentEnquiry ? 'Edit Enquiry' : 'New Enquiry'}
            </h2>
            <EnquiryForm
              initialData={currentEnquiry || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              assignedTo={assignedTo}
            />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading enquiries...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
                <p className="mt-2 text-gray-600">
                  Please check your Supabase configuration in .env.local file.
                </p>
              </div>
            ) : (
              <EnquiryList enquiries={enquiries} onEdit={handleEditEnquiry} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
