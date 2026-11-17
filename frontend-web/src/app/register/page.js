"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

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

    const colors = [
      "rgba(246, 236, 221, 0.6)",
      "rgba(246, 236, 221, 0.3)",
      "rgba(138, 163, 197, 0.5)",
      "rgba(138, 163, 197, 0.3)",
      "rgba(73, 91, 125, 0.4)",
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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 6 &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isFormValid) {
      setErrorMessage("Pastikan semua data sudah diisi dengan benar.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal.");
      }

      setSuccessMessage("Registrasi berhasil! Mengarahkan ke halaman login...");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || "Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-[#02122F]">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#02122F] via-[#0a1932] to-[#23354D]" />

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

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#23354D]/50 border border-[#495B7D]/50 backdrop-blur-md"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CheckBadgeIcon className="w-4 h-4 text-[#F6ECDD]" />
            </motion.div>
            <span className="text-xs text-[#8AA3C5] tracking-wider uppercase font-medium">
              Join The Experience
            </span>
          </motion.div>
        </div>

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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#495B7D] via-[#8AA3C5] to-[#F6ECDD]" />

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
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <UserPlusIcon className="w-8 h-8 text-[#F6ECDD]" />
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
              Daftar{" "}
              <span className="bg-gradient-to-r from-[#8AA3C5] to-[#F6ECDD] bg-clip-text text-transparent">
                Akun
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-3 text-sm text-[#8AA3C5] font-light"
            >
              Mulai perjalanan eksklusif Anda di TicketVerse
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-5 px-4 py-3 rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2"
              >
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-5 px-4 py-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-start gap-2"
              >
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <motion.div
                  animate={{ color: focusedField === "name" ? "#F6ECDD" : "#495B7D" }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <UserIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nama Anda"
                  required
                  autoComplete="name"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <motion.div
                  animate={{ color: focusedField === "email" ? "#F6ECDD" : "#495B7D" }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <motion.div
                  animate={{ color: focusedField === "password" ? "#F6ECDD" : "#495B7D" }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <LockClosedIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
              <AnimatePresence>
                {password.length > 0 && password.length < 6 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-amber-400/90"
                  >
                    Password minimal 6 karakter.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label className="block text-xs font-semibold text-[#8AA3C5] tracking-[0.12em] uppercase mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <motion.div
                  animate={{ color: focusedField === "confirmPassword" ? "#F6ECDD" : "#495B7D" }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
                >
                  <LockClosedIcon className="w-4 h-4" />
                </motion.div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-14 py-3.5 bg-[#02122F]/50 border border-[#495B7D]/50 rounded-xl text-sm text-[#F6ECDD] placeholder-[#495B7D] focus:outline-none focus:ring-2 focus:ring-[#8AA3C5] focus:border-[#8AA3C5] transition-all duration-300 disabled:opacity-50 hover:bg-[#02122F]/80"
                />
                
                <AnimatePresence>
                  {confirmPassword.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 z-10"
                    >
                      <CheckBadgeIcon
                        className={`w-4 h-4 transition-all duration-300 ${
                          passwordsMatch ? "text-emerald-400" : "text-red-400"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#495B7D] hover:text-[#8AA3C5] transition-colors disabled:opacity-50 z-10"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showConfirmPassword ? "slash" : "eye"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
              <AnimatePresence>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-red-400/90"
                  >
                    Password tidak cocok
                  </motion.p>
                )}
                {passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-emerald-400/90"
                  >
                    Password cocok ✓
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              type="submit"
              disabled={isLoading || !isFormValid}
              whileHover={!isLoading && isFormValid ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isLoading && isFormValid ? { scale: 0.97 } : {}}
              className="relative w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#495B7D] to-[#8AA3C5] text-[#F6ECDD] font-semibold shadow-lg shadow-[#8AA3C5]/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group border border-[#8AA3C5]/30"
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
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </span>
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-center text-sm text-[#8AA3C5]"
          >
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#F6ECDD] hover:text-white transition-colors font-semibold underline decoration-[#8AA3C5]/30 underline-offset-4"
            >
              Masuk
            </Link>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
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