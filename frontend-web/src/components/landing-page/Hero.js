"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import {
  ShieldCheck,
  Music,
  Clock,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Calendar,
  Radio,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

// Clean Countdown Box for Featured Card
const FeaturedCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 8, minutes: 22, seconds: 40 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {[
        { label: "Hari", value: timeLeft.days },
        { label: "Jam", value: timeLeft.hours },
        { label: "Menit", value: timeLeft.minutes },
        { label: "Detik", value: timeLeft.seconds },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-md">
            <span className="text-xs font-bold text-white font-mono">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity && selectedCity !== "Semua Lokasi") params.set("location", selectedCity);

    const qs = params.toString();
    router.push(`/cari-acara${qs ? `?${qs}` : ""}`);
  };

  const handleChipClick = (keyword) => {
    setSearchQuery(keyword);
    router.push(`/cari-acara?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <section className="relative min-h-[96vh] flex items-center overflow-hidden bg-[#040814] text-white pt-32 pb-20 lg:py-32 px-4 sm:px-6 lg:px-8">
      {/* Background Soft Stage Lighting & Concert Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=2000&q=80&auto=format&fit=crop"
          alt="Concert Stage Atmosphere"
          fill
          priority
          className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/80 to-[#040814]" />
        <div className="absolute inset-0 bg-radial-at-c from-blue-600/15 via-transparent to-[#040814]" />

        {/* Luminous Spotlights */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[400px] bg-indigo-600/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-sky-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* ========================================================
              LEFT COLUMN: Editorial Typography & Fast Action
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Live Feed Status Pill + Audio Wavelet */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 backdrop-blur-md mb-6"
            >
              <div className="flex items-center gap-1">
                {[0.4, 0.9, 0.5, 1.0, 0.6].map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 bg-blue-400 rounded-full"
                    animate={{ height: ["20%", `${h * 100}%`, "20%"] }}
                    transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ height: "14px" }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">
                Platform Tiket Konser Resmi Indonesia
              </span>
            </motion.div>

            {/* Editorial Heading (Clean, Balanced, Non-Shouty) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08]"
            >
              Temukan Konser & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
                Momen Musik Terbaik
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl"
            >
              Bermitra resmi langsung dengan promotor nasional. Pilih kursi favorit secara presisi, bayar instan tanpa calo, dan nikmati kemudahan e-tiket digital langsung di ponsel Anda.
            </motion.p>

            {/* Clean Fast Search Capsule */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="w-full max-w-xl mt-8 p-2 rounded-2xl bg-[#091124]/90 border border-white/15 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 w-full flex items-center">
                  <FaSearch className="absolute left-3.5 w-4 h-4 text-blue-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari artis, konser, venue..."
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] text-sm text-white placeholder-slate-400 outline-none border border-white/10 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Location Select */}
                <div className="relative w-full sm:w-44 flex items-center">
                  <FaMapMarkerAlt className="absolute left-3.5 w-3.5 h-3.5 text-sky-400 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] text-xs text-white outline-none border border-white/10 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#091124] text-white">Semua Lokasi</option>
                    <option value="Jakarta" className="bg-[#091124] text-white">Jakarta</option>
                    <option value="Bandung" className="bg-[#091124] text-white">Bandung</option>
                    <option value="Surabaya" className="bg-[#091124] text-white">Surabaya</option>
                    <option value="Bali" className="bg-[#091124] text-white">Bali</option>
                    <option value="Yogyakarta" className="bg-[#091124] text-white">Yogyakarta</option>
                  </select>
                </div>

                {/* Search CTA */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <span>Cari</span>
                  <FaArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.form>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400"
            >
              <span className="text-slate-400 mr-1 font-medium">Tren:</span>
              {["Coldplay", "Sheila On 7", "Tulus", "BLACKPINK", "Bernadya"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleChipClick(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-xs"
                >
                  #{tag}
                </button>
              ))}
            </motion.div>

            {/* 3 Live Metric Badges (Enriches the Left Column without feeling empty) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 sm:gap-8 mt-10 pt-8 border-t border-white/10 w-full max-w-xl"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">120K+</p>
                <p className="text-xs text-slate-400 mt-0.5">Tiket Terverifikasi</p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Garansi Resmi</p>
              </div>
              <div className="border-l border-white/10 pl-6">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">50+</p>
                <p className="text-xs text-slate-400 mt-0.5">Kota di Indonesia</p>
              </div>
            </motion.div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: Layered 3D Showcase (Coldplay + Peeking Card)
             ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center py-6"
          >
            {/* Background Layer 2: Peeking Tilted Card Behind (Creates 3D Depth) */}
            <div className="absolute top-2 -right-4 w-[85%] max-w-sm aspect-[16/11] rounded-[28px] bg-[#081024] border border-blue-500/20 shadow-2xl transform rotate-6 opacity-40 pointer-events-none hidden sm:block overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80"
                alt="BLACKPINK Born Pink Tour"
                fill
                className="object-cover opacity-60"
              />
            </div>

            {/* Ambient Card Backlight */}
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-blue-600/30 to-sky-500/10 blur-xl opacity-75" />

            {/* Main Featured Showcase Card */}
            <div className="relative w-full max-w-md rounded-[28px] bg-[#0c1428] border border-white/15 shadow-2xl overflow-hidden backdrop-blur-xl z-10">
              {/* Stage Poster Header */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80"
                  alt="Coldplay Stadium Concert Stage"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1428] via-transparent to-black/40" />

                {/* Floating Top Tag */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shadow">
                    HEADLINE CONCERT
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                    GBK JAKARTA
                  </span>
                </div>

                {/* Live sound tag */}
                <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-black/70 border border-white/15 text-[10px] font-semibold text-slate-300 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Audio 360° Stadium Live</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6">
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Coldplay: Music of the Spheres
                  </h3>
                  <p className="text-xs text-blue-300 font-medium mt-1 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-blue-400" />
                    <span>Coldplay • World Stadium Tour</span>
                  </p>
                </div>

                {/* Meta Date & Location */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Sabtu, 15 Desember 2026</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">19:30 WIB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Stadion Utama GBK, Jakarta</span>
                  </div>
                </div>

                {/* Countdown Timer Row */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
                      Event Terdekat
                    </p>
                    <FeaturedCountdown />
                  </div>

                  <Link
                    href="#concerts"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Lihat Tiket</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating Live Indicator Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#091124]/95 border border-white/15 shadow-2xl backdrop-blur-xl z-20"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                <FaTicketAlt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Status Tiket</p>
                <p className="text-xs font-bold text-white">88% Kuota Terpesan</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
