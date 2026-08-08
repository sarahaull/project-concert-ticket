"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MusicalNoteIcon,
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { name: "Beranda", href: "/", icon: HomeIcon },
  { name: "Konser", href: "#concerts", icon: CalendarDaysIcon },
  { name: "Fitur", href: "#features", icon: SparklesIcon },
  { name: "Testimoni", href: "#testimonials", icon: ChatBubbleLeftEllipsisIcon },
];

export default function Navbar({ user: initialUser }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(initialUser || null);

  // Jika user tidak diberikan sebagai prop, kita bisa ambil dari localStorage atau context di sini.
  // Contoh sederhana: (opsional)
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) setUser(JSON.parse(storedUser));
  // }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScrollClose = () => setIsDropdownOpen(false);
    window.addEventListener("scroll", handleScrollClose);
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginRedirect = () => {
    router.push("/login");
    setIsMobileMenuOpen(false);
  };

  const handleRegisterRedirect = () => {
    router.push("/register");
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0a0e1a]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 border-b border-white/5 py-2.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isScrolled
                ? "bg-gradient-to-br from-sapphire/20 to-navy/30 border border-sapphire/20"
                : "bg-white/10 backdrop-blur-sm border border-white/20"
            }`}
          >
            <MusicalNoteIcon className="w-5 h-5 text-sapphire" />
          </motion.div>
          <span className="text-xl font-light tracking-tight">
            <span className="text-ivory">Ticket</span>
            <span className="font-medium text-sapphire ml-0.5">Verse</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-light tracking-wide text-ivory/70 hover:text-ivory transition-colors duration-300 relative group px-2 py-1.5"
            >
              <span className="flex items-center gap-2">
                <link.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                {link.name}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-sapphire transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {/* User Profile & Auth */}
          {user ? (
            <div className="relative ml-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sapphire to-navy flex items-center justify-center text-sm font-semibold text-ivory shadow-lg shadow-sapphire/20 ring-2 ring-sapphire/30">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <span className="text-xs font-medium text-ivory/90 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-ivory/50 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 bg-[#0f1a2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2.5 border-b border-white/5">
                        <p className="text-sm font-medium text-ivory">{user.name}</p>
                        <p className="text-xs text-ivory/40 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ivory/70 hover:text-ivory hover:bg-white/5 transition-all duration-200"
                        >
                          <UserCircleIcon className="w-5 h-5 text-sapphire" />
                          <span>Profil Saya</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ivory/70 hover:text-ivory hover:bg-white/5 transition-all duration-200"
                        >
                          <Cog6ToothIcon className="w-5 h-5 text-sapphire" />
                          <span>Pengaturan</span>
                        </Link>
                      </div>
                      <div className="border-t border-white/5 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200"
                        >
                          <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full text-sm font-medium text-ivory/80 hover:text-ivory border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-sapphire to-navy text-ivory hover:shadow-lg hover:shadow-sapphire/30 transition-all duration-300 hover:scale-105"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/5 transition-colors duration-200 group"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-ivory" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-ivory" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#0f1a2e]/98 backdrop-blur-2xl border-t border-white/5"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
              {/* User info if logged in */}
              {user && (
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-white/5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sapphire to-navy flex items-center justify-center text-base font-semibold text-ivory shadow-lg shadow-sapphire/20 ring-2 ring-sapphire/30">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ivory">{user.name}</p>
                    <p className="text-xs text-ivory/40 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-ivory/70 hover:text-ivory py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-sm font-light"
                >
                  <link.icon className="w-5 h-5 text-sapphire" />
                  {link.name}
                </Link>
              ))}

              {/* Auth Buttons */}
              {user ? (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-ivory/70 hover:text-ivory py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-sm"
                  >
                    <UserCircleIcon className="w-5 h-5 text-sapphire" />
                    Profil Saya
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-ivory/70 hover:text-ivory py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-sm"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-sapphire" />
                    Pengaturan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-rose-400 hover:text-rose-300 py-3 px-3 rounded-xl hover:bg-rose-500/10 transition-all duration-200 text-sm"
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-ivory py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-sapphire to-navy text-ivory py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-sapphire/20"
                  >
                    <UserIcon className="w-5 h-5" />
                    Daftar Akun
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}