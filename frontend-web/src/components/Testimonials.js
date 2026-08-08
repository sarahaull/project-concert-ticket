"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "Penggemar Musik",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
    quote: "Pengalaman memesan tiket di ConcertTi sangat mudah dan cepat. Saya berhasil mendapatkan tiket konser favorit saya tanpa ribet.",
    rating: 5,
  },
  {
    id: 2,
    name: "Siti Rahma",
    role: "Kolektor Tiket",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=center",
    quote: "Sistem yang transparan dan informatif. Saya selalu update dengan jadwal konser terbaru berkat notifikasi dari ConcertTi.",
    rating: 5,
  },
  {
    id: 3,
    name: "Budi Santoso",
    role: "Event Organizer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
    quote: "Sebagai EO, saya sangat terbantu dengan platform ini. Proses penjualan tiket menjadi lebih terorganisir dan efisien.",
    rating: 4,
  },
  {
    id: 4,
    name: "Dewi Lestari",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
    quote: "Desain UI yang cantik dan mudah digunakan. ConcertTi benar-benar mengubah cara saya membeli tiket konser.",
    rating: 5,
  },
  {
    id: 5,
    name: "Rizky Febrian",
    role: "Mahasiswa",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
    quote: "Harga tiket kompetitif dan proses checkout super cepat. Recomended banget buat anak muda!",
    rating: 4,
  },
  {
    id: 6,
    name: "Maya Putri",
    role: "Artis",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=center",
    quote: "Platform yang sangat membantu para penggemar musik. Tiket resmi terjamin dan prosesnya transparan.",
    rating: 5,
  },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-3.5 h-3.5 transition-colors duration-300 ${
            i < rating ? "text-amber-400" : "text-warm-taupe/20"
          }`}
        />
      ))}
    </div>
  );
};

const TestimonialSlide = ({ testimonial }) => {
  return (
    <div className="min-w-[320px] md:min-w-[380px] px-4 flex-shrink-0">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-warm-taupe/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        {/* Header: Avatar + Nama */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-navy/10 shadow-md flex-shrink-0">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-navy truncate">
              {testimonial.name}
            </h4>
            <p className="text-[10px] text-warm-taupe font-medium truncate">
              {testimonial.role}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Quote className="w-5 h-5 text-sapphire/20" />
          </div>
        </div>

        {/* Rating */}
        <StarRating rating={testimonial.rating} />

        {/* Quote */}
        <p className="mt-2 text-sm text-sapphire/70 leading-relaxed font-light italic line-clamp-3">
          "{testimonial.quote}"
        </p>

        {/* Garis dekoratif */}
        <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-sapphire/30 to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default function Testimonials() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [isPaused, setIsPaused] = useState(false);

  // Duplikat array untuk infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-ivory"
    >
      {/* Background dekorasi */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-champagne/10 to-ivory" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sapphire/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-champagne/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-warm-taupe/30 shadow-sm mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-navy tracking-wider uppercase">Testimoni</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy leading-[1.1] tracking-tight">
            Apa Kata <span className="bg-gradient-to-r from-navy to-sapphire bg-clip-text text-transparent">Mereka</span>
          </h2>
          <p className="mt-3 text-base text-sapphire/70 max-w-xl mx-auto">
            Lebih dari 500+ pengguna telah merasakan kemudahan di ConcertTi
          </p>
        </motion.div>

        {/* Marquee / Infinite Scroll */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="flex gap-4 py-6"
            animate={{
              x: ["0%", "-33.33%"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              pause: isPaused,
            }}
            style={{ width: "max-content" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialSlide key={`${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </motion.div>

          {/* Gradient overlay di ujung kiri & kanan */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ivory to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ivory to-transparent pointer-events-none" />
        </div>

        {/* Tombol CTA kecil di bawah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-10"
        >
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-navy to-sapphire text-ivory text-sm font-medium shadow-lg shadow-navy/20 hover:shadow-navy/40 transition-all duration-300 hover:scale-105">
            Lihat Semua Testimoni
            <span className="text-xs">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}