"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewVenuePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    capacity: "",
    status: "Aktif",
    description: "",
  });

  const [facilities, setFacilities] = useState([]);
  const [facilityInput, setFacilityInput] = useState("");
  const [saving, setSaving] = useState(false);

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

    if (facilities.includes(value)) {
      setFacilityInput("");
      return;
    }

    setFacilities((prev) => [...prev, value]);
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
      const saved =
        JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

      const newVenue = {
        id: `VEN-${String(Date.now()).slice(-6)}`,
        name: form.name,
        type: form.type,
        address: form.address,
        city: form.city,
        capacity: Number(form.capacity),
        status: form.status,
        description: form.description,
        facilities,
        createdAt: new Date()
          .toISOString()
          .split("T")[0],
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...saved, newVenue])
      );

      router.push("/superadmin/venues");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan venue.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-4">

        <button
          onClick={() =>
            router.push("/superadmin/venues")
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE2EA] bg-white text-[#697F93] transition hover:bg-[#F5F7FA] hover:text-[#112250]"
        >
          <ArrowLeft size={17} />
        </button>

        <div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8795A7]">
            Master Data / Venue
          </p>

          <h1 className="mt-1 text-[23px] font-semibold tracking-[-0.03em] text-[#112250]">
            Tambah Venue
          </h1>

          <p className="mt-1 text-[11px] text-[#697F93]">
            Tambahkan lokasi baru yang dapat digunakan untuk event.
          </p>

        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* INFORMASI UTAMA */}

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
                  Data utama venue.
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
              placeholder="Contoh: Gelora Bung Karno"
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
              placeholder="Contoh: Jakarta"
              required
            />

            <InputField
              label="Kapasitas"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Contoh: 50000"
              required
            />

            <div className="md:col-span-2">

              <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#53657D]">
                <MapPin size={13} />
                Alamat Venue
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Masukkan alamat lengkap venue..."
                className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-white px-3 py-3 text-[11px] text-[#112250] outline-none placeholder:text-[#A0AAB7] focus:border-[#8BA7CF]"
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
                placeholder="Deskripsi singkat mengenai venue..."
                className="w-full resize-none rounded-xl border border-[#DCE2EA] bg-white px-3 py-3 text-[11px] text-[#112250] outline-none placeholder:text-[#A0AAB7] focus:border-[#8BA7CF]"
              />

            </div>

          </div>

        </div>

        {/* FASILITAS */}

        <div className="rounded-2xl border border-[#DDE3EB] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

          <div className="border-b border-[#E8ECF1] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                <Users size={18} />
              </div>

              <div>
                <h2 className="text-[13px] font-semibold text-[#112250]">
                  Fasilitas
                </h2>

                <p className="mt-0.5 text-[10px] text-[#8795A7]">
                  Tambahkan fasilitas yang tersedia.
                </p>
              </div>

            </div>

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
                placeholder="Contoh: Parking Area"
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

            {facilities.length > 0 && (
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
            )}

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

        <div className="flex items-center justify-end gap-2">

          <button
            type="button"
            onClick={() =>
              router.push("/superadmin/venues")
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

            {saving ? "Menyimpan..." : "Simpan Venue"}
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