'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FaUsers,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const stats = [
  {
    icon: FaUsers,
    value: '50.000+',
    label: 'Pengguna Aktif',
    color: 'from-blue-300 to-blue-400',
    bg: 'bg-blue-100/50',
    iconBg: 'bg-blue-400/20',
  },
  {
    icon: FaTicketAlt,
    value: '200+',
    label: 'Konser Sukses',
    color: 'from-indigo-300 to-indigo-400',
    bg: 'bg-indigo-100/50',
    iconBg: 'bg-indigo-400/20',
  },
  {
    icon: FaCalendarAlt,
    value: '150+',
    label: 'Event Tahunan',
    color: 'from-cyan-300 to-cyan-400',
    bg: 'bg-cyan-100/50',
    iconBg: 'bg-cyan-400/20',
  },
  {
    icon: FaMapMarkerAlt,
    value: '30+',
    label: 'Kota di Indonesia',
    color: 'from-purple-300 to-purple-400',
    bg: 'bg-purple-100/50',
    iconBg: 'bg-purple-400/20',
  },
];

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #dbeafe 100%)',
      }}
    >
      {/* Dekorasi Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      {/* Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Heading minimalis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 text-xs font-medium text-blue-500 tracking-wider uppercase shadow-sm">
            ✦ Prestasi Kami
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light text-slate-700">
            <span className="font-semibold text-slate-800">Tumbuh Bersama</span> Komunitas
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Grid Statistik */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2, type: 'spring', stiffness: 400 },
              }}
              className="group relative bg-white/50 backdrop-blur-md rounded-2xl p-6 text-center border border-white/60 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              {/* Lingkaran latar belakang ikon */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Ikon */}
              <div
                className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} mx-auto mb-4 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              {/* Nilai */}
              <p className="relative z-10 text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                {stat.value}
              </p>

              {/* Label */}
              <p className="relative z-10 text-sm text-slate-500 font-medium mt-1">
                {stat.label}
              </p>

              {/* Garis dekoratif di bawah */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-300/50 to-indigo-300/50 group-hover:w-12 transition-all duration-500 rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}