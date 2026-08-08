'use client';

import { useState } from 'react';
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const userData = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'Premium Member',
  };

  // Notifikasi dummy
  const notifications = [
    { id: 1, message: 'Tiket konser Anda dikonfirmasi!', time: '5 menit lalu' },
    { id: 2, message: 'Promo 20% untuk member premium', time: '1 jam lalu' },
    { id: 3, message: 'Jangan lewatkan konser minggu depan!', time: '3 jam lalu' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-champagne/20 to-ivory flex">
      {/* Sidebar */}
      <Sidebar open={mobileMenuOpen} setOpen={setMobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-warm-taupe/20 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-champagne/50 text-navy transition"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search bar (dekoratif) */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-ivory/80 border border-warm-taupe/20 text-navy/60 text-sm">
              <Search className="h-4 w-4 text-warm-taupe" />
              <span>Cari acara konser...</span>
              <kbd className="ml-2 px-2 py-0.5 text-[10px] font-mono bg-white/50 rounded border border-warm-taupe/20 text-warm-taupe">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge member */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-navy/5 to-sapphire/5 border border-sapphire/10 text-sapphire text-xs font-medium">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Premium</span>
            </div>

            {/* Notifikasi */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2.5 rounded-full hover:bg-champagne/50 text-sapphire transition"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-warm-taupe/20 py-2 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-warm-taupe/20 flex items-center justify-between">
                    <span className="font-semibold text-navy text-sm">Notifikasi</span>
                    <button className="text-[10px] text-sapphire/60 hover:text-sapphire transition">
                      Tandai semua dibaca
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-champagne/30 transition cursor-pointer border-b border-warm-taupe/10 last:border-0"
                      >
                        <p className="text-sm text-navy/80">{notif.message}</p>
                        <p className="text-[10px] text-warm-taupe mt-0.5">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-warm-taupe/20">
                    <button className="w-full text-center text-xs text-sapphire hover:text-navy transition font-medium">
                      Lihat semua notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-white/70 hover:bg-champagne/30 transition border border-warm-taupe/20 shadow-sm"
              >
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-sapphire/20 shadow-sm"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-navy leading-tight">
                    {userData.name}
                  </p>
                  <p className="text-[10px] text-warm-taupe">{userData.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-warm-taupe hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-warm-taupe/20 py-2 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-warm-taupe/20">
                    <p className="font-semibold text-navy">{userData.name}</p>
                    <p className="text-xs text-warm-taupe">{userData.email}</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-navy/70 hover:bg-champagne/30 transition">
                    <User className="h-4 w-4 text-sapphire" /> Profil Saya
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-navy/70 hover:bg-champagne/30 transition">
                    <Settings className="h-4 w-4 text-sapphire" /> Pengaturan
                  </button>
                  <hr className="my-1 border-warm-taupe/20" />
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50/50 transition">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}