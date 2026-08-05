'use client';

import { motion } from 'framer-motion';
import {
  TicketIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: TicketIcon,
    title: 'Pesan Mudah',
    description: 'Pesan tiket dalam hitungan menit dengan antarmuka yang intuitif dan cepat.',
    color: 'from-sky-200 to-blue-200',
    iconColor: 'text-sky-700',
    border: 'border-sky-100/60',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Aman & Terpercaya',
    description: 'Sistem pembayaran terenkripsi dan perlindungan penuh untuk setiap transaksi.',
    color: 'from-blue-200 to-indigo-200',
    iconColor: 'text-blue-700',
    border: 'border-blue-100/60',
  },
  {
    icon: ClockIcon,
    title: 'Update Real-Time',
    description: 'Dapatkan informasi terbaru tentang jadwal, kuota, dan pengumuman penting.',
    color: 'from-cyan-200 to-sky-200',
    iconColor: 'text-cyan-700',
    border: 'border-cyan-100/60',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Dukungan 24/7',
    description: 'Tim support kami siap membantu Anda kapan saja melalui live chat.',
    color: 'from-pastel-blue-200 to-blue-200',
    iconColor: 'text-pastel-blue-700',
    border: 'border-pastel-blue-100/60',
  },
  {
    icon: MapPinIcon,
    title: 'Lokasi Lengkap',
    description: 'Informasi detail venue, akses transportasi, dan peta lokasi konser.',
    color: 'from-indigo-200 to-purple-200',
    iconColor: 'text-indigo-700',
    border: 'border-indigo-100/60',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Friendly',
    description: 'Akses dari mana saja dengan tampilan yang sempurna di semua perangkat.',
    color: 'from-pastel-blue-300 to-sky-200',
    iconColor: 'text-pastel-blue-700',
    border: 'border-pastel-blue-100/60',
  },
];

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="features"
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white via-pastel-blue-50/50 to-white"
    >
      {/* Dekorasi latar belakang – biru pastel lembut */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pastel-blue-200/30 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-sky-200/20 to-pastel-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 rounded-full blur-3xl" />
        {/* Garis dekoratif halus */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-pastel-blue-200/40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-pastel-blue-200/40" />
      </div>

      <div className="container-custom relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header – refined dengan sentuhan biru */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block text-[11px] tracking-[0.2em] uppercase font-medium text-pastel-blue-500 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full border border-pastel-blue-100/50 shadow-sm mb-5"
          >
            — Keunggulan Kami —
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-slate-800 leading-[1.15]">
            Mengapa Memilih{' '}
            <span className="font-medium bg-gradient-to-r from-pastel-blue-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              TicketVerse
            </span>
          </h2>

          <div className="w-12 h-0.5 bg-gradient-to-r from-pastel-blue-300/60 to-blue-300/60 mx-auto mt-5 mb-4" />

          <p className="text-base md:text-lg text-slate-500/80 leading-relaxed font-light max-w-xl mx-auto">
            Pengalaman pemesanan tiket konser yang dirancang dengan kemudahan dan sentuhan elegan.
          </p>
        </motion.div>

        {/* Grid fitur – elegan dengan palet biru pastel & putih */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`group relative bg-white/80 backdrop-blur-md rounded-2xl p-7 border ${feature.border} shadow-sm hover:shadow-xl hover:shadow-pastel-blue-100/40 transition-all duration-500 overflow-hidden`}
            >
              {/* Glow latar belakang halus saat hover */}
              <div
                className={`absolute -inset-1 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-700`}
              />

              {/* Dekorasi sudut elegan */}
              <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-gradient-to-br from-pastel-blue-100/40 to-white/40 blur-2xl group-hover:scale-150 transition-transform duration-700" />

              {/* Ikon dengan latar biru pastel lembut */}
              <div
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3.5 mb-5 border border-white/60 shadow-sm group-hover:shadow-md transition-all duration-300`}
              >
                <feature.icon className={`w-full h-full ${feature.iconColor} group-hover:scale-105 transition-transform duration-300`} />
              </div>

              <h3 className="text-lg font-medium text-slate-800 mb-2.5 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500/80 leading-relaxed font-light">
                {feature.description}
              </p>

              {/* Garis aksen bawah – biru pastel */}
              <div
                className={`mt-5 h-[2px] w-10 bg-gradient-to-r ${feature.color} rounded-full group-hover:w-16 transition-all duration-500`}
              />

              {/* Lingkaran dekoratif di sudut kanan bawah */}
              <div
                className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer dekoratif */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-xs text-slate-400/70 font-light tracking-wider">
            <span className="w-6 h-px bg-pastel-blue-200/50" />
            <span>Pengalaman terbaik untuk setiap momen</span>
            <span className="w-6 h-px bg-pastel-blue-200/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}