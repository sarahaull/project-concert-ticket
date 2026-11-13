"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  CameraIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  SparklesIcon,
  LockClosedIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilSuperAdmin() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [formData, setFormData] = useState({
    name: "Super Admin TicketVerse",
    email: "superadmin@ticketverse.id",
    phone: "+62 812 3456 7890",
    role: "Super Administrator",
    location: "Jakarta, Indonesia",
    bio: "Mengelola seluruh operasional platform TicketVerse dan memastikan pengalaman terbaik bagi pengguna.",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError("Semua kolom wajib diisi.");
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      setPasswordSuccess(true);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
      }, 1500);
    }, 900);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;
    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div className={`w-full min-w-0 text-[#0B1220] transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      {/* ================= HERO ================= */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          {/* Breadcrumb */}
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            <span>Super Admin</span>
            <ChevronRightIcon className="h-3 w-3 text-white/30" />
            <span className="text-white/90">Profil Saya</span>
          </div>

          {/* Profile row */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sky-400/60 to-violet-500/60 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#0B1220] bg-[#13213b]">
                  <UserCircleIcon className="h-14 w-14 text-sky-200/80" />
                </div>
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white text-[#0B1220] shadow-lg transition hover:bg-slate-100"
                aria-label="Ubah foto profil"
              >
                <CameraIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <ShieldCheckIcon className="h-3 w-3 text-emerald-300" />
                Akun Terverifikasi
              </div>
              <h1 className="mt-2.5 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[28px]">
                {formData.name}
              </h1>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-sky-300 sm:justify-start">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                {formData.role}
              </p>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-white/60">
                {formData.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* INFORMASI PRIBADI */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                </span>
                Informasi Pribadi
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Perbarui data diri dan kontak Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <DevicePhoneMobileIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Lokasi
                  </label>
                  <div className="relative">
                    <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <div className="order-2 sm:order-1">
                  {showSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Profil berhasil diperbarui
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="order-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                >
                  {isSaving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>Simpan Perubahan</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* KEAMANAN AKUN */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                  <KeyIcon className="h-3.5 w-3.5" />
                </span>
                Keamanan Akun
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Kelola kata sandi dan autentikasi akun Anda
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* PASSWORD */}
              <div className="flex flex-col justify-between gap-3 px-5 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]/[0.05] text-[#0B1220]">
                    <LockClosedIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0B1220]">
                      Kata Sandi
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Terakhir diubah 3 bulan yang lalu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
                >
                  Ubah Sandi
                </button>
              </div>

              {/* 2FA */}
              <div className="flex flex-col justify-between gap-3 px-5 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]/[0.05] text-[#0B1220]">
                    <FingerPrintIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0B1220]">
                      Autentikasi Dua Faktor (2FA)
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Tingkatkan keamanan akun Anda
                    </p>
                  </div>
                </div>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-[11.5px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: STATUS AKUN */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-5 shadow-[0_8px_24px_rgba(11,18,32,0.18)]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-400/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-violet-400/10 blur-2xl" />

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] text-sky-300 backdrop-blur">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-[13px] font-semibold text-white">
                Status Akun
              </h3>
              <p className="mt-0.5 text-[11.5px] text-white/50">
                Informasi ringkas tentang akun Anda
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white/50">Status Verifikasi</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Terverifikasi
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white/50">Level Akses</span>
                  <span className="font-semibold text-white">Super Admin</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white/50">Bergabung Sejak</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    <CalendarDaysIcon className="h-3 w-3 text-white/40" />
                    01 Jan 2024
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <SparklesIcon className="h-3 w-3 text-amber-300" />
                  Akun Premium Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PASSWORD MODAL ================= */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePasswordModal();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/[0.06]">
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220]/[0.05] text-[#0B1220]">
                <LockClosedIcon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-slate-900">
                Ubah Kata Sandi
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                Gunakan kata sandi yang kuat dan tidak pernah digunakan di
                platform lain.
              </p>

              <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, current: e.target.value }))
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, next: e.target.value }))
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                  />
                </div>

                {passwordError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5">
                    <ExclamationTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <p className="text-[11.5px] leading-4 text-rose-700">
                      {passwordError}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    <p className="text-[11.5px] font-semibold text-emerald-700">
                      Kata sandi berhasil diperbarui
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePasswordModal}
                disabled={passwordSaving}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={passwordSaving || passwordSuccess}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordSaving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>Simpan Sandi</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}