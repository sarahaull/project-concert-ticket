"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  CalendarDays,
  MapPin,
  Users,
  CircleDollarSign,
  Pencil,
  ShoppingBag,
} from "lucide-react";

const ticketData = {
  1: {
    name: "VIP",
    code: "VIP-001",
    event: "Soundwave Festival 2026",
    category: "VIP",
    price: 750000,
    quota: 1000,
    sold: 842,
    available: 158,
    status: "Aktif",
    date: "18 Oktober 2026",
    time: "19:00 WIB",
    venue: "GBK Senayan",
    city: "Jakarta",
    description:
      "Tiket VIP memberikan akses terbaik untuk menikmati Soundwave Festival 2026.",
  },

  2: {
    name: "Festival",
    code: "FST-001",
    event: "Soundwave Festival 2026",
    category: "Festival",
    price: 350000,
    quota: 5000,
    sold: 4235,
    available: 765,
    status: "Aktif",
    date: "18 Oktober 2026",
    time: "19:00 WIB",
    venue: "GBK Senayan",
    city: "Jakarta",
    description:
      "Tiket festival untuk akses utama area konser.",
  },

  3: {
    name: "Regular",
    code: "REG-001",
    event: "Nusantara Music Fest",
    category: "Regular",
    price: 275000,
    quota: 3000,
    sold: 2180,
    available: 820,
    status: "Aktif",
    date: "24 Oktober 2026",
    time: "18:30 WIB",
    venue: "JIExpo Kemayoran",
    city: "Jakarta",
    description:
      "Tiket reguler untuk menikmati seluruh rangkaian acara.",
  },
};

export default function TicketDetailPage() {
  const params = useParams();

  const ticket =
    ticketData[params.id] || ticketData[1];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(value);

  const percentage =
    ticket.quota > 0
      ? Math.round(
          (ticket.sold / ticket.quota) * 100
        )
      : 0;

  const revenue = ticket.sold * ticket.price;

  return (
    <div className="w-full max-w-6xl space-y-6">

      {/* BACK */}
      <Link
        href="/superadmin/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#112250]"
      >
        <ArrowLeft size={17} />
        Kembali ke Tiket
      </Link>

      {/* TICKET PREVIEW */}
      <div className="overflow-hidden rounded-[24px] border border-[#DDE4ED] bg-white shadow-[0_10px_35px_rgba(17,34,80,0.07)]">

        {/* TOP */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#10244A] via-[#183763] to-[#274D7B] p-8 text-white">

          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-white/10" />

          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Ticket size={31} />
              </div>

              <div>

                <p className="text-xs font-medium tracking-[0.2em] text-blue-200">
                  TICKETVERSE PASS
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                  {ticket.name}
                </h1>

                <p className="mt-1 text-sm tracking-widest text-blue-200">
                  {ticket.code}
                </p>

              </div>

            </div>

            <StatusBadge status={ticket.status} />

          </div>

          <div className="relative mt-8">

            <p className="text-xs uppercase tracking-widest text-blue-200">
              Event
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {ticket.event}
            </h2>

          </div>

        </div>

        {/* NOTCH */}
        <div className="relative h-8 bg-white">

          <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#F5F7FA]" />

          <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#F5F7FA]" />

          <div className="absolute left-10 right-10 top-1/2 border-t border-dashed border-[#CBD5E1]" />

        </div>

        {/* BODY */}
        <div className="p-8">

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <Info
              icon={<CalendarDays size={19} />}
              label="Tanggal"
              value={ticket.date}
            />

            <Info
              icon={<CalendarDays size={19} />}
              label="Waktu"
              value={ticket.time}
            />

            <Info
              icon={<MapPin size={19} />}
              label="Lokasi"
              value={`${ticket.venue}, ${ticket.city}`}
            />

          </div>

          {/* STATS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DetailStat
              icon={<CircleDollarSign size={20} />}
              label="Harga"
              value={formatCurrency(ticket.price)}
            />

            <DetailStat
              icon={<Ticket size={20} />}
              label="Kuota"
              value={formatNumber(ticket.quota)}
            />

            <DetailStat
              icon={<ShoppingBag size={20} />}
              label="Terjual"
              value={formatNumber(ticket.sold)}
            />

            <DetailStat
              icon={<Users size={20} />}
              label="Tersedia"
              value={formatNumber(ticket.available)}
            />

          </div>

          {/* PROGRESS */}
          <div className="mt-8 rounded-2xl bg-[#F7F9FC] p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-[#8A96A8]">
                  Progress Penjualan
                </p>

                <p className="mt-1 text-xl font-bold text-[#112250]">
                  {percentage}%
                </p>
              </div>

              <p className="text-sm text-[#718096]">
                {formatNumber(ticket.sold)} dari{" "}
                {formatNumber(ticket.quota)} tiket
              </p>

            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E3E8EF]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B507D] to-[#6C8EBF]"
                style={{
                  width: `${Math.min(
                    percentage,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-8">

            <h3 className="font-bold text-[#112250]">
              Deskripsi
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#718096]">
              {ticket.description}
            </p>

          </div>

          {/* ACTION */}
          <div className="mt-8 flex justify-end">

            <Link
              href={`/superadmin/tickets/${params.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white hover:bg-[#1A326A]"
            >
              <Pencil size={17} />
              Edit Tiket
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
        {icon}
      </div>

      <div>

        <p className="text-xs text-[#9AA4B3]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#44546A]">
          {value}
        </p>

      </div>

    </div>
  );
}

function DetailStat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#E2E7EF] bg-white p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#3B507D]">
        {icon}
      </div>

      <p className="mt-3 text-xs text-[#8A96A8]">
        {label}
      </p>

      <p className="mt-1 font-bold text-[#112250]">
        {value}
      </p>

    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold">

      <span
        className={`h-2 w-2 rounded-full ${
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