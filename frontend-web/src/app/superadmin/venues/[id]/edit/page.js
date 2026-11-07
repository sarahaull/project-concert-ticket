"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Save,
  Plus,
  X,
} from "lucide-react";

const STORAGE_KEY = "ticketverse_venues";

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [facilityInput, setFacilityInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const venue = saved.find(
        (item) => item.id === params.id
      );

      if (venue) {
        setForm({
          name: venue.name || "",
          type: venue.type || "",
          address: venue.address || "",
          city: venue.city || "",
          capacity: venue.capacity || "",
          status: venue.status || "Aktif",
          description: venue.description || "",
        });

        setFacilities(venue.facilities || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFacility = () => {
    const value = facilityInput.trim();

    if (!value) return;

    if (!facilities.includes(value)) {
      setFacilities((prev) => [...prev, value]);
    }

    setFacilityInput("");
  };

  const removeFacility = (facility) => {
    setFacilities((prev) =>
      prev.filter((item) => item !== facility)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.type ||
      !form.address ||
      !form.city ||
      !form.capacity
    ) {
      alert("Lengkapi data venue terlebih dahulu.");
      return;
    }

    setSaving(true);

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const updated = saved.map((venue) => {
        if (venue.id !== params.id) {
          return venue;
        }

        return {
          ...venue,
          name: form.name,
          type: form.type,
          address: form.address,
          city: form.city,
          capacity: Number(form.capacity),
          status: form.status,
          description: form.description,
          facilities,
        };
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      router.push(`/superadmin/venues/${params.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui venue.");
      setSaving(false);
    }
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

  if (!form) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">

        <Building2
          size={30}
          className="text-[#8795A7]"
        />

        <p className="mt-3 text-[12px] font-semibold text-[#112250]">
          Venue tidak ditemukan
        </p>

        <button
          onClick={() =>
            router.push("/superadmin/venues")
          }
          className="mt-4 flex h-9 items-center gap-2 rounded-xl bg-[#112250] px-4 text-[10px] font-semibold text-white"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>

      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-4">

        <button
          onClick={() =>
            router.push(`/superadmin/venues/${params.id}`)
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-[#F5F7FA]"
        >
          <ArrowLeft size={17} />
        </button>

        <div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8795A7]">
            Master Data / Venue / Edit
          </p>

          <h1 className="mt-1 text-[23px] font-semibold tracking-[-0.03em] text-[#112250]">
            Edit Venue
          </h1>

          <p className="mt-1 text-[11px] text-[#697F93]">
            Perbarui informasi venue.
          </p>

        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* INFORMASI */}

        <div className="rounded-2xl border border-[#DDE3EB] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

          <div className="border-b border-[#E8ECF1] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="text-[13px] font-semibold text-[#112250]">
                  Informasi Venue
                </h2>

                <p className="mt-0.5 text-[10px] text-[#8795A7]">
                  Perbarui data utama venue.
                </p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

            <InputField
              label="Nama Venue"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama venue"
              required
            />

            <div>

              <label className="mb-2 block text-[10px] font-semibold text-[#53657D]">
                Tipe Venue
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-white px-3 text-[11px] text-[#112250] outline-none focus:border-[#8BA7CF]"
              >
                <option value="">
                  Pilih tipe venue
                </option>

                <option value="Stadium">
                  Stadium
                </option>

                <option value="Convention Hall">
                  Convention Hall
                </option>

                <option value="Indoor Arena">
                  Indoor Arena
                </option>

                <option value="Outdoor">
                  Outdoor
                </option>

                <option value="Theater">
                  Theater
                </option>

                <option value="Hall">
                  Hall
                </option>

              </select>

            </div>

            <InputField
              label="Kota"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Kota"
              required
            />

            <InputField
              label="Kapasitas"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Kapasitas"
              required
            />

            <div className="md:col-span-2">

              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#53657D]">
                <MapPin size={13} />
                Alamat
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                required
                className="w-full resize-none rounded-xl border border-[#DCE2EA] px-3 py-3 text-[11px] text-[#112250] outline-none focus:border-[#8BA7CF]"
              />

            </div>

            <div className="md:col-span-2">

              <label className="mb-2 block text-[10px] font-semibold text-[#53657D]">
                Deskripsi
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-xl border border-[#DCE2EA] px-3 py-3 text-[11px] text-[#112250] outline-none focus:border-[#8BA7CF]"
              />

            </div>

          </div>

        </div>

        {/* FASILITAS */}

        <div className="rounded-2xl border border-[#DDE3EB] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

          <div className="border-b border-[#E8ECF1] px-6 py-5">

            <h2 className="text-[13px] font-semibold text-[#112250]">
              Fasilitas
            </h2>

            <p className="mt-1 text-[10px] text-[#8795A7]">
              Kelola fasilitas venue.
            </p>

          </div>

          <div className="p-6">

            <div className="flex gap-2">

              <input
                value={facilityInput}
                onChange={(e) =>
                  setFacilityInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFacility();
                  }
                }}
                placeholder="Tambah fasilitas..."
                className="h-10 flex-1 rounded-xl border border-[#DCE2EA] px-3 text-[11px] text-[#112250] outline-none focus:border-[#8BA7CF]"
              />

              <button
                type="button"
                onClick={addFacility}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-4 text-[10px] font-semibold text-white"
              >
                <Plus size={14} />
                Tambah
              </button>

            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              {facilities.map((facility) => (
                <div
                  key={facility}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F1F4F8] px-3 py-2 text-[10px] font-medium text-[#53657D]"
                >

                  {facility}

                  <button
                    type="button"
                    onClick={() =>
                      removeFacility(facility)
                    }
                    className="text-[#8795A7] hover:text-[#B45353]"
                  >
                    <X size={13} />
                  </button>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* STATUS */}

        <div className="rounded-2xl border border-[#DDE3EB] bg-white p-6 shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

          <label className="mb-2 block text-[10px] font-semibold text-[#53657D]">
            Status Venue
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-11 w-full max-w-[400px] rounded-xl border border-[#DCE2EA] bg-white px-3 text-[11px] text-[#112250] outline-none focus:border-[#8BA7CF]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">
              Tidak Aktif
            </option>
          </select>

        </div>

        {/* ACTION */}

        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={() =>
              router.push(`/superadmin/venues/${params.id}`)
            }
            className="h-10 rounded-xl border border-[#DCE2EA] bg-white px-5 text-[10px] font-semibold text-[#697F93] transition hover:bg-[#F5F7FA]"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#112250] px-5 text-[10px] font-semibold text-white transition hover:bg-[#1B3560] disabled:opacity-50"
          >
            <Save size={14} />

            {saving ? "Menyimpan..." : "Simpan Perubahan"}

          </button>

        </div>

      </form>

    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-[10px] font-semibold text-[#53657D]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-[#DCE2EA] bg-white px-3 text-[11px] text-[#112250] outline-none placeholder:text-[#A0AAB7] focus:border-[#8BA7CF]"
      />

    </div>
  );
}