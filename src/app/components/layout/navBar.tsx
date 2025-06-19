// components/Navbar.tsx
'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LanguageSwitcher } from './languageSwitcher';
import Link from 'next/link';
import type { Route } from 'next';

const Navbar = () => {
  const homeRoute = '/' as Route;
  return (
    <nav className="bg-white dark:bg-deepblue border-b border-gray-200">
      <div className="mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}

          <div className="flex-shrink-1 flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <SidebarTrigger data-testid="hamburger-menu" />
            </div>
            <Link
              href={homeRoute}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              LazyP
            </Link>
          </div>
          <div className="flex items-right space-x-4">
            {/* Theme toggle - always visible */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
