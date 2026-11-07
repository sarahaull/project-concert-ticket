"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    Ticket,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    CalendarDays,
    Clock3,
    MapPin,
    Wallet,
    TrendingUp,
    PackageOpen,
} from "lucide-react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EMPTY_FORM = {
    category_name: "",
    price: "",
    quota: "",
};

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Rp0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "Rp0";
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(number);
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(time) {
    if (!time) {
        return "-";
    }

    const value = String(time);

    if (value.length >= 5) {
        return value.slice(0, 5);
    }

    return value;
}

/* =========================================================
   POSTER URL
========================================================= */

function getPosterUrl(poster) {
    if (!poster) {
        return null;
    }

    if (
        poster.startsWith("http://") ||
        poster.startsWith("https://")
    ) {
        return poster;
    }

    return `${API_URL}/${poster.replace(/^\/+/, "")}`;
}

/* =========================================================
   TOKEN
========================================================= */

function getToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("token");
}

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
                data.error ||
                "Terjadi kesalahan pada server."
        );
    }

    return data;
}

/* =========================================================
   PAGE
========================================================= */

export default function KelolaTiketPage() {
    const params = useParams();

    const eventId = params?.id;

    /* =====================================================
       STATE
    ===================================================== */

    const [event, setEvent] = useState(null);

    const [ticketCategories, setTicketCategories] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    const [notification, setNotification] =
        useState(null);

    const [error, setError] = useState("");

    /* =====================================================
       FETCH WHEN EVENT ID CHANGES
    ===================================================== */

    useEffect(() => {
        if (!eventId) {
            return;
        }

        fetchData();
    }, [eventId]);

    /* =====================================================
       AUTO HIDE NOTIFICATION
    ===================================================== */

    useEffect(() => {
        if (!notification) {
            return;
        }

        const timer = setTimeout(() => {
            setNotification(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [notification]);

    /* =====================================================
       FETCH EVENT + TICKET CATEGORIES
    ===================================================== */

    async function fetchData() {
        try {
            setLoading(true);
            setError("");

            const [eventData, ticketData] =
                await Promise.all([
                    apiRequest(
                        `${API_URL}/api/events/${eventId}`
                    ),

                    apiRequest(
                        `${API_URL}/api/ticket-categories`
                    ),
                ]);

            /* =============================================
               EVENT
            ============================================= */

            const eventResult =
                eventData.event ||
                eventData.data ||
                eventData;

            setEvent(eventResult);

            /* =============================================
               TICKET CATEGORIES

               RESPONSE BACKEND:
               {
                   success: true,
                   ticket_categories: [...]
               }
            ============================================= */

            const categories =
                Array.isArray(
                    ticketData.ticket_categories
                )
                    ? ticketData.ticket_categories
                    : [];

            /* =============================================
               FILTER BY EVENT ID
            ============================================= */

            const filteredCategories =
                categories.filter((ticket) => {
                    return (
                        Number(ticket.event_id) ===
                        Number(eventId)
                    );
                });

            console.log(
                "Event ID:",
                eventId
            );

            console.log(
                "Semua Ticket Categories:",
                categories
            );

            console.log(
                "Ticket Categories Event:",
                filteredCategories
            );

            setTicketCategories(
                filteredCategories
            );
        } catch (err) {
            console.error(
                "FETCH DATA ERROR:",
                err
            );

            setError(
                err.message ||
                    "Gagal mengambil data event dan kategori tiket."
            );
        } finally {
            setLoading(false);
        }
    }

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    function handleFormChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    /* =====================================================
       OPEN ADD FORM
    ===================================================== */

    function openAddForm() {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });

        setShowForm(true);
    }

    /* =====================================================
       OPEN EDIT FORM
    ===================================================== */

    function openEditForm(ticket) {
        setEditingId(ticket.id);

        setForm({
            category_name:
                ticket.category_name || "",

            price:
                ticket.price ?? "",

            quota:
                ticket.quota ?? "",
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /* =====================================================
       CLOSE FORM
    ===================================================== */

    function closeForm() {
        if (saving) {
            return;
        }

        setShowForm(false);

        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });
    }

    /* =====================================================
       SUBMIT TICKET CATEGORY
    ===================================================== */

    async function handleSubmit(e) {
        e.preventDefault();

        const categoryName =
            form.category_name.trim();

        const price = Number(form.price);

        const quota = Number(form.quota);

        /* =============================================
           VALIDATION CATEGORY
        ============================================= */

        if (!categoryName) {
            setNotification({
                type: "error",
                message:
                    "Nama kategori tiket wajib diisi.",
            });

            return;
        }

        /* =============================================
           VALIDATION PRICE
        ============================================= */

        if (!price || price <= 0) {
            setNotification({
                type: "error",
                message:
                    "Harga tiket harus lebih dari 0.",
            });

            return;
        }

        /* =============================================
           VALIDATION QUOTA
        ============================================= */

        if (!quota || quota <= 0) {
            setNotification({
                type: "error",
                message:
                    "Kuota tiket harus lebih dari 0.",
            });

            return;
        }

        try {
            setSaving(true);

            const payload = {
                event_id: Number(eventId),

                category_name:
                    categoryName,

                price,

                quota,
            };

            /* =============================================
               EDIT
            ============================================= */

            if (editingId) {
                await apiRequest(
                    `${API_URL}/api/ticket-categories/${editingId}`,
                    {
                        method: "PUT",

                        body: JSON.stringify(
                            payload
                        ),
                    }
                );

                setNotification({
                    type: "success",
                    message:
                        "Kategori tiket berhasil diperbarui.",
                });
            }

            /* =============================================
               ADD
            ============================================= */

            else {
                await apiRequest(
                    `${API_URL}/api/ticket-categories`,
                    {
                        method: "POST",

                        body: JSON.stringify(
                            payload
                        ),
                    }
                );

                setNotification({
                    type: "success",
                    message:
                        "Kategori tiket berhasil ditambahkan.",
                });
            }

            closeForm();

            await fetchData();
        } catch (err) {
            console.error(
                "SAVE TICKET ERROR:",
                err
            );

            setNotification({
                type: "error",
                message:
                    err.message ||
                    "Gagal menyimpan kategori tiket.",
            });
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DELETE
    ===================================================== */

    async function handleDelete(ticket) {
        const confirmed =
            window.confirm(
                `Hapus kategori tiket "${ticket.category_name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(ticket.id);

            await apiRequest(
                `${API_URL}/api/ticket-categories/${ticket.id}`,
                {
                    method: "DELETE",
                }
            );

            setNotification({
                type: "success",
                message:
                    "Kategori tiket berhasil dihapus.",
            });

            await fetchData();
        } catch (err) {
            console.error(
                "DELETE TICKET ERROR:",
                err
            );

            setNotification({
                type: "error",
                message:
                    err.message ||
                    "Gagal menghapus kategori tiket.",
            });
        } finally {
            setDeletingId(null);
        }
    }

    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics = useMemo(() => {
        const totalQuota =
            ticketCategories.reduce(
                (total, ticket) =>
                    total +
                    Number(
                        ticket.quota || 0
                    ),
                0
            );

        const totalRemaining =
            ticketCategories.reduce(
                (total, ticket) =>
                    total +
                    Number(
                        ticket.remaining_ticket ??
                            ticket.quota ??
                            0
                    ),
                0
            );

        const totalSold = Math.max(
            totalQuota -
                totalRemaining,
            0
        );

        const totalRevenue =
            ticketCategories.reduce(
                (total, ticket) => {
                    const quota =
                        Number(
                            ticket.quota ||
                                0
                        );

                    const remaining =
                        Number(
                            ticket.remaining_ticket ??
                                quota
                        );

                    const sold =
                        Math.max(
                            quota -
                                remaining,
                            0
                        );

                    return (
                        total +
                        sold *
                            Number(
                                ticket.price ||
                                    0
                            )
                    );
                },
                0
            );

        return {
            totalCategory:
                ticketCategories.length,

            totalQuota,

            totalSold,

            totalRemaining,

            totalRevenue,
        };
    }, [ticketCategories]);

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <main className="min-h-screen px-4 py-6 md:ml-64 md:px-6 lg:px-8">
                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

                            <p className="text-sm text-slate-500">
                                Memuat data tiket...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="min-h-screen px-4 py-6 md:ml-64 md:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[1500px]">

                    {/* =====================================
                        NOTIFICATION
                    ===================================== */}

                    {notification && (
                        <div
                            className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
                                notification.type ===
                                "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                            {notification.type ===
                            "success" ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            ) : (
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            )}

                            <p className="text-sm font-medium">
                                {
                                    notification.message
                                }
                            </p>
                        </div>
                    )}

                    {/* =====================================
                        ERROR
                    ===================================== */}

                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                            <p>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Link
                                href="/organizer/event"
                                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                            >
                                <ArrowLeft className="h-4 w-4" />

                                Kembali ke Event
                            </Link>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Kelola Tiket
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Atur kategori, harga,
                                dan kuota tiket event.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/organizer/event/${eventId}`}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                            >
                                Lihat Event
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    openAddForm
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />

                                Tambah Tiket
                            </button>
                        </div>
                    </div>

                    {/* =====================================
                        EVENT SUMMARY
                    ===================================== */}

                    {event && (
                        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid lg:grid-cols-[240px_1fr]">

                                {/* POSTER */}

                                <div className="relative h-56 bg-slate-100 lg:h-full lg:min-h-[240px]">
                                    {getPosterUrl(
                                        event.poster
                                    ) ? (
                                        <img
                                            src={getPosterUrl(
                                                event.poster
                                            )}
                                            alt={
                                                event.event_name ||
                                                "Event"
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-[240px] items-center justify-center">
                                            <Ticket className="h-12 w-12 text-slate-300" />
                                        </div>
                                    )}

                                    <div className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                                        {event.status ||
                                            "Coming Soon"}
                                    </div>
                                </div>

                                {/* INFO */}

                                <div className="p-6 md:p-7">
                                    <div className="mb-5">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                                            Event
                                        </p>

                                        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                                            {
                                                event.event_name
                                            }
                                        </h2>

                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                            {event.description ||
                                                "Belum ada deskripsi event."}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                                        {/* DATE */}

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                                <CalendarDays className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Tanggal
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-800">
                                                {formatDate(
                                                    event.event_date
                                                )}
                                            </p>
                                        </div>

                                        {/* TIME */}

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                                <Clock3 className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Waktu
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-800">
                                                {formatTime(
                                                    event.event_time
                                                )}
                                            </p>
                                        </div>

                                        {/* LOCATION */}

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                                <MapPin className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Lokasi
                                                </span>
                                            </div>

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {event.venue_name ||
                                                    "-"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {event.city ||
                                                    ""}
                                            </p>
                                        </div>

                                        {/* CATEGORY */}

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                                <Ticket className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Kategori
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-800">
                                                {
                                                    statistics.totalCategory
                                                }{" "}
                                                kategori
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* =====================================
                        STATISTICS
                    ===================================== */}

                    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* CATEGORY */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                    <Ticket className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500">
                                Kategori Tiket
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {
                                    statistics.totalCategory
                                }
                            </p>
                        </div>

                        {/* QUOTA */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                                    <PackageOpen className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500">
                                Total Kuota
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {statistics.totalQuota.toLocaleString(
                                    "id-ID"
                                )}
                            </p>
                        </div>

                        {/* SOLD */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500">
                                Tiket Terjual
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {statistics.totalSold.toLocaleString(
                                    "id-ID"
                                )}
                            </p>
                        </div>

                        {/* REVENUE */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                                    <Wallet className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500">
                                Estimasi Pendapatan
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {formatRupiah(
                                    statistics.totalRevenue
                                )}
                            </p>
                        </div>
                    </section>

                    {/* =====================================
                        FORM
                    ===================================== */}

                    {showForm && (
                        <section className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingId
                                            ? "Edit Kategori Tiket"
                                            : "Tambah Kategori Tiket"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Tentukan nama
                                        kategori, harga,
                                        dan jumlah kuota
                                        tiket.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="p-6"
                            >
                                <div className="grid gap-5 md:grid-cols-3">

                                    {/* CATEGORY */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Nama Kategori
                                        </label>

                                        <input
                                            type="text"
                                            name="category_name"
                                            value={
                                                form.category_name
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Contoh: VIP"
                                            disabled={
                                                saving
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                        />
                                    </div>

                                    {/* PRICE */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Harga Tiket
                                        </label>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                Rp
                                            </span>

                                            <input
                                                type="number"
                                                name="price"
                                                min="1"
                                                value={
                                                    form.price
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="1500000"
                                                disabled={
                                                    saving
                                                }
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                            />
                                        </div>

                                        {form.price && (
                                            <p className="mt-2 text-xs font-medium text-blue-600">
                                                {
                                                    formatRupiah(
                                                        form.price
                                                    )
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* QUOTA */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Kuota Tiket
                                        </label>

                                        <input
                                            type="number"
                                            name="quota"
                                            min="1"
                                            value={
                                                form.quota
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="1000"
                                            disabled={
                                                saving
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                        />

                                        {form.quota && (
                                            <p className="mt-2 text-xs font-medium text-slate-500">
                                                {Number(
                                                    form.quota
                                                ).toLocaleString(
                                                    "id-ID"
                                                )}{" "}
                                                tiket
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* FORM ACTION */}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving
                                        }
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />

                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />

                                                {editingId
                                                    ? "Simpan Perubahan"
                                                    : "Simpan Tiket"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* =====================================
                        TICKET LIST
                    ===================================== */}

                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Daftar Kategori Tiket
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Kelola harga dan kuota
                                    setiap kategori
                                    tiket.
                                </p>
                            </div>

                            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                {
                                    ticketCategories.length
                                }{" "}
                                kategori
                            </span>
                        </div>

                        {/* =================================
                            EMPTY STATE
                        ================================= */}

                        {ticketCategories.length ===
                        0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                                    <Ticket className="h-8 w-8" />
                                </div>

                                <h3 className="text-base font-bold text-slate-900">
                                    Belum ada kategori
                                    tiket
                                </h3>

                                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                                    Tambahkan kategori
                                    tiket seperti VIP,
                                    Festival, atau
                                    Regular untuk
                                    event ini.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        openAddForm
                                    }
                                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />

                                    Tambah Tiket
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">

                                {ticketCategories.map(
                                    (ticket) => {
                                        const quota =
                                            Number(
                                                ticket.quota ||
                                                    0
                                            );

                                        const remaining =
                                            Number(
                                                ticket.remaining_ticket ??
                                                    quota
                                            );

                                        const sold =
                                            Math.max(
                                                quota -
                                                    remaining,
                                                0
                                            );

                                        const soldPercentage =
                                            quota >
                                            0
                                                ? Math.min(
                                                      Math.round(
                                                          (sold /
                                                              quota) *
                                                              100
                                                      ),
                                                      100
                                                  )
                                                : 0;

                                        const isSoldOut =
                                            remaining <=
                                            0;

                                        return (
                                            <div
                                                key={
                                                    ticket.id
                                                }
                                                className="p-5 transition hover:bg-slate-50/70 md:p-6"
                                            >
                                                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                                                    {/* LEFT CONTENT */}

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-wrap items-center gap-3">

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                                <Ticket className="h-5 w-5" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <h3 className="truncate text-base font-bold text-slate-900">
                                                                    {
                                                                        ticket.category_name ||
                                                                        "-"
                                                                    }
                                                                </h3>

                                                                <p className="mt-0.5 text-sm font-semibold text-blue-600">
                                                                    {formatRupiah(
                                                                        ticket.price
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    isSoldOut
                                                                        ? "bg-red-50 text-red-600"
                                                                        : "bg-emerald-50 text-emerald-600"
                                                                }`}
                                                            >
                                                                {isSoldOut
                                                                    ? "Sold Out"
                                                                    : "Tersedia"}
                                                            </span>
                                                        </div>

                                                        {/* NUMBERS */}

                                                        <div className="mt-5 grid gap-4 sm:grid-cols-3">

                                                            <div>
                                                                <p className="text-xs font-medium text-slate-400">
                                                                    Kuota
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                    {quota.toLocaleString(
                                                                        "id-ID"
                                                                    )}{" "}
                                                                    tiket
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-medium text-slate-400">
                                                                    Terjual
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                    {sold.toLocaleString(
                                                                        "id-ID"
                                                                    )}{" "}
                                                                    tiket
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-medium text-slate-400">
                                                                    Tersisa
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                    {Math.max(
                                                                        remaining,
                                                                        0
                                                                    ).toLocaleString(
                                                                        "id-ID"
                                                                    )}{" "}
                                                                    tiket
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* PROGRESS */}

                                                        <div className="mt-5">
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <span className="text-xs font-medium text-slate-400">
                                                                    Penjualan
                                                                </span>

                                                                <span className="text-xs font-bold text-slate-600">
                                                                    {
                                                                        soldPercentage
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>

                                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        soldPercentage >=
                                                                        90
                                                                            ? "bg-red-500"
                                                                            : soldPercentage >=
                                                                                60
                                                                              ? "bg-amber-500"
                                                                              : "bg-blue-600"
                                                                    }`}
                                                                    style={{
                                                                        width: `${soldPercentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ACTION */}

                                                    <div className="flex shrink-0 gap-2 xl:ml-6">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    ticket
                                                                )
                                                            }
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />

                                                            <span className="hidden sm:inline">
                                                                Edit
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    ticket
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                ticket.id
                                                            }
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingId ===
                                                            ticket.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}

                                                            <span className="hidden sm:inline">
                                                                Hapus
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>

                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Pengelolaan tiket event
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Pastikan kategori, harga,
                                dan kuota sudah sesuai
                                sebelum event
                                dipublikasikan.
                            </p>
                        </div>

                        <Link
                            href="/organizer/event"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Selesai
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

