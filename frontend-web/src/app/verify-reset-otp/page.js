// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   ArrowLeft,
//   Loader2,
//   ShieldCheck,
//   RotateCcw,
// } from "lucide-react";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "http://localhost:5000/api/auth";

// export default function VerifyResetOTPPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [countdown, setCountdown] = useState(60);

//   // ============================================================
//   // AMBIL EMAIL
//   // ============================================================

//   useEffect(() => {
//     const queryEmail = searchParams.get("email");

//     const savedEmail =
//       sessionStorage.getItem(
//         "reset_password_email"
//       );

//     const finalEmail =
//       queryEmail || savedEmail || "";

//     if (finalEmail) {
//       setEmail(finalEmail);

//       sessionStorage.setItem(
//         "reset_password_email",
//         finalEmail
//       );
//     }
//   }, [searchParams]);


//   // ============================================================
//   // COUNTDOWN RESEND
//   // ============================================================

//   useEffect(() => {
//     if (countdown <= 0) return;

//     const timer = setInterval(() => {
//       setCountdown((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [countdown]);


//   // ============================================================
//   // INPUT OTP
//   // ============================================================

//   const handleOtpChange = (e) => {
//     const value = e.target.value
//       .replace(/\D/g, "")
//       .slice(0, 6);

//     setOtp(value);
//     setError("");
//   };


//   // ============================================================
//   // VERIFY OTP
//   // ============================================================

//   const handleVerify = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!email) {
//       setError("Email tidak ditemukan.");
//       return;
//     }

//     if (otp.length !== 6) {
//       setError("Masukkan 6 digit kode OTP.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         `${API_URL}/verify-reset-otp`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//             otp,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "OTP tidak valid"
//         );
//       }

//       // Simpan email + OTP untuk reset password
//       sessionStorage.setItem(
//         "reset_password_email",
//         email
//       );

//       sessionStorage.setItem(
//         "reset_password_otp",
//         otp
//       );

//       setSuccess(
//         "OTP berhasil diverifikasi."
//       );

//       setTimeout(() => {
//         router.push("/reset-password");
//       }, 700);

//     } catch (err) {
//       setError(
//         err.message ||
//           "OTP tidak dapat diverifikasi."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ============================================================
//   // RESEND OTP
//   // ============================================================

//   const handleResend = async () => {
//     if (countdown > 0 || !email) return;

//     setError("");
//     setSuccess("");
//     setResending(true);

//     try {
//       const response = await fetch(
//         `${API_URL}/forgot-password`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Gagal mengirim ulang OTP"
//         );
//       }

//       setSuccess(
//         "Kode OTP baru berhasil dikirim."
//       );

//       setOtp("");
//       setCountdown(60);

//     } catch (err) {
//       setError(
//         err.message ||
//           "Gagal mengirim ulang OTP."
//       );
//     } finally {
//       setResending(false);
//     }
//   };


//   return (
//     <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md">

//         <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

//           {/* Icon */}
//           <div className="flex justify-center mb-6">
//             <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
//               <ShieldCheck
//                 size={30}
//                 className="text-indigo-600"
//               />
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center mb-8">
//             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
//               Verifikasi OTP
//             </h1>

//             <p className="text-sm text-slate-500 mt-3 leading-relaxed">
//               Masukkan kode 6 digit yang telah
//               dikirim ke
//             </p>

//             <p className="text-sm font-semibold text-slate-800 mt-1 break-all">
//               {email || "email kamu"}
//             </p>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           {/* Success */}
//           {success && (
//             <div className="mb-5 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-600">
//               {success}
//             </div>
//           )}

//           <form
//             onSubmit={handleVerify}
//             className="space-y-6"
//           >

//             {/* OTP */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
//                 Kode OTP
//               </label>

//               <input
//                 type="text"
//                 inputMode="numeric"
//                 autoComplete="one-time-code"
//                 maxLength={6}
//                 value={otp}
//                 onChange={handleOtpChange}
//                 placeholder="000000"
//                 disabled={loading}
//                 className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
//               />
//             </div>

//             {/* Verify */}
//             <button
//               type="submit"
//               disabled={
//                 loading ||
//                 otp.length !== 6
//               }
//               className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <>
//                   <Loader2
//                     size={19}
//                     className="animate-spin"
//                   />
//                   Memverifikasi...
//                 </>
//               ) : (
//                 <>
//                   <ShieldCheck size={19} />
//                   Verifikasi OTP
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Resend */}
//           <div className="text-center mt-6">
//             <p className="text-sm text-slate-500 mb-2">
//               Tidak menerima kode?
//             </p>

//             <button
//               type="button"
//               onClick={handleResend}
//               disabled={
//                 countdown > 0 ||
//                 resending
//               }
//               className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed"
//             >
//               {resending ? (
//                 <>
//                   <Loader2
//                     size={16}
//                     className="animate-spin"
//                   />
//                   Mengirim...
//                 </>
//               ) : countdown > 0 ? (
//                 <>
//                   Kirim ulang dalam {countdown}s
//                 </>
//               ) : (
//                 <>
//                   <RotateCcw size={16} />
//                   Kirim ulang OTP
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Back */}
//           <button
//             type="button"
//             onClick={() =>
//               router.push("/forgot-password")
//             }
//             className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
//           >
//             <ArrowLeft size={17} />
//             Ganti Email
//           </button>
//         </div>

//         <p className="text-center text-xs text-slate-500 mt-6">
//           © {new Date().getFullYear()} TicketVerse
//         </p>
//       </div>
//     </main>
//   );
// }