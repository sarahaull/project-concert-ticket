'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaTicketAlt, FaPhoneAlt } from 'react-icons/fa';
import { Sparkles, Send } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-ivory py-16 md:py-24">
      {/* Dekorasi Background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sapphire/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-champagne/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-warm-taupe/20 p-8 md:p-12 lg:p-16 overflow-hidden relative">
            {/* Dekorasi sudut */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sapphire/5 to-transparent rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-navy/5 to-transparent rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Konten Kiri */}
              <div className="flex-1 text-center lg:text-left">
                {/* Badge */}
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne/50 border border-warm-taupe/30 mb-4"
                >
                  <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-navy/70 uppercase tracking-wider">
                    Aplikasi ConcertTi
                  </span>
                </motion.div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight mb-4">
                  Lebih Mudah di{' '}
                  <span className="bg-gradient-to-r from-navy to-sapphire bg-clip-text text-transparent">
                    Genggamanmu
                  </span>
                </h2>

                <p className="text-base md:text-lg text-sapphire/70 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8">
                  Unduh aplikasi ConcertTi dan nikmati pengalaman pemesanan tiket 
                  yang lebih cepat dan praktis.
                </p>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {/* Beli Tiket Sekarang */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-navy to-sapphire text-ivory font-semibold shadow-xl shadow-sapphire/20 hover:shadow-sapphire/40 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <FaTicketAlt className="h-5 w-5" />
                    <span>Beli Tiket Sekarang</span>
                  </motion.button>

                  {/* Hubungi Kami */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-white border-2 border-navy/20 text-navy font-semibold shadow-lg hover:shadow-sapphire/20 transition-all duration-300 flex items-center justify-center gap-3 hover:border-sapphire hover:text-sapphire"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-champagne/0 via-champagne/20 to-champagne/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Send className="h-5 w-5" />
                    <span>Hubungi Kami</span>
                  </motion.button>
                </div>

                <p className="text-xs text-warm-taupe mt-4">
                  * Gratis download • Tersedia untuk iOS & Android
                </p>
              </div>

              {/* Ilustrasi HP (Kanan) – Menggunakan Gambar Nyata */}
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative"
                >
                  {/* Lingkaran dekoratif di belakang HP */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-champagne to-warm-taupe/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-sapphire/10 to-navy/10 rounded-full blur-2xl" />
                  
                  {/* Mockup HP dengan Gambar */}
                  <div className="relative w-56 md:w-64 h-auto">
                    <Image
                      src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80"
                      alt="Aplikasi ConcertTi di HP"
                      width={400}
                      height={600}
                      className="rounded-3xl shadow-2xl shadow-sapphire/20 border-4 border-white/80"
                    />
                    {/* Overlay kecil untuk efek glossy */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
                    
                    {/* Tombol home indikator (di bawah layar) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/40 rounded-full" />
                  </div>
                  
                  {/* Badge floating (Live Now) */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-4 -top-4 bg-white rounded-2xl shadow-xl border border-warm-taupe/20 px-4 py-2 hidden md:block"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-lg">🎵</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy">Live Now</p>
                        <p className="text-[10px] text-warm-taupe">Coldplay Jakarta</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Badge kedua (Rating) */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -left-4 -bottom-2 bg-white rounded-2xl shadow-xl border border-warm-taupe/20 px-4 py-2 hidden md:block"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-lg">⭐</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy">4.9 Rating</p>
                        <p className="text-[10px] text-warm-taupe">10k+ Reviews</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Garis dekoratif bawah */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sapphire/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}