"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaSearch,
  FaChair,
  FaCreditCard,
  FaEnvelope,
  FaArrowRight,
  FaMusic,
  FaRegSmile,
} from "react-icons/fa";

const steps = [
  {
    id: 1,
    icon: FaSearch,
    title: "Pilih Event",
    description: "Temukan acara favorit Anda",
    color: "from-blue-300/80 to-blue-400/80",
    bg: "bg-blue-50/70",
    border: "border-blue-200/40",
    shadow: "shadow-blue-200/30",
    accent: "text-blue-500",
  },
  {
    id: 2,
    icon: FaChair,
    title: "Pilih Kursi",
    description: "Tentukan lokasi tempat duduk",
    color: "from-indigo-300/80 to-indigo-400/80",
    bg: "bg-indigo-50/70",
    border: "border-indigo-200/40",
    shadow: "shadow-indigo-200/30",
    accent: "text-indigo-500",
  },
  {
    id: 3,
    icon: FaCreditCard,
    title: "Bayar",
    description: "Pilih metode pembayaran",
    color: "from-violet-300/80 to-violet-400/80",
    bg: "bg-violet-50/70",
    border: "border-violet-200/40",
    shadow: "shadow-violet-200/30",
    accent: "text-violet-500",
  },
  {
    id: 4,
    icon: FaEnvelope,
    title: "Terima Tiket",
    description: "E-tiket dikirim ke email",
    color: "from-teal-300/80 to-teal-400/80",
    bg: "bg-teal-50/70",
    border: "border-teal-200/40",
    shadow: "shadow-teal-200/30",
    accent: "text-teal-500",
  },
];

const StepCard = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -16,
        scale: 1.03,
        transition: { duration: 0.4, type: "spring", stiffness: 250, damping: 20 },
      }}
      className={`relative group rounded-3xl p-8 border ${step.bg} ${step.border} backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${step.shadow} hover:${step.shadow.replace('30', '50')} bg-white/70 flex flex-col items-start`}
      style={{
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)",
      }}
    >
      {/* Nomor langkah besar sebagai elemen dekoratif */}
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/60 flex items-center justify-center text-2xl font-bold text-slate-300/60 shadow-xl shadow-black/5">
        {String(step.id).padStart(2, "0")}
      </div>

      {/* Lingkaran ikon dengan gradasi & bayangan artistik */}
      <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-xl ${step.shadow} group-hover:${step.shadow.replace('30', '50')} transition-all duration-500`}>
        <Icon className="text-3xl text-white drop-shadow-sm" />
        {/* Lingkaran dekoratif di luar ikon */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-500 scale-105 group-hover:scale-110" />
      </div>

      {/* Judul */}
      <h3 className={`text-2xl font-bold text-slate-800 mb-2 tracking-tight ${step.accent}`}>
        {step.title}
      </h3>

      {/* Deskripsi */}
      <p className="text-slate-500 text-base leading-relaxed">
        {step.description}
      </p>

      {/* Garis dekoratif bawah dengan efek gradasi */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-200/60 to-transparent rounded-full transition-all duration-700 ease-out" />

      {/* Panah indikator dengan animasi */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        whileHover={{ opacity: 1, x: 4 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-6 right-6 text-slate-300 group-hover:text-blue-400 transition-colors duration-300"
      >
        <FaArrowRight className="text-lg" />
      </motion.div>
    </motion.div>
  );
};

export default function HowToBook() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 overflow-hidden"
    >
      {/* Background halus dengan gradasi dan orbs yang tidak beraturan */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-white to-blue-100/40" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-200/10 rounded-full blur-3xl" />
        {/* Pola titik-titik halus */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Badge dengan desain unik */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-blue-200/40 shadow-sm mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-pulse" />
            <span className="text-xs font-medium text-blue-600 tracking-wider uppercase">Panduan</span>
          </motion.div>

          {/* Judul utama */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 leading-[1.1] tracking-tight"
          >
            Cara <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Pesan</span> Tiket
          </motion.h2>

          {/* Subjudul */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Langkah mudah menuju event impian Anda, mulai dari memilih hingga tiket di tangan.
          </motion.p>

          {/* Garis dekoratif dengan elemen unik */}
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "100px" } : { width: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mt-5 rounded-full"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-3 h-3 rounded-full bg-blue-300/60 mx-auto mt-1.5 shadow-md shadow-blue-200/50"
          />
        </motion.div>

        {/* Grid Langkah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* Footer CTA dengan desain yang lebih menarik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="text-center mt-16 md:mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 20px 50px -10px rgba(59,130,246,0.4)" }}
            whileTap={{ scale: 0.96 }}
            className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-blue-200/50 transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Mulai Pesan Tiket</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <FaArrowRight className="text-sm" />
            </motion.span>
            {/* Efek glow di hover */}
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </motion.button>
          <p className="mt-4 text-sm text-slate-400">Tanpa ribet, langsung dapat tiketnya</p>
        </motion.div>
      </div>
    </section>
  );
}