"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// SHIMMER PARTICLE BACKGROUND
// ============================================================
const ShimmerBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let particles = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    const colors = [
      "rgba(255,255,255,0.4)",
      "rgba(255,255,255,0.2)",
      "rgba(165,180,252,0.3)",
      "rgba(147,197,253,0.2)",
      "rgba(255,255,255,0.15)",
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;

        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;

        this.color =
          colors[Math.floor(Math.random() * colors.length)];

        this.opacity = Math.random() * 0.6 + 0.2;
        this.shimmer = Math.random() * 0.02 + 0.01;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        this.opacity =
          0.2 +
          Math.sin(
            Date.now() * this.shimmer + this.phase
          ) *
            0.15 +
          0.15;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;

        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
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

        if (this.size > 2) {
          const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size * 3
          );

          gradient.addColorStop(
            0,
            `rgba(255,255,255,${this.opacity * 0.3})`
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

    const init = () => {
      particles = [];

      for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

// ============================================================
// REGISTER PAGE
// ============================================================
export default function RegisterPage() {
  const router = useRouter();

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Error / success
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================
  // VALIDATION
  // ============================================================

  const passwordsMatch =
    password === confirmPassword &&
    password.length > 0;

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 6 &&
    passwordsMatch;

  // ============================================================
  // REGISTER
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!isFormValid) {
      setErrorMessage(
        "Pastikan semua data sudah diisi dengan benar."
      );

      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullname: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      // ========================================================
      // ERROR DARI BACKEND
      // ========================================================

      if (!response.ok) {
        throw new Error(
          data.message || "Registrasi gagal."
        );
      }

      // ========================================================
      // REGISTER BERHASIL
      // ========================================================

      setSuccessMessage(
        "Registrasi berhasil! Mengarahkan ke halaman login..."
      );

      // Beri sedikit waktu supaya user melihat pesan sukses
      setTimeout(() => {
        router.push(
          `/login?email=${encodeURIComponent(
            email.trim()
          )}`
        );
      }, 1000);
    } catch (error) {
      console.error("Register error:", error);

      setErrorMessage(
        error.message ||
          "Tidak dapat terhubung ke server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="absolute inset-0 z-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#1a0a2e] to-[#0f1a2e]" />

        {/* Star pattern */}
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
              )
            `,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Glow kanan */}
        <motion.div
          animate={{
            x: [0, 70, -40, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.5, 0.2, 0.3],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-80 -right-80 w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-3xl"
        />

        {/* Glow kiri */}
        <motion.div
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.8, 1.2, 1],
            opacity: [0.2, 0.4, 0.3, 0.2],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-80 -left-80 w-[900px] h-[900px] bg-purple-500/10 rounded-full blur-3xl"
        />

        {/* Glow tengah */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -40, 20, 0],
            opacity: [0.15, 0.3, 0.1, 0.15],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-3xl"
        />

        {/* Particles */}
        <ShimmerBackground />
      </div>

      {/* ========================================================
          REGISTER CARD
      ======================================================== */}

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
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Card */}
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/40 p-8 md:p-10 overflow-hidden">
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

          {/* Reflection */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-2xl" />

          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-2xl" />

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="text-center mb-8 relative">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/30 to-blue-400/30 rounded-2xl blur-xl" />

                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-blue-400/20 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-indigo-500/20">
                  <UserPlusIcon className="w-8 h-8 text-indigo-300" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-light text-white tracking-tight">
              Daftar Akun
            </h1>

            <div className="w-12 h-px bg-gradient-to-r from-indigo-300/50 to-blue-300/50 mx-auto mt-3" />

            <p className="mt-4 text-sm text-white/40 font-light">
              Mulai perjalanan musikmu di sini
            </p>
          </div>

          {/* ====================================================
              ERROR MESSAGE
          ==================================================== */}

          {errorMessage && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* ====================================================
              SUCCESS MESSAGE
          ==================================================== */}

          {successMessage && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {successMessage}
            </motion.div>
          )}

          {/* ====================================================
              FORM
          ==================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 relative"
          >
            {/* ==================================================
                NAMA
            ================================================== */}

            <div>
              <label className="block text-xs font-medium text-white/30 tracking-[0.1em] uppercase mb-1.5">
                Nama Lengkap
              </label>

              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-300 transition-colors duration-300" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Nama Anda"
                  required
                  autoComplete="name"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-transparent transition-all duration-300 group-hover:border-white/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div>
              <label className="block text-xs font-medium text-white/30 tracking-[0.1em] uppercase mb-1.5">
                Email
              </label>

              <div className="relative group">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-300 transition-colors duration-300" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-transparent transition-all duration-300 group-hover:border-white/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div>
              <label className="block text-xs font-medium text-white/30 tracking-[0.1em] uppercase mb-1.5">
                Password
              </label>

              <div className="relative group">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-300 transition-colors duration-300" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-transparent transition-all duration-300 group-hover:border-white/20 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors duration-200 disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password hint */}
              {password.length > 0 &&
                password.length < 6 && (
                  <p className="mt-1.5 text-xs text-amber-300/70">
                    Password minimal 6 karakter.
                  </p>
                )}
            </div>

            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div>
              <label className="block text-xs font-medium text-white/30 tracking-[0.1em] uppercase mb-1.5">
                Konfirmasi Password
              </label>

              <div className="relative group">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-indigo-300 transition-colors duration-300" />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-14 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-transparent transition-all duration-300 group-hover:border-white/20 disabled:opacity-50"
                />

                {/* Password match icon */}
                {confirmPassword.length > 0 && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <CheckBadgeIcon
                      className={`w-4 h-4 transition-all duration-300 ${
                        passwordsMatch
                          ? "text-emerald-400"
                          : "text-rose-400/60"
                      }`}
                    />
                  </div>
                )}

                {/* Show password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors duration-200 disabled:opacity-50"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 &&
                !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-rose-400/70 font-light">
                    Password tidak cocok
                  </p>
                )}

              {passwordsMatch && (
                <p className="mt-1.5 text-xs text-emerald-400/70 font-light">
                  Password cocok ✓
                </p>
              )}
            </div>

            {/* ==================================================
                REGISTER BUTTON
            ================================================== */}

            <motion.button
              type="submit"
              disabled={
                isLoading || !isFormValid
              }
              whileHover={
                !isLoading && isFormValid
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                !isLoading && isFormValid
                  ? { scale: 0.97 }
                  : {}
              }
              className="relative w-full py-3 rounded-xl bg-gradient-to-r from-indigo-400 to-blue-400 text-white font-medium hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group mt-2"
            >
              <span className="relative z-10">
                {isLoading
                  ? "Mendaftarkan..."
                  : "Daftar"}
              </span>

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500"
                initial={{
                  x: "100%",
                }}
                whileHover={{
                  x: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
              />
            </motion.button>
          </form>

          {/* ====================================================
              DIVIDER
          ==================================================== */}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>

            <div className="relative flex justify-center">
              <span className="px-4 bg-white/5 text-[10px] text-white/20 font-light tracking-[0.15em] uppercase backdrop-blur-sm rounded-full">
                atau
              </span>
            </div>
          </div>

          {/* ====================================================
              SOCIAL
          ==================================================== */}

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-all duration-300"
            >
              <span className="text-lg">
                🔵
              </span>

              Google
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-all duration-300"
            >
              <span className="text-lg">
                🐦
              </span>

              Twitter
            </motion.button>
          </div>

          {/* ====================================================
              LOGIN
          ==================================================== */}

          <p className="mt-6 text-center text-sm text-white/30 font-light">
            Sudah punya akun?{" "}

            <Link
              href="/login"
              className="text-indigo-300 hover:text-indigo-200 transition-colors duration-200 font-medium border-b border-indigo-300/20 hover:border-indigo-300/50 pb-0.5"
            >
              Masuk
            </Link>
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="flex justify-center gap-2 mt-5">
          <span className="w-2 h-2 rounded-full bg-indigo-400/40 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-blue-400/30" />
          <span className="w-2 h-2 rounded-full bg-purple-400/20" />
        </div>
      </motion.div>

      {/* ========================================================
          SHIMMER ANIMATION
      ======================================================== */}

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