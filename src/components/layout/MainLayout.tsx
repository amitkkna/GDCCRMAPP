"use client";

import React from 'react';
import Sidebar from './Sidebar';
import { User } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-end px-4 lg:px-8 h-full">
            {/* User dropdown */}
            <div className="ml-4 flex items-center">
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 p-2 text-sm focus:outline-none hover:shadow-md transition-all duration-200"
              >
                <span className="sr-only">Open user menu</span>
                <User className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="mt-8 lg:mt-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {title}
                  {subtitle && (
                    <span className="ml-4 text-sm font-normal text-gray-500 hidden sm:inline-block">
                      {subtitle}
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
              {subtitle && (
                <p className="mb-6 text-sm text-gray-500 sm:hidden">{subtitle}</p>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
