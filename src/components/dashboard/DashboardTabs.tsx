"use client";

import React from 'react';

interface DashboardTabsProps {
  activeTab: 'Amit' | 'Prateek';
  onTabChange: (tab: 'Amit' | 'Prateek') => void;
  onRefresh?: () => void;
}

export default function DashboardTabs({ activeTab, onTabChange, onRefresh }: DashboardTabsProps) {
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
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-green-600 hover:border-green-300 hover:text-green-700 font-medium text-sm flex items-center"
                title="Refresh dashboard data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
