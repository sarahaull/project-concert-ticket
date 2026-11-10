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
} from "@heroicons/react/24/outline";

export default function ProfilSuperAdmin() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8ab4f8] to-[#4a6b9a] p-1">
              <div className="w-full h-full rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden border-2 border-[#13213b]">
                <UserCircleIcon className="w-16 h-16 text-[#8aa0c0]" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg text-[#0a1628] hover:text-[#8ab4f8] transition-colors border border-[#e0e8f0]">
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
              {formData.name}
            </h1>
            <p className="text-sm text-[#8ab4f8] font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <ShieldCheckIcon className="w-4 h-4" />
              {formData.role}
            </p>
            <p className="text-xs text-[#8aa0c0] mt-2 max-w-md">{formData.bio}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2">
                  <PencilSquareIcon className="w-5 h-5 text-[#4a6b9a]" />
                  Informasi Pribadi
                </h2>
                <p className="text-[11px] text-[#7e91b2] mt-0.5">Perbarui data diri dan kontak Anda</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Alamat Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Nomor Telepon</label>
                  <div className="relative">
                    <DevicePhoneMobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1.5 block">Lokasi</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-sm font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <div>
                  {showSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                      <CheckCircleIcon className="w-4 h-4" /> Profil berhasil diperbarui
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(10,22,40,0.2)] disabled:opacity-70 transition-all"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-6 rounded-2xl shadow-sm">
            <h2 className="text-[15px] font-bold text-[#0a1628] flex items-center gap-2 mb-6">
              <KeyIcon className="w-5 h-5 text-[#4a6b9a]" />
              Keamanan Akun
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-[#e0e8f0] rounded-xl hover:bg-[#f8fafc] transition-colors gap-3">
                <div>
                  <p className="text-sm font-bold text-[#0a1628]">Kata Sandi</p>
                  <p className="text-[11px] text-[#7e91b2] mt-0.5">Terakhir diubah 3 bulan yang lalu</p>
                </div>
                <button className="text-xs font-semibold text-[#5a7aad] border border-[#d0d8e4] px-4 py-2 rounded-lg hover:bg-white hover:border-[#8ab4f8] transition-all">
                  Ubah Sandi
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-[#e0e8f0] rounded-xl hover:bg-[#f8fafc] transition-colors gap-3">
                <div>
                  <p className="text-sm font-bold text-[#0a1628]">Autentikasi Dua Faktor (2FA)</p>
                  <p className="text-[11px] text-[#7e91b2] mt-0.5">Tingkatkan keamanan akun Anda</p>
                </div>
                <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-all">
                  Aktif
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ab4f8]/10 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-[#8ab4f8]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Status Akun</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8aa0c0]">Status Verifikasi</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Terverifikasi
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8aa0c0]">Level Akses</span>
                  <span className="text-white font-semibold">Super Admin</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8aa0c0]">Bergabung Sejak</span>
                  <span className="text-white font-semibold">01 Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}