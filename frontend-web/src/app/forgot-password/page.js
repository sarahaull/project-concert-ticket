"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);

    try {
      console.log("=================================");
      console.log("FORGOT PASSWORD");
      console.log("EMAIL:", cleanEmail);
      console.log("API:", `${API_URL}/api/auth/forgot-password`);
      console.log("=================================");

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error("Response bukan JSON:", text);

        throw new Error(
          `Server mengembalikan response tidak valid (${response.status})`
        );
      }

      console.log("Response backend:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengirim OTP reset password."
        );
      }

      // Simpan email untuk halaman berikutnya
      sessionStorage.setItem(
        "forgot_password_email",
        cleanEmail
      );

      // Hapus OTP lama jika ada
      sessionStorage.removeItem(
        "forgot_password_otp"
      );

      setSuccess(
        "OTP berhasil dikirim ke email kamu."
      );

      // Pindah ke halaman verifikasi
      setTimeout(() => {
        router.push("/forgot-password/verify");
      }, 700);
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error.message ||
          "Gagal mengirim OTP reset password."
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

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[100px]" />

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
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Kembali ke Login
        </button>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl p-8">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
              <ShieldCheck
                size={32}
                className="text-blue-400"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold text-white mb-2">
              Lupa Password?
            </h1>

            <p className="text-sm text-slate-400 leading-6">
              Masukkan email yang terdaftar.
              Kami akan mengirimkan kode OTP
              untuk mereset password kamu.
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
              className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {success}
            </motion.div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="superadmin@gmail.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600"
                />

              </div>

            </div>

            {/* Button */}
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
                  Mengirim OTP...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Kirim OTP
                </>
              )}

            </button>

          </form>

          {/* Info */}
          <div className="mt-6 text-center">

            <p className="text-xs text-slate-600">
              OTP akan berlaku selama 10 menit.
            </p>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} TicketVerse
        </p>

      </motion.div>

    </main>
  );
}