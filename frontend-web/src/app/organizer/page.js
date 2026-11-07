"use client";

import {
  CalendarDays,
  Ticket,
  WalletCards,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  MapPin,
  Clock3,
  MoreHorizontal,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

import Link from "next/link";

export default function DashboardOrganizerPage() {
  return (
    <div className="w-full min-w-0">
      {/* ===================================================
          PAGE HEADER
      ==================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#8490A1]">
            <span>Organizer</span>
            <span>/</span>
            <span className="text-[#112250]">Dashboard</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#112250] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#8490A1]">
            Pantau performa event dan penjualan tiket kamu.
          </p>
        </div>

        <Link
          href="/organizer/events/tambah"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#112250]
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-[#112250]/15
            transition
            duration-200
            hover:bg-[#0D1F42]
            hover:-translate-y-0.5
          "
        >
          <Plus size={18} />
          Buat Event
        </Link>
      </div>

      {/* ===================================================
          STAT CARDS
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Event"
          value="12"
          description="Event yang dibuat"
          icon={CalendarDays}
          trend="+2"
          trendText="bulan ini"
        />

        <StatCard
          title="Tiket Terjual"
          value="3.842"
          description="Total tiket terjual"
          icon={Ticket}
          trend="+18,6%"
          trendText="vs bulan lalu"
        />

        <StatCard
          title="Total Pendapatan"
          value="Rp 284,5 Jt"
          description="Pendapatan keseluruhan"
          icon={WalletCards}
          trend="+12,4%"
          trendText="vs bulan lalu"
        />

        <StatCard
          title="Total Peserta"
          value="3.214"
          description="Peserta terdaftar"
          icon={Users}
          trend="+9,8%"
          trendText="vs bulan lalu"
        />
      </div>

      {/* ===================================================
          GRAPH + SUMMARY
      ==================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* GRAPH */}

        <section className="overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F5] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF]">
                <BarChart3 size={19} className="text-[#2563EB]" />
              </div>

              <div>
                <h2 className="font-bold text-[#112250]">
                  Grafik Penjualan
                </h2>

                <p className="text-xs text-[#8490A1]">
                  Performa penjualan tiket
                </p>
              </div>
            </div>

            <select
              className="
                rounded-lg
                border
                border-[#DDE4ED]
                bg-white
                px-3
                py-2
                text-sm
                font-medium
                text-[#526B92]
                outline-none
                focus:border-[#2563EB]
              "
            >
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
              <option>3 Bulan Terakhir</option>
              <option>1 Tahun</option>
            </select>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs text-[#8490A1]">
                  Total Penjualan
                </p>

                <h3 className="mt-1 text-2xl font-bold text-[#112250]">
                  Rp 48.750.000
                </h3>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-[#ECFDF3] px-2.5 py-1.5 text-xs font-semibold text-[#16803C]">
                <TrendingUp size={14} />
                18,6%
              </div>
            </div>

            <div className="h-[280px] w-full">
              <svg
                viewBox="0 0 800 280"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity="0.18"
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <line x1="0" y1="40" x2="800" y2="40" stroke="#EEF1F5" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#EEF1F5" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="#EEF1F5" />
                <line x1="0" y1="220" x2="800" y2="220" stroke="#EEF1F5" />

                <path
                  d="
                    M 0 210
                    L 115 180
                    L 230 195
                    L 345 125
                    L 460 150
                    L 575 85
                    L 690 110
                    L 800 45
                    L 800 260
                    L 0 260
                    Z
                  "
                  fill="url(#salesGradient)"
                />

                <path
                  d="
                    M 0 210
                    L 115 180
                    L 230 195
                    L 345 125
                    L 460 150
                    L 575 85
                    L 690 110
                    L 800 45
                  "
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {[
                  [0, 210],
                  [115, 180],
                  [230, 195],
                  [345, 125],
                  [460, 150],
                  [575, 85],
                  [690, 110],
                  [800, 45],
                ].map(([cx, cy], index) => (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="#2563EB"
                  />
                ))}
              </svg>
            </div>

            <div className="mt-2 grid grid-cols-8 text-center text-[11px] text-[#8490A1]">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
              <span>Hari ini</span>
            </div>
          </div>
        </section>

        {/* SUMMARY */}

        <section className="rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#112250]">
                Ringkasan Penjualan
              </h2>

              <p className="mt-1 text-xs text-[#8490A1]">
                Statistik bulan ini
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF]">
              <TrendingUp size={18} className="text-[#2563EB]" />
            </div>
          </div>

          <div className="space-y-5">
            <SummaryItem
              label="Tiket Terjual"
              value="1.284"
              percentage="78%"
            />

            <SummaryItem
              label="Pendapatan"
              value="Rp 84,2 Jt"
              percentage="64%"
            />

            <SummaryItem
              label="Peserta Check-in"
              value="924"
              percentage="72%"
            />

            <SummaryItem
              label="Refund"
              value="24"
              percentage="8%"
            />
          </div>

          <Link
            href="/organizer/laporan/penjualan"
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#DDE4ED]
              py-3
              text-sm
              font-semibold
              text-[#526B92]
              transition
              hover:border-[#2563EB]
              hover:text-[#2563EB]
            "
          >
            Lihat Laporan Lengkap
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      {/* ===================================================
          BOTTOM GRID
      ==================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* SALES */}

        <section className="overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] p-5">
            <div>
              <h2 className="font-bold text-[#112250]">
                Penjualan Terbaru
              </h2>

              <p className="mt-1 text-xs text-[#8490A1]">
                Transaksi tiket terbaru
              </p>
            </div>

            <Link
              href="/organizer/penjualan/pesanan"
              className="text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[#EEF1F5] bg-[#FAFBFC] text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]">
                    Pembeli
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]">
                    Event
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]">
                    Tiket
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]">
                    Total
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8490A1]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                <SalesRow
                  name="Andi Pratama"
                  initials="AP"
                  event="Soundwave Festival 2026"
                  ticket="VIP"
                  amount="Rp 750.000"
                  time="5 menit lalu"
                />

                <SalesRow
                  name="Nadia Putri"
                  initials="NP"
                  event="Jakarta Jazz Night"
                  ticket="Regular"
                  amount="Rp 350.000"
                  time="18 menit lalu"
                />

                <SalesRow
                  name="Rizky Maulana"
                  initials="RM"
                  event="Nusantara Music Fest"
                  ticket="VIP"
                  amount="Rp 600.000"
                  time="32 menit lalu"
                />

                <SalesRow
                  name="Salsa Amelia"
                  initials="SA"
                  event="Indie Weekend"
                  ticket="Regular"
                  amount="Rp 250.000"
                  time="1 jam lalu"
                />

                <SalesRow
                  name="Dimas Saputra"
                  initials="DS"
                  event="Comedy Night Jakarta"
                  ticket="Premium"
                  amount="Rp 425.000"
                  time="2 jam lalu"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* ACTIVE EVENT */}

        <section className="rounded-2xl border border-[#DDE4ED] bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] p-5">
            <div>
              <h2 className="font-bold text-[#112250]">
                Event Aktif
              </h2>

              <p className="mt-1 text-xs text-[#8490A1]">
                Event yang sedang berlangsung
              </p>
            </div>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8490A1] hover:bg-[#F6F8FB]"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <ActiveEvent
              title="Soundwave Festival 2026"
              location="Jakarta International Expo"
              date="20 Sep 2026"
              sold="1.284"
              quota="2.000"
              percentage={64}
            />

            <ActiveEvent
              title="Nusantara Music Fest"
              location="GBK Senayan"
              date="04 Okt 2026"
              sold="842"
              quota="1.500"
              percentage={56}
            />

            <ActiveEvent
              title="Jakarta Jazz Night"
              location="JIExpo Kemayoran"
              date="18 Okt 2026"
              sold="568"
              quota="800"
              percentage={71}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, description, icon: Icon, trend, trendText }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#DDE4ED] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#112250]/5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#EEF4FF] opacity-70 transition duration-300 group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250] text-white shadow-lg shadow-[#112250]/15">
            <Icon size={20} />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#ECFDF3] px-2 py-1 text-[11px] font-bold text-[#16803C]">
            <TrendingUp size={12} />
            {trend}
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-[#8490A1]">{title}</p>

        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#112250]">
          {value}
        </h3>

        <p className="mt-1 text-xs text-[#8490A1]">
          {description} • {trendText}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryItem({ label, value, percentage }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-[#526B92]">{label}</span>
        <span className="text-sm font-bold text-[#112250]">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
        <div
          className="h-full rounded-full bg-[#2563EB]"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SALES ROW
========================================================= */

function SalesRow({ name, initials, event, ticket, amount, time }) {
  return (
    <tr className="border-b border-[#F0F2F5] transition hover:bg-[#FAFBFD] last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#112250] text-xs font-bold text-white">
            {initials}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#112250]">{name}</p>
            <p className="text-[11px] text-[#8490A1]">{time}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="max-w-[180px] truncate text-sm font-medium text-[#526B92]">
          {event}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg bg-[#EEF4FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
          {ticket}
        </span>
      </td>

      <td className="px-5 py-4 text-sm font-bold text-[#112250]">
        {amount}
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ECFDF3] px-2.5 py-1 text-xs font-semibold text-[#16803C]">
          <CheckCircle2 size={13} />
          Berhasil
        </span>
      </td>
    </tr>
  );
}

/* =========================================================
   ACTIVE EVENT
========================================================= */

function ActiveEvent({ title, location, date, sold, quota, percentage }) {
  return (
    <div className="rounded-xl border border-[#EEF1F5] p-4 transition hover:border-[#D5DEEC] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#112250]">
            {title}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#8490A1]">
              <MapPin size={13} />
              <span className="truncate">{location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#8490A1]">
              <Clock3 size={13} />
              {date}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#EEF4FF] px-2.5 py-1 text-xs font-bold text-[#2563EB]">
          {percentage}%
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[#8490A1]">Tiket terjual</span>
          <span className="font-semibold text-[#112250]">
            {sold} / {quota}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}