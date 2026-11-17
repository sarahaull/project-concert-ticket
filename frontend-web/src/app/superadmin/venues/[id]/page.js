"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Building2,
  MapPin,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Tag,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  Camera,
  Globe,
  Hash,
  Info,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? `${API_URL}/venues`
  : `${API_URL}/api/venues`;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

const getHeaders = () => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatNumber = (number) =>
  new Intl.NumberFormat("id-ID").format(Number(number || 0));

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const normalizeVenue = (data) => ({
  id: data.id,
  name: data.venue_name || data.name || "",
  city: data.city || "",
  address: data.address || "",
  capacity: Number(data.capacity || 0),
  image: data.image || data.image_url || "",
  createdAt: data.created_at || data.createdAt || null,
  type: data.type || data.venue_type || "",
  status: data.status || "",
  description: data.description || "",
  facilities: Array.isArray(data.facilities) ? data.facilities : [],
});

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params?.id;

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const fetchVenue = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(venueId)}`,
        { method: "GET", headers: getHeaders(), cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Gagal mengambil detail venue."
        );
      }
      const venueData = data.venue || data.data;
      if (!venueData) throw new Error("Data venue tidak ditemukan.");
      setVenue(normalizeVenue(venueData));
      setImageError(false);
    } catch (err) {
      console.error("GET VENUE DETAIL ERROR:", err);
      setError(err.message || "Terjadi kesalahan.");
      setVenue(null);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  const statusAktif =
    venue?.status?.toLowerCase() === "aktif" ||
    venue?.status?.toLowerCase() === "active";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F8]">
          <RefreshCw className="h-6 w-6 animate-spin text-[#112250]" />
        </div>
        <p className="text-sm font-medium text-[#8795A7]">
          Memuat detail venue...
        </p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-[#112250]">
          Venue tidak ditemukan
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#8795A7]">
          {error || "Data venue tidak tersedia."}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={fetchVenue}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-white px-5 text-sm font-semibold text-[#112250] transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
          <Link
            href="/superadmin/venues"
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white transition hover:bg-[#1B3560] active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-1 pb-10 sm:space-y-6 sm:px-2 lg:px-0">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push("/superadmin/venues")}
            aria-label="Kembali"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-slate-50 active:scale-95 sm:mt-1"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8795A7]">
              Master Data / Venue / Detail
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold text-[#112250] sm:text-2xl">
              Detail Venue
            </h1>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={fetchVenue}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-white px-4 text-xs font-semibold text-[#53657D] transition hover:bg-slate-50 active:scale-[0.98] sm:flex-none"
          >
            <RefreshCw size={14} />
            <span className="hidden xs:inline sm:inline">Refresh</span>
            <span className="xs:hidden sm:hidden">Muat Ulang</span>
          </button>
          <Link
            href={`/superadmin/venues/${venue.id}/edit`}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 text-xs font-semibold text-white transition hover:bg-[#1B3560] active:scale-[0.98] sm:flex-none"
          >
            <Pencil size={14} />
            Edit Venue
          </Link>
        </div>
      </div>

      {/* HERO IMAGE */}
      <section className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-sm">
        <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-[#0D1D35] via-[#142B4B] to-[#1D3A61] sm:h-[340px] lg:h-[380px]">
          {venue.image && !imageError ? (
            <img
              src={venue.image}
              alt={venue.name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <ImageIcon size={30} />
              </div>
              <p className="text-xs font-medium">
                Gambar venue belum tersedia
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#071326]/95 via-[#071326]/25 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur sm:px-3 sm:py-1.5">
                <Building2 size={11} />
                Venue
              </span>
              {venue.type && (
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur sm:px-3 sm:py-1.5">
                  {venue.type}
                </span>
              )}
              {venue.status && (
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur sm:px-3 sm:py-1.5">
                  {venue.status}
                </span>
              )}
            </div>

            <h2 className="mt-2 line-clamp-2 text-xl font-bold tracking-tight text-white sm:mt-3 sm:text-2xl lg:text-3xl">
              {venue.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-white/75 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {venue.city || "Kota belum diisi"}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash size={12} />
                ID: {venue.id}
              </span>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 divide-y divide-[#EDF0F4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <QuickStat
            icon={Users}
            label="Kapasitas Venue"
            value={`${formatNumber(venue.capacity)} orang`}
          />
          <QuickStat icon={MapPin} label="Lokasi" value={venue.city || "-"} />
          <QuickStat
            icon={CalendarDays}
            label="Tanggal Dibuat"
            value={formatDate(venue.createdAt)}
          />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {/* LEFT CONTENT */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-2">
          {/* INFORMASI UTAMA */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-6">
            <SectionHeading
              icon={Building2}
              title="Informasi Venue"
              description="Informasi utama lokasi penyelenggaraan event."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 sm:grid-cols-2 sm:gap-6">
              <InfoItem icon={Building2} label="Nama Venue" value={venue.name} />
              <InfoItem icon={Hash} label="ID Venue" value={venue.id} />
              <InfoItem icon={MapPin} label="Kota" value={venue.city} />
              <InfoItem
                icon={Users}
                label="Kapasitas"
                value={`${formatNumber(venue.capacity)} orang`}
              />
              <div className="sm:col-span-2">
                <InfoItem
                  icon={MapPin}
                  label="Alamat Lengkap"
                  value={venue.address}
                />
              </div>
            </div>
          </section>

          {/* GAMBAR VENUE */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-6">
            <SectionHeading
              icon={Camera}
              title="Foto Venue"
              description="Dokumentasi visual lokasi venue."
            />
            <div className="mt-4 overflow-hidden rounded-xl border border-[#E5EAF0] bg-[#F6F8FA] sm:mt-5">
              {venue.image && !imageError ? (
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="max-h-[380px] min-h-[180px] w-full object-contain sm:max-h-[450px] sm:min-h-[220px]"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-[#9AA6B2] sm:min-h-[240px]">
                  <ImageIcon size={38} />
                  <p className="px-4 text-center text-xs">
                    Belum ada foto yang dapat ditampilkan.
                  </p>
                </div>
              )}
            </div>
            {venue.image && !imageError && (
              <a
                href={venue.image}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#315A91] hover:underline"
              >
                <Globe size={13} />
                Buka gambar asli
              </a>
            )}
          </section>

          {/* DESKRIPSI */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-6">
            <SectionHeading
              icon={Info}
              title="Deskripsi Venue"
              description="Keterangan tambahan mengenai venue."
            />
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#697F93] sm:mt-5">
              {venue.description || "Belum ada deskripsi untuk venue ini."}
            </p>
          </section>

          {/* FASILITAS */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-6">
            <SectionHeading
              icon={Tag}
              title="Fasilitas Venue"
              description="Daftar fasilitas yang tersedia."
            />
            <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
              {venue.facilities.length > 0 ? (
                venue.facilities.map((facility, index) => (
                  <span
                    key={`${facility}-${index}`}
                    className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-2.5 py-1.5 text-[11px] font-medium text-[#53657D] sm:px-3 sm:py-2 sm:text-xs"
                  >
                    {facility}
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#9AA6B2]">
                  Informasi fasilitas belum tersedia.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-4 sm:space-y-5">
          {/* STATUS */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <SectionHeading icon={CheckCircle2} title="Status Venue" />
            <div className="mt-4 sm:mt-5">
              {venue.status ? (
                <div
                  className={`flex items-center gap-3 rounded-xl p-3.5 sm:p-4 ${
                    statusAktif ? "bg-emerald-50" : "bg-slate-50"
                  }`}
                >
                  {statusAktif ? (
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle size={20} className="shrink-0 text-slate-500" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`truncate text-xs font-semibold ${
                        statusAktif ? "text-emerald-700" : "text-slate-700"
                      }`}
                    >
                      {venue.status}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Status berdasarkan data server.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-3.5 sm:p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Status belum tersedia
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Backend belum mengirimkan informasi status venue.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* KAPASITAS */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <SectionHeading icon={Users} title="Kapasitas Venue" />
            <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4 sm:mt-5 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8795A7]">
                Total kapasitas
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#112250] sm:text-3xl">
                {formatNumber(venue.capacity)}
              </p>
              <p className="mt-1 text-xs text-[#8795A7]">Orang</p>
            </div>
          </section>

          {/* INFORMASI SISTEM */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <SectionHeading icon={CalendarDays} title="Informasi Sistem" />
            <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
              <SystemInfo
                icon={CalendarDays}
                label="Tanggal Dibuat"
                value={formatDate(venue.createdAt)}
              />
              <SystemInfo icon={Hash} label="ID Venue" value={venue.id} />
              <SystemInfo
                icon={Building2}
                label="Nama Venue"
                value={venue.name}
              />
            </div>
          </section>

          {/* LOKASI */}
          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-4 shadow-sm sm:p-5">
            <SectionHeading icon={MapPin} title="Lokasi Venue" />
            <div className="mt-4 rounded-xl bg-[#F5F7FA] p-3.5 sm:p-4">
              <p className="text-xs font-semibold text-[#334155]">
                {venue.city || "Kota belum diisi"}
              </p>
              <p className="mt-2 text-xs leading-6 text-[#697F93]">
                {venue.address || "Alamat belum tersedia."}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${venue.address} ${venue.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#315A91] hover:underline sm:mt-4"
              >
                <MapPin size={13} />
                Lihat di Google Maps
              </a>
            </div>
          </section>
        </aside>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-2 rounded-xl border border-[#DDE3EB] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <p className="text-[11px] text-[#8795A7] sm:text-xs">
          Menampilkan informasi venue berdasarkan data server.
        </p>
        <Link
          href="/superadmin/venues"
          className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#315A91] hover:underline sm:text-xs"
        >
          <ArrowLeft size={13} />
          Kembali ke Daftar Venue
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#53657D] sm:h-9 sm:w-9">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[#112250]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[10px] leading-4 text-[#8795A7] sm:mt-1 sm:text-[11px]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F4F8] text-[#53657D] sm:h-10 sm:w-10">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#8795A7]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[#112250] sm:mt-1">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#697F93] sm:h-9 sm:w-9">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#9AA6B2]">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#334155] sm:leading-6">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function SystemInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <Icon size={15} className="mt-0.5 shrink-0 text-[#8795A7]" />
      <div className="min-w-0">
        <p className="text-[10px] text-[#9AA6B2]">{label}</p>
        <p className="mt-0.5 break-words text-xs font-medium text-[#53657D] sm:mt-1">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}