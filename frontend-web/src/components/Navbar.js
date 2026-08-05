"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Konser", href: "#concerts" },
  { name: "Fitur", href: "#features" },
  { name: "Testimoni", href: "#testimonials" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-200/30 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isScrolled
                ? "bg-blue-50"
                : "bg-white/10 backdrop-blur-sm border border-white/20"
            }`}
          >
            <MusicalNoteIcon
              className={`w-5 h-5 ${
                isScrolled ? "text-blue-500" : "text-white"
              }`}
            />
          </div>
          <span className="text-xl font-light tracking-tight">
            <span
              className={`transition-colors duration-300 ${
                isScrolled ? "text-slate-800" : "text-white"
              }`}
            >
              Ticket
            </span>
            <span
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? "text-slate-600" : "text-white/70"
              }`}
            >
              Verse
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-light tracking-wide transition-colors duration-300 relative ${
                isScrolled
                  ? "text-slate-500 hover:text-slate-800"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.name}
              <span
                className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${
                  isScrolled ? "bg-slate-400" : "bg-white/50"
                }`}
              />
            </Link>
          ))}

          <Link
  href="/register"
  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
    isScrolled
      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200/40"
      : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
  }`}
>
  Pesan Tiket
</Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center gap-1.5 w-8 h-8 group"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-6 transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            } ${isScrolled ? "bg-slate-600" : "bg-white"}`}
          />
          <span
            className={`block h-px w-6 transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            } ${isScrolled ? "bg-slate-600" : "bg-white"}`}
          />
          <span
            className={`block h-px w-6 transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            } ${isScrolled ? "bg-slate-600" : "bg-white"}`}
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
          className="md:hidden overflow-hidden bg-white/80 backdrop-blur-xl border-t border-slate-100/50"
        >
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-slate-900 py-3 px-4 rounded-xl hover:bg-slate-50/80 transition-all duration-200 text-sm font-light tracking-wide"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-3 bg-blue-500 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200"
            >
              Pesan Tiket
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}