"use client";

import React from 'react';
import MainLayout from '../layout/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout title="Settings" subtitle="Configure your application">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Application Settings</h3>
          <div className="mt-5 border-t border-gray-200 pt-5">
            <p className="text-sm text-gray-500">
              Settings functionality will be implemented in a future update.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
