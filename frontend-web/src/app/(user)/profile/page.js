"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    Edit3,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    AtSign,
    Camera,
    ArrowLeft,
    Sparkles,
} from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const [user, setUser] = useState(null);

    const [form, setForm] = useState({
        fullname: "",
        username: "",
        email: "",
        phone: "",
        gender: "",
        birth_date: "",
        photo: null,
        role: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // =========================
    // HELPER
    // =========================

    const getUserId = (parsedUser) => {
        return (
            parsedUser?.id ||
            parsedUser?.user_id ||
            parsedUser?.userId
        );
    };

    const formatDate = (date) => {
        if (!date) return "";

        return String(date).slice(0, 10);
    };

    const setProfileForm = (profile) => {
        setForm({
            fullname: profile?.fullname || "",
            username: profile?.username || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
            gender: profile?.gender || "",
            birth_date: formatDate(profile?.birth_date),
            photo: profile?.photo || null,
            role: profile?.role || "",
        });
    };

    const formatRole = (role) => {
        if (!role) return "Customer";

        return role
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getInitial = () => {
        const name =
            user?.fullname ||
            user?.username ||
            "U";

        return name.charAt(0).toUpperCase();
    };

    // =========================
    // GET PROFILE
    // =========================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const storedUser = localStorage.getItem("user");

                if (!token) {
                    router.push("/login");
                    return;
                }

                if (!storedUser) {
                    throw new Error("Data user tidak ditemukan.");
                }

                const parsedUser = JSON.parse(storedUser);
                const userId = getUserId(parsedUser);

                if (!userId) {
                    throw new Error("ID user tidak ditemukan.");
                }

                const response = await fetch(
                    `${API_URL}/api/profile/${userId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                            "Gagal mengambil data profile."
                    );
                }

                const profile = data.user;

                setUser(profile);
                setProfileForm(profile);
            } catch (error) {
                console.error("PROFILE ERROR:", error);

                setErrorMessage(
                    error.message ||
                        "Gagal mengambil data profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [API_URL, router]);

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // UPDATE PROFILE
    // =========================

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccessMessage("");
            setErrorMessage("");

            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) {
                router.push("/login");
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            const userId = getUserId(parsedUser);

            if (!userId) {
                throw new Error("ID user tidak ditemukan.");
            }

            const response = await fetch(
                `${API_URL}/api/profile/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fullname: form.fullname,
                        phone: form.phone || null,
                        gender: form.gender || null,
                        birth_date: form.birth_date || null,
                        photo: form.photo || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Gagal memperbarui profile."
                );
            }

            const updatedUser = data.user;

            setUser(updatedUser);
            setProfileForm(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...parsedUser,
                    ...updatedUser,
                })
            );

            setEditing(false);
            setSuccessMessage(
                "Profile berhasil diperbarui."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3500);
        } catch (error) {
            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Gagal memperbarui profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancel = () => {
        if (!user) return;

        setProfileForm(user);
        setEditing(false);
        setErrorMessage("");
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-full border-4 border-[#112250]/10 border-t-[#112250] animate-spin" />

                    <p className="text-sm font-medium text-slate-500">
                        Memuat profile...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <AlertCircle
                            size={27}
                            className="text-red-500"
                        />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                        Profile tidak dapat dimuat
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        {errorMessage ||
                            "Terjadi kesalahan saat mengambil data profile."}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-6 px-5 py-2.5 rounded-xl bg-[#112250] hover:bg-[#1A326A] text-white text-sm font-semibold transition"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0">
            {/* HEADER HALAMAN (Mengikuti gaya Cari Event & Pesanan Saya) */}
            <section className="relative isolate overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">
                <div className="relative w-full px-5 py-6 sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
                                title="Kembali"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div>
                                

                                <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                                    Profile
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Kelola informasi identitas akun TicketVerse Anda.
                                </p>
                            </div>
                        </div>

                        {!editing ? (
                            <button
                                onClick={() => {
                                    setEditing(true);
                                    setSuccessMessage("");
                                    setErrorMessage("");
                                }}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#112250] hover:bg-[#1A326A] text-white text-sm font-bold transition shadow-sm hover:-translate-y-0.5"
                            >
                                <Edit3 size={17} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition disabled:opacity-50"
                                >
                                    <X size={17} />
                                    <span className="hidden sm:inline">Batal</span>
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-60 hover:-translate-y-0.5"
                                >
                                    {saving ? (
                                        <Loader2 size={17} className="animate-spin" />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    <span>
                                        {saving ? "Menyimpan..." : "Simpan"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ALERT */}
            {(successMessage || errorMessage) && (
                <div className="mb-6">
                    {successMessage && (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            <CheckCircle2 size={18} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm mt-3">
                            <AlertCircle size={18} />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
                
                {/* PROFILE CARD (KIRI) */}
                <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-fit">
                    {/* Cover Gradient */}
                    <div className="h-32 bg-gradient-to-r from-[#112250] via-[#3B507D] to-[#112250] relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="-mt-14 flex justify-center">
                            <div className="relative">
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.fullname || "Profile"}
                                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                        <span className="text-4xl font-black text-[#112250]">
                                            {getInitial()}
                                        </span>
                                    </div>
                                )}

                                {editing && (
                                    <button
                                        type="button"
                                        className="absolute -right-2 -bottom-2 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center border-4 border-white shadow-md hover:bg-blue-700 transition"
                                        title="Ubah Foto Profile"
                                    >
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-5">
                            <h2 className="text-xl font-extrabold text-[#14213D]">
                                {user.fullname || "Nama User"}
                            </h2>

                            <p className="text-sm font-medium text-slate-500 mt-1">
                                @{user.username || "-"}
                            </p>

                            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                <ShieldCheck size={14} />
                                {formatRole(user.role)}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Mail size={17} className="text-slate-500" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                                        Email
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
                                        {user.email || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Phone size={17} className="text-slate-500" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
                                        Nomor HP
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
                                        {user.phone || "Belum diisi"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DETAIL PROFILE (KANAN) */}
                <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="px-6 sm:px-8 py-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-[#14213D]">
                            Informasi Personal
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Informasi dasar yang digunakan pada akun TicketVerse Anda.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NAMA LENGKAP */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Nama Lengkap
                                </label>

                                {editing ? (
                                    <div className="relative">
                                        <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="fullname"
                                            value={form.fullname}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-11 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center px-4 text-sm font-medium text-slate-700">
                                        {user.fullname || "-"}
                                    </div>
                                )}
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Username
                                </label>

                                <div className="relative">
                                    <AtSign size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <div className="w-full h-11 rounded-xl bg-slate-100/50 border border-slate-200 flex items-center pl-11 pr-4 text-sm font-medium text-slate-500 cursor-not-allowed">
                                        {user.username || "-"}
                                    </div>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 mt-2">
                                    Username tidak dapat diubah.
                                </p>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <div className="w-full h-11 rounded-xl bg-slate-100/50 border border-slate-200 flex items-center pl-11 pr-4 text-sm font-medium text-slate-500 truncate cursor-not-allowed">
                                        {user.email || "-"}
                                    </div>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 mt-2">
                                    Email digunakan sebagai identitas akun.
                                </p>
                            </div>

                            {/* NOMOR HP */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Nomor HP
                                </label>

                                {editing ? (
                                    <div className="relative">
                                        <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-11 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center px-4 text-sm font-medium text-slate-700">
                                        {user.phone || "Belum diisi"}
                                    </div>
                                )}
                            </div>

                            {/* JENIS KELAMIN */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Jenis Kelamin
                                </label>

                                {editing ? (
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                ) : (
                                    <div className="h-11 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center px-4 text-sm font-medium text-slate-700">
                                        {user.gender || "Belum diisi"}
                                    </div>
                                )}
                            </div>

                            {/* TANGGAL LAHIR */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Tanggal Lahir
                                </label>

                                {editing ? (
                                    <div className="relative">
                                        <CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={form.birth_date}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#112250] focus:ring-4 focus:ring-[#112250]/10"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-11 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center px-4 text-sm font-medium text-slate-700">
                                        {user.birth_date ? formatDate(user.birth_date) : "Belum diisi"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INFORMASI AKUN */}
                        <div className="mt-9 pt-8 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-[#14213D]">
                                Informasi Akun
                            </h3>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                        Account ID
                                    </p>
                                    <p className="text-sm font-bold text-slate-700 mt-1">
                                        #{user.id}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                        Account Type
                                    </p>
                                    <p className="text-sm font-bold text-slate-700 mt-1">
                                        {formatRole(user.role)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SAVE AREA (BAWAH) */}
                        {editing && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Simpan perubahan profile
                                    </p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">
                                        Pastikan informasi yang Anda masukkan sudah benar.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#112250] hover:bg-[#1A326A] text-white text-sm font-bold transition shadow-sm disabled:opacity-60 hover:-translate-y-0.5"
                                    >
                                        {saving ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}