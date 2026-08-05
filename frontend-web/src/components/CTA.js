'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { FaTicketAlt } from 'react-icons/fa';

export default function CTA() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pastel-blue-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pastel-blue-50/60 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-pastel-blue-50 via-white to-pastel-blue-50/50 rounded-4xl p-8 md:p-12 lg:p-16 border border-pastel-blue-100 shadow-2xl shadow-pastel-blue-200/20"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-4"
            >
              <SparklesIcon className="w-12 h-12 text-pastel-blue-400" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4">
              Siap Menikmati{' '}
              <span className="bg-gradient-to-r from-pastel-blue-400 to-pastel-blue-600 bg-clip-text text-transparent">
                Konser Impian
              </span>
              ?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Daftar sekarang dan dapatkan akses eksklusif ke ribuan tiket konser 
              terbaik di Indonesia. Jangan sampai kehabisan!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#concerts"
                className="bg-gradient-to-r from-pastel-blue-400 to-pastel-blue-600 text-white px-8 py-4 rounded-full font-semibold shadow-xl shadow-pastel-blue-200/50 hover:shadow-2xl hover:shadow-pastel-blue-300/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
              >
                <FaTicketAlt className="w-5 h-5" />
                Pesan Tiket Sekarang
              </Link>
              <Link
                href="#contact"
                className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full font-semibold border-2 border-pastel-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Hubungi Kami
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              * Tidak ada biaya pendaftaran. Mulai pesan tiket sekarang!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}