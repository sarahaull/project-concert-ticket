"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Ticket,
  CalendarDays,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingUp,
  CircleDollarSign,
  Users,
} from "lucide-react";

const tickets = [
  {
    id: 1,
    name: "VIP",
    code: "VIP-001",
    event: "Soundwave Festival 2026",
    category: "VIP",
    price: 750000,
    quota: 1000,
    sold: 842,
    available: 158,
    status: "Aktif",
    date: "18 Okt 2026",
    city: "Jakarta",
  },
  {
    id: 2,
    name: "Festival",
    code: "FST-001",
    event: "Soundwave Festival 2026",
    category: "Festival",
    price: 350000,
    quota: 5000,
    sold: 4235,
    available: 765,
    status: "Aktif",
    date: "18 Okt 2026",
    city: "Jakarta",
  },
  {
    id: 3,
    name: "Regular",
    code: "REG-001",
    event: "Nusantara Music Fest",
    category: "Regular",
    price: 275000,
    quota: 3000,
    sold: 2180,
    available: 820,
    status: "Aktif",
    date: "24 Okt 2026",
    city: "Jakarta",
  },
  {
    id: 4,
    name: "Early Bird",
    code: "EB-001",
    event: "Jakarta Jazz Night",
    category: "Early Bird",
    price: 250000,
    quota: 1000,
    sold: 1000,
    available: 0,
    status: "Habis",
    date: "01 Nov 2026",
    city: "Jakarta",
  },
  {
    id: 5,
    name: "VIP Package",
    code: "VIP-002",
    event: "K-Pop Fan Meeting",
    category: "VIP",
    price: 1250000,
    quota: 800,
    sold: 642,
    available: 158,
    status: "Aktif",
    date: "15 Nov 2026",
    city: "Tangerang",
  },
  {
    id: 6,
    name: "Presale",
    code: "PRE-001",
    event: "Indie Weekend",
    category: "Presale",
    price: 180000,
    quota: 1500,
    sold: 0,
    available: 1500,
    status: "Draft",
    date: "22 Nov 2026",
    city: "Jakarta",
  },
  {
    id: 7,
    name: "Regular",
    code: "REG-002",
    event: "Comedy Night Jakarta",
    category: "Regular",
    price: 300000,
    quota: 2500,
    sold: 1420,
    available: 1080,
    status: "Aktif",
    date: "29 Nov 2026",
    city: "Jakarta",
  },
  {
    id: 8,
    name: "Premium",
    code: "PRE-002",
    event: "Art & Culture Expo",
    category: "Premium",
    price: 200000,
    quota: 2000,
    sold: 1560,
    available: 440,
    status: "Aktif",
    date: "12 Des 2026",
    city: "Tangerang",
  },
];

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [category, setCategory] = useState("Semua");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const perPage = 6;

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(value);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        ticket.name.toLowerCase().includes(keyword) ||
        ticket.code.toLowerCase().includes(keyword) ||
        ticket.event.toLowerCase().includes(keyword);

      const matchStatus =
        status === "Semua" || ticket.status === status;

      const matchCategory =
        category === "Semua" ||
        ticket.category === category;

      return matchSearch && matchStatus && matchCategory;
    });

    result.sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [search, status, category, sortAsc]);

  const totalPages = Math.ceil(
    filteredTickets.length / perPage
  );

  const displayedTickets = filteredTickets.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const activeTickets = tickets.filter(
    (ticket) => ticket.status === "Aktif"
  ).length;

  const soldTickets = tickets.reduce(
    (sum, ticket) => sum + ticket.sold,
    0
  );

  const totalRevenue = tickets.reduce(
    (sum, ticket) => sum + ticket.sold * ticket.price,
    0
  );

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#718096]">
            <span>Event & Tiket</span>
            <span>/</span>
            <span className="font-medium text-[#3B507D]">
              Tiket
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#112250]">
            Kelola Tiket
          </h1>

          <p className="mt-1 text-sm text-[#718096]">
            Kelola seluruh tiket dari semua event TicketVerse.
          </p>
        </div>

        <Link
          href="/superadmin/tickets/create"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white transition hover:bg-[#1A326A]"
        >
          <Plus size={18} />
          Tambah Tiket
        </Link>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Ticket size={20} />}
          label="Total Tiket"
          value={tickets.length}
          description="Jenis tiket"
        />

        <StatCard
          icon={<TrendingUp size={20} />}
          label="Tiket Aktif"
          value={activeTickets}
          description="Sedang tersedia"
        />

        <StatCard
          icon={<Users size={20} />}
          label="Tiket Terjual"
          value={formatNumber(soldTickets)}
          description="Semua event"
        />

        <StatCard
          icon={<CircleDollarSign size={20} />}
          label="Total Penjualan"
          value={formatCurrency(totalRevenue)}
          description="Estimasi pendapatan"
          compact
        />

      </div>

      {/* FILTER */}
      <div className="rounded-2xl border border-[#E2E7EF] bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

          <div className="relative w-full xl:w-[340px]">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A8]"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari tiket atau event..."
              className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-10 pr-4 text-sm outline-none focus:border-[#5275A5]"
            />

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">

              <SlidersHorizontal
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
              />

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-11 appearance-none rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-9 pr-8 text-sm text-[#44546A]"
              >
                <option value="Semua">
                  Semua Kategori
                </option>
                <option value="VIP">VIP</option>
                <option value="Festival">Festival</option>
                <option value="Regular">Regular</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Presale">Presale</option>
                <option value="Premium">Premium</option>
              </select>

            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm text-[#44546A]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Habis">Habis</option>
              <option value="Draft">Draft</option>
            </select>

            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] px-4 text-sm text-[#44546A] hover:bg-[#F5F7FA]"
            >
              <ArrowUpDown size={16} />
              Nama
            </button>

          </div>

        </div>
      </div>

      {/* TICKET GRID */}
      {displayedTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {displayedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          ))}

        </div>
      ) : (
        <div className="rounded-2xl border border-[#E2E7EF] bg-white py-20 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF3F9] text-[#3B507D]">
            <Ticket size={28} />
          </div>

          <h3 className="mt-4 font-semibold text-[#112250]">
            Tiket tidak ditemukan
          </h3>

          <p className="mt-1 text-sm text-[#8490A1]">
            Coba ubah pencarian atau filter.
          </p>

        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E7EF] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-[#7A8799]">
            Menampilkan{" "}
            <b>
              {(page - 1) * perPage + 1}
            </b>{" "}
            -{" "}
            <b>
              {Math.min(
                page * perPage,
                filteredTickets.length
              )}
            </b>{" "}
            dari{" "}
            <b>{filteredTickets.length}</b> tiket
          </p>

          <div className="flex items-center gap-1">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-9 w-9 rounded-lg text-xs font-semibold ${
                  page === number
                    ? "bg-[#112250] text-white"
                    : "text-[#64748B] hover:bg-[#F1F4F8]"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================
   TICKET CARD
========================= */

function TicketCard({
  ticket,
  formatCurrency,
  formatNumber,
}) {
  const percentage =
    ticket.quota > 0
      ? Math.round((ticket.sold / ticket.quota) * 100)
      : 0;

  return (
    <div className="group overflow-hidden rounded-[22px] border border-[#DDE4ED] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(17,34,80,0.11)]">

      {/* HEADER TICKET */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#10244A] via-[#183763] to-[#274D7B] p-6 text-white">

        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-white/10" />

        <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border border-white/10" />

        <div className="relative flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Ticket size={23} />
            </div>

            <div>

              <p className="text-[10px] font-medium tracking-widest text-blue-200">
                TICKETVERSE PASS
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {ticket.name}
              </h2>

              <p className="mt-1 text-[11px] tracking-widest text-blue-200">
                {ticket.code}
              </p>

            </div>

          </div>

          <StatusBadge status={ticket.status} />

        </div>

        <div className="relative mt-6">

          <p className="text-[10px] font-medium tracking-widest text-blue-200">
            EVENT
          </p>

          <h3 className="mt-1 text-lg font-bold">
            {ticket.event}
          </h3>

        </div>

      </div>

      {/* SOBEKAN */}
      <div className="relative h-7 bg-white">

        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#F5F7FA]" />

        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#F5F7FA]" />

        <div className="absolute left-7 right-7 top-1/2 border-t border-dashed border-[#C9D2DE]" />

      </div>

      {/* BODY */}
      <div className="px-6 pb-6">

        <div className="grid grid-cols-2 gap-4">

          <InfoItem
            icon={<CalendarDays size={15} />}
            label="Tanggal"
            value={ticket.date}
          />

          <InfoItem
            icon={<MapPin size={15} />}
            label="Lokasi"
            value={ticket.city}
          />

        </div>

        <div className="mt-4 rounded-xl bg-[#F7F9FC] p-4">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8A96A8]">
                Harga
              </p>

              <p className="mt-1 text-lg font-bold text-[#112250]">
                {formatCurrency(ticket.price)}
              </p>
            </div>

            <div className="text-right">

              <p className="text-[10px] uppercase tracking-wider text-[#8A96A8]">
                Terjual
              </p>

              <p className="mt-1 text-sm font-bold text-[#3B507D]">
                {formatNumber(ticket.sold)} /{" "}
                {formatNumber(ticket.quota)}
              </p>

            </div>

          </div>

          <div className="mt-3">

            <div className="flex justify-between text-[10px]">

              <span className="text-[#8A96A8]">
                Penjualan
              </span>

              <span className="font-bold text-[#44546A]">
                {percentage}%
              </span>

            </div>

            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E4E9F0]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B507D] to-[#6C8EBF]"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between">

          <div className="flex h-9 items-center gap-[2px] opacity-60">

            {[3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1].map(
              (width, index) => (
                <span
                  key={index}
                  className="h-8 bg-[#112250]"
                  style={{ width: `${width}px` }}
                />
              )
            )}

          </div>

          <div className="flex items-center gap-1">

            <Link
              href={`/superadmin/tickets/${ticket.id}`}
              title="Detail"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68778C] hover:bg-[#EEF3F9] hover:text-[#3B507D]"
            >
              <Eye size={17} />
            </Link>

            <Link
              href={`/superadmin/tickets/${ticket.id}/edit`}
              title="Edit"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68778C] hover:bg-[#EEF3F9] hover:text-[#3B507D]"
            >
              <Pencil size={17} />
            </Link>

            <button
              title="Hapus"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8792A1] hover:bg-[#FFF1F1] hover:text-[#C04A4A]"
            >
              <Trash2 size={17} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================
   INFO
========================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#526B92]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-wide text-[#9AA4B3]">
          {label}
        </p>

        <p className="truncate text-xs font-semibold text-[#44546A]">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================
   STATUS
========================= */

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold backdrop-blur-sm">

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Aktif"
            ? "bg-emerald-300"
            : status === "Habis"
            ? "bg-red-300"
            : "bg-slate-300"
        }`}
      />

      {status}

    </span>
  );
}

/* =========================
   STAT
========================= */

function StatCard({
  icon,
  label,
  value,
  description,
  compact = false,
}) {
  return (
    <div className="rounded-2xl border border-[#E2E7EF] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
        {icon}
      </div>

      <p className="mt-4 text-xs text-[#7B8798]">
        {label}
      </p>

      <p
        className={`mt-1 font-bold text-[#112250] ${
          compact ? "text-lg" : "text-2xl"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-[#98A3B2]">
        {description}
      </p>

    </div>
  );
}