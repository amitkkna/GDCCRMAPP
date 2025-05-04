"use client";

import React from 'react';
import { Customer } from '@/types/database.types';
import { Edit, Eye } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: ((customer: Customer) => void) | null; // Can be null for read-only mode
}

export default function CustomerList({ customers, onEdit }: CustomerListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No customers found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">Customer List</h3>
        <p className="mt-1 text-sm text-gray-500">
          Total customers: {customers.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {customer.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(customer.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {onEdit ? (
                      <button
                        onClick={() => onEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-150"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    ) : null}
                    <button
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-150"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
