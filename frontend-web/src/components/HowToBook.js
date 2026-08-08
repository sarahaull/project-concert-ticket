"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaSearch,
  FaChair,
  FaCreditCard,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

const steps = [
  {
    id: 1,
    icon: FaSearch,
    title: "Pilih Event",
    description: "Jelajahi ribuan konser dan festival. Temukan acara favoritmu dengan mudah.",
    color: "from-navy to-sapphire",
    bg: "bg-ivory",
    border: "border-navy/20",
    accent: "text-navy",
    iconBg: "bg-navy",
  },
  {
    id: 2,
    icon: FaChair,
    title: "Pilih Kursi",
    description: "Lihat denah kursi interaktif. Pilih posisi terbaik untuk pengalaman maksimal.",
    color: "from-sapphire to-navy",
    bg: "bg-ivory",
    border: "border-sapphire/20",
    accent: "text-sapphire",
    iconBg: "bg-sapphire",
  },
  {
    id: 3,
    icon: FaCreditCard,
    title: "Bayar",
    description: "Transaksi aman dengan berbagai metode pembayaran. Proses cepat dan mudah.",
    color: "from-navy to-sapphire",
    bg: "bg-ivory",
    border: "border-navy/20",
    accent: "text-navy",
    iconBg: "bg-navy",
  },
  {
    id: 4,
    icon: FaEnvelope,
    title: "Terima Tiket",
    description: "E-tiket dikirim ke email Anda. Scan QR code untuk masuk acara.",
    color: "from-sapphire to-navy",
    bg: "bg-ivory",
    border: "border-sapphire/20",
    accent: "text-sapphire",
    iconBg: "bg-sapphire",
  },
];

export default function HowToBook() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 overflow-hidden bg-ivory"
    >
      {/* Background dekorasi */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-champagne/10 to-ivory" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sapphire/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-champagne/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-warm-taupe/30 shadow-sm mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-sapphire/60 animate-pulse" />
            <span className="text-xs font-medium text-navy tracking-wider uppercase">Panduan</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy leading-[1.1] tracking-tight">
            Cara <span className="bg-gradient-to-r from-navy to-sapphire bg-clip-text text-transparent">Pesan</span> Tiket
          </h2>
          <p className="mt-4 text-base sm:text-lg text-sapphire/70 max-w-2xl mx-auto">
            Ikuti langkah mudah ini untuk mendapatkan tiket event impian Anda.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Garis vertikal tengah */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-navy via-sapphire to-navy opacity-30 hidden md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-12 md:mb-16 last:mb-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Icon & nomor (di tengah) */}
                <div className="md:absolute md:left-1/2 md:-translate-x-1/2 z-20 flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl shadow-navy/20 border-4 border-white`}
                  >
                    <Icon className="text-xl md:text-2xl text-white" />
                  </motion.div>
                  <div className="mt-2 text-xs font-bold text-warm-taupe bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-warm-taupe/20">
                    Step {step.id}
                  </div>
                </div>

                {/* Konten card */}
                <div
                  className={`flex-1 md:w-[calc(50%-40px)] ${
                    isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                  }`}
                >
                  <motion.div
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.3, type: "spring", stiffness: 300 },
                    }}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border ${step.border} shadow-lg hover:shadow-xl transition-shadow duration-300`}
                  >
                    <h3 className={`text-xl font-bold ${step.accent} mb-2`}>
                      {step.title}
                    </h3>
                    <p className="text-sapphire/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-warm-taupe">
                      <span className="w-8 h-0.5 bg-warm-taupe/30 rounded-full" />
                      <span>Langkah {step.id} dari {steps.length}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tombol CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 50px -10px rgba(17,34,80,0.4)" }}
            whileTap={{ scale: 0.96 }}
            className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-navy to-sapphire text-ivory font-semibold text-base shadow-xl shadow-navy/20 transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Mulai Pesan Tiket</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <FaArrowRight className="text-sm" />
            </motion.span>
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </motion.button>
          <p className="mt-4 text-sm text-warm-taupe">Tanpa ribet, langsung dapat tiketnya</p>
        </motion.div>
      </div>
    </section>
  );
}