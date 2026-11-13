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
  Sparkles,
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
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

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
        createdAt: new Date().toISOString().split("T")[0],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, newVenue]));

      router.push("/superadmin/venues");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan venue.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
      
      {/* HEADER */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => router.push("/superadmin/venues")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:text-indigo-600"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            <Building2 size={14} />
            Master Data / Venue
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#112250] md:text-3xl">
            Tambah Venue Baru
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Tambahkan lokasi baru yang dapat digunakan untuk berbagai event.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* INFORMASI UTAMA */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112250]">Informasi Venue</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Lengkapi data utama mengenai lokasi venue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <InputField
              label="Nama Venue"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Gelora Bung Karno"
              required
            />

            <div>
              <label className="mb-2 block text-xs font-bold text-[#112250]">
                Tipe Venue <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#112250] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Pilih tipe venue</option>
                <option value="Stadium">Stadium</option>
                <option value="Convention Hall">Convention Hall</option>
                <option value="Indoor Arena">Indoor Arena</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Theater">Theater</option>
                <option value="Hall">Hall</option>
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
              label="Kapasitas (Orang)"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Contoh: 50000"
              required
            />

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-xs font-bold text-[#112250]">
                <MapPin size={15} className="text-indigo-500" />
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Masukkan alamat lengkap venue..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-[#112250] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold text-[#112250]">
                Deskripsi Venue
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Berikan deskripsi singkat mengenai keunggulan atau fasilitas umum venue ini..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-[#112250] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </div>

        {/* FASILITAS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112250]">Fasilitas Venue</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Tambahkan fasilitas apa saja yang tersedia di lokasi ini.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFacility();
                  }
                }}
                placeholder="Ketik fasilitas (Cth: VIP Parking, AC, Food Court)"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#112250] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
              <button
                type="button"
                onClick={addFacility}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#112250] px-6 text-sm font-bold text-white shadow-md transition hover:bg-indigo-900 sm:w-auto"
              >
                <Plus size={18} />
                Tambah
              </button>
            </div>

            {facilities.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {facilities.map((facility) => (
                  <div
                    key={facility}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="rounded-full p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {facilities.length === 0 && (
              <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8">
                <p className="text-sm font-medium text-slate-400">
                  Belum ada fasilitas yang ditambahkan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STATUS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
          <label className="mb-2 block text-xs font-bold text-[#112250]">
            Status Publikasi Venue
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-12 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#112250] outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="Aktif">Aktif (Dapat digunakan untuk Event)</option>
            <option value="Tidak Aktif">Tidak Aktif (Disembunyikan)</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col-reverse items-center justify-end gap-3 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/superadmin/venues")}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
          >
            <Save size={18} />
            {saving ? "Menyimpan..." : "Simpan Venue"}
          </button>
        </div>

      </form>
    </div>
  );
}

// KOMPONEN INPUT YANG SUDAH DIDESAIN ULANG
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
      <label className="mb-2 block text-xs font-bold text-[#112250]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#112250] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}