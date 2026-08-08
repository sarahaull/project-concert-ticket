'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Ticket,
  ShieldCheck,
  Clock,
  MessageSquare,
  MapPin,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Ticket,
    title: 'Pesan Mudah',
    desc: 'Pesan tiket dalam hitungan menit dengan antarmuka yang intuitif dan cepat.',
    gradient: 'from-navy via-sapphire to-navy',
  },
  {
    icon: ShieldCheck,
    title: 'Aman & Terpercaya',
    desc: 'Sistem pembayaran terenkripsi dan perlindungan penuh untuk setiap transaksi.',
    gradient: 'from-sapphire via-navy to-sapphire',
  },
  {
    icon: Clock,
    title: 'Update Real-Time',
    desc: 'Dapatkan informasi terbaru tentang jadwal, kuota, dan pengumuman penting.',
    gradient: 'from-navy via-sapphire to-navy',
  },
  {
    icon: MessageSquare,
    title: 'Dukungan 24/7',
    desc: 'Tim support kami siap membantu Anda kapan saja melalui live chat.',
    gradient: 'from-sapphire via-navy to-sapphire',
  },
  {
    icon: MapPin,
    title: 'Lokasi Lengkap',
    desc: 'Informasi detail venue, akses transportasi, dan peta lokasi konser.',
    gradient: 'from-navy via-sapphire to-navy',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    desc: 'Akses dari mana saja dengan tampilan yang sempurna di semua perangkat.',
    gradient: 'from-sapphire via-navy to-sapphire',
  },
];

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -12, scale: 1.03, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-sapphire/20 transition-all duration-500 p-7 overflow-hidden">
        {/* Background gradien hidup */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-1000`} />
        <div className="absolute -inset-4 bg-gradient-to-r from-sapphire/5 via-transparent to-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl" />

        {/* Nomor dekoratif */}
        <div className="absolute -top-4 -right-2 text-8xl font-black text-navy/[0.04] group-hover:text-sapphire/[0.08] transition-colors duration-700 select-none">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Ikon dengan background gradien dan icon putih */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-sapphire flex items-center justify-center mb-5 shadow-lg group-hover:shadow-2xl transition-all duration-500">
          <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-navy/30 to-sapphire/30 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
        </div>

        <h3 className="text-xl font-extrabold text-navy mb-2 group-hover:text-sapphire transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm text-sapphire/70 leading-relaxed">{feature.desc}</p>

        <div className={`mt-5 h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-700 ease-out`} />
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-sapphire/40 group-hover:text-sapphire transition-colors duration-300">
          <span>Selengkapnya</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 overflow-hidden bg-ivory">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-champagne/5 to-ivory" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-navy/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sapphire/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-champagne/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #112250 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-warm-taupe/20 shadow-sm mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-navy/80 tracking-[0.15em] uppercase">Keunggulan</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-navy leading-tight tracking-tight">
            Mengapa Memilih{' '}
            <span className="bg-gradient-to-r from-navy via-sapphire to-navy bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              ConcertTi
            </span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-sapphire/40 to-navy/40 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-sapphire/70 max-w-xl mx-auto">
            Pengalaman pemesanan tiket konser yang dirancang dengan kemudahan dan sentuhan elegan.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-shimmer { animation: shimmer 4s linear infinite; }
      `}</style>
    </section>
  );
}