"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Ticket,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Layers3,
  TicketCheck,
  ArrowUpDown,
} from "lucide-react";

const ticketCategories = [
  {
    id: 1,
    name: "VIP",
    code: "VIP",
    description: "Tiket dengan akses dan fasilitas eksklusif.",
    totalEvents: 24,
    totalTickets: 4280,
    status: "Aktif",
    createdAt: "12 Agu 2026",
  },
  {
    id: 2,
    name: "Festival",
    code: "FEST",
    description: "Tiket untuk area festival dan standing.",
    totalEvents: 38,
    totalTickets: 12560,
    status: "Aktif",
    createdAt: "10 Agu 2026",
  },
  {
    id: 3,
    name: "Regular",
    code: "REG",
    description: "Tiket reguler untuk pengunjung umum.",
    totalEvents: 42,
    totalTickets: 18420,
    status: "Aktif",
    createdAt: "08 Agu 2026",
  },
  {
    id: 4,
    name: "Early Bird",
    code: "EB",
    description: "Tiket harga khusus untuk pembelian lebih awal.",
    totalEvents: 17,
    totalTickets: 3650,
    status: "Aktif",
    createdAt: "05 Agu 2026",
  },
  {
    id: 5,
    name: "Presale",
    code: "PRE",
    description: "Tiket penjualan tahap awal sebelum harga normal.",
    totalEvents: 21,
    totalTickets: 5840,
    status: "Aktif",
    createdAt: "02 Agu 2026",
  },
  {
    id: 6,
    name: "VVIP",
    code: "VVIP",
    description: "Tiket dengan fasilitas dan pengalaman paling eksklusif.",
    totalEvents: 8,
    totalTickets: 920,
    status: "Aktif",
    createdAt: "28 Jul 2026",
  },
  {
    id: 7,
    name: "Economy",
    code: "ECO",
    description: "Kategori tiket dengan harga paling terjangkau.",
    totalEvents: 15,
    totalTickets: 7320,
    status: "Nonaktif",
    createdAt: "24 Jul 2026",
  },
];

export default function TicketCategoriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    let result = ticketCategories.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [search, statusFilter, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = ticketCategories.filter(
    (item) => item.status === "Aktif"
  ).length;

  const inactiveCount = ticketCategories.filter(
    (item) => item.status === "Nonaktif"
  ).length;

  const totalTickets = ticketCategories.reduce(
    (total, item) => total + item.totalTickets,
    0
  );

  const formatNumber = (number) =>
    new Intl.NumberFormat("id-ID").format(number);

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#718096]">
            <span>Master Data</span>
            <span>/</span>
            <span className="font-medium text-[#3B507D]">
              Kategori Tiket
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#112250]">
            Kategori Tiket
          </h1>

          <p className="mt-1 text-sm text-[#718096]">
            Kelola kategori tiket yang tersedia di platform TicketVerse.
          </p>
        </div>

        <Link
          href="/superadmin/kategori-tiket/tambah"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,34,80,0.18)] transition hover:bg-[#1A326A]"
        >
          <Plus size={18} />
          Tambah Kategori
        </Link>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Layers3 size={20} />}
          label="Total Kategori"
          value={ticketCategories.length}
          description="Kategori terdaftar"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Kategori Aktif"
          value={activeCount}
          description="Sedang digunakan"
        />

        <StatCard
          icon={<XCircle size={20} />}
          label="Nonaktif"
          value={inactiveCount}
          description="Tidak tersedia"
        />

        <StatCard
          icon={<TicketCheck size={20} />}
          label="Total Tiket"
          value={formatNumber(totalTickets)}
          description="Terhubung ke kategori"
        />
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_4px_20px_rgba(17,34,80,0.05)]">
        {/* TOOLBAR */}
        <div className="border-b border-[#E8ECF2] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#112250]">
                Daftar Kategori
              </h2>
              <p className="mt-1 text-xs text-[#7B8798]">
                {filteredData.length} kategori ditemukan
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A8]"
                />

                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-10 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-[#9AA5B5] focus:border-[#5275A5] focus:bg-white sm:w-64"
                />
              </div>

              {/* STATUS */}
              <div className="relative">
                <SlidersHorizontal
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 appearance-none rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-9 pr-9 text-sm font-medium text-[#44546A] outline-none focus:border-[#5275A5]"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* SORT */}
              <button
                onClick={() => setSortAsc((prev) => !prev)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm font-medium text-[#44546A] transition hover:border-[#5275A5] hover:bg-[#F4F7FB]"
              >
                <ArrowUpDown size={16} />
                Nama
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#E8ECF2] bg-[#F8FAFC] text-left">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Kategori
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Kode
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Event
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Tiket
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="group border-b border-[#EEF1F5] transition hover:bg-[#F8FAFD]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                        <Ticket size={18} />
                      </div>

                      <div>
                        <p className="font-semibold text-[#112250]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#8A96A8]">
                          Dibuat {item.createdAt}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-[#F1F4F8] px-2.5 py-1 font-mono text-xs font-semibold text-[#4B5D78]">
                      {item.code}
                    </span>
                  </td>

                  <td className="max-w-[280px] px-6 py-4">
                    <p className="truncate text-sm text-[#68778B]">
                      {item.description}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-[#344563]">
                      {item.totalEvents}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-[#344563]">
                      {formatNumber(item.totalTickets)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {item.status === "Aktif" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F0] px-3 py-1.5 text-xs font-semibold text-[#25804B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39A866]" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F5] px-3 py-1.5 text-xs font-semibold text-[#7A8494]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9AA3AF]" />
                        Nonaktif
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/superadmin/kategori-tiket/${item.id}`}
                        title="Detail"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9] hover:text-[#3B507D]"
                      >
                        <Eye size={17} />
                      </Link>

                      <Link
                        href={`/superadmin/kategori-tiket/${item.id}/edit`}
                        title="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9] hover:text-[#3B507D]"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        title="Hapus"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A96A8] transition hover:bg-[#FFF1F1] hover:text-[#C04A4A]"
                      >
                        <Trash2 size={17} />
                      </button>

                      <button
                        title="Lainnya"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9]"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F8] text-[#7C899C]">
                      <Ticket size={24} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#112250]">
                      Kategori tidak ditemukan
                    </h3>

                    <p className="mt-1 text-sm text-[#8490A1]">
                      Coba gunakan kata kunci pencarian yang berbeda.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-[#E8ECF2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#7A8799]">
            Menampilkan{" "}
            <span className="font-semibold text-[#44546A]">
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-[#44546A]">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-[#44546A]">
              {filteredData.length}
            </span>{" "}
            kategori
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE2EA] text-[#64748B] transition hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    currentPage === page
                      ? "bg-[#112250] text-white shadow-sm"
                      : "text-[#64748B] hover:bg-[#F1F4F8]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE2EA] text-[#64748B] transition hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description }) {
  return (
    <div className="group rounded-2xl border border-[#E2E7EF] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(17,34,80,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
          {icon}
        </div>

        <TrendingUp
          size={16}
          className="text-[#8DA0B8]"
        />
      </div>

      <p className="mt-4 text-xs font-medium text-[#7B8798]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#112250]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#98A3B2]">
        {description}
      </p>
    </div>
  );
}