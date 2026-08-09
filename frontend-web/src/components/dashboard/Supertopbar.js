// components/dashboard/Superbar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function Superbar({
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
  title = 'Dashboard',
  breadcrumb = '/ Super Admin',
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Toggle functions
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  // Close menus when clicking outside (simplified)
  const closeMenus = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  // Notification data (dummy)
  const notifications = [
    { id: 1, text: 'Event baru: Coldplay World Tour', time: '5 menit lalu', read: false },
    { id: 2, text: 'Transaksi #TRX-2025-001 berhasil', time: '15 menit lalu', read: false },
    { id: 3, text: 'Refund #REF-2025-018 diproses', time: '1 jam lalu', read: true },
    { id: 4, text: 'User baru: aisyahp@gmail.com', time: '2 jam lalu', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#112250] border-b border-[#3B507D]/40 px-4 py-3 flex items-center justify-between shadow-lg shadow-[#112250]/20">
      {/* Left Section: Hamburger + Title */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-[#3B507D]/30 transition-colors duration-200 text-[#F5F4F0]"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Mobile logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#3B507D]/30 border border-[#3B507D]/40">
              <HomeIcon className="w-5 h-5 text-[#E7E2CE]" />
            </div>
            <span className="text-lg font-light tracking-tight text-[#F5F4F0] hidden sm:inline">
              Ticket<span className="font-medium text-[#BEB7A7]">Verse</span>
            </span>
          </Link>

          <span className="hidden sm:inline-block text-[#BEB7A7] text-sm font-light mx-1">/</span>
          <h1 className="text-lg font-semibold text-[#F5F4F0] hidden sm:block">{title}</h1>
          <span className="text-xs text-[#BEB7A7]/60 hidden md:inline-block ml-1">
            {breadcrumb}
          </span>
        </div>
      </div>

      {/* Right Section: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-[#0A1434]/60 border border-[#3B507D]/30 rounded-xl px-3 py-1.5 focus-within:border-[#3B507D] focus-within:ring-1 focus-within:ring-[#3B507D] transition-all duration-200">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#BEB7A7]" />
          <input
            type="text"
            placeholder="Cari event, user, transaksi..."
            className="bg-transparent border-none outline-none text-[#F5F4F0] text-sm placeholder-[#BEB7A7]/50 w-48 lg:w-64"
          />
        </div>

        {/* Search icon - mobile only */}
        <button className="p-2 rounded-xl hover:bg-[#3B507D]/30 transition-colors duration-200 md:hidden text-[#BEB7A7]">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-xl hover:bg-[#3B507D]/30 transition-colors duration-200 relative text-[#BEB7A7] hover:text-[#F5F4F0]"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#112250]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0A1434] border border-[#3B507D]/40 rounded-2xl shadow-2xl shadow-[#112250]/50 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#3B507D]/30">
                <span className="text-sm font-semibold text-[#F5F4F0]">Notifikasi</span>
                <span className="ml-2 text-xs text-[#BEB7A7]">({unreadCount} baru)</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-2.5 hover:bg-[#3B507D]/20 transition-colors duration-150 border-b border-[#3B507D]/10 last:border-0 ${
                      !notif.read ? 'bg-[#3B507D]/10' : ''
                    }`}
                  >
                    <p className="text-sm text-[#E7E2CE]">{notif.text}</p>
                    <span className="text-xs text-[#BEB7A7]">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[#3B507D]/30 text-center">
                <Link
                  href="/admin/notifications"
                  className="text-xs text-[#3B507D] hover:text-[#BEB7A7] transition-colors duration-200"
                >
                  Lihat semua notifikasi
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0A1434] border border-[#3B507D]/40 hover:border-[#3B507D] transition-all duration-200 group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B507D] to-[#112250] flex items-center justify-center text-xs font-bold text-[#F5F4F0] border border-[#3B507D]/30">
              SA
            </div>
            <span className="text-sm font-medium text-[#E7E2CE] hidden sm:block group-hover:text-[#F5F4F0] transition-colors">
              Super Admin
            </span>
            <ChevronDownIcon className={`w-4 h-4 text-[#BEB7A7] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0A1434] border border-[#3B507D]/40 rounded-2xl shadow-2xl shadow-[#112250]/50 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#3B507D]/30">
                <p className="text-sm font-semibold text-[#F5F4F0]">Super Admin</p>
                <p className="text-xs text-[#BEB7A7]">superadmin@ticketverse.com</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E7E2CE] hover:bg-[#3B507D]/20 transition-colors duration-150"
                >
                  <UserCircleIcon className="w-5 h-5 text-[#BEB7A7]" />
                  <span>Profil Saya</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E7E2CE] hover:bg-[#3B507D]/20 transition-colors duration-150"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-[#BEB7A7]" />
                  <span>Pengaturan</span>
                </Link>
              </div>
              <div className="border-t border-[#3B507D]/30 py-1">
                <button
                  onClick={() => {/* handle logout */}}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}