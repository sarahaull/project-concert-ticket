'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MusicalNoteIcon } from '@heroicons/react/24/solid';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const socialIcons = [
  { icon: FaFacebook, color: '#1877F2', label: 'Facebook' },
  { icon: FaInstagram, color: '#E4405F', label: 'Instagram' },
  { icon: FaTwitter, color: '#1DA1F2', label: 'Twitter' },
  { icon: FaYoutube, color: '#FF0000', label: 'Youtube' },
];

const footerLinks = {
  Menu: ['Beranda', 'Konser', 'Fitur', 'Testimoni'],
  Bantuan: ['Pusat Bantuan', 'Cara Pesan', 'Pembayaran', 'Kebijakan Privasi'],
};

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pastel-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pastel-blue-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pastel-blue-300/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10 py-16">
        <div className="grid md:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.05 }}
                className="bg-gradient-to-br from-pastel-blue-400 to-pastel-blue-600 p-2.5 rounded-2xl shadow-lg shadow-pastel-blue-500/20"
              >
                <MusicalNoteIcon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-pastel-blue-300 to-pastel-blue-400 bg-clip-text text-transparent">
                Ticket<span className="text-white/90">Verse</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Platform pemesanan tiket konser terpercaya di Indonesia. 
              Temukan dan pesan tiket konser favoritmu dengan mudah.
            </p>

            {/* Social Icons with Glassmorphism */}
            <div className="flex gap-3 pt-2">
              {socialIcons.map(({ icon: Icon, color, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                  aria-label={label}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pastel-blue-400/20 to-pastel-blue-600/20 rounded-full blur-md group-hover:blur-xl transition-all duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-full hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/10">
                    <Icon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-lg mb-5 relative inline-block">
                {title}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-pastel-blue-400 to-pastel-blue-600 rounded-full" />
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={link === 'Beranda' ? '/' : `#${link.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white transition-all duration-300 relative group flex items-center gap-2"
                    >
                      <span className="w-0 h-0.5 bg-pastel-blue-400 rounded-full group-hover:w-3 transition-all duration-300" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 relative inline-block">
              Hubungi Kami
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-pastel-blue-400 to-pastel-blue-600 rounded-full" />
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { icon: HiOutlineMail, text: 'support@ticketverse.id' },
                { icon: HiOutlinePhone, text: '+62 21 1234 5678' },
                { icon: HiOutlineLocationMarker, text: 'Jakarta, Indonesia' },
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-pastel-blue-400 group-hover:text-pastel-blue-300 transition-colors flex-shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </motion.li>
              ))}
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-pastel-blue-400">🕐</span>
                <span>Senin - Minggu, 08:00 - 22:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p className="flex items-center gap-2">
            © {new Date().getFullYear()} TicketVerse.
            <span className="hidden sm:inline">All rights reserved.</span>
          </p>
          <div className="flex gap-6">
            {['Syarat & Ketentuan', 'Privasi', 'Cookie'].map((item) => (
              <Link
                key={item}
                href="#"
                className="hover:text-pastel-blue-400 transition-all duration-300 hover:scale-105"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}