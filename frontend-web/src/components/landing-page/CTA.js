"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function CTA() {
  const router = useRouter();

  const handleBrowseConcerts = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (!token || !user) {
        router.push("/login");
        return;
      }
    }
    router.push("/cari-acara");
  };

  return (
    <section id="cta" className="relative py-28 sm:py-36 bg-[#030612] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-[36px] border border-blue-500/25 overflow-hidden shadow-2xl">
          {/* Real Concert Crowd Jumping Background with Sapphire Grading */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&q=85&auto=format&fit=crop"
              alt="Live Festival Crowd Cheering"
              fill
              className="object-cover object-center opacity-35 mix-blend-luminosity scale-105"
            />
            {/* Dramatic blue/black stage overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030612]/95 via-[#030612]/85 to-[#030612]/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030612] via-transparent to-[#030612]" />
          </div>

          <div className="relative z-10 p-10 sm:p-16 lg:p-24 text-center flex flex-col items-center max-w-3xl mx-auto">
            {/* Clean Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>AKSES TIKET RESMI TERBUKA</span>
            </div>

            {/* Concert Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.08]">
              Amankan Tiket Konser Impian{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
                Sebelum Kehabisan
              </span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl">
              Kuota tiket konser populer terbatas dan dapat habis sewaktu-waktu. Masuk ke akun Anda sekarang untuk memilih kursi favorit.
            </p>

            {/* Buttons (Clean Sapphire & Silver, No Yellow) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBrowseConcerts}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2.5 group"
              >
                <Ticket className="w-4 h-4" />
                <span>Pesan Tiket Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all text-center"
              >
                Daftar Akun Baru
              </Link>
            </div>

            {/* Trust Assurances */}
            <div className="mt-14 pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>100% Tiket Resmi Garansi Uang Kembali</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Bebas Calo & Scan Barcode Instan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
