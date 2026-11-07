"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Mail,
} from "lucide-react";

export default function VerifyForgotPasswordPage() {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // AMBIL EMAIL DARI SESSION
  // =====================================================

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "forgot_password_email"
    );

    if (!savedEmail) {
      router.replace("/forgot-password");
      return;
    }

    setEmail(savedEmail);
  }, [router]);

  // =====================================================
  // INPUT OTP
  // =====================================================

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanOtp = String(otp).trim();

    if (!cleanEmail) {
      setError(
        "Email tidak ditemukan. Silakan ulangi."
      );
      return;
    }

    if (cleanOtp.length !== 6) {
      setError(
        "OTP harus terdiri dari 6 digit."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("=================================");
      console.log("VERIFY RESET OTP");
      console.log("EMAIL:", cleanEmail);
      console.log("OTP DARI FE:", cleanOtp);
      console.log(
        "API:",
        `${API_URL}/api/auth/verify-reset-otp`
      );
      console.log("=================================");

      const response = await fetch(
        `${API_URL}/api/auth/verify-reset-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            otp: cleanOtp,
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
            "OTP salah atau tidak valid."
        );
      }

      // =================================================
      // SIMPAN OTP UNTUK RESET PASSWORD
      // =================================================

      sessionStorage.setItem(
        "forgot_password_email",
        cleanEmail
      );

      sessionStorage.setItem(
        "forgot_password_otp",
        cleanOtp
      );

      setSuccess(
        "OTP benar. Mengarahkan ke reset password..."
      );

      setTimeout(() => {
        router.push(
          "/forgot-password/reset"
        );
      }, 700);

    } catch (error) {

      console.error(
        "Verify reset OTP error:",
        error
      );

      setError(
        error.message ||
          "Gagal memverifikasi OTP."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // KIRIM ULANG OTP
  // =====================================================

  const handleResend = async () => {
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      return;
    }

    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      console.log(
        "Mengirim ulang OTP:",
        cleanEmail
      );

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
        throw new Error(
          `Server response tidak valid (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Gagal mengirim ulang OTP."
        );
      }

      // OTP lama jangan dipakai
      sessionStorage.removeItem(
        "forgot_password_otp"
      );

      setOtp("");

      setSuccess(
        "OTP baru berhasil dikirim. Gunakan OTP terbaru."
      );

      console.log(
        "✅ OTP baru berhasil dikirim."
      );

    } catch (error) {

      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        error.message ||
          "Gagal mengirim ulang OTP."
      );

    } finally {
      setResendLoading(false);
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
              "/forgot-password"
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

              <ShieldCheck
                size={32}
                className="text-blue-400"
              />

            </div>

          </div>

          {/* Title */}
          <div className="text-center mb-8">

            <h1 className="text-2xl font-bold mb-2">
              Verifikasi OTP
            </h1>

            <p className="text-slate-400 text-sm leading-6">
              Masukkan kode OTP 6 digit yang
              dikirim ke email kamu.
            </p>

          </div>

          {/* Email */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">

            <div className="flex items-center gap-3">

              <Mail
                size={18}
                className="text-blue-400"
              />

              <div className="min-w-0">

                <p className="text-xs text-slate-500">
                  OTP dikirim ke
                </p>

                <p className="text-sm text-white truncate">
                  {email}
                </p>

              </div>

            </div>

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

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Kode OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-700"
              />

            </div>

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 py-3.5 font-semibold transition flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Memverifikasi...
                </>
              ) : (
                "Verifikasi OTP"
              )}

            </button>

          </form>

          {/* Resend */}
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500 mb-3">
              Tidak menerima kode?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition"
            >

              {resendLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Mengirim...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />

                  Kirim ulang OTP
                </>
              )}

            </button>

          </div>

        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} TicketVerse
        </p>

      </motion.div>

    </main>
  );
}