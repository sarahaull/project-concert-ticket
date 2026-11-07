"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  ChevronRight,
  MoreHorizontal,
  QrCode,
  Download,
  Share2,
  Heart,
  Sparkles,
  CheckCircle2,
  CircleDot,
  Navigation,
  CalendarCheck2,
  TicketCheck,
  WalletCards,
  Users,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const upcomingEvents = [
  {
    id: 1,
    title: "Soundwave Festival 2026",
    category: "Festival",
    location: "Jakarta International Expo",
    city: "Jakarta",
    date: "18 Okt 2026",
    isoDate: "2026-10-18T15:00:00",
    time: "15:00 WIB",
    gate: "13:00 WIB",
    ticketType: "Festival Pass",
    ticketCode: "TV-SW26-8K2P",
    orderId: "TV-2026-001284",
    quantity: 2,
    price: 350000,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90",
    organizer: "Soundwave Indonesia",
    status: "confirmed",
    description:
      "Festival musik dan hiburan dengan berbagai penampilan menarik dalam satu pengalaman.",
  },
  {
    id: 2,
    title: "Nusantara Music Fest",
    category: "Music",
    location: "GBK Senayan",
    city: "Jakarta",
    date: "24 Okt 2026",
    isoDate: "2026-10-24T16:00:00",
    time: "16:00 WIB",
    gate: "14:00 WIB",
    ticketType: "Regular",
    ticketCode: "TV-NMF26-4X9L",
    orderId: "TV-2026-001291",
    quantity: 1,
    price: 275000,
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=90",
    organizer: "Nusantara Entertainment",
    status: "confirmed",
    description:
      "Perayaan musik Indonesia dengan suasana meriah dan pengalaman yang memorable.",
  },
  {
    id: 3,
    title: "K-Pop Fan Meeting",
    category: "K-Pop",
    location: "ICE BSD City",
    city: "Tangerang",
    date: "15 Nov 2026",
    isoDate: "2026-11-15T18:30:00",
    time: "18:30 WIB",
    gate: "16:30 WIB",
    ticketType: "VIP",
    ticketCode: "TV-KPF26-7M3Q",
    orderId: "TV-2026-001305",
    quantity: 1,
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=90",
    organizer: "K-Stage Indonesia",
    status: "confirmed",
    description:
      "Fan meeting spesial dengan pengalaman interaktif dan berbagai aktivitas menarik.",
  },
  {
    id: 4,
    title: "Indie Weekend",
    category: "Indie",
    location: "M Bloc Space",
    city: "Jakarta",
    date: "22 Nov 2026",
    isoDate: "2026-11-22T17:00:00",
    time: "17:00 WIB",
    gate: "15:30 WIB",
    ticketType: "Early Entry",
    ticketCode: "TV-IW26-2A8N",
    orderId: "TV-2026-001317",
    quantity: 2,
    price: 180000,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=90",
    organizer: "Indie Collective",
    status: "confirmed",
    description:
      "Weekend bersama musik indie dan komunitas dengan suasana santai.",
  },
  {
    id: 5,
    title: "Comedy Night Jakarta",
    category: "Comedy",
    location: "Balai Sarbini",
    city: "Jakarta",
    date: "29 Nov 2026",
    isoDate: "2026-11-29T19:30:00",
    time: "19:30 WIB",
    gate: "18:00 WIB",
    ticketType: "Regular",
    ticketCode: "TV-CNJ26-5P1R",
    orderId: "TV-2026-001329",
    quantity: 1,
    price: 300000,
    image:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=90",
    organizer: "Laugh Factory ID",
    status: "confirmed",
    description:
      "Malam penuh hiburan dan tawa bersama komika pilihan.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCountdown(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = Math.max(target - now, 0);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function EventMendatangPage() {
  const [selectedEvent, setSelectedEvent] = useState(
    upcomingEvents[0]
  );

  const [countdown, setCountdown] = useState(() =>
    getCountdown(upcomingEvents[0].isoDate)
  );

  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(selectedEvent.isoDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedEvent]);

  const daysUntilEvent = useMemo(() => {
    const now = new Date().getTime();
    const target = new Date(selectedEvent.isoDate).getTime();

    return Math.max(
      Math.ceil((target - now) / (1000 * 60 * 60 * 24)),
      0
    );
  }, [selectedEvent]);

  return (
    <main className="min-h-screen  text-[#112250]">
      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <section className="border-b border-[#E5EAF1] bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7183A0]">
              <CalendarCheck2 size={14} />
              TicketVerse
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#112250] sm:text-3xl">
              Event Mendatang
            </h1>

            <p className="mt-1 text-sm text-[#8793A3]">
              Semua event yang sudah kamu pesan, dalam satu tempat.
            </p>
          </div>

          <Link
            href="/cari-acara"
            className="hidden h-10 items-center gap-2 rounded-xl border border-[#DCE3EC] bg-white px-4 text-xs font-semibold text-[#52627A] transition hover:border-[#112250] hover:bg-[#112250] hover:text-white sm:inline-flex"
          >
            Cari Event
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
        {/* ===================================================
            HERO COUNTDOWN
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-[#0D1F42] shadow-[0_20px_60px_rgba(17,34,80,0.14)]">
          {/* Decorative */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -right-8 top-12 h-52 w-52 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-40 left-20 h-80 w-80 rounded-full border border-white/[0.06]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_390px]">
            {/* Hero Info */}
            <div className="p-7 sm:p-9 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold text-blue-100 backdrop-blur">
                  <Sparkles size={13} />
                  EVENT TERDEKAT
                </span>

                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#112250]">
                  {selectedEvent.category}
                </span>
              </div>

              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/70">
                {selectedEvent.organizer}
              </p>

              <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {selectedEvent.title}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/65">
                {selectedEvent.description}
              </p>

              <div className="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <HeroInfo
                  icon={<CalendarDays size={16} />}
                  label="Tanggal"
                  value={selectedEvent.date}
                />

                <HeroInfo
                  icon={<Clock3 size={16} />}
                  label="Mulai"
                  value={selectedEvent.time}
                />

                <HeroInfo
                  icon={<MapPin size={16} />}
                  label="Lokasi"
                  value={selectedEvent.city}
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/tickets/${selectedEvent.id}`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-[#112250] transition hover:bg-[#EEF3F9]"
                >
                  <QrCode size={16} />
                  Buka Tiket
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={() => setFavorite((value) => !value)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    favorite
                      ? "border-white bg-white text-[#112250]"
                      : "border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-[#112250]"
                  }`}
                >
                  <Heart
                    size={17}
                    fill={favorite ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>

            {/* Countdown */}
            <div className="border-t border-white/10 bg-black/[0.10] p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-200/60">
                    Hitung mundur
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    Menuju hari event
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-blue-200">
                  <Clock3 size={16} />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-4 gap-2">
                <CountdownBox
                  value={countdown.days}
                  label="Hari"
                />

                <CountdownBox
                  value={countdown.hours}
                  label="Jam"
                />

                <CountdownBox
                  value={countdown.minutes}
                  label="Menit"
                />

                <CountdownBox
                  value={countdown.seconds}
                  label="Detik"
                />
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#112250]">
                    <TicketCheck size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-100/50">
                      STATUS TIKET
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-blue-200"
                      />

                      <p className="text-xs font-semibold text-white">
                        Tiket terkonfirmasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-[10px] leading-5 text-blue-100/45">
                Pastikan datang sebelum waktu gate dibuka.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={<TicketCheck size={18} />}
            label="Tiket Aktif"
            value={upcomingEvents.length}
          />

          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Event Terdekat"
            value={`${daysUntilEvent} hari`}
          />

          <SummaryCard
            icon={<Users size={18} />}
            label="Total Tiket"
            value={upcomingEvents.reduce(
              (total, event) => total + event.quantity,
              0
            )}
          />

          <SummaryCard
            icon={<WalletCards size={18} />}
            label="Pesanan"
            value={upcomingEvents.length}
          />
        </section>

        {/* ===================================================
            EVENT LIST
        ==================================================== */}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7183A0]">
                <CircleDot size={13} />
                Jadwal Kamu
              </div>

              <h2 className="text-xl font-bold text-[#112250] sm:text-2xl">
                Event yang akan kamu hadiri
              </h2>

              <p className="mt-1 text-sm text-[#8793A3]">
                Kelola tiket dan lihat detail event dengan mudah.
              </p>
            </div>

            <span className="hidden rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#65748A] shadow-sm sm:inline-flex">
              {upcomingEvents.length} Event
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            {/* Timeline */}
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <UpcomingEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  active={selectedEvent.id === event.id}
                  onSelect={() => {
                    setSelectedEvent(event);
                    setFavorite(false);
                  }}
                />
              ))}
            </div>

            {/* Detail Panel */}
            <aside className="hidden xl:block">
              <div className="sticky top-6 overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_12px_35px_rgba(17,34,80,0.06)]">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#07162F]/85 via-transparent to-transparent" />

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#112250]">
                      {selectedEvent.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[9px] uppercase tracking-widest text-blue-200">
                      {selectedEvent.organizer}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white">
                      {selectedEvent.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <DetailRow
                    icon={<CalendarDays size={15} />}
                    label="Tanggal"
                    value={selectedEvent.date}
                  />

                  <DetailRow
                    icon={<Clock3 size={15} />}
                    label="Waktu Event"
                    value={selectedEvent.time}
                  />

                  <DetailRow
                    icon={<Navigation size={15} />}
                    label="Gate Dibuka"
                    value={selectedEvent.gate}
                  />

                  <DetailRow
                    icon={<MapPin size={15} />}
                    label="Lokasi"
                    value={selectedEvent.location}
                  />

                  <div className="my-5 border-t border-[#EEF1F5]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#98A3B2]">
                        Jenis Tiket
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#112250]">
                        {selectedEvent.ticketType}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                      <Ticket size={17} />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F7F9FC] p-3">
                    <p className="text-[9px] uppercase tracking-wider text-[#98A3B2]">
                      Kode Tiket
                    </p>

                    <p className="mt-1 font-mono text-xs font-bold tracking-wider text-[#112250]">
                      {selectedEvent.ticketCode}
                    </p>
                  </div>

                  <Link
                    href={`/tickets/${selectedEvent.id}`}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#112250] text-xs font-semibold text-white transition hover:bg-[#1A326A]"
                  >
                    <QrCode size={16} />
                    Lihat Tiket
                    <ChevronRight size={15} />
                  </Link>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#DDE4ED] text-[10px] font-semibold text-[#52627A] transition hover:bg-[#F5F7FA]">
                      <Share2 size={14} />
                      Bagikan
                    </button>

                    <button className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#DDE4ED] text-[10px] font-semibold text-[#52627A] transition hover:bg-[#F5F7FA]">
                      <Download size={14} />
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ===================================================
            MOBILE SELECTED DETAIL
        ==================================================== */}

        <section className="mt-6 xl:hidden">
          <div className="rounded-[24px] border border-[#DDE4ED] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#98A3B2]">
                  Event dipilih
                </p>

                <h3 className="mt-1 text-base font-bold text-[#112250]">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                <Ticket size={17} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SmallDetail
                icon={<CalendarDays size={14} />}
                label="Tanggal"
                value={selectedEvent.date}
              />

              <SmallDetail
                icon={<Clock3 size={14} />}
                label="Waktu"
                value={selectedEvent.time}
              />

              <SmallDetail
                icon={<MapPin size={14} />}
                label="Lokasi"
                value={selectedEvent.city}
              />

              <SmallDetail
                icon={<TicketCheck size={14} />}
                label="Tiket"
                value={selectedEvent.ticketType}
              />
            </div>

            <Link
              href={`/tickets/${selectedEvent.id}`}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#112250] text-xs font-semibold text-white transition hover:bg-[#1A326A]"
            >
              <QrCode size={16} />
              Buka E-Ticket
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ===================================================
            REMINDER
        ==================================================== */}

        <section className="mt-8 overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                <CalendarCheck2 size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#112250]">
                  Jangan lupa datang tepat waktu
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8793A3]">
                  Simpan tiket digital kamu dan pastikan informasi
                  event sudah sesuai sebelum hari pelaksanaan.
                </p>
              </div>
            </div>

            <Link
              href="/history"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DDE4ED] px-4 text-xs font-semibold text-[#52627A] transition hover:bg-[#F5F7FA]"
            >
              Riwayat Pesanan
              <ExternalLink size={14} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   HERO INFO
========================================================= */

function HeroInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-blue-200">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-blue-100/40">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COUNTDOWN BOX
========================================================= */

function CountdownBox({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-4 text-center backdrop-blur">
      <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-1 text-[8px] font-medium uppercase tracking-wider text-blue-100/45">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-[#DDE4ED] bg-white p-4 shadow-[0_5px_20px_rgba(17,34,80,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(17,34,80,0.07)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-[#98A3B2]">
            {label}
          </p>

          <p className="mt-1 truncate text-base font-bold text-[#112250]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   UPCOMING EVENT CARD
========================================================= */

function UpcomingEventCard({
  event,
  index,
  active,
  onSelect,
}) {
  return (
    <div className="relative flex gap-3 sm:gap-5">
      {/* Timeline */}
      <div className="hidden w-8 shrink-0 flex-col items-center sm:flex">
        <button
          onClick={onSelect}
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#F6F8FB] text-[10px] font-bold transition ${
            active
              ? "bg-[#112250] text-white shadow-[0_5px_15px_rgba(17,34,80,0.18)]"
              : "bg-[#DDE5EF] text-[#52627A]"
          }`}
        >
          {index + 1}
        </button>

        {index !== upcomingEvents.length - 1 && (
          <div className="w-px flex-1 bg-[#DDE4ED]" />
        )}
      </div>

      {/* Card */}
      <button
        onClick={onSelect}
        className={`group w-full overflow-hidden rounded-[22px] border bg-white text-left shadow-[0_7px_25px_rgba(17,34,80,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(17,34,80,0.08)] ${
          active
            ? "border-[#AEBED5] ring-1 ring-[#D8E1EE]"
            : "border-[#DDE4ED]"
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-52">
            <img
              src={event.image}
              alt={event.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#07162F]/70 via-transparent to-transparent" />

            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold text-[#112250] shadow-sm">
                {event.category}
              </span>
            </div>

            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white">
                <CheckCircle2 size={13} />
                Terkonfirmasi
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8C99AA]">
                  {event.organizer}
                </p>

                <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-[#112250] sm:text-lg">
                  {event.title}
                </h3>
              </div>

              <div className="hidden shrink-0 sm:block">
                <MoreHorizontal
                  size={18}
                  className="text-[#A2ACB9]"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniEventInfo
                icon={<CalendarDays size={14} />}
                label="Tanggal"
                value={event.date}
              />

              <MiniEventInfo
                icon={<Clock3 size={14} />}
                label="Waktu"
                value={event.time}
              />

              <MiniEventInfo
                icon={<MapPin size={14} />}
                label="Lokasi"
                value={event.city}
              />
            </div>

            <div className="mt-5 border-t border-[#EEF1F5] pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#A0A9B6]">
                      Tiket
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#112250]">
                      {event.ticketType}
                    </p>
                  </div>

                  <div className="h-7 w-px bg-[#E8ECF1]" />

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#A0A9B6]">
                      Jumlah
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#112250]">
                      {event.quantity} Tiket
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#526B92] transition group-hover:text-[#112250]">
                  Lihat detail
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* =========================================================
   MINI EVENT INFO
========================================================= */

function MiniEventInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-wider text-[#A0A9B6]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-semibold text-[#52627A]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-[#A0A9B6]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-[#52627A]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL DETAIL
========================================================= */

function SmallDetail({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-[#F7F9FC] p-3">
      <div className="flex items-center gap-2 text-[#526B92]">
        {icon}

        <span className="text-[9px] uppercase tracking-wider text-[#98A3B2]">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-[11px] font-semibold text-[#112250]">
        {value}
      </p>
    </div>
  );
}