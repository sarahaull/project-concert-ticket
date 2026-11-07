"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Lock,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Trash2,
  LogOut,
  ChevronRight,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const USER_API = `${API_BASE}/api/users`;
const AUTH_API = `${API_BASE}/api/auth`;

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Gagal membaca user dari localStorage:", error);
    return null;
  }
}

const DEFAULT_NOTIF_SETTINGS = {
  emailTicket: true,
  emailPayment: true,
  emailPromo: false,
  pushTicket: true,
  pushPayment: true,
  pushPromo: false,
  pushNews: false,
};

const SETTINGS_STORAGE_KEY = "ticketverse-notification-settings";

export default function SettingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState(
    DEFAULT_NOTIF_SETTINGS
  );

  const [deleteConfirm, setDeleteConfirm] = useState("");

  const tabs = [
    {
      value: "profile",
      label: "Profil",
      icon: User,
      description: "Informasi akun kamu",
    },
    {
      value: "password",
      label: "Keamanan",
      icon: Lock,
      description: "Kata sandi & akses",
    },
    {
      value: "notifications",
      label: "Notifikasi",
      icon: Bell,
      description: "Preferensi pemberitahuan",
    },
    {
      value: "danger",
      label: "Zona Berbahaya",
      icon: Shield,
      description: "Kelola akun & data",
    },
  ];

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = getStoredUser();

      if (!token || !user?.id) {
        router.replace("/login");
        return;
      }

      setProfile({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setNotifications({ ...DEFAULT_NOTIF_SETTINGS, ...parsed });
        }
      } catch (parseError) {
        console.error("LOAD SETTINGS ERROR:", parseError);
      }
    } catch (err) {
      console.error("LOAD PROFILE ERROR:", err);
      setError(
        err?.message || "Terjadi kesalahan saat memuat profil."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profile.fullname.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!profile.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(profile.email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = getStoredUser();

      if (!token || !user?.id) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${USER_API}/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            fullname: profile.fullname.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Gagal menyimpan perubahan profil."
        );
      }

      const updatedUser = {
        ...user,
        fullname: profile.fullname.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || null,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      showSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      console.error("SAVE PROFILE ERROR:", err);
      setError(err?.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (
      !password.current ||
      !password.new ||
      !password.confirm
    ) {
      setError("Semua kolom password wajib diisi.");
      return;
    }

    if (password.new.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (password.new !== password.confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.current === password.new) {
      setError(
        "Password baru harus berbeda dari password saat ini."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = getStoredUser();

      if (!token || !user?.id) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${AUTH_API}/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            current_password: password.current,
            new_password: password.new,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Gagal memperbarui password."
        );
      }

      setPassword({ current: "", new: "", confirm: "" });
      showSuccess("Password berhasil diperbarui.");
    } catch (err) {
      console.error("SAVE PASSWORD ERROR:", err);
      setError(err?.message || "Gagal memperbarui password.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications((current) => {
      const next = { ...current, [key]: !current[key] };
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch (err) {
        console.error("SAVE NOTIFICATION SETTINGS ERROR:", err);
      }
      return next;
    });
  };

  const handleLogoutAllDevices = () => {
    if (
      !window.confirm(
        "Logout dari semua perangkat? Kamu perlu login ulang."
      )
    ) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm.trim().toUpperCase() !== "HAPUS") {
      setError(
        'Ketik kata "HAPUS" pada kolom konfirmasi untuk melanjutkan.'
      );
      return;
    }

    setError(
      "Penghapusan akun memerlukan verifikasi manual. Silakan hubungi tim support untuk melanjutkan proses ini."
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D8D0C4]/40 bg-white shadow-lg">
            <Loader2
              size={26}
              className="animate-spin text-[#112250]"
            />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#112250]">
            Memuat pengaturan...
          </h2>
          <p className="mt-1 text-sm text-[#9B907F]">
            Mengambil preferensi akun kamu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <section className="relative isolate mb-6 overflow-hidden rounded-2xl border border-[#D8D0C4]/40 bg-gradient-to-br from-[#112250] via-[#1A326A] to-[#3B507D] shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,194,122,0.15),transparent_50%)]" />

        <div className="relative w-full px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C27A]">
                <Sparkles size={14} />
                Pengaturan Akun
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Pengaturan
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Kelola profil, keamanan akun, dan preferensi
                notifikasi kamu di TicketVerse.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
              <SettingsIcon className="h-4 w-4" />
              <span>Akun Aktif</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm font-medium">
            {successMessage}
          </div>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-4">
        <aside className="lg:col-span-1 lg:sticky lg:top-24">
          <nav className="space-y-1.5 rounded-2xl border border-[#D8D0C4]/40 bg-white p-3 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${
                    active
                      ? "bg-gradient-to-r from-[#112250] to-[#3B507D] text-white shadow-sm"
                      : "text-[#3B507D] hover:bg-[#112250]/5"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-[#F7F8FA] text-[#3B507D]"
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {tab.label}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[11px] ${
                        active
                          ? "text-white/70"
                          : "text-[#9B907F]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>

                  <ChevronRight
                    size={15}
                    className={`shrink-0 ${
                      active ? "text-white" : "text-[#9B907F]"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-5 lg:col-span-3">
          {activeTab === "profile" && (
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-start gap-3 border-b border-[#D8D0C4]/30 pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#3B507D]">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#112250]">
                    Informasi Profil
                  </h2>
                  <p className="mt-1 text-sm text-[#9B907F]">
                    Perbarui informasi dasar akun kamu.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <FormField
                  icon={<User size={18} />}
                  label="Nama Lengkap"
                  type="text"
                  value={profile.fullname}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      fullname: value,
                    }))
                  }
                  placeholder="Masukkan nama lengkap"
                />

                <FormField
                  icon={<Mail size={18} />}
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                  placeholder="nama@email.com"
                />

                <FormField
                  icon={<Phone size={18} />}
                  label="Nomor Telepon"
                  type="tel"
                  value={profile.phone}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#D8D0C4]/30 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form
              onSubmit={handleSavePassword}
              className="rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-start gap-3 border-b border-[#D8D0C4]/30 pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#3B507D]">
                  <Lock size={21} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#112250]">
                    Keamanan Akun
                  </h2>
                  <p className="mt-1 text-sm text-[#9B907F]">
                    Ganti password secara berkala untuk keamanan
                    akun.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <PasswordField
                  label="Password Saat Ini"
                  value={password.current}
                  onChange={(value) =>
                    setPassword((current) => ({
                      ...current,
                      current: value,
                    }))
                  }
                  visible={showPassword.current}
                  onToggleVisible={() =>
                    setShowPassword((current) => ({
                      ...current,
                      current: !current.current,
                    }))
                  }
                  placeholder="Masukkan password saat ini"
                />

                <PasswordField
                  label="Password Baru"
                  value={password.new}
                  onChange={(value) =>
                    setPassword((current) => ({
                      ...current,
                      new: value,
                    }))
                  }
                  visible={showPassword.new}
                  onToggleVisible={() =>
                    setShowPassword((current) => ({
                      ...current,
                      new: !current.new,
                    }))
                  }
                  placeholder="Minimal 8 karakter"
                  hint="Gunakan kombinasi huruf, angka, dan simbol."
                />

                <PasswordField
                  label="Konfirmasi Password Baru"
                  value={password.confirm}
                  onChange={(value) =>
                    setPassword((current) => ({
                      ...current,
                      confirm: value,
                    }))
                  }
                  visible={showPassword.confirm}
                  onToggleVisible={() =>
                    setShowPassword((current) => ({
                      ...current,
                      confirm: !current.confirm,
                    }))
                  }
                  placeholder="Ketik ulang password baru"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#D8D0C4]/30 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Perbarui Password
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg sm:p-6">
                <div className="flex items-start gap-3 border-b border-[#D8D0C4]/30 pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#3B507D]">
                    <Mail size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#112250]">
                      Notifikasi Email
                    </h2>
                    <p className="mt-1 text-sm text-[#9B907F]">
                      Pilih email yang ingin kamu terima.
                    </p>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-[#D8D0C4]/30">
                  <ToggleRow
                    title="Tiket & Pemesanan"
                    description="Konfirmasi pembelian dan penerbitan tiket."
                    checked={notifications.emailTicket}
                    onChange={() =>
                      handleToggleNotification("emailTicket")
                    }
                  />

                  <ToggleRow
                    title="Pembayaran"
                    description="Status pembayaran dan pengingat transaksi."
                    checked={notifications.emailPayment}
                    onChange={() =>
                      handleToggleNotification("emailPayment")
                    }
                  />

                  <ToggleRow
                    title="Promo & Penawaran"
                    description="Promo eksklusif dan diskon tiket pilihan."
                    checked={notifications.emailPromo}
                    onChange={() =>
                      handleToggleNotification("emailPromo")
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#D8D0C4]/40 bg-white p-5 shadow-lg sm:p-6">
                <div className="flex items-start gap-3 border-b border-[#D8D0C4]/30 pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112250]/5 text-[#3B507D]">
                    <Bell size={21} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#112250]">
                      Notifikasi Push
                    </h2>
                    <p className="mt-1 text-sm text-[#9B907F]">
                      Pemberitahuan real-time di perangkat kamu.
                    </p>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-[#D8D0C4]/30">
                  <ToggleRow
                    title="Tiket & Pemesanan"
                    description="Update status pemesanan secara langsung."
                    checked={notifications.pushTicket}
                    onChange={() =>
                      handleToggleNotification("pushTicket")
                    }
                  />

                  <ToggleRow
                    title="Pembayaran"
                    description="Notifikasi saat pembayaran dikonfirmasi."
                    checked={notifications.pushPayment}
                    onChange={() =>
                      handleToggleNotification("pushPayment")
                    }
                  />

                  <ToggleRow
                    title="Promo & Penawaran"
                    description="Promo menarik yang tersedia hari ini."
                    checked={notifications.pushPromo}
                    onChange={() =>
                      handleToggleNotification("pushPromo")
                    }
                  />

                  <ToggleRow
                    title="Berita & Update"
                    description="Informasi fitur baru dan acara khusus."
                    checked={notifications.pushNews}
                    onChange={() =>
                      handleToggleNotification("pushNews")
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-lg sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <LogOut size={21} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-base font-bold text-[#112250]">
                      Logout dari Semua Perangkat
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#3B507D]/80">
                      Keluar dari semua sesi aktif di perangkat lain.
                      Kamu perlu login ulang setelahnya.
                    </p>

                    <button
                      type="button"
                      onClick={handleLogoutAllDevices}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
                    >
                      <LogOut size={16} />
                      Logout Semua Perangkat
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-lg sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Trash2 size={21} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-base font-bold text-[#112250]">
                      Hapus Akun
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#3B507D]/80">
                      Tindakan ini permanen. Semua data akun, tiket,
                      dan riwayat transaksi akan dihapus dan tidak
                      dapat dipulihkan.
                    </p>

                    <div className="mt-4">
                      <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9B907F]">
                        Ketik{" "}
                        <span className="text-rose-600">HAPUS</span>{" "}
                        untuk konfirmasi
                      </label>

                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) =>
                          setDeleteConfirm(e.target.value)
                        }
                        placeholder="HAPUS"
                        className="mt-2 w-full rounded-xl border border-[#D8D0C4]/50 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
                    >
                      <Trash2 size={16} />
                      Hapus Akun Saya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FormField({
  icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9B907F]">
        <span className="text-[#3B507D]">{icon}</span>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#D8D0C4]/50 bg-[#F7F8FA] px-4 py-3 text-sm font-semibold text-[#112250] outline-none transition placeholder:font-normal placeholder:text-[#9B907F] focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
      />

      {hint && (
        <p className="mt-1.5 text-xs text-[#9B907F]">{hint}</p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  hint,
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9B907F]">
        <Lock size={12} className="text-[#3B507D]" />
        {label}
      </label>

      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#D8D0C4]/50 bg-[#F7F8FA] px-4 py-3 pr-12 text-sm font-semibold text-[#112250] outline-none transition placeholder:font-normal placeholder:text-[#9B907F] focus:border-[#112250] focus:bg-white focus:ring-4 focus:ring-[#112250]/10"
        />

        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9B907F] transition hover:bg-[#112250]/5 hover:text-[#112250]"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-[#9B907F]">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-2 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#112250]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#9B907F]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-[#112250]" : "bg-[#D8D0C4]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}