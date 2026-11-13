
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const ARTIST_ENDPOINT = `${API_URL}/api/artists`;

const initialForm = {
  artist_name: "",
  photo: "",
  description: "",
  instagram: "",
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Request gagal (${response.status})`
    );
  }

  if (result.success === false) {
    throw new Error(result.message || "Permintaan gagal");
  }

  return result;
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DataArtis() {
  const [artists, setArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [detailArtist, setDetailArtist] = useState(null);

  const [form, setForm] = useState(initialForm);

  // =====================================================
  // GET ARTISTS
  // =====================================================

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(ARTIST_ENDPOINT);

      setArtists(
        Array.isArray(result.artists) ? result.artists : []
      );
    } catch (err) {
      setError(err.message || "Gagal mengambil data artis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredArtists = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return artists.filter((artist) => {
      return (
        artist.artist_name?.toLowerCase().includes(keyword) ||
        artist.description?.toLowerCase().includes(keyword) ||
        artist.instagram?.toLowerCase().includes(keyword)
      );
    });
  }, [artists, searchTerm]);

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const handleAdd = () => {
    setSelectedArtist(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleEdit = (artist) => {
    setSelectedArtist(artist);

    setForm({
      artist_name: artist.artist_name || "",
      photo: artist.photo || "",
      description: artist.description || "",
      instagram: artist.instagram || "",
    });

    setError("");
    setShowModal(true);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.artist_name.trim()) {
      setError("Nama artis wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        artist_name: form.artist_name.trim(),
        photo: form.photo.trim() || null,
        description: form.description.trim() || null,
        instagram: form.instagram.trim() || null,
      };

      if (selectedArtist) {
        await apiRequest(
          `${ARTIST_ENDPOINT}/${selectedArtist.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess("Data artis berhasil diperbarui.");
      } else {
        await apiRequest(ARTIST_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Artis berhasil ditambahkan.");
      }

      setShowModal(false);
      setSelectedArtist(null);
      setForm(initialForm);

      await fetchArtists();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data artis.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (artist) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus artis "${artist.artist_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest(`${ARTIST_ENDPOINT}/${artist.id}`, {
        method: "DELETE",
      });

      setSuccess("Artis berhasil dihapus.");

      if (detailArtist?.id === artist.id) {
        setDetailArtist(null);
      }

      await fetchArtists();
    } catch (err) {
      setError(err.message || "Gagal menghapus artis.");
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setSelectedArtist(null);
    setForm(initialForm);
    setError("");
  };

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}

      <section className="relative overflow-hidden rounded-2xl px-6 py-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <Link
              href="/superadmin"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#8aa0c0] hover:text-white mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Data <span className="text-[#8ab4f8]">Artis</span>
            </h1>

            <p className="mt-2 text-sm text-[#8aa0c0] max-w-xl">
              Kelola data artis dan performer yang terdaftar
              di platform TicketVerse.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-sm font-bold px-5 py-3 rounded-xl hover:shadow-lg transition"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Artis
          </button>
        </div>
      </section>

      {/* ALERT */}

      {error && !showModal && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircleIcon className="w-5 h-5 shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          icon={MicrophoneIcon}
          title="Total Artis"
          value={artists.length}
        />

        <SummaryCard
          icon={MusicalNoteIcon}
          title="Hasil Pencarian"
          value={filteredArtists.length}
        />
      </section>

      {/* TABLE */}

      <section className="rounded-2xl bg-white border border-[#e0e8f0]/60 shadow-sm overflow-hidden">

        <div className="p-5 sm:p-6 border-b border-[#e0e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0a1628]">
              Daftar Artis
            </h2>

            <p className="text-xs text-[#7e91b2] mt-1">
              Menampilkan {filteredArtists.length} dari {artists.length} artis
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />

              <input
                type="text"
                placeholder="Cari nama, deskripsi, Instagram..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-xs text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20"
              />
            </div>

            <button
              onClick={fetchArtists}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#d0d8e4] text-xs font-semibold text-[#4a6b9a] hover:bg-[#f8fafc] disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e0e8f0]">
                <th className="py-4 px-5 text-[10px] font-bold text-[#7e91b2] uppercase">
                  Artis
                </th>

                <th className="py-4 px-5 text-[10px] font-bold text-[#7e91b2] uppercase">
                  Deskripsi
                </th>

                <th className="py-4 px-5 text-[10px] font-bold text-[#7e91b2] uppercase">
                  Instagram
                </th>

                <th className="py-4 px-5 text-[10px] font-bold text-[#7e91b2] uppercase">
                  Tanggal Dibuat
                </th>

                <th className="py-4 px-5 text-[10px] font-bold text-[#7e91b2] uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e0e8f0]/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-[#5a7aad]" />
                    <p className="text-xs text-[#7e91b2] mt-3">
                      Mengambil data artis dari server...
                    </p>
                  </td>
                </tr>
              ) : filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <tr
                    key={artist.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#e6f0fa] border border-[#d0d8e4] shrink-0 flex items-center justify-center">
                          {artist.photo ? (
                            <img
                              src={artist.photo}
                              alt={artist.artist_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MicrophoneIcon className="w-5 h-5 text-[#5a7aad]" />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#0a1628]">
                            {artist.artist_name}
                          </p>
                          <p className="text-[10px] text-[#7e91b2]">
                            ID: {artist.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <p className="text-xs text-[#64748b] max-w-[240px] line-clamp-2">
                        {artist.description || "-"}
                      </p>
                    </td>

                    <td className="py-4 px-5">
                      {artist.instagram ? (
                        <a
                          href={
                            artist.instagram.startsWith("http")
                              ? artist.instagram
                              : `https://instagram.com/${artist.instagram.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#4a6b9a] hover:underline"
                        >
                          {artist.instagram}
                        </a>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">-</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-xs text-[#64748b] whitespace-nowrap">
                      {formatDate(artist.created_at)}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <ActionButton
                          title="Detail"
                          onClick={() => setDetailArtist(artist)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </ActionButton>

                        <ActionButton
                          title="Edit"
                          onClick={() => handleEdit(artist)}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </ActionButton>

                        <ActionButton
                          title="Hapus"
                          danger
                          onClick={() => handleDelete(artist)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <MicrophoneIcon className="w-9 h-9 mx-auto text-[#cbd5e1]" />
                    <p className="text-sm font-semibold text-[#64748b] mt-3">
                      Tidak ada data artis
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      Coba ubah kata kunci pencarian atau tambahkan artis baru.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-[#e0e8f0] text-xs text-[#7e91b2]">
          Total {filteredArtists.length} data artis
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0a1628]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-5 border-b border-[#e0e8f0]">
              <div>
                <h2 className="text-lg font-bold text-[#0a1628]">
                  {selectedArtist ? "Edit Artis" : "Tambah Artis"}
                </h2>

                <p className="text-xs text-[#7e91b2] mt-1">
                  Isi informasi artis sesuai data yang akan disimpan.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-[#f1f5f9]"
              >
                <XMarkIcon className="w-5 h-5 text-[#64748b]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <FormField label="Nama Artis" required>
                <input
                  type="text"
                  name="artist_name"
                  value={form.artist_name}
                  onChange={handleChange}
                  placeholder="Masukkan nama artis"
                  required
                  className="form-input"
                />
              </FormField>

              <FormField label="URL Foto">
                <input
                  type="url"
                  name="photo"
                  value={form.photo}
                  onChange={handleChange}
                  placeholder="https://example.com/foto.jpg"
                  className="form-input"
                />
              </FormField>

              {form.photo && (
                <div className="flex items-center gap-3">
                  <img
                    src={form.photo}
                    alt="Preview foto artis"
                    className="w-16 h-16 rounded-xl object-cover border border-[#e0e8f0]"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-xs text-[#7e91b2]">
                    Preview foto artis
                  </p>
                </div>
              )}

              <FormField label="Deskripsi">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Masukkan deskripsi artis"
                  className="form-input resize-none"
                />
              </FormField>

              <FormField label="Instagram">
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="@username atau URL Instagram"
                  className="form-input"
                />
              </FormField>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-[#e0e8f0]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-[#d0d8e4] text-sm font-semibold text-[#64748b]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#13213b] text-white text-sm font-semibold hover:bg-[#1b2f4e] disabled:opacity-50"
                >
                  {submitting
                    ? "Menyimpan..."
                    : selectedArtist
                    ? "Simpan Perubahan"
                    : "Tambah Artis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}

      {detailArtist && (
        <div className="fixed inset-0 z-50 bg-[#0a1628]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e0e8f0]">
              <h2 className="font-bold text-[#0a1628]">
                Detail Artis
              </h2>

              <button
                onClick={() => setDetailArtist(null)}
                className="p-2 rounded-lg hover:bg-[#f1f5f9]"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-[#e6f0fa] flex items-center justify-center">
                {detailArtist.photo ? (
                  <img
                    src={detailArtist.photo}
                    alt={detailArtist.artist_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MicrophoneIcon className="w-10 h-10 text-[#5a7aad]" />
                )}
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#0a1628]">
                {detailArtist.artist_name}
              </h3>

              <p className="text-xs text-[#7e91b2] mt-1">
                ID: {detailArtist.id}
              </p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <DetailRow
                label="Instagram"
                value={detailArtist.instagram || "-"}
              />

              <DetailRow
                label="Tanggal Dibuat"
                value={formatDate(detailArtist.created_at)}
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  Deskripsi
                </p>
                <p className="text-sm text-[#475569] mt-1 whitespace-pre-wrap">
                  {detailArtist.description || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid #d0d8e4;
          border-radius: 10px;
          background: #f8fafc;
          color: #0a1628;
          font-size: 13px;
          outline: none;
        }

        .form-input:focus {
          border-color: #8ab4f8;
          box-shadow: 0 0 0 3px rgba(138, 180, 248, 0.15);
        }
      `}</style>
    </div>
  );
}

// =====================================================
// COMPONENTS
// =====================================================

function SummaryCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white border border-[#e0e8f0]/60 p-5 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#e6f0fa] flex items-center justify-center text-[#4a6b9a]">
        <Icon className="w-6 h-6" />
      </div>

      <div>
        <p className="text-[11px] font-medium text-[#7e91b2] uppercase tracking-wider">
          {title}
        </p>

        <p className="text-xl font-bold text-[#0a1628] mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionButton({ children, title, onClick, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-[#7e91b2] hover:text-[#0a1628] hover:bg-[#f0f5fc]"
      }`}
    >
      {children}
    </button>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#334155] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#e0e8f0] pb-3">
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <span className="text-xs font-semibold text-[#334155] text-right break-all">
        {value}
      </span>
    </div>
  );
}
