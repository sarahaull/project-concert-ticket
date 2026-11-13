"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MusicalNoteIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
  TicketIcon,
  QueueListIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { name: "Beranda", href: "/", icon: HomeIcon },
  { name: "Konser", href: "#concerts", icon: CalendarDaysIcon },
  { name: "Keunggulan", href: "#features", icon: SparklesIcon },
  { name: "Cara Pesan", href: "#how-to-book", icon: QueueListIcon },
  { name: "Testimoni", href: "#testimonials", icon: ChatBubbleLeftEllipsisIcon },
];

export default function Navbar({ user: initialUser }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(initialUser || null);

  useEffect(() => {
    if (!initialUser && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Gagal membaca session user:", err);
      }
    }
  }, [initialUser]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScrollClose = () => setIsDropdownOpen(false);
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    const role = (user.role || "").toLowerCase();
    if (role === "super_admin") return "/superadmin/dashboard";
    if (role === "event_organizer" || role === "organizer") return "/organizer/dashboard";
    return "/dashboard";
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#050914]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/60 py-3.5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Clean Luxury Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <MusicalNoteIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Ticket<span className="text-blue-400">Verse</span>
            </span>
            <span className="text-[9px] font-medium tracking-[0.25em] text-slate-400 uppercase mt-1">
              Official Platform
            </span>
          </div>
        </Link>

        {/* Clean Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* User Auth Buttons / Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl hover:bg-white/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    (user.name || user.fullname || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left max-w-[120px] truncate">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user.name || user.fullname || "Akun Saya"}
                  </p>
                  <p className="text-[10px] text-blue-300/70 uppercase tracking-wider leading-none">
                    {user.role || "Member"}
                  </p>
                </div>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-60 bg-[#091024]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-50 divide-y divide-white/10"
                  >
                    <div className="p-4 bg-white/[0.02]">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.name || user.fullname || "Pengguna"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email || ""}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                        {user.role || "Customer"}
                      </span>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Squares2X2Icon className="w-4 h-4 text-blue-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <UserCircleIcon className="w-4 h-4 text-blue-400" />
                        <span>Profil Saya</span>
                      </Link>
                      <Link
                        href="/tickets"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <TicketIcon className="w-4 h-4 text-blue-400" />
                        <span>Tiket Saya</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 text-blue-400" />
                        <span>Pengaturan</span>
                      </Link>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors"
                      >
                        <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors"
          aria-label="Menu Navigasi"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-5 h-5 text-white" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-[#070c1c]/98 backdrop-blur-2xl border-t border-white/10 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-2">
              {user && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || user.fullname || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name || user.fullname || "Pengguna"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                    {user.role || "Customer"}
                  </span>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-slate-300 hover:text-white py-2.5 px-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  <link.icon className="w-5 h-5 text-blue-400" />
                  {link.name}
                </Link>
              ))}

              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                {user ? (
                  <>
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-slate-200 hover:text-white py-2.5 px-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                    >
                      <Squares2X2Icon className="w-5 h-5 text-blue-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-slate-200 hover:text-white py-2.5 px-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                    >
                      <UserCircleIcon className="w-5 h-5 text-blue-400" />
                      Profil Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-rose-300 hover:text-rose-100 py-2.5 px-3.5 rounded-xl hover:bg-rose-500/20 transition-colors text-sm font-medium"
                    >
                      <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                      Keluar
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-all text-center"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all text-center"
                    >
                      Daftar Akun
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
