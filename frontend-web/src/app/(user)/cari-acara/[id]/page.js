"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  Users,
  ShieldCheck,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle2,
  Building2,
  Info,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";



export default function EventDetailPage() {
  const params = useParams();

  const [event, setEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [liked, setLiked] = useState(false);

  /* =======================================================
     FETCH EVENT + TICKET
  ======================================================= */

  useEffect(() => {
    if (!params?.id) return;

    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const eventId = params.id;

        const [eventResponse, ticketResponse] = await Promise.all([
          fetch(`${API_URL}/api/events/${eventId}`),
          fetch(`${API_URL}/api/ticket-categories`),
        ]);

        const eventData = await eventResponse.json();
        const ticketData = await ticketResponse.json();

        /* ================================================
           EVENT
        ================================================= */

        if (!eventResponse.ok || !eventData.success) {
          throw new Error(
            eventData.message || "Gagal mengambil detail event"
          );
        }

        /* ================================================
           TICKET CATEGORIES
        ================================================= */

        if (!ticketResponse.ok || !ticketData.success) {
          throw new Error(
            ticketData.message ||
              "Gagal mengambil kategori tiket"
          );
        }

        const eventDataFromApi = eventData.event;

        const allTickets = Array.isArray(
          ticketData.ticket_categories
        )
          ? ticketData.ticket_categories
          : [];

        const eventTickets = allTickets.filter(
          (ticket) =>
            Number(ticket.event_id) === Number(eventId)
        );

        setEvent(eventDataFromApi);
        setTicketCategories(eventTickets);
      } catch (err) {
        console.error("GET EVENT DETAIL ERROR:", err);

        setError(
          err.message ||
            "Terjadi kesalahan saat mengambil data event"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [params?.id]);

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formattedDate = useMemo(() => {
    if (!event?.event_date) return "-";

    const date = new Date(event.event_date);

    if (Number.isNaN(date.getTime())) {
      return event.event_date;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }, [event?.event_date]);

  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formattedTime = useMemo(() => {
    if (!event?.event_time) return "-";

    const time = String(event.event_time);

    if (time.length >= 5) {
      return `${time.slice(0, 5)} WIB`;
    }

    return `${time} WIB`;
  }, [event?.event_time]);

  /* =======================================================
     TICKET CALCULATION
  ======================================================= */

  const ticketStats = useMemo(() => {
    if (!Array.isArray(ticketCategories)) {
      return {
        price: 0,
        quota: 0,
        remaining: 0,
        sold: 0,
      };
    }

    const validTickets = ticketCategories.filter(
      (ticket) =>
        Number(ticket.quota) >= 0 &&
        Number(ticket.remaining_ticket) >= 0
    );

    const quota = validTickets.reduce(
      (total, ticket) =>
        total + Number(ticket.quota || 0),
      0
    );

    const remaining = validTickets.reduce(
      (total, ticket) =>
        total + Number(ticket.remaining_ticket || 0),
      0
    );

    const sold = Math.max(quota - remaining, 0);

    const prices = validTickets
      .map((ticket) => Number(ticket.price))
      .filter((price) => !Number.isNaN(price));

    const price =
      prices.length > 0 ? Math.min(...prices) : 0;

    return {
      price,
      quota,
      remaining,
      sold,
    };
  }, [ticketCategories]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const percentage =
    ticketStats.quota > 0
      ? Math.round(
          (ticketStats.sold / ticketStats.quota) * 100
        )
      : 0;

  const isSoldOut =
    ticketStats.quota > 0 &&
    ticketStats.remaining <= 0;

  /*
    Backend belum mempunyai organizer_id / organizer_name.
    Untuk sementara gunakan artist_name sebagai informasi
    yang memang tersedia dari endpoint event.
  */

  const organizerName =
    event?.artist_name || "Penyelenggara Event";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDE4ED] border-t-[#112250]" />

          <p className="mt-4 text-sm font-medium text-[#68778C]">
            Memuat detail event...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR / 404
  ======================================================= */

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EEF3F9] text-[#526B92]">
            <Ticket size={34} />
          </div>

          <div className="mt-6 text-6xl font-bold tracking-tight text-[#112250]">
            404
          </div>

          <h1 className="mt-3 text-xl font-bold text-[#112250]">
            Event tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8490A1]">
            {error ||
              "Event yang kamu cari mungkin sudah tidak tersedia atau alamat event tidak valid."}
          </p>

          <Link
            href="/cari-acara"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white transition hover:bg-[#1A326A]"
          >
            <ArrowLeft size={16} />
            Kembali ke Cari Event
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-[#112250]">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative h-[440px] overflow-hidden bg-[#0D1F42]">
        {/* Background */}

        <img
          src={
            event.poster ||
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90"
          }
          alt={event.event_name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-[#07162F] via-[#07162F]/65 to-[#07162F]/20" />

        <div className="absolute inset-0 bg-[#07162F]/10" />

        {/* Content */}

        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-between px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
          {/* TOP BAR */}

          <div className="flex items-center justify-between gap-3">
            <Link
              href="/cari-acara"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
            >
              <ArrowLeft size={15} />
              Kembali ke Event
            </Link>

            <div className="flex items-center gap-2">
              {/* Share */}

              <button
                type="button"
                onClick={() => {
                  if (
                    typeof navigator !== "undefined" &&
                    navigator.share
                  ) {
                    navigator.share({
                      title: event.event_name,
                      text: `Lihat event ${event.event_name} di TicketVerse`,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-[#112250]"
                aria-label="Bagikan event"
              >
                <Share2 size={17} />
              </button>

              {/* Wishlist */}

              <button
                type="button"
                onClick={() =>
                  setLiked((value) => !value)
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/20 backdrop-blur-md transition ${
                  liked
                    ? "text-red-400"
                    : "text-white hover:bg-white hover:text-[#112250]"
                }`}
                aria-label="Simpan event"
              >
                <Heart
                  size={17}
                  fill={
                    liked ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
          </div>

          {/* HERO CONTENT */}

          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#112250] shadow-sm">
                {event.category_name || "Event"}
              </span>

              {isSoldOut && (
                <span className="rounded-full border border-white/15 bg-red-500/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
                  Tiket Habis
                </span>
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
              {organizerName}
            </p>

            <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {event.event_name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100/85">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} />
                {formattedDate}
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={15} />
                {formattedTime}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={15} />
                {event.city || "-"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_370px]">
          {/* LEFT */}

          <div className="space-y-6">
            {/* EVENT INFORMATION */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                    Event
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#112250]">
                    Informasi Event
                  </h2>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Info size={20} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<CalendarDays size={18} />}
                  label="Tanggal"
                  value={formattedDate}
                />

                <InfoItem
                  icon={<Clock3 size={18} />}
                  label="Waktu"
                  value={formattedTime}
                />

                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Lokasi"
                  value={
                    event.venue_name ||
                    event.city ||
                    "-"
                  }
                />

                <InfoItem
                  icon={<Users size={18} />}
                  label="Kapasitas"
                  value={`${ticketStats.quota.toLocaleString(
                    "id-ID"
                  )} tiket`}
                />
              </div>
            </section>

            {/* DESCRIPTION */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Deskripsi
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#112250]">
                Tentang Event
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#68778C]">
                {event.description ||
                  "Belum ada deskripsi untuk event ini."}
              </p>
            </section>

            {/* HIGHLIGHTS */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Kenapa hadir?
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#112250]">
                Pengalaman yang kamu dapatkan
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FeatureItem
                  title="Tiket resmi"
                  description="Pesan tiket melalui platform TicketVerse."
                />

                <FeatureItem
                  title="Informasi lengkap"
                  description="Detail tanggal, waktu dan lokasi tersedia."
                />

                <FeatureItem
                  title="Transaksi aman"
                  description="Proses pemesanan dibuat sederhana dan aman."
                />

                <FeatureItem
                  title="E-ticket"
                  description="Tiket digital tersedia setelah pembayaran."
                />
              </div>
            </section>

            {/* ORGANIZER */}

            <section className="rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A96A8]">
                Organizer
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Building2 size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#112250]">
                    {organizerName}
                  </p>

                  <p className="mt-1 text-xs text-[#8A96A8]">
                    Penyelenggara event
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT / TICKET */}

          <aside>
            <div className="sticky top-6 rounded-[22px] border border-[#DDE4ED] bg-white p-6 shadow-[0_15px_45px_rgba(17,34,80,0.08)]">
              {/* Price */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A3B2]">
                    Harga tiket
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight text-[#112250]">
                    {ticketStats.price > 0
                      ? formatCurrency(
                          ticketStats.price
                        )
                      : "Belum tersedia"}
                  </p>

                  <p className="mt-1 text-[11px] text-[#98A3B2]">
                    Harga mulai dari
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
                  <Ticket size={20} />
                </div>
              </div>

              <div className="my-6 border-t border-[#EEF1F5]" />

              {/* Availability */}

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8793A3]">
                    Ketersediaan tiket
                  </span>

                  <span className="font-semibold text-[#52627A]">
                    {percentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8ECF2]">
                  <div
                    className="h-full rounded-full bg-[#526B92] transition-all"
                    style={{
                      width: `${Math.min(
                        percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#98A3B2]">
                    {ticketStats.sold.toLocaleString(
                      "id-ID"
                    )}{" "}
                    terjual
                  </span>

                  <span className="font-semibold text-[#52627A]">
                    {ticketStats.remaining.toLocaleString(
                      "id-ID"
                    )}{" "}
                    tersisa
                  </span>
                </div>
              </div>

              {/* Buy */}

              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-semibold text-[#98A3B2]"
                >
                  <Ticket size={17} />
                  Tiket Habis
                </button>
              ) : ticketStats.quota === 0 ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E8ECF2] text-sm font-semibold text-[#98A3B2]"
                >
                  <Ticket size={17} />
                  Tiket Belum Tersedia
                </button>
              ) : (
                <Link
                  href={`/cari-acara/${event.id}/beli`}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#112250] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,34,80,0.16)] transition hover:bg-[#1A326A] hover:shadow-[0_12px_28px_rgba(17,34,80,0.22)]"
                >
                  <Ticket size={17} />
                  Beli Tiket
                  <ChevronRight size={16} />
                </Link>
              )}

              {/* Secure */}

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#8A96A8]">
                <ShieldCheck size={14} />
                Transaksi aman melalui TicketVerse
              </div>

              {/* Divider */}

              <div className="my-5 border-t border-[#EEF1F5]" />

              {/* Event summary */}

              <div className="space-y-3">
                <SummaryRow
                  icon={<CalendarDays size={15} />}
                  label="Tanggal"
                  value={formattedDate}
                />

                <SummaryRow
                  icon={<Clock3 size={15} />}
                  label="Waktu"
                  value={formattedTime}
                />

                <SummaryRow
                  icon={<MapPin size={15} />}
                  label="Lokasi"
                  value={event.city || "-"}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#EEF1F5] bg-[#FBFCFE] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A3B2]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold leading-5 text-[#52627A]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#EEF1F5] bg-[#FBFCFE] p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-xs font-bold text-[#112250]">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-[#8995A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-[#A0A9B6]">
          {label}
        </p>

        <p className="truncate text-xs font-semibold text-[#52627A]">
          {value}
        </p>
      </div>
    </div>
  );
}