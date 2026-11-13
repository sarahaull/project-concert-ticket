"use client";

import Link from "next/link";
import {
  MusicalNoteIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaArrowRight,
} from "react-icons/fa";

const navigationLinks = [
  { name: "Beranda", href: "/" },
  { name: "Konser & Jadwal", href: "#concerts" },
  { name: "Keunggulan", href: "#features" },
  { name: "Panduan Pemesanan", href: "#how-to-book" },
  { name: "Ulasan Penonton", href: "#testimonials" },
];

const helpLinks = [
  { name: "Cari Acara", href: "/cari-acara" },
  { name: "Pusat Bantuan", href: "/faq" },
  { name: "Tentang Kami", href: "/about" },
  { name: "Kontak & Kerjasama", href: "/contact" },
  { name: "Kebijakan Privasi", href: "#" },
  { name: "Syarat & Ketentuan", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#02050e] text-slate-300 overflow-hidden border-t border-white/10 pt-20 pb-14">
      {/* Decorative ambient lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16 border-b border-white/10">
          {/* Brand & About (Col 4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <MusicalNoteIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Ticket<span className="text-blue-400">Verse</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 font-light leading-relaxed max-w-sm">
              Platform penjualan tiket konser musik dan pertunjukan langsung resmi di Indonesia. Jaminan 100% tiket asli langsung dari promotor dengan integrasi QR digital instan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaTwitter, href: "#", label: "Twitter" },
                { icon: FaTiktok, href: "#", label: "TikTok" },
                { icon: FaYoutube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-blue-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigasi
            </h4>
            <ul className="space-y-3 text-sm">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-300 transition-colors font-light flex items-center gap-1.5"
                  >
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Legal (Col 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Layanan & Bantuan
            </h4>
            <ul className="space-y-3 text-sm">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-300 transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <EnvelopeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>support@ticketverse.id</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>+62 21 5088 9900</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPinIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Jakarta Selatan, DKI Jakarta</span>
              </li>
            </ul>

            {/* Newsletter Mini Form */}
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-400 mb-2">
                Dapatkan info jadwal tur & presale konser:
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Alamat email Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center transition-colors"
                  aria-label="Kirim"
                >
                  <FaArrowRight className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Verified Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
            <span>© {new Date().getFullYear()} TicketVerse Indonesia. Hak Cipta Dilindungi.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Metode Resmi: QRIS • BCA • Mandiri • BRI • BNI • Visa • Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
