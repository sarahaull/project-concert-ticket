"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function OTPPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(null);
  
  const inputsRef = useRef([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("otp_email");
    if (!savedEmail) {
      router.replace("/login");
      return;
    }
    setEmail(savedEmail);
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, [router]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    setSuccess("");
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;
    const newOtp = ["", "", "", "", "", ""];
    pastedData.split("").forEach((number, index) => {
      newOtp[index] = number;
    });
    setOtp(newOtp);
    setError("");
    setSuccess("");
    const nextIndex = Math.min(pastedData.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const redirectByRole = (data) => {
    const rawRole =
      data?.user?.role ??
      data?.user?.role_name ??
      data?.user?.user_role ??
      data?.user?.jenis_user ??
      data?.user?.tipe_user ??
      data?.role;

    const role = rawRole?.toString().trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (role === "user" || role === "pengguna" || role === "customer") {
      router.replace("/dashboard");
      return;
    }
    if (role === "organizer" || role === "organiser" || role === "event_organizer") {
      router.replace("/organizer");
      return;
    }
    if (role === "super_admin" || role === "superadmin") {
      router.replace("/super-admin");
      return;
    }
    setError(`Role akun tidak dikenali: ${rawRole || "tidak ada"}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Kode OTP tidak valid.");
      }
      if (!data?.token) {
        throw new Error("Token login tidak diterima dari server.");
      }
      if (!data?.user) {
        throw new Error("Data user tidak diterima dari server.");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_user");
      setSuccess("Verifikasi berhasil! Mengarahkan...");
      setTimeout(() => {
        redirectByRole(data);
      }, 500);
    } catch (error) {
      setError(error?.message || "Terjadi kesalahan saat verifikasi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email) {
      setError("Email tidak ditemukan. Silakan login kembali.");
      return;
    }
    try {
      setIsResending(true);
      setError("");
      setSuccess("");
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Gagal mengirim ulang OTP.");
      }
      setOtp(["", "", "", "", "", ""]);
      setSuccess("Kode OTP baru telah dikirim ke email.");
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    } catch (error) {
      setError(error?.message || "Gagal mengirim ulang OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem("otp_email");
    sessionStorage.removeItem("otp_user");
    router.push("/login");
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
              <ShieldCheckIcon className="w-4 h-4 text-[#F6ECDD]" />
            </motion.div>
            <span className="text-xs text-[#8AA3C5] tracking-wider uppercase font-medium">
              Secure Verification
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
                    <ShieldCheckIcon className="w-8 h-8 text-[#F6ECDD]" />
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
              Verifikasi{" "}
              <span className="bg-gradient-to-r from-[#8AA3C5] to-[#F6ECDD] bg-clip-text text-transparent">
                OTP
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-3 text-sm text-[#8AA3C5] font-light"
            >
              Masukkan kode 6 digit yang dikirim ke
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-1 text-sm font-semibold text-[#F6ECDD] break-all"
            >
              {email}
            </motion.p>
          </div>

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
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-5 px-4 py-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-start gap-2"
              >
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-8 relative">
            <div className="flex justify-center gap-1.5 sm:gap-2.5 md:gap-3" onPaste={handlePaste}>
              {otp.map((value, index) => (
                <div key={index} className="relative">
                  <motion.div
                    animate={{
                      borderColor: focusedIndex === index 
                        ? "#8AA3C5" 
                        : value 
                          ? "#495B7D" 
                          : "rgba(73,91,125,0.3)",
                      boxShadow: focusedIndex === index 
                        ? "0 0 15px rgba(138,163,197,0.3)" 
                        : "none"
                    }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-[#495B7D]/50 overflow-hidden bg-[#02122F]/50"
                  >
                    <input
                      ref={(element) => {
                        inputsRef.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      disabled={isLoading || isResending}
                      className="w-10 h-13 sm:w-11 sm:h-14 md:w-12 md:h-14 text-center text-lg sm:text-xl font-bold text-[#F6ECDD] bg-transparent outline-none transition-all disabled:opacity-50"
                    />
                  </motion.div>
                </div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              type="submit"
              disabled={isLoading || isResending || otp.join("").length !== 6}
              whileHover={!isLoading && otp.join("").length === 6 ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isLoading && otp.join("").length === 6 ? { scale: 0.97 } : {}}
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#495B7D] to-[#8AA3C5] text-[#F6ECDD] font-semibold shadow-lg shadow-[#8AA3C5]/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group border border-[#8AA3C5]/30 relative"
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
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi OTP"
                )}
              </span>
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-[#8AA3C5]">Tidak menerima kode?</p>
            <button
              type="button"
              onClick={resendOTP}
              disabled={isResending || isLoading}
              className="mt-1 text-sm text-[#F6ECDD] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium underline decoration-[#8AA3C5]/30 underline-offset-4"
            >
              {isResending ? "Mengirim ulang..." : "Kirim ulang OTP"}
            </button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            type="button"
            onClick={handleBackToLogin}
            disabled={isLoading || isResending}
            className="flex items-center justify-center gap-2 mx-auto mt-6 text-xs text-[#8AA3C5] hover:text-[#F6ECDD] disabled:opacity-50 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Kembali ke Login
          </motion.button>
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