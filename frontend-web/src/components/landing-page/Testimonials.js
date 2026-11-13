"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "Penonton Konser • Jakarta",
    concert: "Coldplay Music of the Spheres",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    quote: "Pengalaman war tiket di TicketVerse sangat stabil dan transparan. Antrean virtual jelas, konfirmasi pembayaran QRIS instan, dan e-tiket langsung tersimpan dengan barcode siap scan di gate GBK.",
    rating: 5,
  },
  {
    id: 2,
    name: "Siti Rahmawati",
    role: "K-Pop Enthusiast • Bandung",
    concert: "BLACKPINK 'BORN PINK' Encore",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    quote: "Sistem integrasi denah panggungnya sangat akurat. Tiket terjamin asli langsung dari promotor tanpa was-was calo. Pas hari pelaksanaan konser, tinggal buka HP dan langsung lolos masuk gate.",
    rating: 5,
  },
  {
    id: 3,
    name: "Budi Santoso",
    role: "Event Director • Surabaya",
    concert: "Java Jazz Festival 2026",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    quote: "Sebagai penikmat dan pemerhati event musik, TicketVerse memiliki standar platform yang sangat profesional dan bersih. Alur checkout ringkas dan perlindungan transaksi sangat terpercaya.",
    rating: 5,
  },
  {
    id: 4,
    name: "Dewi Lestari",
    role: "Content Creator • Yogyakarta",
    concert: "Sheila On 7: Tunggu Aku Di Jogja",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    quote: "Mendapatkan tiket kategori Festival tanpa kendala server down. Notifikasi pengingat rundown acara di hari H juga sangat membantu mengatur waktu keberangkatan ke venue.",
    rating: 5,
  },
  {
    id: 5,
    name: "Rizky Febrian",
    role: "Festival Goer • Bali",
    concert: "Djakarta Warehouse Project (DWP)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    quote: "Garansi keaslian tiket resmi dan sistem barcode anti-duplikasi memberikan rasa tenang penuh. Seluruh rekan komunitas kami kini selalu memesan tiket konser melalui TicketVerse.",
    rating: 5,
  },
  {
    id: 6,
    name: "Maya Putri",
    role: "Music Enthusiast • Semarang",
    concert: "Bernadya Tur Berjalan Bersama",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&auto=format&fit=crop&q=80",
    quote: "Desain antarmukanya sangat bersih, modern, dan nyaman digunakan. Proses dari memilih kursi hingga menerima e-tiket digital selesai dalam hitungan beberapa menit saja.",
    rating: 5,
  },
];

const TestimonialCard = ({ item }) => (
  <div className="w-[360px] sm:w-[420px] p-7 rounded-3xl bg-[#091124]/90 hover:bg-[#0e1933] border border-white/10 hover:border-blue-400/30 backdrop-blur-xl shadow-2xl transition-all duration-300 flex flex-col justify-between flex-shrink-0">
    <div>
      {/* Header: Avatar, Name, Verified Badge */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-blue-500/20 flex-shrink-0">
          <Image src={item.avatar} alt={item.name} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.role}</p>
        </div>
        <Quote className="w-5 h-5 text-blue-400/20 flex-shrink-0" />
      </div>

      {/* Concert Tag */}
      <div className="mb-3.5">
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 truncate max-w-full uppercase tracking-wider">
          {item.concert}
        </span>
      </div>

      {/* Star Rating (Clean Sky Blue / White, No Yellow) */}
      <div className="flex gap-1 mb-3.5">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-sky-400 fill-sky-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
        "{item.quote}"
      </p>
    </div>

    {/* Verified Reviewer Tag */}
    <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>Verified Attendee</span>
      <span className="text-blue-400 font-semibold">100% Genuine Review</span>
    </div>
  </div>
);

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedList = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="relative py-28 sm:py-36 bg-[#030612] text-white overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - Spacious & Clean */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <span>ULASAN PENONTON TERVERIFIKASI</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight uppercase"
          >
            Pengalaman Nyata Menonton{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
              Konser Spektakuler
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed"
          >
            Puluhan ribu penonton telah membuktikan kemudahan memesan tiket konser resmi melalui TicketVerse.
          </motion.p>
        </div>
      </div>

      {/* Infinite Smooth Carousel Ticker */}
      <div
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex gap-6 w-max"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedList.map((item, idx) => (
            <TestimonialCard key={`${item.id}-${idx}`} item={item} />
          ))}
        </motion.div>

        {/* Gradient edge faders */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#030612] to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#030612] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
