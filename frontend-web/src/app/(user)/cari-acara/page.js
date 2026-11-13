"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  CalendarDays,
  Ticket,
  ChevronDown,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Clock3,
  X,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Music,
  ImageOff,
  Star,
  Flame,
  ShieldCheck,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const PER_PAGE = 6;

function getPosterUrl(poster) {
  if (!poster || typeof poster !== "string") {
    return null;
  }

  const value = poster.trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/uploads/events/${value}`;
}

const CATEGORY_ICONS = {
  Music: Ticket,
  Festival: Sparkles,
  "K-Pop": Users,
  Jazz: Clock3,
  Comedy: Users,
  Art: Tag,
  EDM: TrendingUp,
};

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "Harga belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(date) {
  if (!date) return "Tanggal belum tersedia";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatTime(time) {
  if (!time) return "Waktu belum tersedia";

  return `${String(time).slice(0, 5)} WIB`;
}

function getEventImage(event) {
  const possibleImages = [
    event?.poster,
    event?.image,
    event?.poster_url,
    event?.image_url,
    event?.event_image,
  ];

  const image = possibleImages.find(
    (value) => typeof value === "string" && value.trim() !== ""
  );

  return image || null;
}

function normalizeEvent(event) {
  return {
    id: event.id,
    title: event.event_name || "Event Tanpa Nama",
    category: event.category_name || "Lainnya",
    location: event.venue_name || "Lokasi belum tersedia",
    city: event.city || "Kota belum tersedia",
    date: formatDate(event.event_date),
    rawDate: event.event_date || null,
    time: formatTime(event.event_time),
    description: event.description || "",
    artist: event.artist_name || "Artist belum tersedia",
    status: event.status || "Coming Soon",
    image: getPosterUrl(event.poster),

    price: null,
    sold: null,
    quota: null,
    organizer: null,
  };
}

function EventImage({ src, alt, className = "", iconSize = 36 }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (!src || imageFailed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#132B55] via-[#203F73] to-[#0D1F42] text-white/80 ${className}`}
      >
        <ImageOff size={iconSize} strokeWidth={1.5} />
        <span className="text-xs font-medium text-white/60">
          Poster belum tersedia
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Poster event"}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export default function CariEventPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [location, setLocation] = useState("Semua Lokasi");
  const [sort, setSort] = useState("Terpopuler");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/events`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || data?.success === false) {
          throw new Error(data?.message || "Gagal mengambil data event.");
        }

        const eventData = Array.isArray(data?.events)
          ? data.events
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        setEvents(eventData);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("FETCH EVENTS ERROR:", err);

        setError(err.message || "Terjadi kesalahan saat mengambil data event.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, []);

  const mappedEvents = useMemo(() => events.map(normalizeEvent), [events]);

  const categories = useMemo(() => {
    const names = [
      ...new Set(mappedEvents.map((event) => event.category).filter(Boolean)),
    ];

    return [
      { name: "Semua", icon: Sparkles },
      ...names.map((name) => ({
        name,
        icon: CATEGORY_ICONS[name] || Music,
      })),
    ];
  }, [mappedEvents]);

  const locations = useMemo(() => {
    const cities = [
      ...new Set(
        mappedEvents
          .map((event) => event.city)
          .filter((city) => city && city !== "Kota belum tersedia")
      ),
    ];

    return ["Semua Lokasi", ...cities];
  }, [mappedEvents]);

  const filteredEvents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const result = mappedEvents.filter((event) => {
      const matchSearch =
        !keyword ||
        event.title.toLowerCase().includes(keyword) ||
        event.category.toLowerCase().includes(keyword) ||
        event.city.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword) ||
        event.artist.toLowerCase().includes(keyword);

      const matchCategory =
        category === "Semua" || event.category === category;

      const matchLocation =
        location === "Semua Lokasi" || event.city === location;

      return matchSearch && matchCategory && matchLocation;
    });

    if (sort === "Tanggal Terdekat") {
      result.sort((a, b) => {
        if (!a.rawDate) return 1;
        if (!b.rawDate) return -1;

        return new Date(a.rawDate) - new Date(b.rawDate);
      });
    }

    return result;
  }, [mappedEvents, search, category, location, sort]);

  const totalPages = Math.ceil(filteredEvents.length / PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const displayedEvents = filteredEvents.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const featuredEvents = mappedEvents.slice(0, 3);

  function resetFilter() {
    setSearch("");
    setCategory("Semua");
    setLocation("Semua Lokasi");
    setSort("Terpopuler");
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center text-[#112250]">
        <div className="relative flex flex-col items-center text-center">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-[#EAF0FA] via-[#F5F8FC] to-[#E6EEF9] blur-2xl" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#DDE4ED] bg-white shadow-[0_10px_30px_rgba(17,34,80,0.12)]">
            <Loader2 size={28} className="animate-spin text-[#112250]" />
          </div>

          <h2 className="relative mt-5 text-base font-bold">
            Memuat event...
          </h2>

          <p className="relative mt-1 text-sm text-[#8793A3]">
            Sedang mengambil data event dari server.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center text-[#112250]">
        <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white p-8 text-center shadow-[0_20px_60px_rgba(17,34,80,0.12)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#DCE7F7] via-[#112250] to-[#DCE7F7]" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1F1] text-red-500 ring-1 ring-red-100">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-lg font-bold">Gagal memuat event</h2>

          <p className="mt-2 text-sm leading-6 text-[#8793A3]">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#112250] px-6 text-xs font-semibold text-white shadow-lg shadow-[#112250]/25 transition hover:bg-[#1A326A] hover:shadow-xl hover:shadow-[#112250]/30"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 text-[#112250]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0D1F42] via-[#112250] to-[#1A326A] shadow-[0_30px_80px_-20px_rgba(13,31,66,0.55)]">
        {/* Dekorasi */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 top-16 h-64 w-64 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -left-32 bottom-[-140px] h-80 w-80 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute left-1/3 -top-10 h-52 w-52 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#3C5C99]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative w-full px-5 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
          <div className="mb-8 flex items-center gap-2.5 text-xs text-blue-200/70">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <span className="text-blue-200/40">/</span>
            <span className="font-medium text-white">Cari Event</span>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-md">
              <Sparkles size={13} className="text-[#BFD6F8]" />
              Temukan event favoritmu
              <span className="ml-1 h-1 w-1 rounded-full bg-[#9FB9E4]" />
              <span className="text-blue-200/80">Ribuan pilihan</span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Cari event yang ingin
              <span className="mt-1 block bg-gradient-to-r from-[#BFD6F8] via-[#DCE7F7] to-[#9FB9E4] bg-clip-text text-transparent">
                kamu hadiri
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/70 sm:text-base">
              Temukan konser, festival, fan meeting, comedy show, dan berbagai
              event menarik lainnya di TicketVerse — semua dalam satu tempat.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-10 max-w-5xl">
            <div className="rounded-[22px] border border-white/25 bg-white/95 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex flex-col gap-2 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8090A8]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama event, artis, atau venue..."
                    className="h-14 w-full rounded-[14px] bg-[#F7F9FC] pl-12 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-[#9AA5B5] focus:bg-white focus:ring-2 focus:ring-[#DCE7F7]"
                  />
                </div>

                <div className="relative w-full lg:w-52 lg:shrink-0">
                  <MapPin
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E7E97]"
                  />

                  <select
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setPage(1);
                    }}
                    className="h-14 w-full appearance-none rounded-[14px] border-0 bg-[#F7F9FC] pl-11 pr-10 text-sm text-[#44546A] outline-none focus:ring-2 focus:ring-[#DCE7F7]"
                  >
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#718096]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="group relative h-14 w-full shrink-0 overflow-hidden rounded-[14px] bg-gradient-to-r from-[#112250] to-[#1A326A] px-7 text-sm font-semibold text-white shadow-lg shadow-[#112250]/30 transition hover:shadow-xl hover:shadow-[#112250]/40 active:scale-[0.99] lg:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Search size={16} />
                    Cari Event
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </div>

              {/* Quick stats */}
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-2 pt-2 text-[11px] text-[#8793A3]">
                <span className="inline-flex items-center gap-1.5">
                  <Flame size={13} className="text-[#D9882E]" />
                  {mappedEvents.length} event tersedia
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#3C7A5C]" />
                  Pembelian tiket aman
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star size={13} className="text-[#C9A227]" />
                  Event terverifikasi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="mt-7 rounded-[20px] border border-[#E4E9F0] bg-white p-2 shadow-[0_10px_30px_rgba(17,34,80,0.06)]">
        <div className="flex w-full items-center gap-2 overflow-x-auto px-2 py-2 scrollbar-none">
          {categories.map((item) => {
            const Icon = item.icon;
            const active = category === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setCategory(item.name);
                  setPage(1);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-[#112250] to-[#1A326A] text-white shadow-md shadow-[#112250]/30 ring-1 ring-[#112250]/20"
                    : "bg-[#F5F7FA] text-[#65748A] hover:bg-[#EEF3F9] hover:text-[#112250]"
                }`}
              >
                <Icon size={15} />
                {item.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="w-full py-10">
        {/* FEATURED */}
        {category === "Semua" &&
          !search.trim() &&
          location === "Semua Lokasi" &&
          featuredEvents.length > 0 && (
            <section>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F82A0]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#EEF3F9] to-[#E1EAF6] ring-1 ring-[#DDE4ED]">
                      <Sparkles size={13} className="text-[#112250]" />
                    </span>
                    Pilihan TicketVerse
                  </div>

                  <h2 className="text-xl font-bold text-[#112250] sm:text-2xl">
                    Event yang sedang tersedia
                  </h2>

                  <p className="mt-1 text-sm text-[#8490A1]">
                    Event pilihan terbaik yang siap kamu hadiri.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="group hidden items-center gap-1.5 rounded-xl border border-[#DDE4ED] bg-white px-4 py-2 text-xs font-semibold text-[#526B92] transition hover:border-[#112250] hover:bg-[#112250] hover:text-white sm:flex"
                >
                  Lihat semua
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredEvents.map((event) => (
                  <FeaturedEventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

        {/* ALL EVENTS */}
        <section className="mt-14">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F82A0]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#EEF3F9] to-[#E1EAF6] ring-1 ring-[#DDE4ED]">
                  <TrendingUp size={13} className="text-[#112250]" />
                </span>
                Event Terbaru
              </div>

              <h2 className="text-xl font-bold text-[#112250] sm:text-2xl">
                Temukan event lainnya
              </h2>

              <p className="mt-1 text-sm text-[#8490A1]">
                Pilih event dan dapatkan tiketmu sekarang.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 text-xs text-[#8490A1] sm:flex">
                <SlidersHorizontal size={15} />
                Urutkan
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-xl border border-[#DDE4ED] bg-white pl-4 pr-9 text-xs font-medium text-[#52627A] outline-none transition focus:border-[#9DAFC7] focus:ring-2 focus:ring-[#EDF2F9] sm:w-auto"
                >
                  <option value="Terpopuler">Terpopuler</option>
                  <option value="Tanggal Terdekat">Tanggal Terdekat</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7C899B]"
                />
              </div>
            </div>
          </div>

          {/* RESULT COUNT */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#EEF1F5] bg-[#FAFBFD] px-4 py-2.5">
            <p className="text-xs text-[#8793A3]">
              Menampilkan{" "}
              <span className="font-semibold text-[#112250]">
                {filteredEvents.length}
              </span>{" "}
              event
              {totalPages > 1 && (
                <span className="text-[#A0A9B6]">
                  {" "}
                  · Halaman {currentPage} dari {totalPages}
                </span>
              )}
            </p>

            {(search ||
              category !== "Semua" ||
              location !== "Semua Lokasi" ||
              sort !== "Terpopuler") && (
              <button
                type="button"
                onClick={resetFilter}
                className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#526B92] hover:text-[#112250]"
              >
                <X size={14} />
                Reset filter
              </button>
            )}
          </div>

          {/* EVENT GRID */}
          {displayedEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState resetFilter={resetFilter} />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE4ED] bg-white text-[#63728A] shadow-sm transition hover:border-[#112250] hover:bg-[#112250] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#DDE4ED] disabled:hover:bg-white disabled:hover:text-[#63728A]"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    aria-current={currentPage === number ? "page" : undefined}
                    className={`h-10 w-10 rounded-xl text-xs font-semibold transition ${
                      currentPage === number
                        ? "bg-gradient-to-r from-[#112250] to-[#1A326A] text-white shadow-md shadow-[#112250]/30"
                        : "border border-transparent bg-white text-[#65748A] hover:bg-[#EEF3F9] hover:text-[#112250]"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE4ED] bg-white text-[#63728A] shadow-sm transition hover:border-[#112250] hover:bg-[#112250] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#DDE4ED] disabled:hover:bg-white disabled:hover:text-[#63728A]"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="relative isolate mt-16 overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0D1F42] via-[#112250] to-[#1A326A] shadow-[0_30px_80px_-20px_rgba(13,31,66,0.5)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-[#3C5C99]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.06),transparent_55%)]" />

          <div className="relative flex flex-col gap-7 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-14">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-medium text-blue-100 backdrop-blur-sm">
                <Ticket size={13} />
                TicketVerse
              </div>

              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                Jangan sampai ketinggalan event favoritmu.
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100/65">
                Temukan event menarik dan dapatkan pengalaman terbaik bersama
                TicketVerse. Ribuan event menanti untuk kamu jelajahi.
              </p>
            </div>

            <Link
              href="/cari-acara"
              className="group inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#112250] shadow-lg shadow-black/20 transition hover:bg-[#EEF3F9] hover:shadow-xl sm:w-auto"
            >
              Jelajahi Event
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeaturedEventCard({ event }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_12px_45px_rgba(17,34,80,0.08)] transition duration-300 hover:-translate-y-2 hover:border-[#C3D0E3] hover:shadow-[0_28px_65px_rgba(17,34,80,0.18)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#DCE7F7] via-[#112250] to-[#DCE7F7] opacity-0 transition group-hover:opacity-100" />

      <Link href={`/cari-acara/${event.id}`} className="block">
        <div className="relative h-56 overflow-hidden bg-[#E9EDF3] sm:h-60">
          <EventImage
            src={event.image}
            alt={event.title}
            className="transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07162F]/95 via-[#07162F]/25 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#112250] shadow-sm backdrop-blur">
              {event.category}
            </span>

            <span className="rounded-full border border-white/20 bg-[#112250]/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
              {event.status}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              {event.artist}
            </p>

            <h3 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-white">
              {event.title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniInfo
              icon={<CalendarDays size={14} />}
              label="Tanggal"
              value={event.date}
            />

            <MiniInfo
              icon={<MapPin size={14} />}
              label="Lokasi"
              value={event.city}
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#EEF1F5] pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#98A3B2]">
                Status
              </p>

              <p className="mt-1 text-sm font-bold text-[#112250]">
                {event.status}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#EEF3F9] px-3.5 py-2 text-xs font-semibold text-[#526B92] transition group-hover:bg-[#112250] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#112250]/25">
              Detail
              <ArrowRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function EventCard({ event }) {
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[20px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-[#C3D0E3] hover:shadow-[0_22px_55px_rgba(17,34,80,0.14)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#DCE7F7] via-[#112250] to-[#DCE7F7] opacity-0 transition group-hover:opacity-100" />

      <Link href={`/cari-acara/${event.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-[#E9EDF3]">
          <EventImage
            src={event.image}
            alt={event.title}
            className="transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-[#112250] shadow-sm backdrop-blur">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 rounded-lg bg-[#112250]/90 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
            {event.status}
          </div>
        </div>

        <div className="p-5">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#8A96A8]">
            {event.artist}
          </p>

          <h3 className="mt-1.5 line-clamp-1 text-base font-bold text-[#112250]">
            {event.title}
          </h3>

          <div className="mt-4 space-y-2.5">
            <MiniInfo
              icon={<CalendarDays size={14} />}
              label="Tanggal"
              value={`${event.date} • ${event.time}`}
            />

            <MiniInfo
              icon={<MapPin size={14} />}
              label="Lokasi"
              value={event.location}
            />
          </div>

          <div className="my-4 border-t border-[#EEF1F5]" />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-[#9AA4B3]">Status event</p>

              <p className="mt-0.5 truncate text-sm font-bold text-[#112250]">
                {event.status}
              </p>
            </div>

            <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#EEF3F9] px-3 text-xs font-semibold text-[#3B507D] transition group-hover:bg-[#112250] group-hover:text-white">
              Detail
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function MiniInfo({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#EEF3F9] to-[#E1EAF6] text-[#526B92] ring-1 ring-[#DDE4ED]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-wide text-[#A0A9B6]">
          {label}
        </p>

        <p className="truncate text-[11px] font-semibold text-[#52627A]">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ resetFilter }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-gradient-to-br from-white via-[#FAFBFD] to-[#F2F6FB] px-6 py-16 text-center shadow-[0_10px_40px_rgba(17,34,80,0.06)] sm:py-20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#EAF0FA]/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#E6EEF9]/70 blur-2xl" />

      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#112250] to-[#1A326A] text-white shadow-lg shadow-[#112250]/30 ring-4 ring-[#EEF3F9]">
        <Search size={27} />
      </div>

      <h3 className="relative mt-5 text-base font-bold text-[#112250]">
        Event tidak ditemukan
      </h3>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-[#8793A3]">
        Kami belum menemukan event yang sesuai dengan pencarian atau filter yang
        kamu pilih.
      </p>

      <button
        type="button"
        onClick={resetFilter}
        className="relative mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-5 text-xs font-semibold text-white shadow-lg shadow-[#112250]/25 transition hover:bg-[#1A326A] hover:shadow-xl hover:shadow-[#112250]/30"
      >
        Reset pencarian
        <X size={14} />
      </button>
    </div>
  );
}