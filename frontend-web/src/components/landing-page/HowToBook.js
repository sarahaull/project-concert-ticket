"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Armchair,
  CreditCard,
  QrCode,
  ArrowRight,
  Check,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Pilih Jadwal & Musisi",
    description: "Cari musisi idola atau festival musik yang ingin Anda tonton. Tinjau tanggal, jadwal tampil, dan lokasi venue acara.",
    tag: "Eksplorasi Konser",
  },
  {
    step: "02",
    icon: Armchair,
    title: "Tentukan Kategori & Kursi",
    description: "Pilih posisi terbaik Anda di area Festival Standing, VIP Lounge, atau Tribune bernomor dengan denah interaktif.",
    tag: "Denah Kursi Real-Time",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Pembayaran Cepat & Terenkripsi",
    description: "Selesaikan transaksi secara instan menggunakan QRIS atau Virtual Account bank utama dengan konfirmasi otomatis.",
    tag: "Enkripsi Aman 256-Bit",
  },
  {
    step: "04",
    icon: QrCode,
    title: "Terima E-Tiket Barcode",
    description: "E-tiket barcode resmi langsung tersimpan di akun TicketVerse & terkirim ke email Anda. Cukup scan di pintu masuk venue.",
    tag: "Akses Gate Cepat",
  },
];

export default function HowToBook() {
  const router = useRouter();

  const handleStartBooking = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (!token || !user) {
        router.push("/login");
        return;
      }
    }
    router.push("/cari-acara");
  };

  return (
    <section id="how-to-book" className="relative py-28 sm:py-36 bg-[#030612] text-white overflow-hidden">
      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - Spacious & Clean */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <span>ALUR PEMESANAN PRAKTIS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight"
          >
            4 Langkah Menuju{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
              Panggung Konser
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-300 font-light max-w-xl mx-auto leading-relaxed"
          >
            Pemesanan tiket resmi cepat, aman, dan tanpa perlu repot antre menukar tiket fisik di hari pelaksanaan.
          </motion.p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative p-7 rounded-3xl bg-[#091124]/80 hover:bg-[#0d1833] border border-white/10 hover:border-blue-400/40 shadow-xl flex flex-col justify-between transition-all backdrop-blur-xl"
              >
                {/* Background Watermark Step Number */}
                <span className="absolute top-2 right-4 text-6xl font-black text-white/[0.04] select-none font-mono">
                  {item.step}
                </span>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/25 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                    TAHAP {item.step}
                  </span>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mt-1.5">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-3 border-t border-white/10 flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-blue-300 transition-colors">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>{item.tag}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Clean Spacious CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 p-8 sm:p-10 rounded-3xl bg-[#0b1429]/80 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl"
        >
          <div>
            <h4 className="text-xl sm:text-2xl font-bold text-white">
              Siap Menonton Musisi Favorit Anda?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 max-w-lg">
              Katalog tiket konser populer terus diperbarui. Masuk ke akun Anda dan amankan tiket sebelum kuota habis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartBooking}
            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2.5 flex-shrink-0"
          >
            <span>Pesan Tiket Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
