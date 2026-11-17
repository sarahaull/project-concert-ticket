"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  TicketIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SnowBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];
    let animationId = null;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Menggunakan warna dari palet: Moonlight & Frost Blue
    const colors = [
      "rgba(246, 236, 221, 0.6)", // Moonlight
      "rgba(246, 236, 221, 0.3)",
      "rgba(138, 163, 197, 0.5)", // Frost Blue
      "rgba(138, 163, 197, 0.3)",
      "rgba(73, 91, 125, 0.4)",   // Steel
    ];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * 0.02 + 0.01;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Efek interaktif mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }

        this.opacity =
          0.2 + Math.sin(Date.now() * this.pulse + this.phase) * 0.2 + 0.2;

        if (this.x > canvas.width + 20) this.x = -20;
        if (this.x < -20) this.x = canvas.width + 20;
        if (this.y > canvas.height + 20) this.y = -20;
        if (this.y < -20) this.y = canvas.height + 20;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();

        if (this.size > 2) {
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 4
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradient;
          ctx.globalAlpha = this.opacity * 0.4;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    const init = () => {
      particles = [];
      const count = Math.min(80, Math.floor(window.innerWidth / 18));
      for (let i = 0; i < count; i++) particles.push(new Particle());
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
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Email wajib diisi.");
    if (!password) return setError("Password wajib diisi.");

    try {
      setIsLoading(true);
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_user");

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server mengembalikan response tidak valid. Status: ${response.status}`
        );
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Email atau password salah.");
      }

      if (data.requiresOtp === false) {
        if (!data.token) throw new Error("Token login tidak diterima dari server.");
        if (!data.user) throw new Error("Data user tidak diterima dari server.");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        switch (data.user.role) {
          case "super_admin":
            router.push("/superadmin/dashboard");
            break;
          case "event_organizer":
            router.push("/organizer/dashboard");
            break;
          case "customer":
          default:
            router.push("/dashboard");
            break;
        }
        return;
      }

      if (data.requiresOtp === true) {
        sessionStorage.setItem("otp_email", cleanEmail);
        if (data.user) {
          sessionStorage.setItem("otp_user", JSON.stringify(data.user));
        }
        router.push("/login/otp");
        return;
      }

      throw new Error("Response login dari server tidak dikenali.");
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan pada server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Background utama menggunakan Oxford Blue
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-[#02122F]">
      
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Gradient dari Oxford Blue ke Storm */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#02122F] via-[#0a1932] to-[#23354D]" />

        {/* Grid Pattern halus */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 20% 30%, #F6ECDD 100%, transparent),
              radial-gradient(1px 1px at 40% 70%, #8AA3C5 100%, transparent),
              radial-gradient(1.5px 1.5px at 60% 20%, #F6ECDD 100%, transparent),
              radial-gradient(1px 1px at 80% 80%, #8AA3C5 100%, transparent)`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Efek Cahaya Bergerak (Aurora / Frost Glow) */}
        <motion.div
          animate={{
            x: [0, 80, -50, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.2, 0.4, 0.15, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-80 -right-80 w-[900px] h-[900px] bg-[#8AA3C5]/20 rounded-full blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.85, 1.2, 1],
            opacity: [0.15, 0.3, 0.1, 0.15],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-80 -left-80 w-[900px] h-[900px] bg-[#495B7D]/30 rounded-full blur-[120px]"
        />

        <SnowBackground />
      </div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Badge Atas */}
        <div className="mb-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#23354D]/50 border border-[#495B7D]/50 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <SparklesIcon className="w-4 h-4 text-[#F6ECDD]" />
            </motion.div>
            <span className="text-xs text-[#8AA3C5] tracking-wider uppercase font-medium">
              Premium Ticket Experience
            </span>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          animate={{
            boxShadow: [
              "0 25px 60px -15px rgba(2,18,47,0.8)",
              "0 25px 60px -15px rgba(73,91,125,0.4)",
              "0 25px 60px -15px rgba(2,18,47,0.8)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-[#23354D]/60 backdrop-blur-2xl rounded-3xl border border-[#495B7D]/40 p-8 md:p-10 overflow-hidden"
        >
          {/* Garis Atas Card (Aksen Frost Blue) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#495B7D] via-[#8AA3C5] to-[#F6ECDD]" />

          {/* Efek Kilau (Shimmer) */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 4,
            }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
          />

          {/* Header Card */}
          <div className="text-center mb-8 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 180 }}
              className="flex justify-center mb-5"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(138,163,197,0.3)",
                    "0 0 40px rgba(246,236,221,0.5)",
                    "0 0 20px rgba(138,163,197,0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-[#8AA3C5]/50 to-[#F6ECDD]/50 rounded-2xl blur-xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#495B7D] to-[#23354D] border border-[#8AA3C5]/30 flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <TicketIcon className="w-8 h-8 text-[#F6ECDD]" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl font-bold text-[#F6ECDD] tracking-tight"
            >
              Selamat Datang di{" "}
              <span className="bg-gradient-to-r from-[#8AA3C5] to-[#F6ECDD] bg-clip-text text-transparent">
                TicketVerse
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-3 text-sm text-[#8AA3C5] font-light"
            >
              Masuk untuk mengakses tiket eksklusif Anda
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-5 px-4 py-3 rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2"
              >
                <ExclamationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <motion.div
                  animate={{
                    color:
                      focusedField === "email"
                        ? "#F6ECDD"
                        : "#495B7D",
                  }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#8AA3C5] hover:text-[#F6ECDD] transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <motion.div
                  animate={{
                    color:
                      focusedField === "password"
                        ? "#F6ECDD"
                        : "#495B7D",
                  }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <LockClosedIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#495B7D] hover:text-[#8AA3C5] transition-colors disabled:opacity-50 z-10"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? "slash" : "eye"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.97 } : {}}
              className="relative w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#495B7D] to-[#8AA3C5] text-[#F6ECDD] font-semibold shadow-lg shadow-[#8AA3C5]/20 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group border border-[#8AA3C5]/30"
            >
              <motion.span
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#F6ECDD]/30 border-t-[#F6ECDD] rounded-full"
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <TicketIcon className="w-5 h-5" />
                    Masuk
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.span>
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Register Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-center text-sm text-[#8AA3C5]"
          >
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#F6ECDD] hover:text-white transition-colors font-semibold underline decoration-[#8AA3C5]/30 underline-offset-4"
            >
              Daftar Gratis
            </Link>
          </motion.p>
        </motion.div>

        {/* Footer Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center gap-4 mt-6 text-[10px] text-[#8AA3C5]/70 uppercase tracking-widest"
        >
          <span>Secure</span>
          <span className="w-1 h-1 rounded-full bg-[#495B7D]" />
          <span>Trusted</span>
          <span className="w-1 h-1 rounded-full bg-[#495B7D]" />
          <span>24/7 Support</span>
        </motion.div>
      </motion.div>
    </div>
  );
}