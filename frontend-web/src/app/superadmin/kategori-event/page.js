"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Tags,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

const initialCategories = [
  {
    id: 1,
    name: "Konser",
    slug: "konser",
    description: "Kategori untuk event musik dan konser",
    totalEvents: 24,
    status: "Aktif",
    createdAt: "10 Juni 2026",
  },
  {
    id: 2,
    name: "Festival",
    slug: "festival",
    description: "Kategori festival musik dan hiburan",
    totalEvents: 18,
    status: "Aktif",
    createdAt: "08 Juni 2026",
  },
  {
    id: 3,
    name: "Fan Meeting",
    slug: "fan-meeting",
    description: "Kategori acara pertemuan dengan artis",
    totalEvents: 12,
    status: "Aktif",
    createdAt: "05 Juni 2026",
  },
  {
    id: 4,
    name: "Sports",
    slug: "sports",
    description: "Kategori event olahraga",
    totalEvents: 9,
    status: "Aktif",
    createdAt: "02 Juni 2026",
  },
  {
    id: 5,
    name: "Theater",
    slug: "theater",
    description: "Kategori pertunjukan teater",
    totalEvents: 7,
    status: "Aktif",
    createdAt: "28 Mei 2026",
  },
  {
    id: 6,
    name: "Comedy",
    slug: "comedy",
    description: "Kategori pertunjukan komedi",
    totalEvents: 5,
    status: "Tidak Aktif",
    createdAt: "25 Mei 2026",
  },
  {
    id: 7,
    name: "Exhibition",
    slug: "exhibition",
    description: "Kategori pameran dan expo",
    totalEvents: 4,
    status: "Aktif",
    createdAt: "21 Mei 2026",
  },
  {
    id: 8,
    name: "Workshop",
    slug: "workshop",
    description: "Kategori workshop dan seminar",
    totalEvents: 3,
    status: "Aktif",
    createdAt: "18 Mei 2026",
  },
];

