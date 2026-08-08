'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Ticket,
  History,
  User,
  Settings,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
  Bell,
  Search,
  Heart,
  CreditCard,
  HelpCircle,
  Shield,
  Barcode,
} from 'lucide-react';

// ============================================================
//  MENU SESUAI GAMBAR
// ============================================================
const mainMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Cari Acara', href: '/cari-acara', icon: Search },
  { name: 'Tiket Saya', href: '/tickets', icon: Ticket },
  { name: 'E-Ticket', href: '/eticket', icon: Barcode },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Riwayat Transaksi', href: '/history', icon: History },
  { name: 'Profil Saya', href: '/profile', icon: User },
  { name: 'Metode Pembayaran', href: '/payment', icon: CreditCard },
];

const otherMenu = [
  { name: 'Bantuan & FAQ', href: '/help', icon: HelpCircle },
  { name: 'Kebijakan Privasi', href: '/privacy', icon: Shield },
];

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
    role: 'Premium Member',
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-ivory/95 backdrop-blur-xl border-r border-warm-taupe/30 shadow-2xl shadow-navy/10 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Dekorasi blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sapphire/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

        {/* ===== HEADER ===== */}
        <div className="relative flex h-24 items-center px-6 border-b border-warm-taupe/20 bg-gradient-to-r from-navy to-sapphire">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-ivory/20 backdrop-blur-sm shadow-lg shadow-navy/20">
              <Ticket className="h-7 w-7 text-ivory" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ivory tracking-tight">
                ConcertTix
              </h1>
              <span className="text-[10px] font-medium text-champagne/80 tracking-[0.2em] uppercase">
                Dashboard
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-ivory/10 transition ml-auto"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5 text-ivory/70" />
          </button>
        </div>

        {/* ===== PROFIL ===== */}
        <div className="mx-4 mt-6 p-4 rounded-2xl bg-white/80 border border-warm-taupe/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full ring-2 ring-sapphire/30 object-cover shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy truncate">
                {user.name}
              </p>
              <p className="text-xs text-sapphire/70 truncate flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {user.role}
              </p>
            </div>
            <div className="p-2 rounded-full bg-champagne/50 text-sapphire hover:bg-champagne transition">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ===== NAVIGASI ===== */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Menu Utama */}
          <div className="mb-2">
            <p className="px-4 text-[10px] font-semibold text-warm-taupe/70 uppercase tracking-widest">
              Menu Utama
            </p>
          </div>
          <div className="space-y-0.5">
            {mainMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sapphire/20 to-navy/10 text-navy shadow-sm'
                      : 'text-navy/70 hover:bg-champagne/50 hover:text-navy'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-sapphire to-navy rounded-r-full shadow-sm shadow-sapphire/30" />
                  )}
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive
                        ? 'text-sapphire'
                        : 'text-warm-taupe group-hover:text-sapphire'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-sapphire/60" />
                  )}
                  {!isActive && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-warm-taupe" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Lainnya */}
          <div className="mt-6 mb-2">
            <p className="px-4 text-[10px] font-semibold text-warm-taupe/70 uppercase tracking-widest">
              Lainnya
            </p>
          </div>
          <div className="space-y-0.5">
            {otherMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sapphire/20 to-navy/10 text-navy shadow-sm'
                      : 'text-navy/70 hover:bg-champagne/50 hover:text-navy'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-sapphire to-navy rounded-r-full shadow-sm shadow-sapphire/30" />
                  )}
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive
                        ? 'text-sapphire'
                        : 'text-warm-taupe group-hover:text-sapphire'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-sapphire/60" />
                  )}
                  {!isActive && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-warm-taupe" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ===== CARD NOTIFIKASI ===== */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-champagne/70 to-ivory border border-warm-taupe/30 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-navy/10 text-navy">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-navy">
                  Dapatkan Notifikasi Acara Terbaru!
                </h4>
                <p className="text-xs text-navy/60 mt-1 leading-relaxed">
                  Jangan lewatkan konser favoritmu. Aktifkan notifikasi sekarang!
                </p>
                <button className="mt-3 w-full bg-gradient-to-r from-navy to-sapphire text-ivory text-xs font-medium py-2.5 rounded-xl shadow-lg shadow-navy/20 hover:shadow-navy/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Aktifkan Notifikasi
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* ===== FOOTER LOGOUT ===== */}
        <div className="p-4 border-t border-warm-taupe/20 bg-ivory/40 backdrop-blur-sm">
          <button className="group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-50/50 transition-all duration-200">
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span>Keluar</span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs text-rose-400">→</span>
          </button>
        </div>
      </div>
    </>
  );
}