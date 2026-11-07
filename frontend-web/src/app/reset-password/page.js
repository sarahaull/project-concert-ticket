// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   LockKeyhole,
//   Eye,
//   EyeOff,
//   Loader2,
//   CheckCircle2,
// } from "lucide-react";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "http://localhost:5000/api/auth";

// export default function ResetPasswordPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");

//   const [newPassword, setNewPassword] =
//     useState("");

//   const [confirmPassword, setConfirmPassword] =
//     useState("");

//   const [showPassword, setShowPassword] =
//     useState(false);

//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState(false);

//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ============================================================
//   // AMBIL DATA RESET
//   // ============================================================

//   useEffect(() => {
//     const savedEmail =
//       sessionStorage.getItem(
//         "reset_password_email"
//       );

//     const savedOtp =
//       sessionStorage.getItem(
//         "reset_password_otp"
//       );

//     if (!savedEmail || !savedOtp) {
//       router.replace("/forgot-password");
//       return;
//     }

//     setEmail(savedEmail);
//     setOtp(savedOtp);
//   }, [router]);


//   // ============================================================
//   // RESET PASSWORD
//   // ============================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!email || !otp) {
//       setError(
//         "Sesi reset password tidak ditemukan. Silakan ulangi."
//       );
//       return;
//     }

//     if (!newPassword || !confirmPassword) {
//       setError(
//         "Password baru dan konfirmasi password wajib diisi."
//       );
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError(
//         "Password minimal 6 karakter."
//       );
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError(
//         "Konfirmasi password tidak cocok."
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         `${API_URL}/reset-password`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//             otp,
//             newPassword,
//             confirmPassword,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Gagal mengubah password"
//         );
//       }

//       setSuccess(
//         "Password berhasil diubah. Mengarahkan ke halaman login..."
//       );

//       // Hapus data reset
//       sessionStorage.removeItem(
//         "reset_password_email"
//       );

//       sessionStorage.removeItem(
//         "reset_password_otp"
//       );

//       setTimeout(() => {
//         router.push("/login");
//       }, 1500);

//     } catch (err) {
//       setError(
//         err.message ||
//           "Gagal mengubah password."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md">

//         <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

//           {/* Icon */}
//           <div className="flex justify-center mb-6">
//             <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
//               <LockKeyhole
//                 size={30}
//                 className="text-indigo-600"
//               />
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center mb-8">
//             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
//               Buat Password Baru
//             </h1>

//             <p className="text-sm text-slate-500 mt-3 leading-relaxed">
//               Buat password baru untuk akun
//               TicketVerse kamu.
//             </p>

//             {email && (
//               <p className="text-xs font-medium text-slate-500 mt-2 break-all">
//                 {email}
//               </p>
//             )}
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           {/* Success */}
//           {success && (
//             <div className="mb-5 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-600 flex gap-2">
//               <CheckCircle2
//                 size={18}
//                 className="shrink-0"
//               />
//               <span>{success}</span>
//             </div>
//           )}

//           <form
//             onSubmit={handleSubmit}
//             className="space-y-5"
//           >

//             {/* Password Baru */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Password Baru
//               </label>

//               <div className="relative">
//                 <LockKeyhole
//                   size={18}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type={
//                     showPassword
//                       ? "text"
//                       : "password"
//                   }
//                   value={newPassword}
//                   onChange={(e) =>
//                     setNewPassword(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Masukkan password baru"
//                   disabled={loading}
//                   className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword(
//                       !showPassword
//                     )
//                   }
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>

//               <p className="text-xs text-slate-400 mt-2">
//                 Minimal 6 karakter
//               </p>
//             </div>


//             {/* Konfirmasi Password */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Konfirmasi Password
//               </label>

//               <div className="relative">
//                 <LockKeyhole
//                   size={18}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type={
//                     showConfirmPassword
//                       ? "text"
//                       : "password"
//                   }
//                   value={confirmPassword}
//                   onChange={(e) =>
//                     setConfirmPassword(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Ulangi password baru"
//                   disabled={loading}
//                   className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowConfirmPassword(
//                       !showConfirmPassword
//                     )
//                   }
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>
//             </div>


//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <>
//                   <Loader2
//                     size={19}
//                     className="animate-spin"
//                   />
//                   Menyimpan Password...
//                 </>
//               ) : (
//                 <>
//                   <LockKeyhole size={19} />
//                   Ubah Password
//                 </>
//               )}
//             </button>
//           </form>
//         </div>

//         <p className="text-center text-xs text-slate-500 mt-6">
//           © {new Date().getFullYear()} TicketVerse
//         </p>
//       </div>
//     </main>
//   );
// }