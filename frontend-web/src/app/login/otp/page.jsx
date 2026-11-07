"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function OTPPage() {
  const router = useRouter();

  // ============================================================
  // API URL
  // ============================================================

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // ============================================================
  // STATE
  // ============================================================

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const inputsRef =
    useRef([]);

  // ============================================================
  // CEK EMAIL OTP
  // ============================================================

  useEffect(() => {
    const savedEmail =
      sessionStorage.getItem(
        "otp_email"
      );

    if (!savedEmail) {
      router.replace("/login");
      return;
    }

    setEmail(savedEmail);

    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  // ============================================================
  // HANDLE INPUT OTP
  // ============================================================

  const handleChange = (
    index,
    value
  ) => {
    // Hanya angka
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    // Ambil digit terakhir
    newOtp[index] =
      value.slice(-1);

    setOtp(newOtp);

    setError("");
    setSuccess("");

    // Pindah ke input berikutnya
    if (
      value &&
      index < 5
    ) {
      inputsRef.current[
        index + 1
      ]?.focus();
    }
  };

  // ============================================================
  // HANDLE KEY DOWN
  // ============================================================

  const handleKeyDown = (
    index,
    e
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputsRef.current[
        index - 1
      ]?.focus();
    }
  };

  // ============================================================
  // HANDLE PASTE
  // ============================================================

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedData
      .split("")
      .forEach(
        (number, index) => {
          newOtp[index] =
            number;
        }
      );

    setOtp(newOtp);

    setError("");
    setSuccess("");

    const nextIndex =
      Math.min(
        pastedData.length,
        5
      );

    inputsRef.current[
      nextIndex
    ]?.focus();
  };

  // ============================================================
  // REDIRECT BERDASARKAN ROLE
  // ============================================================

  const redirectByRole = (
    data
  ) => {
    console.log(
      "========== DATA LOGIN =========="
    );

    console.log(
      "DATA:",
      data
    );

    console.log(
      "USER:",
      data?.user
    );

    console.log(
      "ROLE USER:",
      data?.user?.role
    );

    console.log(
      "ROLE DATA:",
      data?.role
    );

    console.log(
      "================================"
    );

    // ========================================================
    // AMBIL ROLE
    // ========================================================

    const rawRole =
      data?.user?.role ??
      data?.user?.role_name ??
      data?.user?.user_role ??
      data?.user?.jenis_user ??
      data?.user?.tipe_user ??
      data?.role;

    // ========================================================
    // NORMALISASI ROLE
    // ========================================================

    const role =
      rawRole
        ?.toString()
        .trim()
        .toLowerCase()
        .replace(
          /[\s-]+/g,
          "_"
        );

    console.log(
      "ROLE FINAL:",
      role
    );

    // ========================================================
    // CUSTOMER
    // ========================================================

    if (
      role === "user" ||
      role === "pengguna" ||
      role === "customer"
    ) {
      router.replace(
        "/dashboard"
      );

      return;
    }

    // ========================================================
    // EVENT ORGANIZER
    // ========================================================

    if (
      role === "organizer" ||
      role === "organiser" ||
      role === "event_organizer"
    ) {
      router.replace(
        "/organizer"
      );

      return;
    }

    // ========================================================
    // SUPER ADMIN
    // ========================================================

    if (
      role === "super_admin" ||
      role === "superadmin"
    ) {
      router.replace(
        "/super-admin"
      );

      return;
    }

    // ========================================================
    // ROLE TIDAK DIKENALI
    // ========================================================

    console.error(
      "ROLE TIDAK DIKENALI:",
      rawRole
    );

    setError(
      `Role akun tidak dikenali: ${
        rawRole || "tidak ada"
      }`
    );
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // ========================================================
    // GABUNG OTP
    // ========================================================

    const otpCode =
      otp.join("");

    // ========================================================
    // VALIDASI OTP
    // ========================================================

    if (
      otpCode.length !== 6
    ) {
      setError(
        "Masukkan 6 digit kode OTP."
      );

      return;
    }

    try {
      setIsLoading(true);

      setError("");
      setSuccess("");

      // ======================================================
      // REQUEST
      // ======================================================

      const response =
        await fetch(
          `${API_URL}/api/auth/verify-otp`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              otp: otpCode,
            }),
          }
        );

      // ======================================================
      // PARSE RESPONSE
      // ======================================================

      const data =
        await response.json();

      console.log(
        "Response verify OTP:",
        data
      );

      // ======================================================
      // HANDLE ERROR
      // ======================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Kode OTP tidak valid."
        );
      }

      // ======================================================
      // CEK TOKEN
      // ======================================================

      if (!data?.token) {
        throw new Error(
          "Token login tidak diterima dari server."
        );
      }

      // ======================================================
      // CEK USER
      // ======================================================

      if (!data?.user) {
        throw new Error(
          "Data user tidak diterima dari server."
        );
      }

      // ======================================================
      // SIMPAN TOKEN
      // ======================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // ======================================================
      // SIMPAN USER
      // ======================================================

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );

      // ======================================================
      // HAPUS SESSION OTP
      // ======================================================

      sessionStorage.removeItem(
        "otp_email"
      );

      sessionStorage.removeItem(
        "otp_user"
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        "Verifikasi berhasil! Mengarahkan..."
      );

      // ======================================================
      // REDIRECT
      //
      // PENTING:
      // Kirim `data`, bukan `data.user`
      // ======================================================

      setTimeout(() => {
        redirectByRole(
          data
        );
      }, 500);
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      setError(
        error?.message ||
          "Terjadi kesalahan saat verifikasi OTP."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const resendOTP =
    async () => {
      // ========================================================
      // CEK EMAIL
      // ========================================================

      if (!email) {
        setError(
          "Email tidak ditemukan. Silakan login kembali."
        );

        return;
      }

      try {
        setIsResending(
          true
        );

        setError("");
        setSuccess("");

        // ======================================================
        // REQUEST RESEND
        // ======================================================

        const response =
          await fetch(
            `${API_URL}/api/auth/resend-otp`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
              }),
            }
          );

        // ======================================================
        // PARSE RESPONSE
        // ======================================================

        const data =
          await response.json();

        console.log(
          "Response resend OTP:",
          data
        );

        // ======================================================
        // HANDLE ERROR
        // ======================================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Gagal mengirim ulang OTP."
          );
        }

        // ======================================================
        // RESET INPUT OTP
        // ======================================================

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        // ======================================================
        // SUCCESS
        // ======================================================

        setSuccess(
          "Kode OTP baru telah dikirim ke email."
        );

        // ======================================================
        // FOCUS
        // ======================================================

        setTimeout(() => {
          inputsRef.current[
            0
          ]?.focus();
        }, 100);
      } catch (error) {
        console.error(
          "Resend OTP error:",
          error
        );

        setError(
          error?.message ||
            "Gagal mengirim ulang OTP."
        );
      } finally {
        setIsResending(
          false
        );
      }
    };

  // ============================================================
  // KEMBALI LOGIN
  // ============================================================

  const handleBackToLogin =
    () => {
      sessionStorage.removeItem(
        "otp_email"
      );

      sessionStorage.removeItem(
        "otp_user"
      );

      router.push(
        "/login"
      );
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1a2e] to-[#1a0a2e] flex items-center justify-center px-4 py-8">

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-md"
      >

        <div className="relative overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">

          {/* ================================================== */}
          {/* ICON */}
          {/* ================================================== */}

          <div className="flex justify-center mb-6">

            <div className="relative">

              <div className="absolute -inset-2 bg-blue-400/20 blur-xl rounded-2xl" />

              <div className="relative w-16 h-16 rounded-2xl bg-blue-400/10 border border-white/10 flex items-center justify-center">

                <ShieldCheckIcon className="w-8 h-8 text-blue-300" />

              </div>

            </div>

          </div>

          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <div className="text-center">

            <h1 className="text-2xl sm:text-3xl font-light text-white">
              Verifikasi OTP
            </h1>

            <div className="w-12 h-px bg-blue-300/50 mx-auto mt-3" />

            <p className="mt-4 text-sm text-white/40">
              Masukkan kode 6 digit yang
              dikirim ke
            </p>

            <p className="mt-1 text-sm text-blue-300 break-all">
              {email}
            </p>

          </div>

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-6 p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-300 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* ================================================== */}
          {/* SUCCESS */}
          {/* ================================================== */}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-6 p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm text-center"
            >
              {success}
            </motion.div>
          )}

          {/* ================================================== */}
          {/* FORM OTP */}
          {/* ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8"
          >

            <div
              className="flex justify-center gap-1.5 sm:gap-2.5 md:gap-3"
              onPaste={
                handlePaste
              }
            >

              {otp.map(
                (
                  value,
                  index
                ) => (
                  <input
                    key={index}
                    ref={(
                      element
                    ) => {
                      inputsRef.current[
                        index
                      ] =
                        element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      value
                    }
                    onChange={(
                      e
                    ) =>
                      handleChange(
                        index,
                        e.target
                          .value
                      )
                    }
                    onKeyDown={(
                      e
                    ) =>
                      handleKeyDown(
                        index,
                        e
                      )
                    }
                    disabled={
                      isLoading ||
                      isResending
                    }
                    className="w-10 h-13 sm:w-11 sm:h-14 md:w-12 md:h-14 text-center text-lg sm:text-xl font-semibold text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all disabled:opacity-50"
                  />
                )
              )}

            </div>

            {/* ================================================== */}
            {/* VERIFY BUTTON */}
            {/* ================================================== */}

            <motion.button
              type="submit"
              disabled={
                isLoading ||
                isResending ||
                otp.join("")
                  .length !== 6
              }
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >

              {isLoading
                ? "Memverifikasi..."
                : "Verifikasi OTP"}

            </motion.button>

          </form>

          {/* ================================================== */}
          {/* RESEND OTP */}
          {/* ================================================== */}

          <div className="text-center mt-6">

            <p className="text-sm text-white/30">
              Tidak menerima kode?
            </p>

            <button
              type="button"
              onClick={
                resendOTP
              }
              disabled={
                isResending ||
                isLoading
              }
              className="mt-1 text-sm text-blue-300 hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >

              {isResending
                ? "Mengirim ulang..."
                : "Kirim ulang OTP"}

            </button>

          </div>

          {/* ================================================== */}
          {/* BACK LOGIN */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={
              handleBackToLogin
            }
            disabled={
              isLoading ||
              isResending
            }
            className="block mx-auto mt-5 text-xs text-white/30 hover:text-white/60 disabled:opacity-50 transition-colors"
          >
            ← Kembali ke Login
          </button>

        </div>

      </motion.div>

    </div>
  );
}