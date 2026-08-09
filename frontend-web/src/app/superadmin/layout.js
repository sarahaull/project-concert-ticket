// src/app/superadmin/layout.js
'use client';

import { useState, useEffect } from 'react';
import Superbar from '@/components/dashboard/Superbar';
import Supertopbar from '@/components/dashboard/Supertopbar';


export default function SuperAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fungsi untuk mendapatkan title berdasarkan path
  const getPageTitle = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/events')) return 'Manajemen Event';
      if (path.includes('/organizers')) return 'Manajemen Organizers';
      if (path.includes('/users')) return 'Manajemen Users';
      if (path.includes('/tickets')) return 'Manajemen Tiket';
      if (path.includes('/transactions')) return 'Manajemen Transaksi';
      if (path.includes('/refunds')) return 'Manajemen Refund';
      if (path.includes('/promos')) return 'Manajemen Promo';
      if (path.includes('/banners')) return 'Manajemen Banner';
      if (path.includes('/announcements')) return 'Manajemen Announcements';
      if (path.includes('/analytics')) return 'Analytics';
      if (path.includes('/reports')) return 'Reports';
      if (path.includes('/export')) return 'Export Data';
      if (path.includes('/roles')) return 'Roles & Permissions';
      if (path.includes('/logs')) return 'System Logs';
      if (path.includes('/settings')) return 'Settings';
      return 'Dashboard';
    }
    return 'Dashboard';
  };

  // Fungsi untuk mendapatkan breadcrumb
  const getBreadcrumb = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        const lastSegment = segments[segments.length - 1];
        const capitalized = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
        return `/ Super Admin / ${capitalized}`;
      }
      return '/ Super Admin';
    }
    return '/ Super Admin';
  };

  return (
    <div className="min-h-screen bg-[#E7E2CE]">
      

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Supertopbar */}
        <Supertopbar />

        {/* Superbar */}
        <Superbar
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title={getPageTitle()}
          breadcrumb={getBreadcrumb()}
        />

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}