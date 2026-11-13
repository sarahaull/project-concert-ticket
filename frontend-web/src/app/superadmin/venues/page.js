"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Layers,
  X,
  AlertCircle,
  CheckCircle2,
  Camera,
  ChevronRight as ChevronRightSolid,
  ShieldCheck,
  Funnel,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? `${API_URL}/venues`
  : `${API_URL}/api/venues`;

const formatNumber = (number) =>
  new Intl.NumberFormat("id-ID").format(Number(number || 0));

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

const getHeaders = (includeJson = false) => {
  const token = getToken();
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeVenue = (venue) => ({
  id: venue.id,
  name: venue.venue_name || "",
  city: venue.city || "",
  address: venue.address || "",
  capacity: Number(venue.capacity || 0),
  image: venue.image || "",
  createdAt: venue.created_at || null,
});

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || fallback;

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const itemsPerPage = 5;

  const fetchVenues = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Gagal mengambil data venue."));
      }

      const venueData = Array.isArray(data)
        ? data
        : data.venues || data.data || [];

      if (!Array.isArray(venueData)) {
        throw new Error("Format response data venue tidak valid.");
      }

      setVenues(venueData.map(normalizeVenue));
    } catch (err) {
      console.error("GET VENUES ERROR:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data venue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Gagal menghapus venue."));
      }

      setVenues((previous) =>
        previous.filter((venue) => String(venue.id) !== String(id))
      );

      setDeleteId(null);
      setSuccess(data.message || "Venue berhasil dihapus.");

      setPage((currentPage) => {
        const remaining = venues.length - 1;
        const totalPages = Math.max(1, Math.ceil(remaining / itemsPerPage));
        return Math.min(currentPage, totalPages);
      });
    } catch (err) {
      console.error("DELETE VENUE ERROR:", err);
      setError(err.message || "Gagal menghapus venue.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredVenues = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return venues;
    return venues.filter((venue) => {
      return (
        venue.name.toLowerCase().includes(keyword) ||
        venue.city.toLowerCase().includes(keyword) ||
        venue.address.toLowerCase().includes(keyword)
      );
    });
  }, [venues, search]);

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

  const withCity = venues.filter((venue) => venue.city).length;
  const withImage = venues.filter((venue) => venue.image).length;

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeFilterCount = search ? 1 : 0;

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-[0_8px_32px_rgba(11,18,32,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            <span>Master Data</span>
            <ChevronRightSolid className="h-3 w-3 text-white/30" />
            <span className="text-white/90">Venue</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
                <Building2 className="h-3 w-3 text-sky-300" />
                Venue Management
              </div>
              <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
                Venue
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Kelola lokasi yang digunakan untuk penyelenggaraan event.
                Pastikan data kapasitas dan alamat selalu akurat untuk
                pengalaman customer yang lebih baik.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchVenues(true)}
                disabled={refreshing || loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/superadmin/venues/tambah"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0B1220] shadow-lg shadow-black/10 transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Tambah Venue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="text-[13px] font-semibold text-red-800">
                Gagal memuat data venue
              </p>
              <p className="mt-0.5 break-words text-[12.5px] text-red-600">
                {error}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchVenues(true)}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {success && !loading && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-[12.5px] font-medium text-emerald-800">
              {success}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Venue"
          value={formatNumber(venues.length)}
          hint="Seluruh venue terdaftar"
          icon={Building2}
          accent="slate"
        />
        <StatCard
          label="Total Kapasitas"
          value={formatNumber(totalCapacity)}
          hint="Akumulasi seluruh venue"
          icon={Users}
          accent="sky"
        />
        <StatCard
          label="Venue dengan Kota"
          value={formatNumber(withCity)}
          hint="Data lokasi lengkap"
          icon={MapPin}
          accent="emerald"
        />
        <StatCard
          label="Venue dengan Gambar"
          value={formatNumber(withImage)}
          hint="Visual siap tayang"
          icon={ImageIcon}
          accent="amber"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B1220]/[0.05] text-[#0B1220]">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                Daftar Venue
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {loading
                  ? "Memuat data venue..."
                  : `Menampilkan ${formatNumber(
                      filteredVenues.length
                    )} dari ${formatNumber(venues.length)} venue`}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="relative w-full sm:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari nama venue, kota, alamat..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-xl bg-[#0B1220]/10" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220]/[0.06]">
                <RefreshCw className="h-5 w-5 animate-spin text-[#0B1220]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-semibold text-slate-800">
                Memuat data venue...
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                Mengambil koleksi venue dari server
              </p>
            </div>
          </div>
        )}

        {!loading && paginatedVenues.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0B1220]/[0.04] text-[#0B1220]">
              {venues.length === 0 ? (
                <Sparkles className="h-6 w-6" />
              ) : (
                <Search className="h-6 w-6" />
              )}
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              {venues.length === 0
                ? "Belum ada venue"
                : "Venue tidak ditemukan"}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              {venues.length === 0
                ? "Tambahkan venue pertama Anda untuk mulai mengelola lokasi event yang tersedia di platform."
                : "Coba ubah kata kunci pencarian yang digunakan."}
            </p>
            {venues.length === 0 ? (
              <Link
                href="/superadmin/venues/tambah"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Venue Pertama
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1B2942]"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}

        {!loading && paginatedVenues.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
                <tr className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3.5">Venue</th>
                  <th className="px-5 py-3.5">Lokasi</th>
                  <th className="px-5 py-3.5">Kapasitas</th>
                  <th className="px-5 py-3.5">Tanggal Dibuat</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVenues.map((venue) => (
                  <tr
                    key={venue.id}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[#0B1220]/[0.04] text-[#0B1220]">
                          {venue.image ? (
                            <img
                              src={venue.image}
                              alt={venue.name}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 className="h-4 w-4" strokeWidth={1.7} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate text-[13px] font-semibold text-[#0B1220]">
                            {venue.name || "-"}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-slate-400">
                            ID: {venue.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-[#0B1220]">
                            {venue.city || "Kota belum diisi"}
                          </p>
                          <p className="mt-0.5 max-w-[220px] truncate text-[10.5px] text-slate-400">
                            {venue.address || "Alamat belum diisi"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-[12px] font-semibold text-[#0B1220]">
                        {formatNumber(venue.capacity)}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400">
                        orang
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-[12px] font-medium text-slate-600">
                        {formatDate(venue.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/superadmin/venues/${venue.id}`}
                          title="Lihat detail"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>

                        <Link
                          href={`/superadmin/venues/${venue.id}/edit`}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>

                        {deleteId === venue.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(venue.id)}
                              disabled={deleting}
                              className="inline-flex h-8 items-center justify-center rounded-md bg-rose-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                            >
                              {deleting ? "Menghapus..." : "Hapus"}
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              disabled={deleting}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(venue.id)}
                            title="Hapus"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredVenues.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/50 px-6 py-4 sm:flex-row">
            <span className="text-[12px] text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-[#0B1220]">
                {filteredVenues.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-[#0B1220]">
                {Math.min(currentPage * itemsPerPage, filteredVenues.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-[#0B1220]">
                {filteredVenues.length}
              </span>{" "}
              venue
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[11.5px] font-semibold transition ${
                      number === currentPage
                        ? "bg-[#0B1220] text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] hover:text-[#0B1220]"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-[#0B1220]/30 hover:bg-[#0B1220]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, accent = "slate" }) {
  const accents = {
    slate: {
      iconWrap: "bg-[#0B1220]/[0.06] text-[#0B1220]",
      bar: "from-[#0B1220] to-slate-600",
      glow: "bg-slate-300/40",
    },
    sky: {
      iconWrap: "bg-sky-50 text-sky-600",
      bar: "from-sky-400 to-blue-500",
      glow: "bg-sky-300/40",
    },
    amber: {
      iconWrap: "bg-amber-50 text-amber-600",
      bar: "from-amber-400 to-orange-500",
      glow: "bg-amber-300/40",
    },
    emerald: {
      iconWrap: "bg-emerald-50 text-emerald-600",
      bar: "from-emerald-400 to-teal-500",
      glow: "bg-emerald-300/40",
    },
  };
  const a = accents[accent] || accents.slate;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${a.glow} opacity-0 blur-2xl transition duration-500 group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 break-words text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#0B1220]">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-[12px] font-medium text-slate-500">
              {hint}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${a.iconWrap} transition group-hover:scale-110`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] w-full bg-gradient-to-r ${a.bar} opacity-0 transition group-hover:opacity-100`}
      />
    </div>
  );
}