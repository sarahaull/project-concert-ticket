
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Armchair,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Loader2,
  MapPin,
  LayoutGrid,
  Ticket,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Rows3,
  X,
} from "lucide-react";

/* =========================================================
   API CONFIG
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_ROOT = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");
const API_BASE = `${API_ROOT}/api`;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10";

const initialSection = {
  ticket_category_id: "",
  section_code: "",
  section_name: "",
  seat_mode: "NUMBERED",
  rows: 5,
  seats_per_row: 10,
};

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.success === false) {
    throw new Error(
      data?.message ||
        `Request gagal (${response.status}).`
    );
  }

  return data;
}

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  return [];
};

const getSeatStatus = (status) => {
  const value = String(status || "Available").toLowerCase();

  if (value === "available") return "available";
  if (value === "reserved") return "reserved";
  if (value === "booked" || value === "sold") return "booked";

  return "unavailable";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DenahKursiPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const [form, setForm] = useState(initialSection);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const notify = (type, message) => {
    setNotification({ type, message });
  };

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      const [seatData, categoryData] = await Promise.all([
        apiRequest(`/seats/events/${eventId}`),
        apiRequest(`/ticket-categories/event/${eventId}`),
      ]);

      setEvent(seatData.event || null);
      setSections(normalizeArray(seatData.sections));

      setCategories(
        normalizeArray(categoryData.ticket_categories)
      );
    } catch (error) {
      console.error("LOAD SEAT MAP ERROR:", error);
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const allSeats = sections.flatMap((section) =>
      normalizeArray(section.seats)
    );

    return {
      sections: sections.length,
      total: allSeats.length,
      available: allSeats.filter(
        (seat) => getSeatStatus(seat.status) === "available"
      ).length,
      reserved: allSeats.filter(
        (seat) => getSeatStatus(seat.status) === "reserved"
      ).length,
      booked: allSeats.filter(
        (seat) => getSeatStatus(seat.status) === "booked"
      ).length,
    };
  }, [sections]);

  /* =========================================================
     FORM HANDLER
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setForm(initialSection);
    setShowForm(true);
    setNotification({ type: "", message: "" });
  };

  /* =========================================================
     GENERATE SEATS
  ========================================================= */

  const generateSeats = (rows, seatsPerRow) => {
    const seats = [];

    const rowCount = Number(rows);
    const seatCount = Number(seatsPerRow);

    for (let row = 0; row < rowCount; row++) {
      const rowLabel = String.fromCharCode(65 + row);

      for (let column = 1; column <= seatCount; column++) {
        seats.push({
          row_label: rowLabel,
          seat_number: String(column),
          position_x: column,
          position_y: row + 1,
        });
      }
    }

    return seats;
  };

  /* =========================================================
     CREATE SECTION + SEATS
  ========================================================= */

  const handleCreateSection = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!form.ticket_category_id) {
      return notify("error", "Kategori tiket wajib dipilih.");
    }

    if (!form.section_code.trim()) {
      return notify("error", "Kode area wajib diisi.");
    }

    if (!form.section_name.trim()) {
      return notify("error", "Nama area wajib diisi.");
    }

    if (form.seat_mode === "NUMBERED") {
      const rows = Number(form.rows);
      const seats = Number(form.seats_per_row);

      if (
        !Number.isInteger(rows) ||
        !Number.isInteger(seats) ||
        rows < 1 ||
        rows > 26 ||
        seats < 1 ||
        seats > 100 ||
        rows * seats > 1000
      ) {
        return notify(
          "error",
          "Jumlah kursi tidak valid. Maksimal 1.000 kursi per area."
        );
      }
    }

    try {
      setSaving(true);
      setNotification({ type: "info", message: "Menyimpan area kursi..." });

      const sectionPayload = {
        ticket_category_id: Number(form.ticket_category_id),
        section_code: form.section_code.trim().toUpperCase(),
        section_name: form.section_name.trim(),
        seat_mode: form.seat_mode,
        map_position: {
          x: 0,
          y: 0,
        },
      };

      const sectionData = await apiRequest(
        `/seats/events/${eventId}/sections`,
        {
          method: "POST",
          body: JSON.stringify(sectionPayload),
        }
      );

      const sectionId =
        sectionData.section?.id ||
        sectionData.event_section?.id ||
        sectionData.id;

      if (!sectionId) {
        throw new Error(
          "Area berhasil dibuat, tetapi ID area tidak ditemukan pada response backend."
        );
      }

      if (form.seat_mode === "NUMBERED") {
        notify("info", "Membuat daftar kursi...");

        const seats = generateSeats(
          form.rows,
          form.seats_per_row
        );

        await apiRequest(
          `/seats/sections/${sectionId}/seats`,
          {
            method: "POST",
            body: JSON.stringify({ seats }),
          }
        );
      }

      setShowForm(false);
      setForm(initialSection);

      notify("success", "Area dan konfigurasi kursi berhasil disimpan.");

      await loadData();
    } catch (error) {
      console.error("CREATE SECTION ERROR:", error);
      notify("error", error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE SECTION
     Tidak diaktifkan tanpa endpoint DELETE yang terkonfirmasi.
  ========================================================= */

  const getCategory = (categoryId) =>
    categories.find(
      (category) =>
        Number(category.id) === Number(categoryId)
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#F8FAFC] pb-10 text-[#0F172A]">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Link
              href={`/organizer/events/${eventId}/tiket`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                Event Organizer
                <ChevronRight size={13} />
                Denah Kursi
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Pengaturan Denah Kursi
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {event?.event_name || "Atur area dan tempat duduk event."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              disabled={loading || categories.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1A326A] disabled:opacity-50"
            >
              <Plus size={17} />
              Tambah Area
            </button>
          </div>
        </div>

        {/* NOTIFICATION */}

        {notification.message && (
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : notification.type === "info"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : notification.type === "info" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <AlertCircle size={18} />
            )}

            <span className="flex-1">{notification.message}</span>

            <button
              type="button"
              onClick={() =>
                setNotification({ type: "", message: "" })
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Area",
              value: statistics.sections,
              icon: LayoutGrid,
            },
            {
              label: "Total Kursi",
              value: statistics.total,
              icon: Armchair,
            },
            {
              label: "Tersedia",
              value: statistics.available,
              icon: CheckCircle2,
            },
            {
              label: "Terpesan",
              value: statistics.reserved + statistics.booked,
              icon: Users,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112250]/5 text-[#112250]">
                    <Icon size={18} />
                  </div>
                </div>

                <p className="mt-3 text-2xl font-bold tabular-nums">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* LEGEND */}

        <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <span className="text-xs font-bold text-slate-500">
            KETERANGAN KURSI
          </span>

          {[
            ["available", "Tersedia"],
            ["reserved", "Dipesan"],
            ["booked", "Terjual"],
          ].map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className={`h-4 w-4 rounded ${
                  type === "available"
                    ? "bg-emerald-100 border border-emerald-400"
                    : type === "reserved"
                    ? "bg-amber-100 border border-amber-400"
                    : "bg-slate-300 border border-slate-400"
                }`}
              />
              <span className="text-xs font-medium text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* MAIN */}

        <div className="grid gap-6 xl:grid-cols-[1fr_310px]">

          <div className="space-y-5">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-bold">
                    Visual Denah Kursi
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Tampilan area dan posisi tempat duduk event.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  {sections.length} Area
                </span>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 size={30} className="animate-spin" />
                  <p className="text-sm">Memuat denah kursi...</p>
                </div>
              ) : sections.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <Armchair size={30} />
                  </div>

                  <h3 className="mt-4 font-bold">
                    Belum Ada Area Kursi
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Tambahkan area terlebih dahulu dan hubungkan dengan kategori tiket event.
                  </p>

                  <button
                    type="button"
                    onClick={openCreateForm}
                    disabled={categories.length === 0}
                    className="mt-5 rounded-xl bg-[#112250] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    Tambahkan Area Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="mx-auto max-w-xl rounded-xl border-2 border-slate-300 bg-slate-100 py-3 text-center text-xs font-bold tracking-[0.3em] text-slate-500">
                    STAGE / PANGGUNG
                  </div>

                  {sections.map((section) => {
                    const seats = normalizeArray(section.seats);
                    const category =
                      getCategory(section.ticket_category_id);

                    const groupedRows = Object.groupBy
                      ? Object.groupBy(
                          seats,
                          (seat) => seat.row_label
                        )
                      : seats.reduce((result, seat) => {
                          const key = seat.row_label || "-";
                          if (!result[key]) result[key] = [];
                          result[key].push(seat);
                          return result;
                        }, {});

                    const rows = Object.entries(groupedRows).sort(
                      ([a], [b]) => a.localeCompare(b)
                    );

                    return (
                      <div
                        key={section.id}
                        className={`rounded-2xl border-2 p-4 sm:p-5 ${
                          selectedSection === section.id
                            ? "border-[#112250] bg-blue-50/30"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSection(section.id)
                            }
                            className="text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#112250] px-2.5 py-1 text-xs font-bold text-white">
                                {section.section_code}
                              </span>

                              <h3 className="font-bold">
                                {section.section_name}
                              </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {category?.category_name ||
                                section.category_name ||
                                "Kategori tiket"}{" "}
                              · {seats.length} kursi
                            </p>
                          </button>

                          <span className="text-sm font-bold text-[#112250]">
                            {formatRupiah(category?.price || section.price)}
                          </span>
                        </div>

                        {String(section.seat_mode).toUpperCase() ===
                        "GENERAL" ? (
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
                            <Users
                              size={28}
                              className="mx-auto text-blue-700"
                            />
                            <p className="mt-2 text-sm font-bold text-blue-900">
                              General Admission
                            </p>
                            <p className="mt-1 text-xs text-blue-700">
                              Area ini menggunakan tiket bebas tanpa nomor kursi.
                            </p>
                          </div>
                        ) : seats.length === 0 ? (
                          <p className="py-8 text-center text-sm text-slate-400">
                            Belum ada kursi di area ini.
                          </p>
                        ) : (
                          <div className="overflow-x-auto pb-2">
                            <div className="mx-auto flex min-w-max flex-col items-center gap-3">
                              {rows.map(([rowLabel, rowSeats]) => (
                                <div
                                  key={rowLabel}
                                  className="flex items-center gap-3"
                                >
                                  <span className="w-5 text-xs font-bold text-slate-400">
                                    {rowLabel}
                                  </span>

                                  <div className="flex gap-1.5">
                                    {rowSeats
                                      .sort(
                                        (a, b) =>
                                          Number(a.seat_number) -
                                          Number(b.seat_number)
                                      )
                                      .map((seat) => {
                                        const status = getSeatStatus(
                                          seat.status
                                        );

                                        return (
                                          <div
                                            key={seat.id}
                                            title={`${rowLabel}${seat.seat_number} - ${status}`}
                                            className={`flex h-8 w-8 items-center justify-center rounded-md border text-[9px] font-bold ${
                                              status === "available"
                                                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                                : status === "reserved"
                                                ? "border-amber-300 bg-amber-100 text-amber-800"
                                                : status === "booked"
                                                ? "border-slate-300 bg-slate-300 text-slate-600"
                                                : "border-red-200 bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {seat.seat_number}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                          <span>
                            Tersedia:{" "}
                            <strong className="text-emerald-700">
                              {seats.filter(
                                (seat) =>
                                  getSeatStatus(seat.status) ===
                                  "available"
                              ).length}
                            </strong>
                          </span>

                          <span>
                            Terpesan:{" "}
                            <strong className="text-slate-700">
                              {seats.filter(
                                (seat) =>
                                  getSeatStatus(seat.status) !==
                                  "available"
                              ).length}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Ticket size={18} className="text-[#112250]" />
                <h3 className="font-bold">Kategori Tiket</h3>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Kategori yang tersedia untuk event ini.
              </p>

              <div className="mt-5 space-y-3">
                {categories.map((category) => {
                  const linked = sections.filter(
                    (section) =>
                      Number(section.ticket_category_id) ===
                      Number(category.id)
                  );

                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">
                          {category.category_name}
                        </span>

                        <span className="text-[10px] font-bold text-blue-700">
                          {linked.length} Area
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-[#112250]">
                        {formatRupiah(category.price)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Kuota: {category.quota}
                      </p>
                    </div>
                  );
                })}

                {categories.length === 0 && !loading && (
                  <p className="text-xs text-amber-600">
                    Belum ada kategori tiket. Buat kategori tiket terlebih dahulu.
                  </p>
                )}
              </div>

              <Link
                href={`/organizer/events/${eventId}/tiket`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Kelola Kategori Tiket
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#112250]/15 bg-[#112250]/5 p-5">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#112250]" />
                <h3 className="text-sm font-bold">Informasi Denah</h3>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total area</span>
                  <strong>{statistics.sections}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Total kursi</span>
                  <strong>{statistics.total}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Kursi tersedia</span>
                  <strong className="text-emerald-700">
                    {statistics.available}
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* CREATE SECTION FORM */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold">
                    Tambah Area Kursi
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Hubungkan area dengan kategori tiket.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleCreateSection}
                className="space-y-5 p-6"
              >
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Kategori Tiket *
                  </label>

                  <select
                    name="ticket_category_id"
                    value={form.ticket_category_id}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Pilih kategori tiket</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.category_name} -{" "}
                        {formatRupiah(category.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      Kode Area *
                    </label>

                    <input
                      name="section_code"
                      value={form.section_code}
                      onChange={handleChange}
                      maxLength={20}
                      placeholder="VIP-A"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      Nama Area *
                    </label>

                    <input
                      name="section_name"
                      value={form.section_name}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="VIP Depan"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Mode Tempat Duduk
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "NUMBERED",
                        label: "Nomor Kursi",
                        description: "Pembeli memilih kursi tertentu.",
                        icon: Armchair,
                      },
                      {
                        value: "GENERAL",
                        label: "General Admission",
                        description: "Tiket bebas tanpa nomor kursi.",
                        icon: Users,
                      },
                    ].map((mode) => {
                      const Icon = mode.icon;

                      return (
                        <button
                          type="button"
                          key={mode.value}
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              seat_mode: mode.value,
                            }))
                          }
                          className={`rounded-xl border p-4 text-left transition ${
                            form.seat_mode === mode.value
                              ? "border-[#112250] bg-blue-50 ring-2 ring-[#112250]/10"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Icon
                            size={20}
                            className="text-[#112250]"
                          />

                          <p className="mt-3 text-sm font-bold">
                            {mode.label}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.seat_mode === "NUMBERED" && (
                  <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Jumlah Baris
                      </label>

                      <input
                        type="number"
                        name="rows"
                        min="1"
                        max="26"
                        value={form.rows}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        Kursi per Baris
                      </label>

                      <input
                        type="number"
                        name="seats_per_row"
                        min="1"
                        max="100"
                        value={form.seats_per_row}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-xs text-slate-500">
                        Total kursi yang akan dibuat
                      </span>

                      <strong className="text-lg text-[#112250]">
                        {Math.max(0, Number(form.rows) || 0) *
                          Math.max(
                            0,
                            Number(form.seats_per_row) || 0
                          )}{" "}
                        kursi
                      </strong>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1A326A] disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Area
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
