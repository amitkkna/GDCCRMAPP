"use client";

import React from 'react';

interface DashboardTabsProps {
  activeTab: 'Amit' | 'Prateek';
  onTabChange: (tab: 'Amit' | 'Prateek') => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as 'Amit' | 'Prateek')}
        >
          <option value="Amit">Amit</option>
          <option value="Prateek">Prateek</option>
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => onTabChange('Amit')}
              className={`${
                activeTab === 'Amit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              aria-current={activeTab === 'Amit' ? 'page' : undefined}
            >
              Amit
            </button>
            <button
              onClick={() => onTabChange('Prateek')}
              className={`${
                activeTab === 'Prateek'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              aria-current={activeTab === 'Prateek' ? 'page' : undefined}
            >
              Prateek
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
