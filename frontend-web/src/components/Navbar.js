"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MusicalNoteIcon, UserIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { removeToken } from "@/utils/api";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Konser", href: "#concerts" },
  { name: "Fitur", href: "#features" },
  { name: "Testimoni", href: "#testimonials" },
];

export default function Navbar({ user }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0a0e1a]/80 backdrop-blur-xl shadow-lg shadow-black/30 border-b border-white/10 py-3 text-white"
          : "bg-transparent py-5 text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isScrolled
                ? "bg-blue-500/20 border border-blue-400/30"
                : "bg-white/10 backdrop-blur-sm border border-white/20"
            }`}
          >
            <MusicalNoteIcon className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xl font-light tracking-tight">
            <span className="text-white">Ticket</span>
            <span className="font-medium text-blue-400 ml-0.5">Verse</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-light tracking-wide text-white/70 hover:text-white transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {/* User Profile & Logout / Login button */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <span className="text-xs font-medium text-white/90 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-white transition-all duration-300"
                title="Logout"
              >
                <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all duration-300"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center gap-1.5 w-8 h-8 group"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-6 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden bg-[#0f1a2e]/95 backdrop-blur-xl border-t border-white/10"
        >
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-2">
            {user && (
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-sm font-light"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleLogout}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-300 border border-red-500/30 py-3 rounded-xl font-medium text-sm hover:bg-red-500/30 transition-colors duration-200"
              >
                <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-center py-3 rounded-xl font-medium text-sm shadow-md"
              >
                Masuk
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}