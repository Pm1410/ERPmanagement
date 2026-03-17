'use client';

import React from 'react';

interface TopNavProps {
  onMenuClick: () => void;
  role: string;
}

export function TopNav({ onMenuClick, role }: TopNavProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-neutral-500 hover:text-neutral-700 md:hidden"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Search Bar - Hidden on small screens */}
        <div className="hidden md:flex items-center bg-neutral-100 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-white transition-all">
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-64 text-neutral-700 placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
          <span className="text-sm font-medium text-primary">A</span>
        </div>
      </div>
    </header>
  );
}
