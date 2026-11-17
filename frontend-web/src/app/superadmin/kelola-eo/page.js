"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  Building2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Globe,
  CalendarDays,
  X,
  Loader2,
  FileText,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

function InstagramIcon({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "").replace(/\/api$/, "");

const API_ENDPOINT = `${API_URL}/api/organizer`;

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatType = (type) => {
  const types = {
    company: "Perusahaan",
    community: "Komunitas",
    individual: "Individu",
  };
  return types[type] || type || "-";
};

const formatStatus = (status) => {
  const statuses = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return statuses[status] || status;
};

export default function OrganizerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectApplication, setRejectApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_ENDPOINT}/applications?status=${activeStatus}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil daftar pengajuan EO.");
      }
      setApplications(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return applications;
    return applications.filter((item) =>
      [item.fullname, item.username, item.email, item.organization_name, item.responsible_name, item.organization_type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [applications, search]);

  const handleApprove = async (application) => {
    const confirmed = window.confirm(`Setujui pengajuan "${application.organization_name}" dari ${application.fullname}?`);
    if (!confirmed) return;
    await submitReview(application.id, "approved");
  };

  const openRejectModal = (application) => {
    setRejectApplication(application);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }
    await submitReview(rejectApplication.id, "rejected", rejectionReason.trim());
    setRejectApplication(null);
    setRejectionReason("");
  };

  const submitReview = async (id, decision, reason = "") => {
    setProcessingId(id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_ENDPOINT}/applications/${id}/review`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          decision,
          ...(decision === "rejected" ? { rejection_reason: reason } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memproses pengajuan.");
      }
      setSuccess(result.message || "Pengajuan berhasil diproses.");
      setSelectedApplication(null);
      await fetchApplications();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { value: "pending", label: "Menunggu", icon: Clock3 },
    { value: "approved", label: "Disetujui", icon: CheckCircle2 },
    { value: "rejected", label: "Ditolak", icon: XCircle },
    { value: "all", label: "Semua", icon: FileText },
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800">
      
      {/* HEADER HERO BANNER (Konsisten dengan Validasi E-Ticket) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-[#0f172a] p-6 sm:p-8 shadow-md"
      >
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link 
              href="/superadmin/dashboard" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={14} />
              KEMBALI KE DASHBOARD
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Kelola Event Organizer
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-lg">
              Tinjau, setujui, atau tolak pendaftaran akun Event Organizer TicketVerse.
            </p>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>
      </motion.div>

      {/* NOTIFIKASI */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-800 shadow-sm"
          >
            <AlertCircle size={18} className="shrink-0 text-slate-600" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-slate-400 hover:text-slate-900 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0f172a] p-4 text-sm text-white shadow-sm"
          >
            <CheckCircle2 size={18} className="shrink-0 text-slate-300" />
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KARTU RINGKASAN (TABS) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = activeStatus === tab.value;
          return (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                active
                  ? "border-[#0f172a] bg-[#0f172a] text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`rounded-lg p-2 ${active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {tab.label}
                </p>
                <p className={`text-xs mt-0.5 ${active ? "text-slate-300" : "text-slate-400"}`}>
                  {active ? "Filter aktif" : "Klik untuk filter"}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* TABEL DATA */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Pengajuan</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {filteredApplications.length} data ditemukan
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau organisasi..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 size={28} className="animate-spin text-[#0f172a]" />
            <p className="mt-3 text-sm font-medium">Memuat data pengajuan...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-24 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-2">
              <Building2 size={32} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 text-base">Tidak ada data</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Tidak ada pengajuan EO yang sesuai dengan filter atau pencarian saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Pendaftar</th>
                  <th className="px-5 py-3.5 font-semibold">Organisasi</th>
                  <th className="px-5 py-3.5 font-semibold">Jenis</th>
                  <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 text-sm">{item.fullname}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 text-sm">{item.organization_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.responsible_name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatType(item.organization_type)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${
                          item.status === "approved"
                            ? "bg-[#0f172a] text-white border-[#0f172a]"
                            : item.status === "rejected"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedApplication(item)}
                          title="Lihat Detail"
                          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={processingId === item.id}
                              title="Setujui"
                              className="rounded-md bg-[#0f172a] p-1.5 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                              {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            </button>
                            <button
                              onClick={() => openRejectModal(item)}
                              disabled={processingId === item.id}
                              title="Tolak"
                              className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* MODAL DETAIL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5 z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Detail Pengajuan
                </h2>
                <p className="text-sm text-slate-500">Informasi pendaftaran Event Organizer</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Organisasi
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedApplication.organization_name}
                </h3>
                <div className="mt-2 text-sm text-slate-600">
                  Tipe: {formatType(selectedApplication.organization_type)}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Informasi Pendaftar
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailItem icon={UserRound} label="Nama Lengkap" value={selectedApplication.fullname} />
                  <DetailItem icon={Mail} label="Email" value={selectedApplication.email} />
                  <DetailItem icon={Phone} label="Telepon" value={selectedApplication.phone} />
                  <DetailItem icon={UserRound} label="Penanggung Jawab" value={selectedApplication.responsible_name} />
                  <DetailItem icon={CalendarDays} label="Tanggal Pengajuan" value={formatDate(selectedApplication.created_at)} />
                  <DetailItem icon={MapPin} label="Alamat" value={selectedApplication.address} />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Deskripsi
                </h3>
                <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {selectedApplication.description || "Tidak ada deskripsi."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={InstagramIcon} label="Instagram" value={selectedApplication.instagram} />
                <DetailItem icon={Globe} label="Website" value={selectedApplication.website} />
              </div>

              {selectedApplication.rejection_reason && (
                <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                  <p className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <AlertCircle size={16} /> Alasan Penolakan
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedApplication.rejection_reason}</p>
                </div>
              )}

              {selectedApplication.status === "pending" && (
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                  <button
                    onClick={() => handleApprove(selectedApplication)}
                    disabled={processingId === selectedApplication.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    {processingId === selectedApplication.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      openRejectModal(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <XCircle size={16} />
                    Tolak
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL REJECT */}
      {rejectApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Tolak Pengajuan</h2>
              <button
                onClick={() => setRejectApplication(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Pengajuan dari <strong className="text-slate-900">{rejectApplication.organization_name}</strong> akan ditolak. Harap berikan alasan yang jelas.
            </p>

            <label className="mt-5 block text-sm font-bold text-slate-900">Alasan Penolakan</label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Informasi legalitas organisasi belum lengkap..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition-all resize-none"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRejectApplication(null)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === rejectApplication.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {processingId === rejectApplication.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Tolak
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-900">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}