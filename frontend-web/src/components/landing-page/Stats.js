"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  Ticket,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Penonton Terlayani",
    desc: "Membeli tiket konser resmi secara aman",
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: Ticket,
    value: 200,
    suffix: "+",
    label: "Konser & Festival",
    desc: "Bekerjasama dengan promotor ternama",
    color: "from-indigo-600 to-sky-600",
  },
  {
    icon: MapPin,
    value: 30,
    suffix: "+",
    label: "Kota Penyelenggara",
    desc: "Tur konser di berbagai kota Indonesia",
    color: "from-sky-600 to-blue-600",
  },
  {
    icon: ShieldCheck,
    value: 99.9,
    suffix: "%",
    decimals: 1,
    label: "Validitas Tiket di Gate",
    desc: "Jaminan keaslian barcode tanpa duplikasi",
    color: "from-blue-600 to-sky-400",
  },
];

const Counter = ({ target, suffix, decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString("id-ID")}
      {suffix}
    </span>
  );
};

export default function Stats() {
  return (
    <section id="stats" className="relative py-24 sm:py-32 bg-[#040814] text-white overflow-hidden border-y border-white/10">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - Spacious & Clean */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>PENCAPAIAN PLATFORM TICKETVERSE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-black tracking-tight uppercase"
          >
            Dipercaya Puluhan Ribu Penonton Konser
          </motion.h2>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative p-8 rounded-3xl bg-[#091124]/80 hover:bg-[#0e1933] border border-white/10 hover:border-blue-400/40 backdrop-blur-xl shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    <Counter target={item.value} suffix={item.suffix} decimals={item.decimals} />
                  </p>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mt-2">
                    {item.label}
                  </h3>

                  <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <div className="h-1 w-12 bg-blue-600 rounded-full group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Venue Partner Badges (Clean Typography) */}
        <div className="mt-16 pt-10 border-t border-white/10 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Panggung & Venue Terkemuka Yang Telah Terintegrasi
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-60 hover:opacity-90 transition-opacity text-slate-300 font-bold text-sm tracking-widest">
            <span>STADION UTAMA GBK</span>
            <span>JIEXPO KEMAYORAN</span>
            <span>ICE BSD CITY</span>
            <span>GWK BALI</span>
            <span>SENTUL SICC</span>
            <span>JOGJA EXPO CENTER</span>
          </div>
        </div>
      </div>
    </section>
  );
}
