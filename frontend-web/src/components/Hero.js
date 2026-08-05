"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaStar,
  FaClock,
  FaCrown,
  FaHandSparkles,
  FaMusic,
  FaUsers,
} from "react-icons/fa";

// ============================================================
// 1. PARTICLE / CONFETTI BACKGROUND (Canvas) — FIXED
// ============================================================
const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "rgba(255, 255, 255, 0.4)",
      "rgba(191, 219, 254, 0.3)",
      "rgba(165, 180, 252, 0.3)",
      "rgba(56, 189, 248, 0.2)",
      "rgba(255, 255, 255, 0.2)",
      "rgba(196, 181, 253, 0.2)",
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * 4 + 1.5;
        this.size = this.baseSize;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.4 + 0.2;
        this.pulse = Math.random() * 0.02 + 0.005;
        this.phase = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Pulse dengan aman — size minimal 0.5
        const pulseValue = Math.sin(Date.now() * this.pulse + this.phase) * 0.3 + 0.7;
        this.size = Math.max(0.5, this.baseSize * pulseValue);

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
  );
};

// ============================================================
// 2. COUNTDOWN TIMER
// ============================================================
const CountdownTimer = () => {
  const targetDate = new Date("2026-12-15T00:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    <div className="flex items-center gap-3 md:gap-4">
      {[
        { label: "Hari", value: timeLeft.days },
        { label: "Jam", value: timeLeft.hours },
        { label: "Menit", value: timeLeft.minutes },
        { label: "Detik", value: timeLeft.seconds },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 1 + idx * 0.15,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ y: -4, scale: 1.05 }}
          className="text-center"
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 md:px-4 md:py-2 min-w-[50px] md:min-w-[60px] border border-white/20 shadow-lg"
            whileHover={{ boxShadow: "0 8px 30px rgba(59,130,246,0.2)" }}
          >
            <motion.span
              key={item.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-bold text-blue-300 tabular-nums"
            >
              {String(item.value).padStart(2, "0")}
            </motion.span>
          </motion.div>
          <p className="text-[8px] md:text-[10px] text-white/40 font-medium mt-1 uppercase tracking-wider">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// 3. FLOATING BADGE
// ============================================================
const FloatingBadge = ({ icon: Icon, label, value, color, delay, x, y }) => {
  const colorMap = {
    amber: "bg-amber-400/20 text-amber-300",
    blue: "bg-blue-400/20 text-blue-300",
    purple: "bg-purple-400/20 text-purple-300",
    emerald: "bg-emerald-400/20 text-emerald-300",
    rose: "bg-rose-400/20 text-rose-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.08, y: -8, transition: { duration: 0.2 } }}
      className={`absolute ${x} ${y} bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-white/10 z-20 hidden lg:flex items-center gap-3 cursor-default`}
    >
      <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
        <Icon className="text-lg" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};

// ============================================================
// 4. MAIN HERO COMPONENT
// ============================================================
export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 md:py-28 bg-[#0a1628]">
      {/* ===== BACKGROUND GAMBAR ===== */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&q=80"
          alt="Konser Premium"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 via-[#0f2847]/80 to-[#1a3a5c]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/40 to-transparent" />
      </div>

      {/* ===== PARTICLE EFFECT ===== */}
      <Particles />

      {/* ===== ORBS DEKORATIF ===== */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 30, 0],
          y: [0, 50, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* ===== FLOATING BADGES ===== */}
      <FloatingBadge
        icon={FaStar}
        label="Rating"
        value="4.9 / 5.0"
        color="amber"
        delay={0.6}
        x="left-4"
        y="top-20"
      />
      <FloatingBadge
        icon={FaCrown}
        label="VIP"
        value="Akses Eksklusif"
        color="blue"
        delay={0.9}
        x="right-4"
        y="top-28"
      />
      <FloatingBadge
        icon={FaMusic}
        label="Artis"
        value="50+ Musisi"
        color="purple"
        delay={1.2}
        x="left-4"
        y="bottom-32"
      />
      <FloatingBadge
        icon={FaTicketAlt}
        label="Tiket"
        value="Mulai 199K"
        color="emerald"
        delay={1.5}
        x="right-4"
        y="bottom-24"
      />

      {/* ===== KONTEN UTAMA ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8 md:space-y-10"
      >
        {/* --- BADGE PREMIUM --- */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-xs font-semibold text-blue-300 tracking-wider"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="text-amber-400"
            >
              <FaHandSparkles />
            </motion.span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Festival Musik 2026 • 500+ Event
          </motion.span>
        </motion.div>

        {/* --- HEADING --- */}
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.05]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="block"
            >
              Pengalaman Premium,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent font-bold relative inline-block"
            >
              Momen Tak
              <motion.span
                animate={{ x: [0, 6, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 -top-3 text-amber-400 text-3xl"
              >
                ✦
              </motion.span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="block text-white/90 font-medium"
            >
              Terlupakan.
            </motion.span>
          </h1>
        </motion.div>

        {/* --- SUBJUDUL --- */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-light"
        >
          Akses eksklusif ke konser, festival, dan acara terbaik di seluruh Indonesia
          <br className="hidden sm:block" />
          dengan layanan prioritas.
        </motion.p>

        {/* --- COUNTDOWN TIMER --- */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10 shadow-lg">
            <div className="flex items-center gap-3 mb-2 text-white/40">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaClock className="text-blue-300" />
              </motion.span>
              <span className="text-xs font-medium uppercase tracking-wider">Event Terdekat:</span>
            </div>
            <CountdownTimer />
          </div>
        </motion.div>

        {/* --- FORM PENCARIAN --- */}
        <motion.div variants={itemVariants} className="mt-4 md:mt-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 backdrop-blur-2xl rounded-2xl p-2 md:p-3 shadow-2xl shadow-blue-500/10 border border-white/10 transition-all duration-300 hover:shadow-blue-500/20 hover:bg-white/10"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                <input
                  type="text"
                  placeholder="Carlnama event, anis, atau vernu"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-0 focus:ring-2 focus:ring-blue-400/50 outline-none text-white placeholder-white/30 text-sm transition-all duration-200"
                />
              </motion.div>
              <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                <select className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-0 focus:ring-2 focus:ring-blue-400/50 outline-none text-white text-sm appearance-none transition-all duration-200 cursor-pointer">
                  <option className="text-gray-900">Semua Lokasi</option>
                  <option className="text-gray-900">Jakarta</option>
                  <option className="text-gray-900">Bandung</option>
                  <option className="text-gray-900">Surabaya</option>
                  <option className="text-gray-900">Yogyakarta</option>
                  <option className="text-gray-900">Bali</option>
                </select>
              </motion.div>
              <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-0 focus:ring-2 focus:ring-blue-400/50 outline-none text-white placeholder-white/30 text-sm transition-all duration-200"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm whitespace-nowrap group"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaSearch className="text-base" />
                </motion.span>
                <span>Cari</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaArrowRight className="text-xs opacity-70" />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* --- STATISTIK --- */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-2"
        >
          {[
            { icon: FaTicketAlt, label: "Tiket Terjual", value: "12.5K+", color: "blue" },
            { icon: FaCalendarAlt, label: "Event Bulan Ini", value: "250+", color: "indigo" },
            { icon: FaMapMarkerAlt, label: "Lokasi", value: "50+ Kota", color: "purple" },
            { icon: FaStar, label: "Rating", value: "4.9 / 5", color: "amber" },
            { icon: FaUsers, label: "Peserta", value: "8.2K+", color: "rose" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="flex items-center gap-2.5 text-sm text-white/60 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 shadow-sm"
            >
              <span className={`p-1.5 rounded-lg bg-${item.color}-500/10`}>
                <item.icon className={`text-${item.color}-300 text-sm`} />
              </span>
              <div>
                <p className="font-bold text-white text-sm">{item.value}</p>
                <p className="text-[10px] text-white/40 font-medium">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- TOMBOL CTA TAMBAHAN --- */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 text-white/70 font-medium text-sm hover:bg-white/10 transition-all shadow-md"
          >
            Lihat Semua Event
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 font-medium text-sm shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 transition-all"
          >
            Dapatkan Diskon
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10"
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] font-medium text-white/30 tracking-[0.2em] uppercase"
        >
          Scroll
        </motion.span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-8 rounded-full border border-white/20 flex justify-center pt-1.5 bg-white/5 backdrop-blur-sm"
        >
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 rounded-full bg-gradient-to-b from-blue-400 to-indigo-400"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}