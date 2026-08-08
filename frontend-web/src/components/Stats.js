'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  FaUsers,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { Sparkles, ArrowUpRight } from 'lucide-react';

const stats = [
  {
    icon: FaUsers,
    value: 50000,
    label: 'Pengguna Aktif',
    suffix: '+',
    gradient: 'from-navy via-sapphire to-navy',
    bgGrad: 'bg-gradient-to-br from-navy to-sapphire',
    accent: 'navy',
  },
  {
    icon: FaTicketAlt,
    value: 200,
    label: 'Konser Sukses',
    suffix: '+',
    gradient: 'from-sapphire via-navy to-sapphire',
    bgGrad: 'bg-gradient-to-br from-sapphire to-navy',
    accent: 'sapphire',
  },
  {
    icon: FaCalendarAlt,
    value: 150,
    label: 'Event Tahunan',
    suffix: '+',
    gradient: 'from-navy via-sapphire to-navy',
    bgGrad: 'bg-gradient-to-br from-navy to-sapphire',
    accent: 'navy',
  },
  {
    icon: FaMapMarkerAlt,
    value: 30,
    label: 'Kota di Indonesia',
    suffix: '+',
    gradient: 'from-sapphire via-navy to-sapphire',
    bgGrad: 'bg-gradient-to-br from-sapphire to-navy',
    accent: 'sapphire',
  },
];

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const step = Math.max(1, Math.floor(target / 60));
      const interval = Math.floor(duration / 60);

      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView, target]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatCard = ({ stat, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -12,
        scale: 1.05,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="group relative"
    >
      <div className="relative rounded-2xl bg-white/80 backdrop-blur-md border-2 border-warm-taupe/20 shadow-lg hover:shadow-2xl hover:shadow-sapphire/20 transition-all duration-500 p-6 md:p-8 overflow-hidden">

        {/* Background gradien */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 rounded-2xl`}
        />
        <div className="absolute -inset-4 bg-gradient-to-r from-sapphire/5 via-transparent to-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />

        {/* Lingkaran dekoratif */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-sapphire/10 to-navy/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-navy/10 to-sapphire/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

        {/* ===== IKON DENGAN GRADIEN BACKGROUND (PASTI MUNCUL) ===== */}
        <div className="relative -mt-2 mb-4">
          {/* Shadow glow di belakang ikon */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-navy/20 to-sapphire/20 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-700" />

          {/* Kotak ikon dengan background gradien solid */}
          <div className={`relative w-20 h-20 rounded-2xl ${stat.bgGrad} shadow-lg group-hover:shadow-2xl transition-all duration-500 flex items-center justify-center border-2 border-white/30`}>
            {/* Efek glossy */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-white/5 pointer-events-none" />
            
            {/* IKON WARNA PUTIH (PASTI TERLIHAT) */}
            <Icon className="w-9 h-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500" />
            
            {/* Glow luar */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-navy/30 via-sapphire/20 to-navy/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
          </div>

          {/* Dekorasi sudut */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${stat.gradient} opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-sm`} />
          <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm`} />
        </div>

        {/* ===== ANGKA ===== */}
        <div className="relative z-10">
          <div className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(17,34,80,0.1)]`}>
            <Counter target={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-sm font-semibold text-sapphire/60 mt-1 group-hover:text-sapphire transition-colors duration-300">
            {stat.label}
          </p>
        </div>

        {/* ===== GARIS AKSEK ===== */}
        <div
          className={`relative z-10 mt-4 h-1 w-16 bg-gradient-to-r ${stat.gradient} rounded-full group-hover:w-full transition-all duration-700 ease-out`}
        />

        {/* ===== TOMBOL "LIHAT DETAIL" ===== */}
        <div className="relative z-10 mt-3 flex items-center gap-1 text-xs font-bold text-sapphire/30 group-hover:text-sapphire transition-colors duration-300">
          <span>Lihat detail</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </div>

        {/* ===== BADGE ===== */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-warm-taupe/10 text-[10px] font-bold text-warm-taupe/40 group-hover:text-sapphire/40 transition-colors duration-300">
          #{String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  );
};

export default function Stats() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 overflow-hidden bg-ivory">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-champagne/5 to-ivory" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-navy/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sapphire/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-champagne/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #112250 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-warm-taupe/20 shadow-lg shadow-navy/5 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-navy/80 tracking-[0.2em] uppercase">
              Prestasi Kami
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-navy leading-tight tracking-tight">
            Tumbuh Bersama{' '}
            <span className="bg-gradient-to-r from-navy via-sapphire to-navy bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Komunitas
            </span>
          </h2>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sapphire/60 to-transparent rounded-full" />
            <span className="text-amber-400 text-sm">✦</span>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sapphire/60 to-transparent rounded-full" />
          </div>

          <p className="mt-5 text-base sm:text-lg text-sapphire/70 max-w-xl mx-auto">
            Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan memesan tiket di ConcertTi.
          </p>
        </motion.div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-14"
        >
          <div className="inline-flex items-center gap-4 text-xs text-warm-taupe/50 font-medium tracking-widest uppercase">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-warm-taupe/30 to-transparent" />
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-sapphire/30" />
              Terpercaya oleh ribuan pengguna
              <span className="w-1 h-1 rounded-full bg-sapphire/30" />
            </span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-warm-taupe/30 to-transparent" />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
      `}</style>
    </section>
  );
}