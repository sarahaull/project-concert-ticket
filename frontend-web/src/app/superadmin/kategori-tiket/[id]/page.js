"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Ticket,
  CalendarDays,
  TicketCheck,
  Hash,
  CircleCheck,
} from "lucide-react";

const categories = {
  1: {
    name: "VIP",
    code: "VIP",
    description: "Tiket dengan akses dan fasilitas eksklusif.",
    status: "Aktif",
    totalEvents: 24,
    totalTickets: 4280,
    createdAt: "12 Agustus 2026",
    updatedAt: "28 Agustus 2026",
  },
  2: {
    name: "Festival",
    code: "FEST",
    description: "Tiket untuk area festival dan standing.",
    status: "Aktif",
    totalEvents: 38,
    totalTickets: 12560,
    createdAt: "10 Agustus 2026",
    updatedAt: "27 Agustus 2026",
  },
  3: {
    name: "Regular",
    code: "REG",
    description: "Tiket reguler untuk pengunjung umum.",
    status: "Aktif",
    totalEvents: 42,
    totalTickets: 18420,
    createdAt: "08 Agustus 2026",
    updatedAt: "26 Agustus 2026",
  },
};

export default function TicketCategoryDetailPage() {
  const params = useParams();

  const category =
    categories[params.id] || categories[1];

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <Link
          href="/superadmin/kategori-tiket"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#112250]"
        >
          <ArrowLeft size={17} />
          Kembali
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#112250] text-white shadow-[0_8px_20px_rgba(17,34,80,0.15)]">
              <Ticket size={22} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#112250]">
                  {category.name}
                </h1>

                <span className="rounded-full bg-[#EAF7F0] px-3 py-1 text-xs font-semibold text-[#25804B]">
                  {category.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#718096]">
                Detail kategori tiket
              </p>
            </div>
          </div>

          <Link
            href={`/superadmin/kategori-tiket/${params.id}/edit`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,34,80,0.18)] transition hover:bg-[#1A326A]"
          >
            <Pencil size={17} />
            Edit Kategori
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#112250] via-[#19345F] to-[#294A78] p-6 text-white shadow-[0_12px_35px_rgba(17,34,80,0.16)]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A9C7F7]">
              Ticket Category
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {category.name}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#D6E0EF]">
              {category.description}
            </p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
            <Ticket size={34} />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon={<Hash size={19} />}
          label="Kode Kategori"
          value={category.code}
        />

        <InfoCard
          icon={<CalendarDays size={19} />}
          label="Terhubung ke Event"
          value={category.totalEvents}
        />

        <InfoCard
          icon={<TicketCheck size={19} />}
          label="Total Tiket"
          value={new Intl.NumberFormat("id-ID").format(
            category.totalTickets
          )}
        />
      </div>

      {/* INFORMATION */}
      <div className="rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_4px_20px_rgba(17,34,80,0.04)]">
        <div className="border-b border-[#E8ECF2] px-6 py-5">
          <h2 className="font-bold text-[#112250]">
            Informasi Kategori
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <DetailRow
            label="Nama Kategori"
            value={category.name}
          />

          <DetailRow
            label="Kode"
            value={category.code}
          />

          <DetailRow
            label="Status"
            value={
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF7F0] px-3 py-1.5 text-xs font-semibold text-[#25804B]">
                <CircleCheck size={14} />
                {category.status}
              </span>
            }
          />

          <DetailRow
            label="Dibuat Pada"
            value={category.createdAt}
          />

          <DetailRow
            label="Terakhir Diperbarui"
            value={category.updatedAt}
          />

          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
              Deskripsi
            </p>

            <p className="rounded-xl bg-[#F7F9FC] p-4 text-sm leading-6 text-[#56657A]">
              {category.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#E2E7EF] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium text-[#8490A1]">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-[#112250]">
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
        {label}
      </p>

      <div className="text-sm font-semibold text-[#344563]">
        {value}
      </div>
    </div>
  );
}