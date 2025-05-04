"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Enquiries', href: '/enquiries', icon: FileText },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="text-white hover:text-blue-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 text-lg font-bold text-white">CRM Tracker</span>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex flex-col w-80 h-full max-w-xs bg-white shadow-xl">
          <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <span className="text-xl font-bold text-white">CRM Tracker</span>
            <button
              type="button"
              className="text-white hover:text-blue-100 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-6 w-6 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t">
            <button
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
            >
              <LogOut className="mr-3 h-6 w-6 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
        <div
          className="absolute inset-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        ></div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-0 lg:pb-4">
        <div className="flex items-center justify-center flex-shrink-0 h-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
          <span className="text-2xl font-bold text-white">CRM Tracker</span>
        </div>
        <div className="mt-8 flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-4 mt-6 border-t border-gray-200 pt-4">
          <button
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
