"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD EMAIL + OTP
  // =====================================================

  useEffect(() => {
    const savedEmail =
      sessionStorage.getItem(
        "forgot_password_email"
      );

    const savedOtp =
      sessionStorage.getItem(
        "forgot_password_otp"
      );

    if (!savedEmail || !savedOtp) {
      router.replace(
        "/forgot-password"
      );
      return;
    }

    setEmail(savedEmail);
    setOtp(savedOtp);
  }, [router]);

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanOtp =
      String(otp).trim();

    if (!cleanEmail || !cleanOtp) {
      setError(
        "Data reset password tidak ditemukan. Silakan ulangi proses."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Password baru wajib diisi."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Konfirmasi password wajib diisi."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak cocok."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("=================================");
      console.log("RESET PASSWORD");
      console.log("EMAIL:", cleanEmail);
      console.log("OTP:", cleanOtp);
      console.log(
        "API:",
        `${API_URL}/api/auth/reset-password`
      );
      console.log("=================================");

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            otp: cleanOtp,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") ||
        "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server response tidak valid (${response.status})`
        );
      }

      console.log(
        "Response backend:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengubah password."
        );
      }

      setSuccess(
        "Password berhasil diubah. Mengarahkan ke login..."
      );

      // =================================================
      // HAPUS DATA RESET
      // =================================================

      sessionStorage.removeItem(
        "forgot_password_email"
      );

      sessionStorage.removeItem(
        "forgot_password_otp"
      );

      // =================================================
      // REDIRECT LOGIN
      // =================================================

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      setError(
        error.message ||
          "Gagal mengubah password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6 py-10 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute top-[-180px] left-[-180px] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] right-[-180px] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />

      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/forgot-password/verify"
            )
          }
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">

            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">

              <LockKeyhole
                size={32}
                className="text-blue-400"
              />

            </div>

          </div>

          {/* Title */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold mb-2">
              Buat Password Baru
            </h1>

            <p className="text-slate-400 text-sm leading-6">
              Masukkan password baru untuk
              akun TicketVerse kamu.
            </p>

          </div>

          {/* Email */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">

            <p className="text-xs text-slate-500 mb-1">
              Akun
            </p>

            <p className="text-sm text-white truncate">
              {email}
            </p>

          </div>

          {/* Error */}
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
              className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2"
            >

              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              <span>
                {success}
              </span>

            </motion.div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Password */}
            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Password Baru
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Masukkan password baru"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

              <p className="text-xs text-slate-600 mt-2">
                Minimal 6 karakter.
              </p>

            </div>

            {/* Confirm Password */}
            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Konfirmasi Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 py-3.5 font-semibold transition flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Menyimpan...
                </>
              ) : (
                "Simpan Password Baru"
              )}

            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} TicketVerse
        </p>

      </motion.div>

    </main>
  );
}