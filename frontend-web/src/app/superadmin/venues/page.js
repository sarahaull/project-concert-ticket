"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";

const STORAGE_KEY = "ticketverse_venues";

const initialVenues = [
  {
    id: "VEN-001",
    name: "Gelora Bung Karno Stadium",
    type: "Stadium",
    address: "Jl. Pintu Satu Senayan",
    city: "Jakarta",
    capacity: 77000,
    status: "Aktif",
    description:
      "Stadion utama untuk konser berskala besar dan event nasional.",
    facilities: ["Parking Area", "Toilet", "VIP Room", "Food Court"],
    createdAt: "2026-08-10",
  },
  {
    id: "VEN-002",
    name: "ICE BSD City",
    type: "Convention Hall",
    address: "Jl. BSD Grand Boulevard",
    city: "Tangerang",
    capacity: 15000,
    status: "Aktif",
    description:
      "Convention hall untuk konser, exhibition, dan event indoor.",
    facilities: ["Parking Area", "AC", "Toilet", "Food Court"],
    createdAt: "2026-08-12",
  },
  {
    id: "VEN-003",
    name: "Jakarta International Stadium",
    type: "Stadium",
    address: "Jl. Papanggo",
    city: "Jakarta",
    capacity: 82000,
    status: "Aktif",
    description:
      "Venue stadion modern untuk event dan konser berskala besar.",
    facilities: ["Parking Area", "VIP Room", "Toilet", "Food Court"],
    createdAt: "2026-08-15",
  },
  {
    id: "VEN-004",
    name: "Istora Senayan",
    type: "Indoor Arena",
    address: "Kompleks Gelora Bung Karno",
    city: "Jakarta",
    capacity: 7200,
    status: "Tidak Aktif",
    description:
      "Arena indoor untuk konser dan event dengan kapasitas menengah.",
    facilities: ["Parking Area", "Toilet", "AC"],
    createdAt: "2026-08-20",
  },
  {
    id: "VEN-005",
    name: "Beach City International Stadium",
    type: "Indoor Arena",
    address: "Ancol, Pademangan",
    city: "Jakarta",
    capacity: 15000,
    status: "Aktif",
    description:
      "Venue indoor di kawasan Ancol untuk berbagai event hiburan.",
    facilities: ["Parking Area", "AC", "Toilet", "VIP Room"],
    createdAt: "2026-08-23",
  },
];

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setVenues(JSON.parse(saved));
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(initialVenues)
        );
        setVenues(initialVenues);
      }
    } catch (error) {
      console.error("Gagal mengambil data venue:", error);
      setVenues(initialVenues);
    }
  }, []);

  const saveVenues = (data) => {
    setVenues(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const venueTypes = useMemo(() => {
    return [
      "Semua",
      ...new Set(venues.map((venue) => venue.type)),
    ];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return venues.filter((venue) => {
      const matchesSearch =
        !keyword ||
        venue.name.toLowerCase().includes(keyword) ||
        venue.city.toLowerCase().includes(keyword) ||
        venue.address.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" ||
        venue.status === statusFilter;

      const matchesType =
        typeFilter === "Semua" ||
        venue.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [venues, search, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVenues.length / itemsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCapacity = venues.reduce(
    (sum, venue) => sum + Number(venue.capacity || 0),
    0
  );

  const activeVenues = venues.filter(
    (venue) => venue.status === "Aktif"
  ).length;

  const inactiveVenues = venues.filter(
    (venue) => venue.status === "Tidak Aktif"
  ).length;

  const handleDelete = (id) => {
    const updated = venues.filter((venue) => venue.id !== id);

    saveVenues(updated);
    setDeleteId(null);

    if (
      paginatedVenues.length === 1 &&
      currentPage > 1
    ) {
      setPage(currentPage - 1);
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  return (
    <div className="min-h-full w-full space-y-6">

      {/* =====================================================
          HEADER PAGE
      ===================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3B507D]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#697F93]">
              Master Data
            </span>
          </div>

          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-[#112250]">
            Venue
          </h1>

          <p className="mt-1 text-[12px] text-[#697F93]">
            Kelola lokasi yang digunakan untuk penyelenggaraan event.
          </p>
        </div>

        <Link
          href="/superadmin/venues/tambah"
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#112250]
            px-4
            text-[11px]
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-[#1B3560]
          "
        >
          <Plus size={16} />
          Tambah Venue
        </Link>

      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Venue"
          value={venues.length}
          icon={Building2}
        />

        <StatCard
          label="Venue Aktif"
          value={activeVenues}
          icon={CheckCircle2}
        />

        <StatCard
          label="Tidak Aktif"
          value={inactiveVenues}
          icon={XCircle}
        />

        <StatCard
          label="Total Kapasitas"
          value={formatNumber(totalCapacity)}
          suffix="orang"
          icon={Users}
        />

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.04)]">

        {/* SEARCH + FILTER */}

        <div className="flex flex-col gap-3 border-b border-[#E8ECF1] p-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-[360px]">

            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8795A7]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama venue, kota..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-[#DCE2EA]
                bg-[#FAFBFC]
                pl-10
                pr-4
                text-[11px]
                text-[#112250]
                outline-none
                transition
                placeholder:text-[#9AA6B2]
                focus:border-[#8BA7CF]
                focus:bg-white
              "
            />

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-3">

              <SlidersHorizontal
                size={14}
                className="text-[#697F93]"
              />

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="
                  bg-transparent
                  text-[11px]
                  font-medium
                  text-[#112250]
                  outline-none
                "
              >
                {venueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "Semua"
                      ? "Semua Tipe"
                      : type}
                  </option>
                ))}
              </select>

            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                rounded-xl
                border
                border-[#DCE2EA]
                bg-[#FAFBFC]
                px-3
                text-[11px]
                font-medium
                text-[#112250]
                outline-none
              "
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">
                Tidak Aktif
              </option>
            </select>

          </div>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-[#E8ECF1] bg-[#FAFBFC]">

                <th className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Venue
                </th>

                <th className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Lokasi
                </th>

                <th className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Tipe
                </th>

                <th className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Kapasitas
                </th>

                <th className="px-5 py-3.5 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Status
                </th>

                <th className="px-5 py-3.5 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8795A7]">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedVenues.length > 0 ? (
                paginatedVenues.map((venue) => (
                  <tr
                    key={venue.id}
                    className="border-b border-[#EEF1F5] last:border-b-0 hover:bg-[#FAFBFC]"
                  >

                    {/* VENUE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                          <Building2
                            size={18}
                            strokeWidth={1.7}
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-[12px] font-semibold text-[#112250]">
                            {venue.name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-[#9AA6B2]">
                            {venue.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* LOKASI */}

                    <td className="px-5 py-4">

                      <div className="flex items-start gap-2">

                        <MapPin
                          size={14}
                          className="mt-0.5 shrink-0 text-[#697F93]"
                        />

                        <div>

                          <p className="text-[11px] font-medium text-[#334155]">
                            {venue.city}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-[9px] text-[#9AA6B2]">
                            {venue.address}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* TIPE */}

                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-[#F1F4F8] px-2.5 py-1.5 text-[9px] font-semibold text-[#53657D]">
                        {venue.type}
                      </span>

                    </td>

                    {/* KAPASITAS */}

                    <td className="px-5 py-4">

                      <p className="text-[11px] font-semibold text-[#112250]">
                        {formatNumber(venue.capacity)}
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#9AA6B2]">
                        orang
                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      {venue.status === "Aktif" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF7F2] px-2.5 py-1.5 text-[9px] font-semibold text-[#327354]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#4A9A70]" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F5F7] px-2.5 py-1.5 text-[9px] font-semibold text-[#697586]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#98A2B3]" />
                          Tidak Aktif
                        </span>
                      )}

                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-1.5">

                        <Link
                          href={`/superadmin/venues/${venue.id}`}
                          title="Lihat detail"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#697F93] transition hover:bg-[#EEF3F9] hover:text-[#112250]"
                        >
                          <Eye size={15} />
                        </Link>

                        <Link
                          href={`/superadmin/venues/${venue.id}/edit`}
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#697F93] transition hover:bg-[#EEF3F9] hover:text-[#112250]"
                        >
                          <Pencil size={15} />
                        </Link>

                        {deleteId === venue.id ? (
                          <div className="flex items-center gap-1.5">

                            <button
                              onClick={() =>
                                handleDelete(venue.id)
                              }
                              className="rounded-lg bg-[#B45353] px-2.5 py-1.5 text-[9px] font-semibold text-white transition hover:bg-[#963F3F]"
                            >
                              Hapus
                            </button>

                            <button
                              onClick={() =>
                                setDeleteId(null)
                              }
                              className="rounded-lg border border-[#DCE2EA] px-2.5 py-1.5 text-[9px] font-semibold text-[#697F93] transition hover:bg-[#F5F7FA]"
                            >
                              Batal
                            </button>

                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setDeleteId(venue.id)
                            }
                            title="Hapus"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B45353] transition hover:bg-[#FEF2F2]"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F8] text-[#8795A7]">
                      <Building2 size={22} />
                    </div>

                    <p className="mt-3 text-[12px] font-semibold text-[#112250]">
                      Venue tidak ditemukan
                    </p>

                    <p className="mt-1 text-[10px] text-[#9AA6B2]">
                      Coba ubah kata pencarian atau filter.
                    </p>

                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-[#E8ECF1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-[#8795A7]">
            Menampilkan{" "}
            <span className="font-semibold text-[#53657D]">
              {filteredVenues.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-[#53657D]">
              {Math.min(
                currentPage * itemsPerPage,
                filteredVenues.length
              )}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-[#53657D]">
              {filteredVenues.length}
            </span>{" "}
            venue
          </p>

          <div className="flex items-center gap-1.5">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setPage((prev) => Math.max(1, prev - 1))
              }
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-[#DCE2EA]
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
            ).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
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
                    number === currentPage
                      ? "bg-[#112250] text-white"
                      : "text-[#697F93] hover:bg-[#F1F4F8]"
                  }
                `}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((prev) =>
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
                border-[#DCE2EA]
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

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-[#DDE3EB] bg-white p-5 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8795A7]">
            {label}
          </p>

          <div className="mt-2 flex items-baseline gap-1.5">

            <p className="text-[23px] font-semibold tracking-[-0.03em] text-[#112250]">
              {value}
            </p>

            {suffix && (
              <span className="text-[9px] text-[#9AA6B2]">
                {suffix}
              </span>
            )}

          </div>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE5F0] bg-[#F1F5FA] text-[#3B507D]">
          <Icon size={18} strokeWidth={1.7} />
        </div>

      </div>

    </div>
  );
}