export default function EventCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Semua" ||
        category.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / itemsPerPage)
  );

  const currentItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (item) => item.status === "Aktif"
  ).length;

  const inactiveCategories = categories.filter(
    (item) => item.status === "Tidak Aktif"
  ).length;

  const totalEvents = categories.reduce(
    (total, item) => total + item.totalEvents,
    0
  );

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus kategori "${name}"?`
    );

    if (!confirmed) return;

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatus = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen w-full space-y-6 ">

      {/* =====================================================
          HEADER PAGE
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#697F93]">
            <span>Master Data</span>
            <span>/</span>
            <span className="text-[#3B507D]">
              Kategori Event
            </span>
          </div>

          <h1 className="mt-2 text-[25px] font-bold tracking-[-0.03em] text-[#112250]">
            Kategori Event
          </h1>

          <p className="mt-1 text-[13px] text-[#697F93]">
            Kelola kategori event yang tersedia di TicketVerse.
          </p>
        </div>

        <Link
          href="/superadmin/kategori-event/tambah"
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#112250]
            px-5
            text-[12px]
            font-semibold
            text-white
            shadow-[0_8px_20px_rgba(17,34,80,0.12)]
            transition
            hover:bg-[#1A315F]
          "
        >
          <Plus size={17} strokeWidth={2} />
          Tambah Kategori
        </Link>

      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Tags size={19} />}
          title="Total Kategori"
          value={totalCategories}
          description="Semua kategori"
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          title="Kategori Aktif"
          value={activeCategories}
          description="Sedang digunakan"
        />

        <StatCard
          icon={<XCircle size={19} />}
          title="Tidak Aktif"
          value={inactiveCategories}
          description="Tidak digunakan"
        />

        <StatCard
          icon={<CalendarDays size={19} />}
          title="Total Event"
          value={totalEvents}
          description="Event berdasarkan kategori"
        />

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#E2E6EC]
          bg-white
          shadow-[0_8px_30px_rgba(17,34,80,0.04)]
        "
      >

        {/* TOOLBAR */}

        <div className="border-b border-[#EEF1F5] p-5">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-[380px]">

              <Search
                size={17}
                strokeWidth={1.8}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#8B98A8]
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari kategori event..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-[#DDE3EA]
                  bg-[#FAFBFC]
                  pl-10
                  pr-4
                  text-[12px]
                  text-[#112250]
                  outline-none
                  transition
                  placeholder:text-[#9AA6B2]
                  focus:border-[#3B507D]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#3B507D]/10
                "
              />

            </div>

            {/* FILTER */}

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#DDE3EA]
                  bg-[#FAFBFC]
                  px-3
                "
              >
                <Filter
                  size={15}
                  className="text-[#697F93]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => handleStatus(e.target.value)}
                  className="
                    cursor-pointer
                    bg-transparent
                    text-[12px]
                    font-medium
                    text-[#112250]
                    outline-none
                  "
                >
                  <option value="Semua">
                    Semua Status
                  </option>

                  <option value="Aktif">
                    Aktif
                  </option>

                  <option value="Tidak Aktif">
                    Tidak Aktif
                  </option>
                </select>
              </div>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-[#EEF1F5] bg-[#FAFBFC]">

                <th className="w-[70px] px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  No
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Kategori
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Slug
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Deskripsi
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Total Event
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Dibuat
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8796]">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {currentItems.length > 0 ? (
                currentItems.map((category, index) => {

                  const number =
                    (currentPage - 1) * itemsPerPage +
                    index +
                    1;

                  return (
                    <tr
                      key={category.id}
                      className="
                        border-b
                        border-[#F0F2F5]
                        transition
                        last:border-0
                        hover:bg-[#FAFBFD]
                      "
                    >

                      {/* NO */}

                      <td className="px-5 py-4 text-center text-[11px] font-medium text-[#7B8796]">
                        {String(number).padStart(2, "0")}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              flex-shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#EEF3F9]
                              text-[#3B507D]
                            "
                          >
                            <Tags
                              size={17}
                              strokeWidth={1.8}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-[12px] font-semibold text-[#112250]">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#9AA6B2]">
                              ID #{category.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* SLUG */}

                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-[#F3F5F8] px-2.5 py-1.5 font-mono text-[10px] text-[#697F93]">
                          {category.slug}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-[260px] px-5 py-4">

                        <p className="truncate text-[11px] text-[#697F93]">
                          {category.description}
                        </p>

                      </td>

                      {/* EVENTS */}

                      <td className="px-5 py-4 text-center">

                        <div className="inline-flex items-center gap-1.5">

                          <CalendarDays
                            size={14}
                            className="text-[#3B507D]"
                          />

                          <span className="text-[12px] font-semibold text-[#112250]">
                            {category.totalEvents}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4 text-center">

                        {category.status === "Aktif" ? (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#EEF6F2]
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-[#39735A]
                            "
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#4C9A78]" />
                            Aktif
                          </span>
                        ) : (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#F3F4F6]
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-[#6B7280]
                            "
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                            Tidak Aktif
                          </span>
                        )}

                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-4 text-center">

                        <span className="text-[10px] text-[#697F93]">
                          {category.createdAt}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-1.5">

                          <Link
                            href={`/superadmin/kategori-event/${category.id}`}
                            title="Detail"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              text-[#697F93]
                              transition
                              hover:bg-[#EEF3F9]
                              hover:text-[#3B507D]
                            "
                          >
                            <Eye
                              size={15}
                              strokeWidth={1.8}
                            />
                          </Link>

                          <Link
                            href={`/superadmin/kategori-event/${category.id}/edit`}
                            title="Edit"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              text-[#697F93]
                              transition
                              hover:bg-[#EEF3F9]
                              hover:text-[#3B507D]
                            "
                          >
                            <Pencil
                              size={15}
                              strokeWidth={1.8}
                            />
                          </Link>

                          <button
                            type="button"
                            title="Hapus"
                            onClick={() =>
                              handleDelete(
                                category.id,
                                category.name
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              text-[#9A7070]
                              transition
                              hover:bg-[#FEF3F3]
                              hover:text-[#B45353]
                            "
                          >
                            <Trash2
                              size={15}
                              strokeWidth={1.8}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                        <Tags size={20} />
                      </div>

                      <p className="mt-4 text-[13px] font-semibold text-[#112250]">
                        Kategori tidak ditemukan
                      </p>

                      <p className="mt-1 text-[11px] text-[#697F93]">
                        Coba ubah kata pencarian atau filter.
                      </p>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-[#EEF1F5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-[#7B8796]">

            Menampilkan{" "}
            <span className="font-semibold text-[#112250]">
              {currentItems.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-[#112250]">
              {filteredCategories.length}
            </span>{" "}
            kategori

          </p>

          <div className="flex items-center gap-1.5">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-[#E2E6EC]
                text-[#697F93]
                transition
                hover:bg-[#F5F7FA]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`
                  flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-lg
                  px-2
                  text-[10px]
                  font-semibold
                  transition

                  ${
                    currentPage === page
                      ? "bg-[#112250] text-white"
                      : "text-[#697F93] hover:bg-[#F5F7FA]"
                  }
                `}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-[#E2E6EC]
                text-[#697F93]
                transition
                hover:bg-[#F5F7FA]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronRight size={15} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   STAT CARD
========================================================== */

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E2E6EC]
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(17,34,80,0.035)]
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A96A5]">
            {title}
          </p>

          <p className="mt-2 text-[25px] font-bold tracking-[-0.03em] text-[#112250]">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-[#697F93]">
            {description}
          </p>

        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#EEF3F9]
            text-[#3B507D]
          "
        >
          {icon}
        </div>

      </div>

    </div>
  );
}