'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface PortalLayoutProps {
  children: React.ReactNode;
  role: 'STUDENT' | 'FACULTY' | 'MANAGEMENT' | 'PARENT' | 'SUPER_ADMIN';
}

export function PortalLayout({ children, role }: PortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 flex-col md:flex-row">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar role={role} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} role={role} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
