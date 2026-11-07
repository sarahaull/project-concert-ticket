"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

const STORAGE_KEY = "ticketverse_venues";

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const found = saved.find(
        (item) => item.id === params.id
      );

      setVenue(found || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[12px] text-[#8795A7]">
          Memuat data venue...
        </p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F8] text-[#8795A7]">
          <Building2 size={24} />
        </div>

        <h2 className="mt-4 text-[14px] font-semibold text-[#112250]">
          Venue tidak ditemukan
        </h2>

        <p className="mt-1 text-[10px] text-[#8795A7]">
          Data venue mungkin sudah dihapus.
        </p>

        <button
          onClick={() =>
            router.push("/superadmin/venues")
          }
          className="mt-5 flex h-9 items-center gap-2 rounded-xl bg-[#112250] px-4 text-[10px] font-semibold text-white"
        >
          <ArrowLeft size={14} />
          Kembali ke Venue
        </button>

      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              router.push("/superadmin/venues")
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-[#F5F7FA]"
          >
            <ArrowLeft size={17} />
          </button>

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8795A7]">
              Master Data / Venue / Detail
            </p>

            <h1 className="mt-1 text-[23px] font-semibold tracking-[-0.03em] text-[#112250]">
              {venue.name}
            </h1>

          </div>

        </div>

        <Link
          href={`/superadmin/venues/${venue.id}/edit`}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 text-[10px] font-semibold text-white transition hover:bg-[#1B3560]"
        >
          <Pencil size={14} />
          Edit Venue
        </Link>

      </div>

      {/* HERO */}

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1D35] via-[#142B4B] to-[#1D3A61] p-6 text-white shadow-[0_15px_40px_rgba(17,34,80,0.12)] sm:p-8">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#8AB4F8]/20 bg-[#8AB4F8]/10 text-[#8AB4F8]">
              <Building2 size={25} />
            </div>

            <div>

              <div className="mb-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-medium text-[#C9D8EC]">
                  {venue.type}
                </span>

                {venue.status === "Aktif" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8AB4F8]/10 px-2.5 py-1 text-[9px] font-semibold text-[#A9C7F7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8AB4F8]" />
                    Aktif
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] text-[#C9D8EC]">
                    Tidak Aktif
                  </span>
                )}

              </div>

              <h2 className="text-[21px] font-semibold">
                {venue.name}
              </h2>

              <p className="mt-1 text-[10px] text-[#AFC0D8]">
                ID Venue: {venue.id}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">

              <p className="text-[9px] uppercase tracking-wider text-[#AFC0D8]">
                Kapasitas
              </p>

              <p className="mt-1 text-[18px] font-semibold">
                {formatNumber(venue.capacity)}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* DETAIL */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        <div className="space-y-5 lg:col-span-2">

          {/* INFORMASI */}

          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Informasi Venue
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <InfoItem
                icon={Building2}
                label="Nama Venue"
                value={venue.name}
              />

              <InfoItem
                icon={Tag}
                label="Tipe Venue"
                value={venue.type}
              />

              <InfoItem
                icon={MapPin}
                label="Kota"
                value={venue.city}
              />

              <InfoItem
                icon={Users}
                label="Kapasitas"
                value={`${formatNumber(
                  venue.capacity
                )} orang`}
              />

              <div className="sm:col-span-2">

                <InfoItem
                  icon={MapPin}
                  label="Alamat"
                  value={venue.address}
                />

              </div>

            </div>

          </section>

          {/* DESKRIPSI */}

          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Deskripsi
            </h2>

            <p className="mt-4 text-[11px] leading-6 text-[#697F93]">
              {venue.description ||
                "Belum ada deskripsi untuk venue ini."}
            </p>

          </section>

        </div>

        {/* SIDEBAR DETAIL */}

        <div className="space-y-5">

          {/* STATUS */}

          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Status
            </h2>

            <div className="mt-4">

              {venue.status === "Aktif" ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#EEF7F2] p-4">

                  <CheckCircle2
                    size={19}
                    className="text-[#327354]"
                  />

                  <div>
                    <p className="text-[11px] font-semibold text-[#327354]">
                      Venue Aktif
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#6D927D]">
                      Dapat digunakan untuk event.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-[#F4F5F7] p-4">

                  <XCircle
                    size={19}
                    className="text-[#697586]"
                  />

                  <div>
                    <p className="text-[11px] font-semibold text-[#697586]">
                      Venue Tidak Aktif
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#8795A7]">
                      Tidak dapat digunakan sementara.
                    </p>
                  </div>

                </div>
              )}

            </div>

          </section>

          {/* FASILITAS */}

          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Fasilitas
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">

              {venue.facilities?.length > 0 ? (
                venue.facilities.map((facility) => (
                  <span
                    key={facility}
                    className="rounded-lg bg-[#F1F4F8] px-3 py-2 text-[9px] font-medium text-[#53657D]"
                  >
                    {facility}
                  </span>
                ))
              ) : (
                <p className="text-[10px] text-[#9AA6B2]">
                  Belum ada fasilitas.
                </p>
              )}

            </div>

          </section>

          {/* INFORMASI SISTEM */}

          <section className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Informasi Sistem
            </h2>

            <div className="mt-4 space-y-4">

              <div className="flex items-center gap-3">

                <CalendarDays
                  size={15}
                  className="text-[#697F93]"
                />

                <div>
                  <p className="text-[9px] text-[#9AA6B2]">
                    Dibuat
                  </p>

                  <p className="text-[10px] font-medium text-[#53657D]">
                    {venue.createdAt}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <Building2
                  size={15}
                  className="text-[#697F93]"
                />

                <div>
                  <p className="text-[9px] text-[#9AA6B2]">
                    ID Venue
                  </p>

                  <p className="text-[10px] font-medium text-[#53657D]">
                    {venue.id}
                  </p>
                </div>

              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F4F8] text-[#697F93]">
        <Icon size={15} />
      </div>

      <div className="min-w-0">

        <p className="text-[9px] uppercase tracking-wide text-[#9AA6B2]">
          {label}
        </p>

        <p className="mt-1 break-words text-[11px] font-medium text-[#334155]">
          {value}
        </p>

      </div>

    </div>
  );
}