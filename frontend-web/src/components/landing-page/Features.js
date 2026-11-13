"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Eye,
  ShieldCheck,
  QrCode,
  Zap,
  CreditCard,
  Headphones,
  CheckCircle2,
  SlidersHorizontal,
  Camera,
  MapPin,
  Volume2,
  Compass,
  Radio,
  Sparkles,
  Activity,
  ScanLine,
} from "lucide-react";

const stageSections = [
  {
    id: "vip",
    name: "VIP Soundcheck & Diamond",
    shortName: "VIP DIAMOND",
    sectionBadge: "FRONT STAGE PIT",
    distance: "5 - 10 Meter dari Panggung",
    elevation: "Lantai Dasar (Eye Level)",
    sightline: "100% Frontal Tanpa Halangan",
    soundPressure: "105 dB (Direct Monitor Rig)",
    gateRoute: "Gate A (Jalur Khusus VIP Barat)",
    povPhoto:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80",
    viewDesc:
      "Perspektif paling eksklusif tepat di bibir panggung dan runway artis. Anda dapat menyaksikan kontak mata musisi, detail aksi panggung, dan efek piroteknik secara langsung tanpa terhalang penonton lain.",
    perks: [
      "Akses Eksklusif Sesi Soundcheck Artis",
      "Lounge VIP Ber-AC dengan F&B Gratis",
      "Official Exclusive Merchandise & Lanyard Pass",
    ],
    zoneColor: "#2563eb",
    pinPosition: { x: 215, y: 125 },
  },
  {
    id: "festival",
    name: "Festival Standing A / B",
    shortName: "FESTIVAL FLOOR",
    sectionBadge: "FLOOR LEVEL ZONE",
    distance: "20 - 25 Meter di Depan Catwalk",
    elevation: "Lantai Dasar (Standing Crowd)",
    sightline: "95% Dinamis Tengah Kerumunan",
    soundPressure: "100 dB (Surround Subwoofer Arena)",
    gateRoute: "Gate B & C (Akses Cepat Plaza Barat)",
    povPhoto:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
    viewDesc:
      "Euforia murni festival musik di tengah lautan penonton. Sangat pas bagi Anda yang ingin melompat, bernyanyi bersama, dan merasakan hentakan bass spektakuler tepat di hadapan runway panggung.",
    perks: [
      "Bebas Bergerak Mengitari Area Catwalk",
      "Gelang Wristband LED Sinkronisasi Lampu Konser",
      "Akses Cepat Menuju Official Food & Drink Station",
    ],
    zoneColor: "#0284c7",
    pinPosition: { x: 300, y: 215 },
  },
  {
    id: "tribune",
    name: "Tribune Center Tier 1",
    shortName: "TRIBUNE CAT 1",
    sectionBadge: "ELEVATED STADIUM VIEW",
    distance: "45 - 55 Meter dari Panggung",
    elevation: "Tribun Bertingkat (Elevasi +8m)",
    sightline: "98% Panorama Seluruh Stadion",
    soundPressure: "92 dB (FOH Arena Master Mix)",
    gateRoute: "Gate Utama Utara (Eskalator & Lift Khusus)",
    povPhoto:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&auto=format&fit=crop&q=80",
    viewDesc:
      "Pemandangan panorama spektakuler dari kursi tribun tengah. Menyajikan visibilitas sempurna atas megascreen panggung, tata lampu arsitektural 360°, dan gelombang lautan cahaya stadion.",
    perks: [
      "Kursi Bernomor Ergonomis Pasti Tanpa Berebut",
      "Akses Tangga & Eskalator Langsung Tanpa Antrean",
      "Perspektif Ideal untuk Dokumentasi Foto & Video",
    ],
    zoneColor: "#38bdf8",
    pinPosition: { x: 300, y: 295 },
  },
];

function PremiumCard({ children, className = "", accent = "from-blue-500/40 via-white/10 to-sky-500/30" }) {
  return (
    <div
      className={`relative rounded-3xl p-[1px] bg-gradient-to-br ${accent} shadow-2xl shadow-blue-950/50 ${className}`}
    >
      <div className="relative rounded-3xl bg-[#080f22]/95 border border-white/5 backdrop-blur-xl h-full flex flex-col overflow-hidden">
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
        {children}
      </div>
    </div>
  );
}

