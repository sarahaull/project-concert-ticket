
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Users,
  Crown,
  Briefcase,
  User,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Funnel,
  CalendarDays,
  AtSign,
  VenusAndMars,
  Image as ImageIcon,
} from "lucide-react";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

const SERVER_ROOT = API_ROOT.replace(/\/api$/, "");
const USERS_URL = `${API_BASE}/sadmin/users`;

const EMPTY_FORM = {
  fullname: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  gender: "",
  birth_date: "",
  role: "customer",
};

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getPhotoUrl(photo) {
  if (!photo) return "";

  const value = String(photo).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${SERVER_ROOT}/${value.replace(/^\/+/, "")}`;
}

async function apiRequest(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Sesi login berakhir atau token tidak valid. Silakan login kembali."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Akses ditolak. Halaman ini khusus Super Admin."
      );
    }

    throw new Error(
      data.message || `Terjadi kesalahan (${response.status}).`
    );
  }

  return data;
}

function roleLabel(role) {
  const roles = {
    super_admin: "Super Admin",
    event_organizer: "Organizer",
    customer: "Customer",
  };

  return roles[role] || role || "-";
}

function roleStyle(role) {
  const styles = {
    super_admin: "border-amber-200 bg-amber-50 text-amber-700",
    event_organizer: "border-sky-200 bg-sky-50 text-sky-700",
    customer: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    styles[role] ||
    "border-slate-200 bg-slate-50 text-slate-700"
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function getRoleIcon(role) {
  if (role === "super_admin") return Crown;
  if (role === "event_organizer") return Briefcase;
  return User;
}

function ProfileAvatar({ user, size = "normal" }) {
  const [imageError, setImageError] = useState(false);

  const photoUrl = getPhotoUrl(user?.photo);

  const sizeClass =
    size === "large"
      ? "h-24 w-24 text-2xl"
      : size === "small"
      ? "h-9 w-9 text-[10px]"
      : "h-11 w-11 text-xs";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-700 ${sizeClass}`}
    >
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={user?.fullname || "Foto profil"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        getInitials(user?.fullname)
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");

  const [sortBy, setSortBy] = useState("fullname");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const loadUsers = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await apiRequest(USERS_URL);

      if (!Array.isArray(result.users)) {
        throw new Error(
          "Format data pengguna dari backend tidak sesuai. Backend harus mengembalikan properti users."
        );
      }

      setUsers(result.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const summary = useMemo(
    () => ({
      total: users.length,
      customers: users.filter(
        (user) => user.role === "customer"
      ).length,
      organizers: users.filter(
        (user) => user.role === "event_organizer"
      ).length,
      superAdmins: users.filter(
        (user) => user.role === "super_admin"
      ).length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        [
          user.fullname,
          user.username,
          user.email,
          user.phone,
        ].some((value) =>
          String(value || "").toLowerCase().includes(keyword)
        );

      const matchesRole =
        filterRole === "Semua" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const comparison = String(a[sortBy] || "").localeCompare(
        String(b[sortBy] || ""),
        "id",
        {
          sensitivity: "base",
          numeric: true,
        }
      );

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedUsers.length / itemsPerPage)
  );

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setModal({ type: "create" });
  };

  const openEdit = (user) => {
    setForm({
      fullname: user.fullname || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      gender: user.gender || "",
      birth_date: user.birth_date
        ? String(user.birth_date).slice(0, 10)
        : "",
      role: user.role || "customer",
    });

    setFormError("");
    setModal({ type: "edit", user });
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.fullname.trim() || !form.email.trim()) {
      setFormError("Nama lengkap dan email wajib diisi.");
      return;
    }

    if (modal.type === "create" && !form.password) {
      setFormError("Password wajib diisi.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }

    const payload = {
      fullname: form.fullname.trim(),
      username: form.username.trim() || null,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      gender: form.gender || null,
      birth_date: form.birth_date || null,
      role: form.role,
    };

    if (form.password) {
      payload.password = form.password;
    }

    setSaving(true);

    try {
      const isEdit = modal.type === "edit";

      const url = isEdit
        ? `${USERS_URL}/${modal.user.id}`
        : USERS_URL;

      const result = await apiRequest(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEdit) {
        if (result.user) {
          setUsers((prev) =>
            prev.map((user) =>
              String(user.id) === String(modal.user.id)
                ? { ...user, ...result.user }
                : user
            )
          );
        } else {
          await loadUsers(true);
        }
      } else {
        if (result.user) {
          setUsers((prev) => [result.user, ...prev]);
          setCurrentPage(1);
        } else {
          await loadUsers(true);
        }
      }

      setModal(null);
      setSuccess(
        result.message || "Data pengguna berhasil disimpan."
      );

      window.setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.role === "super_admin") {
      window.alert(
        "Akun Super Admin dilindungi dan tidak dapat dihapus."
      );
      return;
    }

    const confirmed = window.confirm(
      `Hapus akun ${user.fullname} dari database?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const result = await apiRequest(
        `${USERS_URL}/${user.id}`,
        {
          method: "DELETE",
        }
      );

      setUsers((prev) =>
        prev.filter(
          (item) => String(item.id) !== String(user.id)
        )
      );

      setSuccess(result.message || "Akun berhasil dihapus.");

      window.setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message);
    }
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (filterRole !== "Semua" ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRole("Semua");
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-w-0 text-[#0B1220]">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#0B1220] via-[#1B2942] to-[#2F3F63] p-6 shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
            <span>Master Data</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">
              Manajemen Users
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/80">
                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                User Management Console
              </div>

              <h1 className="mt-3 text-[26px] font-semibold text-white sm:text-[32px]">
                Manajemen Users
              </h1>

              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Kelola akun, informasi profil, dan hak akses
                seluruh pengguna TicketVerse.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => loadUsers(true)}
                disabled={refreshing || loading}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/[0.14] disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0B1220] transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Tambah User
              </button>
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
                Gagal memuat data
              </p>
              <p className="mt-0.5 break-words text-[12.5px] text-red-600">
                {error}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadUsers(true)}
              className="rounded-lg bg-red-600 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-2 text-red-600 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total User"
          value={summary.total}
          hint="Seluruh akun terdaftar"
          icon={Users}
          accent="slate"
        />

        <StatCard
          label="Customer"
          value={summary.customers}
          hint="Pengguna pembeli tiket"
          icon={User}
          accent="sky"
        />

        <StatCard
          label="Organizer"
          value={summary.organizers}
          hint="Penyelenggara event"
          icon={Briefcase}
          accent="emerald"
        />

        <StatCard
          label="Super Admin"
          value={summary.superAdmins}
          hint="Akses penuh sistem"
          icon={Crown}
          accent="amber"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                Daftar Pengguna
              </h2>

              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {loading
                  ? "Memuat data pengguna..."
                  : `Menampilkan ${sortedUsers.length} dari ${users.length} pengguna`}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <div className="relative w-full sm:w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama, username, email..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] outline-none focus:border-slate-400"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative">
                <Funnel className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 min-w-[160px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium outline-none"
                >
                  <option value="Semua">Semua Role</option>
                  <option value="customer">Customer</option>
                  <option value="event_organizer">
                    Organizer
                  </option>
                  <option value="super_admin">
                    Super Admin
                  </option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
            <RefreshCw className="h-7 w-7 animate-spin text-slate-700" />
            <p className="text-[13px] text-slate-500">
              Mengambil data pengguna dari server...
            </p>
          </div>
        )}

        {!loading && currentUsers.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <Users className="h-9 w-9 text-slate-300" />

            <h3 className="mt-4 text-[15px] font-semibold text-slate-900">
              {users.length === 0
                ? "Belum ada pengguna"
                : "Pengguna tidak ditemukan"}
            </h3>

            <p className="mt-1.5 max-w-sm text-[13px] text-slate-500">
              {users.length === 0
                ? "Tambahkan akun pengguna untuk mulai mengelola platform."
                : "Coba ubah kata kunci pencarian atau filter role."}
            </p>

            {users.length === 0 ? (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah User Pertama
              </button>
            ) : (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-lg bg-[#0B1220] px-4 py-2 text-[13px] font-semibold text-white"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {!loading && currentUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="w-12 px-5 py-3.5">No</th>

                  <th
                    onClick={() => toggleSort("fullname")}
                    className="cursor-pointer select-none px-5 py-3.5 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      Profil Pengguna
                      {sortBy === "fullname" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </span>
                  </th>

                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Telepon</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Tanggal Daftar</th>
                  <th className="px-5 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentUsers.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const protectedUser =
                    user.role === "super_admin";

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4 text-[12px] text-slate-400">
                        {(currentPage - 1) * itemsPerPage +
                          index +
                          1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-[210px] items-center gap-3">
                          <ProfileAvatar user={user} />

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                              {user.fullname || "-"}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              @{user.username || "-"}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="max-w-[200px] truncate">
                            {user.email || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                          <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                          {user.phone || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[10.5px] font-semibold ${roleStyle(
                            user.role
                          )}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[12px] text-slate-500">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Detail Profil"
                            onClick={() =>
                              setModal({
                                type: "detail",
                                user,
                              })
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            disabled={protectedUser}
                            onClick={() => openEdit(user)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Hapus"
                            disabled={protectedUser}
                            onClick={() => handleDelete(user)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedUsers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-6 py-4 sm:flex-row">
            <span className="text-[12px] text-slate-500">
              Menampilkan{" "}
              <strong className="text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-slate-900">
                {Math.min(
                  currentPage * itemsPerPage,
                  sortedUsers.length
                )}
              </strong>{" "}
              dari{" "}
              <strong className="text-slate-900">
                {sortedUsers.length}
              </strong>{" "}
              pengguna
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <span className="px-2 text-[12.5px] font-semibold">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                  {modal.type === "detail" ? (
                    <Eye className="h-4 w-4" />
                  ) : modal.type === "edit" ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Data Akun TicketVerse
                  </p>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    {modal.type === "create"
                      ? "Tambah Pengguna"
                      : modal.type === "edit"
                      ? "Edit Pengguna"
                      : "Profil Pengguna"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modal.type === "detail" ? (
              <div className="max-h-[calc(95vh-70px)] overflow-y-auto p-6">
                <div className="mb-6 flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
                  <ProfileAvatar
                    user={modal.user}
                    size="large"
                  />

                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {modal.user.fullname || "-"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    @{modal.user.username || "-"}
                  </p>

                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${roleStyle(
                      modal.user.role
                    )}`}
                  >
                    {(() => {
                      const Icon = getRoleIcon(modal.user.role);
                      return <Icon className="h-3.5 w-3.5" />;
                    })()}
                    {roleLabel(modal.user.role)}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <h3 className="text-[13px] font-semibold text-slate-800">
                    Informasi Profil
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail
                    icon={User}
                    label="Nama lengkap"
                    value={modal.user.fullname}
                  />

                  <Detail
                    icon={AtSign}
                    label="Username"
                    value={
                      modal.user.username
                        ? `@${modal.user.username}`
                        : "-"
                    }
                  />

                  <Detail
                    icon={Mail}
                    label="Email"
                    value={modal.user.email}
                  />

                  <Detail
                    icon={Phone}
                    label="Nomor telepon"
                    value={modal.user.phone}
                  />

                  <Detail
                    icon={VenusAndMars}
                    label="Jenis kelamin"
                    value={modal.user.gender}
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Tanggal lahir"
                    value={formatDate(modal.user.birth_date)}
                  />

                  <Detail
                    icon={ShieldCheck}
                    label="Role akun"
                    value={roleLabel(modal.user.role)}
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Tanggal daftar"
                    value={formatDate(modal.user.created_at)}
                  />

                  <Detail
                    icon={Layers}
                    label="ID pengguna"
                    value={modal.user.id}
                  />
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Foto Profil
                  </div>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    {modal.user.photo || "Pengguna belum memiliki foto profil."}
                  </p>
                </div>

                <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-9 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white hover:bg-[#1B2942]"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="max-h-[calc(95vh-70px)] overflow-y-auto p-6"
              >
                {formError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-[12px] leading-5 text-red-700">
                      {formError}
                    </p>
                  </div>
                )}

                {modal.type === "edit" && (
                  <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <ProfileAvatar user={modal.user} />

                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800">
                        Foto profil pengguna
                      </p>

                      <p className="mt-0.5 break-all text-[11px] text-slate-500">
                        {modal.user.photo || "Belum ada foto profil"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Nama lengkap" required>
                    <input
                      name="fullname"
                      value={form.fullname}
                      onChange={handleFormChange}
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Username">
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleFormChange}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Email" required>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      required
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label={
                      modal.type === "create"
                        ? "Password"
                        : "Password baru (opsional)"
                    }
                    required={modal.type === "create"}
                  >
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleFormChange}
                      required={modal.type === "create"}
                      minLength={8}
                      className={inputClass}
                      placeholder={
                        modal.type === "edit"
                          ? "Kosongkan jika tidak diubah"
                          : "Minimal 8 karakter"
                      }
                    />
                  </FormField>

                  <FormField label="Nomor telepon">
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Role akun">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                      className={inputClass}
                    >
                      <option value="customer">Customer</option>
                      <option value="event_organizer">
                        Organizer
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Jenis kelamin">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleFormChange}
                      className={inputClass}
                    >
                      <option value="">Tidak diisi</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </FormField>

                  <FormField label="Tanggal lahir">
                    <input
                      type="date"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handleFormChange}
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B1220] px-4 text-[13px] font-semibold text-white hover:bg-[#1B2942] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Menyimpan..."
                      : modal.type === "create"
                      ? "Buat Akun"
                      : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0B1220]/40 focus:ring-4 focus:ring-[#0B1220]/[0.06]";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "slate",
}) {
  const accents = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-[28px] font-semibold leading-none text-[#0B1220]">
            {value}
          </p>

          <p className="mt-1.5 text-[12px] text-slate-500">
            {hint}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            accents[accent] || accents.slate
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon className="h-3 w-3" />}
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-1.5 break-words text-[13px] font-semibold text-[#0B1220]">
        {value || "-"}
      </p>
    </div>
  );
}
