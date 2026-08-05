"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "Penggemar Musik",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
    quote: "Pengalaman memesan tiket di TicketVerse sangat mudah dan cepat. Saya berhasil mendapatkan tiket konser favorit saya tanpa ribet.",
    rating: 5,
  },
  {
    id: 2,
    name: "Siti Rahma",
    role: "Kolektor Tiket",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=center",
    quote: "Sistem yang transparan dan informatif. Saya selalu update dengan jadwal konser terbaru berkat notifikasi dari TicketVerse.",
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
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 transition-colors duration-300 ${
            i < rating ? "text-amber-400" : "text-stone-200"
          }`}
        />
      ))}
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-6 bg-stone-50/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <span className="inline-block text-[11px] font-medium text-blue-400 tracking-[0.15em] uppercase mb-5">
            Testimoni
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-stone-800 leading-tight">
            Apa Kata Mereka
          </h2>
          <div className="w-10 h-px bg-stone-300 mx-auto mt-4" />
          <p className="mt-5 text-sm text-stone-400 font-light tracking-wide">
            Ribuan pengguna telah merasakan kemudahan memesan tiket di TicketVerse.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-2xl p-7 md:p-8 border border-stone-100/80 shadow-sm hover:shadow-lg hover:border-stone-200/60 transition-all duration-400"
            >
              {/* Avatar & Nama */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-stone-200/60 group-hover:ring-blue-200/50 transition-all duration-300">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-700 tracking-wide">
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-light tracking-wide">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <StarRating rating={testimonial.rating} />

              {/* Quote */}
              <p className="mt-4 text-sm text-stone-500 leading-relaxed font-light italic tracking-wide">
                "{testimonial.quote}"
              </p>

              {/* Garis dekoratif hover */}
              <div className="mt-5 w-8 h-px bg-stone-200/50 group-hover:w-12 group-hover:bg-blue-300/50 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}