export default function Features() {
  const [activeSection, setActiveSection] = useState(stageSections[0]);

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 bg-[#040814] text-white overflow-hidden"
    >
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-0 w-[550px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Standar Keunggulan TicketVerse</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight"
          >
            Denah Panggung &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
              Perspektif Nyata
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Pilih section pada diagram panggung interaktif untuk melihat contoh
            visual sudut pandang penonton (POV), jarak nyata ke musisi, dan
            fasilitas eksklusif sebelum memesan tiket.
          </motion.p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          
          {/* LEFT COLUMN (8) - MAP & POV */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8"
          >
            <PremiumCard className="h-full">
              <div className="p-5 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-sky-500/10 border border-blue-500/40 flex items-center justify-center text-blue-300 flex-shrink-0">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-400 rounded-full ring-2 ring-[#080f22] animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          Denah Stage &amp; Simulasi Sudut Pandang
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik kategori atau sentuh langsung denah panggung
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-200 border border-blue-400/30 uppercase tracking-wider self-start sm:self-auto">
                      <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                      Live Simulator
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {stageSections.map((sec) => {
                      const isActive = activeSection.id === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSection(sec)}
                          className={`relative px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                            isActive
                              ? "text-white shadow-lg shadow-blue-600/30 border border-transparent"
                              : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/10"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-600" />
                          )}
                          <span
                            className="relative w-1.5 h-1.5 rounded-full ring-2 ring-white/10"
                            style={{ backgroundColor: isActive ? "#fff" : sec.zoneColor }}
                          />
                          <span className="relative">{sec.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Map & POV Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    
                    {/* 1. Diagram Map */}
                    <div className="relative rounded-2xl bg-[#060d1f] border border-white/10 p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            <span>Diagram Tata Letak</span>
                          </p>
                          <span className="text-[9px] text-slate-500 font-mono tracking-wider">
                            ARENA LAYOUT
                          </span>
                        </div>

                        <div className="relative w-full aspect-[4/3] rounded-lg bg-[#030712] border border-white/5 overflow-hidden flex items-center justify-center">
                          {/* SVG Map (Tetap Sama) */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.15),transparent_70%)] pointer-events-none" />
                          <svg viewBox="0 0 600 360" className="w-full h-full select-none relative z-10" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="stageGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.35" />
                              </linearGradient>
                              <linearGradient id="ledGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="50%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                              </linearGradient>
                              <filter id="sapphireGlow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="7" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                              </filter>
                              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" />
                              </filter>
                            </defs>

                            <ellipse cx="300" cy="220" rx="255" ry="120" fill="none" stroke="rgba(56,189,248,0.10)" strokeWidth="1" strokeDasharray="2 6" />
                            <ellipse cx="300" cy="220" rx="220" ry="100" fill="none" stroke="rgba(56,189,248,0.14)" strokeWidth="1" strokeDasharray="2 6" />
                            <ellipse cx="300" cy="220" rx="185" ry="80" fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1" strokeDasharray="2 6" />

                            <path d="M 40 340 C 40 240, 560 240, 560 340" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />

                            <g opacity="0.65">
                              <rect x="60" y="330" width="26" height="6" rx="2" fill="#38bdf8" />
                              <text x="73" y="352" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontFamily="monospace">GATE A</text>
                              <rect x="287" y="345" width="26" height="6" rx="2" fill="#38bdf8" />
                              <text x="300" y="360" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontFamily="monospace">GATE B</text>
                              <rect x="514" y="330" width="26" height="6" rx="2" fill="#38bdf8" />
                              <text x="527" y="352" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontFamily="monospace">GATE C</text>
                            </g>

                            {/* Tribun */}
                            <g onClick={() => setActiveSection(stageSections[2])} className="cursor-pointer transition-all duration-300">
                              <path d="M 55 330 C 120 245, 480 245, 545 330 L 520 348 C 460 272, 140 272, 80 348 Z" fill={activeSection.id === "tribune" ? "rgba(56,189,248,0.35)" : "rgba(30,41,59,0.55)"} stroke={activeSection.id === "tribune" ? "#38bdf8" : "rgba(255,255,255,0.15)"} strokeWidth={activeSection.id === "tribune" ? "2" : "1"} filter={activeSection.id === "tribune" ? "url(#sapphireGlow)" : undefined} />
                              <text x="300" y="305" textAnchor="middle" fill={activeSection.id === "tribune" ? "#ffffff" : "#94a3b8"} fontSize="10" fontWeight="bold">TRIBUNE CENTER</text>
                            </g>

                            {/* Festival */}
                            <g onClick={() => setActiveSection(stageSections[1])} className="cursor-pointer transition-all duration-300">
                              <rect x="110" y="172" width="380" height="78" rx="10" fill={activeSection.id === "festival" ? "rgba(37,99,235,0.4)" : "rgba(15,23,42,0.65)"} stroke={activeSection.id === "festival" ? "#60a5fa" : "rgba(255,255,255,0.12)"} strokeWidth={activeSection.id === "festival" ? "2" : "1"} filter={activeSection.id === "festival" ? "url(#sapphireGlow)" : undefined} />
                              {Array.from({ length: 24 }).map((_, i) => {
                                const x = 130 + (i % 8) * 48;
                                const y = 185 + Math.floor(i / 8) * 16;
                                return <circle key={`cd-${i}`} cx={x} cy={y} r="1.5" fill={activeSection.id === "festival" ? "#bfdbfe" : "#475569"} opacity="0.6" />;
                              })}
                              <text x="300" y="200" textAnchor="middle" fill={activeSection.id === "festival" ? "#ffffff" : "#94a3b8"} fontSize="11" fontWeight="bold">FESTIVAL STANDING</text>
                              <rect x="250" y="226" width="100" height="16" rx="3" fill="#0b1329" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
                              <text x="300" y="237" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="monospace">FOH SOUND RIG</text>
                            </g>

                            {/* VIP */}
                            <g onClick={() => setActiveSection(stageSections[0])} className="cursor-pointer transition-all duration-300">
                              <rect x="160" y="78" width="105" height="82" rx="8" fill={activeSection.id === "vip" ? "rgba(37,99,235,0.55)" : "rgba(30,58,138,0.25)"} stroke={activeSection.id === "vip" ? "#93c5fd" : "rgba(59,130,246,0.3)"} strokeWidth={activeSection.id === "vip" ? "2" : "1"} filter={activeSection.id === "vip" ? "url(#sapphireGlow)" : undefined} />
                              <text x="212" y="115" textAnchor="middle" fill={activeSection.id === "vip" ? "#ffffff" : "#bfdbfe"} fontSize="10" fontWeight="bold">VIP A</text>
                              <rect x="335" y="78" width="105" height="82" rx="8" fill={activeSection.id === "vip" ? "rgba(37,99,235,0.55)" : "rgba(30,58,138,0.25)"} stroke={activeSection.id === "vip" ? "#93c5fd" : "rgba(59,130,246,0.3)"} strokeWidth={activeSection.id === "vip" ? "2" : "1"} filter={activeSection.id === "vip" ? "url(#sapphireGlow)" : undefined} />
                              <text x="387" y="115" textAnchor="middle" fill={activeSection.id === "vip" ? "#ffffff" : "#bfdbfe"} fontSize="10" fontWeight="bold">VIP B</text>
                            </g>

                            {/* Runway & Stage */}
                            <g>
                              <rect x="277" y="62" width="46" height="90" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                              <polygon points="277,152 323,152 300,168" fill="#2563eb" stroke="#60a5fa" strokeWidth="1" />
                              <text x="300" y="110" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="bold" transform="rotate(-90 300 110)" letterSpacing="1">RUNWAY</text>
                              
                              <rect x="180" y="12" width="240" height="12" rx="3" fill="url(#ledGradient)" stroke="#7dd3fc" strokeWidth="1" opacity="0.9" />
                              <rect x="150" y="26" width="300" height="34" rx="6" fill="url(#stageGlow)" stroke="#60a5fa" strokeWidth="2" />
                              <text x="300" y="47" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" letterSpacing="1">MAIN STAGE</text>
                              <rect x="130" y="24" width="14" height="38" rx="2" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                              <rect x="456" y="24" width="14" height="38" rx="2" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                            </g>

                            {/* Active Position Beacon */}
                            <g transform={`translate(${activeSection.pinPosition.x}, ${activeSection.pinPosition.y})`}>
                              <circle r="14" fill={activeSection.zoneColor} opacity="0.25" className="animate-ping" />
                              <circle r="8" fill={activeSection.zoneColor} opacity="0.5" filter="url(#softGlow)" />
                              <circle r="5" fill={activeSection.zoneColor} stroke="#ffffff" strokeWidth="2" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Posisi: <strong className="text-white">{activeSection.shortName}</strong>
                        </span>
                        <span className="text-blue-300 font-medium">Klik zona</span>
                      </div>
                    </div>

                    {/* 2. POV Photo */}
                    <div className="relative rounded-2xl bg-[#060d1f] border border-white/10 p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Camera className="w-3 h-3 text-sky-400" />
                            <span>Foto POV</span>
                          </p>
                          <span className="text-[9px] font-mono font-bold text-blue-200 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-400/30">
                            {activeSection.sectionBadge}
                          </span>
                        </div>

                        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-900 border border-white/10 shadow-xl group">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeSection.id}
                              initial={{ opacity: 0, scale: 1.05 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0"
                            >
                              <Image src={activeSection.povPhoto} alt={`POV ${activeSection.name}`} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
                            </motion.div>
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-transparent to-black/30" />

                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                            <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          </div>

                          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-mono text-white">
                            <Eye className="w-3 h-3 text-sky-400" /> SIMULASI
                          </div>

                          <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/70 backdrop-blur-md border border-white/10">
                            <div className="flex items-center justify-between text-[11px] text-white mb-1">
                              <span className="font-bold truncate">{activeSection.name}</span>
                              <span className="text-[9px] text-sky-300 font-mono flex items-center gap-1">
                                <Volume2 className="w-3 h-3" /> {activeSection.soundPressure}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-300 line-clamp-2 leading-relaxed">
                              {activeSection.viewDesc}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="flex flex-col gap-0.5 text-slate-400">
                          <span>Elevasi:</span>
                          <span className="font-medium text-white truncate">{activeSection.elevation}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-slate-400">
                          <span>Gate:</span>
                          <span className="font-medium text-blue-300 truncate">{activeSection.gateRoute}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Perks */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Fasilitas Eksklusif
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                    {activeSection.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* RIGHT COLUMN (4) - TICKET */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-4"
          >
            <PremiumCard accent="from-sky-500/40 via-white/10 to-blue-600/30" className="h-full">
              <div className="p-5 sm:p-6 flex flex-col justify-between h-full">
                
                {/* Top Section */}
                <div>
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-sky-500/10 border border-blue-500/40 flex items-center justify-center text-blue-300 flex-shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">E-Tiket QR Instan</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tanpa antrean fisik</p>
                    </div>
                  </div>

                  {/* QR Card */}
                  <div className="relative rounded-xl bg-[#0a1124] border border-blue-500/30 p-4 shadow-inner overflow-hidden">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-400/60 rounded-tl-xl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-400/60 rounded-br-xl" />

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pb-2.5 border-b border-white/10">
                      <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-sky-400" />
                        TICKETVERSE PASS
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">READY</span>
                    </div>

                    <div className="my-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Konser</p>
                        <p className="text-sm font-bold text-white truncate">Coldplay: GBK Jakarta</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">Gate A • VIP Diamond</p>
                      </div>
                      <div className="w-14 h-14 rounded-lg bg-white p-1 flex-shrink-0">
                        <div className="w-full h-full bg-[#040814] rounded p-1 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                      <span className="font-mono">ID: TV-8829</span>
                      <span className="text-blue-300 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> 256-Bit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section (Trust Badges) */}
                <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
                    <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Tunjukkan layar ponsel di venue tanpa cetak fisik.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
                    <ScanLine className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Scan sekali, validasi sistem dalam hitungan detik.</span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* 3 Strips Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              label: "Infrastruktur Cloud",
              metric: "< 45ms",
              title: "Tahan Lonjakan 'War Tiket'",
              desc: "Kapasitas server elastis dirancang siap menangani jutaan klik bersamaan tanpa crash.",
            },
            {
              icon: CreditCard,
              label: "Pembayaran",
              metric: "< 5s",
              title: "QRIS Instan & Bank Nasional",
              desc: "Dukungan lengkap QRIS, Virtual Account BCA/Mandiri/BNI, hingga kartu kredit otomatis.",
            },
            {
              icon: Headphones,
              label: "Dukungan",
              metric: "ON-SITE",
              title: "Bantuan Kru Siaga Hari-H",
              desc: "Layanan pelanggan 24 jam serta booth posko resmi kru di lokasi konser.",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent hover:from-blue-400/40 hover:via-sky-400/20 transition-all duration-500"
              >
                <div className="relative h-full rounded-2xl bg-[#080f22]/90 border border-white/5 p-5 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">{f.label}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">{f.metric}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5">{f.title}</h4>
                    <p className="text-[11px] text-slate-300 font-light leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}