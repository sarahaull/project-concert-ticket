"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// API CONFIG
// ============================================================
// .env.local:
// NEXT_PUBLIC_API_URL=http://localhost:5000
//
// Endpoint login:
// http://localhost:5000/api/auth/login
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

// ============================================================
// SHIMMER PARTICLE BACKGROUND
// ============================================================

const ShimmerBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let particles = [];
    let animationId = null;

    // ========================================================
    // RESIZE CANVAS
    // ========================================================

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    // ========================================================
    // PARTICLE COLORS
    // ========================================================

    const colors = [
      "rgba(255,255,255,0.4)",
      "rgba(255,255,255,0.2)",
      "rgba(147,197,253,0.3)",
      "rgba(165,180,252,0.2)",
      "rgba(255,255,255,0.15)",
    ];

    // ========================================================
    // PARTICLE CLASS
    // ========================================================

    class Particle {
      constructor() {
        this.x =
          Math.random() * canvas.width;

        this.y =
          Math.random() * canvas.height;

        this.size =
          Math.random() * 3 + 1;

        this.speedX =
          (Math.random() - 0.5) * 0.4;

        this.speedY =
          (Math.random() - 0.5) * 0.4;

        this.color =
          colors[
            Math.floor(
              Math.random() * colors.length
            )
          ];

        this.opacity =
          Math.random() * 0.6 + 0.2;

        this.shimmer =
          Math.random() * 0.02 + 0.01;

        this.phase =
          Math.random() *
          Math.PI *
          2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        this.opacity =
          0.2 +
          Math.sin(
            Date.now() *
              this.shimmer +
              this.phase
          ) *
            0.15 +
          0.15;

        if (this.x > canvas.width) {
          this.x = 0;
        }

        if (this.x < 0) {
          this.x = canvas.width;
        }

        if (this.y > canvas.height) {
          this.y = 0;
        }

        if (this.y < 0) {
          this.y = canvas.height;
        }
      }

      draw() {
        ctx.beginPath();

        ctx.arc(
          this.x,
          this.y,
          this.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();

        // Glow particle
        if (this.size > 2) {
          const gradient =
            ctx.createRadialGradient(
              this.x,
              this.y,
              0,
              this.x,
              this.y,
              this.size * 3
            );

          gradient.addColorStop(
            0,
            `rgba(255,255,255,${
              this.opacity * 0.3
            })`
          );

          gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
          );

          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.5;

          ctx.beginPath();

          ctx.arc(
            this.x,
            this.y,
            this.size * 3,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }
    }

    // ========================================================
    // INITIALIZE PARTICLES
    // ========================================================

    const init = () => {
      particles = [];

      for (let i = 0; i < 80; i++) {
        particles.push(
          new Particle()
        );
      }
    };

    init();

    // ========================================================
    // ANIMATION
    // ========================================================

    const animate = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles.forEach(
        (particle) => {
          particle.update();
          particle.draw();
        }
      );

      animationId =
        requestAnimationFrame(
          animate
        );
    };

    animate();

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      if (animationId) {
        cancelAnimationFrame(
          animationId
        );
      }

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

// ============================================================
// LOGIN PAGE
// ============================================================

export default function LoginPage() {
  const router = useRouter();

  // ==========================================================
  // STATES
  // ==========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // HANDLE LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error
    setError("");

    // ========================================================
    // VALIDATION
    // ========================================================

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Email wajib diisi."
      );
      return;
    }

    if (!password) {
      setError(
        "Password wajib diisi."
      );
      return;
    }

    try {
      setIsLoading(true);

      // ======================================================
      // BERSIHKAN DATA OTP LAMA
      // ======================================================

      sessionStorage.removeItem(
        "otp_email"
      );

      sessionStorage.removeItem(
        "otp_user"
      );

      // ======================================================
      // REQUEST LOGIN
      // ======================================================

      const loginUrl =
        `${API_URL}/api/auth/login`;

      console.log(
        "Login request:",
        loginUrl
      );

      const response = await fetch(
        loginUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      // ======================================================
      // CEK CONTENT TYPE
      // ======================================================

      const contentType =
        response.headers.get(
          "content-type"
        );

      // ======================================================
      // RESPONSE BUKAN JSON
      // ======================================================

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid. Status: ${response.status}`
        );
      }

      // ======================================================
      // PARSE JSON
      // ======================================================

      const data =
        await response.json();

      console.log(
        "Login response:",
        data
      );

      // ======================================================
      // ERROR RESPONSE
      // ======================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Email atau password salah."
        );
      }

      // ======================================================
      // SUPER ADMIN
      // LANGSUNG LOGIN TANPA OTP
      // ======================================================

      if (
        data.requiresOtp === false
      ) {
        // Pastikan token tersedia
        if (!data.token) {
          throw new Error(
            "Token login tidak diterima dari server."
          );
        }

        // Pastikan user tersedia
        if (!data.user) {
          throw new Error(
            "Data user tidak diterima dari server."
          );
        }

        // ====================================================
        // SIMPAN TOKEN
        // ====================================================

        localStorage.setItem(
          "token",
          data.token
        );

        // ====================================================
        // SIMPAN USER
        // ====================================================

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // ====================================================
        // REDIRECT BERDASARKAN ROLE
        // ====================================================

        switch (
          data.user.role
        ) {
          case "super_admin":
            router.push(
              "/superadmin/dashboard"
            );
            break;

          case "event_organizer":
            router.push(
              "/organizer/dashboard"
            );
            break;

          case "customer":
            router.push(
              "/dashboard"
            );
            break;

          default:
            router.push(
              "/dashboard"
            );
            break;
        }

        return;
      }

      // ======================================================
      // USER BIASA / EVENT ORGANIZER
      // PERLU OTP
      // ======================================================

      if (
        data.requiresOtp === true
      ) {
        // ====================================================
        // SIMPAN EMAIL OTP
        // ====================================================

        sessionStorage.setItem(
          "otp_email",
          cleanEmail
        );

        // ====================================================
        // SIMPAN USER JIKA BACKEND MENGIRIM
        // ====================================================

        if (data.user) {
          sessionStorage.setItem(
            "otp_user",
            JSON.stringify(
              data.user
            )
          );
        }

        // ====================================================
        // REDIRECT KE HALAMAN OTP
        // ====================================================

        router.push(
          "/login/otp"
        );

        return;
      }

      // ======================================================
      // RESPONSE TIDAK DIKENALI
      // ======================================================

      throw new Error(
        "Response login dari server tidak dikenali."
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      // ======================================================
      // TAMPILKAN ERROR
      // ======================================================

      setError(
        error?.message ||
          "Terjadi kesalahan pada server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* ====================================================
          BACKGROUND
      ==================================================== */}

      <div className="absolute inset-0 z-0">

        {/* MAIN BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1a2e] to-[#1a0a2e]" />

        {/* STAR PATTERN */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              radial-gradient(
                2px 2px at 20% 30%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                2px 2px at 40% 70%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                2px 2px at 60% 20%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                2px 2px at 80% 80%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                1px 1px at 10% 90%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                1px 1px at 90% 10%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                1px 1px at 50% 50%,
                #fff 100%,
                transparent
              ),
              radial-gradient(
                1px 1px at 70% 40%,
                #fff 100%,
                transparent
              )
            `,
            backgroundSize:
              "200px 200px",
          }}
        />

        {/* ==================================================
            BLUE GLOW
        ================================================== */}

        <motion.div
          animate={{
            x: [
              0,
              80,
              -40,
              0,
            ],
            y: [
              0,
              -60,
              30,
              0,
            ],
            scale: [
              1,
              1.2,
              0.8,
              1,
            ],
            opacity: [
              0.3,
              0.5,
              0.2,
              0.3,
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-80 -right-80 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-3xl"
        />

        {/* ==================================================
            INDIGO GLOW
        ================================================== */}

        <motion.div
          animate={{
            x: [
              0,
              -70,
              40,
              0,
            ],
            y: [
              0,
              60,
              -30,
              0,
            ],
            scale: [
              1,
              0.8,
              1.2,
              1,
            ],
            opacity: [
              0.2,
              0.4,
              0.3,
              0.2,
            ],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-80 -left-80 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-3xl"
        />

        {/* ==================================================
            PURPLE GLOW
        ================================================== */}

        <motion.div
          animate={{
            x: [
              0,
              40,
              -30,
              0,
            ],
            y: [
              0,
              -40,
              20,
              0,
            ],
            opacity: [
              0.15,
              0.3,
              0.1,
              0.15,
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-3xl"
        />

        {/* PARTICLES */}
        <ShimmerBackground />

      </div>

      {/* ====================================================
          LOGIN CONTAINER
      ==================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* ==================================================
            LOGIN CARD
        ================================================== */}

        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/40 p-8 md:p-10 overflow-hidden">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="text-center mb-8 relative">

            {/* LOGO */}
            <div className="flex justify-center mb-4">

              <div className="relative">

                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-2xl blur-xl" />

                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-blue-500/20">

                  <SparklesIcon className="w-8 h-8 text-blue-300" />

                </div>

              </div>

            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-light text-white tracking-tight">
              Selamat Datang
            </h1>

            <div className="w-12 h-px bg-gradient-to-r from-blue-300/50 to-indigo-300/50 mx-auto mt-3" />

            <p className="mt-4 text-sm text-white/40 font-light">
              Masuk ke akun TicketVerse Anda
            </p>

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/10 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 relative"
          >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label className="block text-xs font-medium text-white/30 tracking-[0.1em] uppercase mb-1.5">
                Email
              </label>

              <div className="relative group">

                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all disabled:opacity-50"
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <div className="flex items-center justify-between mb-1.5">

                <label className="text-xs font-medium text-white/30 tracking-[0.1em] uppercase">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-white/20 hover:text-blue-300 transition-colors"
                >
                  Lupa?
                </Link>

              </div>

              <div className="relative group">

                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-transparent transition-all disabled:opacity-50"
                />

                {/* SHOW / HIDE PASSWORD */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>

              </div>

            </div>

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={
                !isLoading
                  ? {
                      scale: 1.02,
                    }
                  : {}
              }
              whileTap={
                !isLoading
                  ? {
                      scale: 0.97,
                    }
                  : {}
              }
              className="relative w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-medium shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >

              {/* LOADING EFFECT */}
              {isLoading && (
                <span className="absolute inset-0 bg-white/10 animate-pulse" />
              )}

              <span className="relative z-10">
                {isLoading
                  ? "Memproses..."
                  : "Masuk"}
              </span>

            </motion.button>

          </form>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="relative my-6">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>

            <div className="relative flex justify-center">

              <span className="px-4 bg-[#111827]/80 text-[10px] text-white/20 tracking-[0.15em] uppercase rounded-full">
                atau
              </span>

            </div>

          </div>

          {/* =================================================
              SOCIAL LOGIN
          ================================================= */}

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              disabled
              title="Login Google belum tersedia"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm text-white/25 cursor-not-allowed"
            >
              <span className="font-semibold">
                G
              </span>

              Google
            </button>

            <button
              type="button"
              disabled
              title="Login Twitter belum tersedia"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm text-white/25 cursor-not-allowed"
            >
              <span className="font-semibold">
                𝕏
              </span>

              Twitter
            </button>

          </div>

          {/* =================================================
              REGISTER
          ================================================= */}

          <p className="mt-6 text-center text-sm text-white/30">

            Belum punya akun?{" "}

            <Link
              href="/register"
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              Daftar
            </Link>

          </p>

        </div>

        {/* ==================================================
            BOTTOM DOTS
        ================================================== */}

        <div className="flex justify-center gap-2 mt-5">

          <span className="w-2 h-2 rounded-full bg-blue-400/40 animate-pulse" />

          <span className="w-2 h-2 rounded-full bg-indigo-400/30" />

          <span className="w-2 h-2 rounded-full bg-purple-400/20" />

        </div>

      </motion.div>

      {/* ====================================================
          GLOBAL ANIMATION
      ==================================================== */}

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

    </div>
  );
}