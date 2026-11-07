"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  Ticket,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getPosterUrl(poster) {
  if (!poster) return null;

  if (poster.startsWith("http://") || poster.startsWith("https://")) {
    return poster;
  }

  return `${API_URL}/${poster.replace(/^\/+/, "")}`;
}

function formatDate(date) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatDateTime(date) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatTime(time) {
  if (!time) return "-";

  if (typeof time === "string" && time.length >= 5) {
    return time.substring(0, 5);
  }

  return time;
}

function formatRupiah(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);

  if (Number.isNaN(number)) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function getStatusConfig(status) {
  const configs = {
    "Coming Soon": {
      label: "Coming Soon",
      className: "bg-slate-50 text-slate-600 border border-slate-200",
      icon: Timer,
    },
    Available: {
      label: "Available",
      className: "bg-[#112250]/5 text-[#112250] border border-[#112250]/15",
      icon: CheckCircle2,
    },
    Limited: {
      label: "Limited",
      className: "bg-amber-50 text-amber-700 border border-amber-200/60",
      icon: AlertCircle,
    },
    "Sold Out": {
      label: "Sold Out",
      className: "bg-rose-50 text-rose-700 border border-rose-200/60",
      icon: XCircle,
    },
    Cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-500 border border-slate-200",
      icon: XCircle,
    },
  };

  return (
    configs[status] || {
      label: status || "-",
      className: "bg-slate-100 text-slate-500 border border-slate-200",
      icon: AlertCircle,
    }
  );
}

function getTicketStatus(ticket) {
  const remaining = Number(ticket.remaining_ticket ?? 0);
  const quota = Number(ticket.quota ?? 0);

  if (remaining <= 0) {
    return {
      label: "Sold Out",
      className: "text-rose-600 bg-rose-50 border-rose-200",
    };
  }

  if (quota > 0 && remaining <= quota * 0.2) {
    return {
      label: "Hampir Habis",
      className: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }

  return {
    label: "Tersedia",
    className: "text-[#112250] bg-[#112250]/5 border-[#112250]/15",
  };
}

export default function DetailEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(true);

  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");

  const [deleting, setDeleting] = useState(false);

  const [selectedTickets, setSelectedTickets] = useState({});

  useEffect(() => {
    if (!eventId) return;

    fetchEvent();
    fetchTicketCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data event");
      }

      setEvent(data.event);
    } catch (err) {
      console.error("Fetch event error:", err);
      setError(err.message || "Gagal mengambil data event");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTicketCategories() {
    try {
      setTicketLoading(true);
      setTicketError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${API_URL}/api/ticket-categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil kategori tiket");
      }

      const allTickets = Array.isArray(data.ticket_categories)
        ? data.ticket_categories
        : [];

      const eventTickets = allTickets.filter(
        (ticket) => Number(ticket.event_id) === Number(eventId)
      );

      setTickets(eventTickets);
    } catch (err) {
      console.error("Fetch ticket categories error:", err);
      setTicketError(err.message || "Gagal mengambil data kategori tiket");
      setTickets([]);
    } finally {
      setTicketLoading(false);
    }
  }

  function getTicketId(ticket) {
    return String(ticket.id);
  }

  function getSelectedQuantity(ticket) {
    const ticketId = getTicketId(ticket);
    return Number(selectedTickets[ticketId] || 0);
  }

  function increaseTicket(ticket) {
    const ticketId = getTicketId(ticket);
    const remaining = Math.max(0, Number(ticket.remaining_ticket ?? 0));
    const currentQuantity = getSelectedQuantity(ticket);

    if (remaining <= 0) return;
    if (currentQuantity >= remaining) return;

    setSelectedTickets((current) => ({
      ...current,
      [ticketId]: currentQuantity + 1,
    }));
  }

  function decreaseTicket(ticket) {
    const ticketId = getTicketId(ticket);
    const currentQuantity = getSelectedQuantity(ticket);

    if (currentQuantity <= 0) return;

    const nextQuantity = currentQuantity - 1;

    setSelectedTickets((current) => {
      const next = { ...current };
      if (nextQuantity <= 0) delete next[ticketId];
      else next[ticketId] = nextQuantity;
      return next;
    });
  }

  const selectedTicketItems = useMemo(() => {
    return tickets
      .filter((ticket) => getSelectedQuantity(ticket) > 0)
      .map((ticket) => {
        const quantity = getSelectedQuantity(ticket);
        const price = Number(ticket.price) || 0;
        return {
          ...ticket,
          quantity,
          subtotal: price * quantity,
        };
      });
  }, [tickets, selectedTickets]);

  const totalQuantity = useMemo(() => {
    return selectedTicketItems.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  }, [selectedTicketItems]);

  const totalPrice = useMemo(() => {
    return selectedTicketItems.reduce(
      (total, ticket) => total + ticket.subtotal,
      0
    );
  }, [selectedTicketItems]);

  function handleCheckout() {
    if (selectedTicketItems.length === 0) {
      alert("Silakan pilih minimal satu tiket.");
      return;
    }

    const firstTicket = selectedTicketItems[0];

    const query = new URLSearchParams({
      eventId: String(eventId),
      ticketCategoryId: String(firstTicket.id),
      quantity: String(firstTicket.quantity),
    });

    router.push(`/checkout?${query.toString()}`);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus event ini?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menghapus event");
      }

      router.push("/organizer/event");
      router.refresh();
    } catch (err) {
      console.error("Delete event error:", err);
      alert(err.message || "Gagal menghapus event");
    } finally {
      setDeleting(false);
    }
  }

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 size={26} className="animate-spin text-[#112250]" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat detail event...
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-5 text-lg font-bold text-[#0F172A]">
            Data Event Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Event yang Anda cari tidak tersedia atau telah dihapus."}
          </p>
          <button
            onClick={() => router.push("/organizer/event")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Event
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;
  const posterUrl = getPosterUrl(event.poster);

  /* ===================================================
     MAIN RENDER
  =================================================== */

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/organizer/event"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#112250]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Event
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Detail Event
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Informasi lengkap event dan kategori tiket.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push(`/organizer/event/edit/${event.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
            >
              <Pencil className="h-4 w-4" />
              Edit Event
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deleting ? "Menghapus..." : "Hapus Event"}
            </button>
          </div>
        </div>

        {/* HERO EVENT */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* POSTER */}
            <div className="relative min-h-[420px] bg-slate-900 lg:min-h-[500px]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={event.event_name || "Poster Event"}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#112250] via-[#243B68] to-[#3B507D]">
                  <div className="text-center text-white/80">
                    <Ticket className="mx-auto h-14 w-14" />
                    <p className="mt-3 text-sm">Tidak ada poster</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 pt-24 lg:hidden">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* EVENT INFO */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <div className="hidden lg:block">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusConfig.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold leading-tight text-[#0F172A] sm:text-3xl">
                {event.event_name}
              </h2>

              {event.description && (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
                  {event.description}
                </p>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Tanggal Event"
                  value={formatDate(event.event_date)}
                />
                <InfoItem
                  icon={Clock3}
                  label="Waktu"
                  value={formatTime(event.event_time)}
                />
                <InfoItem
                  icon={MapPin}
                  label="Lokasi"
                  value={event.venue_name || event.venue || "-"}
                  subValue={event.city || event.venue_city || ""}
                />
                <InfoItem
                  icon={UserRound}
                  label="Artis"
                  value={event.artist_name || event.artist || "-"}
                />
                <InfoItem
                  icon={Tag}
                  label="Kategori"
                  value={event.category_name || event.category || "-"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TICKET CATEGORIES */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] sm:text-xl">
                    Pilih Tiket
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Pilih kategori dan jumlah tiket yang ingin dibeli.
                  </p>
                </div>
              </div>
            </div>

            {!ticketLoading && !ticketError && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#112250]/5 px-3 py-1.5 text-xs font-bold text-[#112250]">
                <Ticket className="h-3.5 w-3.5" />
                {tickets.length} Kategori
              </div>
            )}
          </div>

          {ticketLoading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#112250]" />
                Memuat kategori tiket...
              </div>
            </div>
          ) : ticketError ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">
                    Gagal memuat kategori tiket
                  </h3>
                  <p className="mt-1 text-sm text-red-600">{ticketError}</p>
                  <button
                    type="button"
                    onClick={fetchTicketCategories}
                    className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Ticket className="h-5 w-5 text-slate-400" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                Belum ada kategori tiket
              </h3>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                Event ini belum memiliki kategori tiket.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {tickets.map((ticket) => {
                const ticketStatus = getTicketStatus(ticket);
                const quota = Number(ticket.quota ?? 0);
                const remaining = Number(ticket.remaining_ticket ?? 0);
                const quantity = getSelectedQuantity(ticket);
                const availability =
                  quota > 0
                    ? Math.min(100, Math.max(0, (remaining / quota) * 100))
                    : 0;
                const isSoldOut = remaining <= 0;

                return (
                  <div
                    key={ticket.id}
                    className={`rounded-2xl border p-5 transition ${
                      quantity > 0
                        ? "border-[#112250]/30 bg-[#112250]/5 shadow-sm"
                        : "border-slate-200 bg-white hover:border-[#112250]/20"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* LEFT */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#0F172A]">
                              {ticket.category_name ||
                                ticket.name ||
                                ticket.nama_kategori ||
                                "-"}
                            </h3>
                            <span
                              className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${ticketStatus.className}`}
                            >
                              {ticketStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Harga
                            </p>
                            <p className="mt-1 text-xl font-bold text-[#112250]">
                              {formatRupiah(ticket.price)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Sisa Tiket
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-800">
                              {remaining.toLocaleString("id-ID")} tiket
                            </p>
                          </div>

                          {quota > 0 && (
                            <div className="min-w-[160px]">
                              <div className="mb-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">
                                  Ketersediaan
                                </span>
                                <span className="font-bold text-slate-600">
                                  {Math.round(availability)}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#112250] transition-all"
                                  style={{ width: `${availability}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* QUANTITY */}
                      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:min-w-[260px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Jumlah
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {quantity} tiket
                          </p>
                        </div>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => decreaseTicket(ticket)}
                            disabled={quantity <= 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Kurangi ${ticket.category_name || "tiket"}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex min-w-[42px] items-center justify-center text-sm font-bold text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseTicket(ticket)}
                            disabled={isSoldOut || quantity >= remaining}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#112250] transition hover:bg-[#112250]/10 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Tambah ${ticket.category_name || "tiket"}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SUBTOTAL */}
                    {quantity > 0 && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                        <span className="text-xs font-medium text-slate-500">
                          Subtotal
                        </span>
                        <span className="text-sm font-bold text-[#0F172A]">
                          {formatRupiah(Number(ticket.price) * quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CHECKOUT SUMMARY */}
        {selectedTicketItems.length > 0 && (
          <section className="overflow-hidden rounded-3xl border border-[#112250]/20 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* SELECTED ITEMS */}
              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250] text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      Ringkasan Pesanan
                    </h2>
                    <p className="text-sm text-slate-500">
                      Tiket yang kamu pilih.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {selectedTicketItems.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">
                          {ticket.category_name ||
                            ticket.name ||
                            ticket.nama_kategori ||
                            "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.quantity} x {formatRupiah(ticket.price)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[#0F172A]">
                        {formatRupiah(ticket.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-[#112250]/10 bg-[#112250]/5 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-sm font-medium text-slate-500">
                  Total Tiket
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold tracking-tight text-[#0F172A]">
                    {totalQuantity}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">tiket</span>
                </div>

                <div className="my-5 h-px bg-[#112250]/10" />

                <p className="text-sm font-medium text-slate-500">
                  Total Pembayaran
                </p>
                <p className="mt-1 text-2xl font-bold text-[#112250]">
                  {formatRupiah(totalPrice)}
                </p>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1A326A] hover:-translate-y-0.5"
                >
                  Lanjut ke Checkout
                  <ChevronRight className="h-4 w-4" />
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
                  Pastikan kategori dan jumlah tiket sudah sesuai sebelum
                  melanjutkan.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* EVENT INFORMATION */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* TICKET SALE */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Periode Penjualan Tiket
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi waktu penjualan tiket.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Mulai Penjualan
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDateTime(event.ticket_sale_start)}
                  </p>
                </div>
                <CalendarDays className="h-5 w-5 shrink-0 text-slate-400" />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Akhir Penjualan
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDateTime(event.ticket_sale_end)}
                  </p>
                </div>
                <CalendarDays className="h-5 w-5 shrink-0 text-slate-400" />
              </div>
            </div>
          </div>

          {/* VENUE */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Lokasi Event
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi tempat penyelenggaraan.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {event.venue_name || event.venue || "-"}
              </h3>

              <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#112250]" />
                <span>
                  {event.city ||
                    event.venue_city ||
                    "Lokasi tidak tersedia"}
                </span>
              </div>

              {event.capacity && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-[#112250]" />
                  <span>
                    Kapasitas:{" "}
                    <strong className="text-slate-700">
                      {Number(event.capacity).toLocaleString("id-ID")}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="flex justify-start pb-4">
          <Link
            href="/organizer/event"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#112250]/30 hover:bg-[#112250]/5 hover:text-[#112250]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================
   INFO ITEM
========================= */

function InfoItem({ icon: Icon, label, value, subValue }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className="h-4 w-4 text-[#112250]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-800">
          {value}
        </p>
        {subValue && (
          <p className="mt-0.5 text-xs text-slate-500">{subValue}</p>
        )}
      </div>
    </div>
  );
}