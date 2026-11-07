"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Tags,
  Info,
} from "lucide-react";

const dummyCategory = {
  name: "Konser",
  slug: "konser",
  description: "Kategori untuk event musik dan konser",
  status: "Aktif",
};

export default function EditEventCategoryPage() {
  const router = useRouter();
  const params = useParams();

  const [form, setForm] = useState(dummyCategory);
  const [loading, setLoading] = useState(false);

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    setLoading(true);

    // TODO:
    // Hubungkan ke API PUT/PATCH backend.
    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setLoading(false);

    router.push("/superadmin/kategori-event");
  };

  return (
    <div className="min-h-screen w-full ">

      {/* HEADER */}

      <div className="mb-6">

        <button
          type="button"
          onClick={() =>
            router.push("/superadmin/kategori-event")
          }
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            text-[11px]
            font-semibold
            text-[#697F93]
            transition
            hover:text-[#112250]
          "
        >
          <ArrowLeft size={15} />
          Kembali ke Kategori Event
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
            <Tags size={18} />
          </div>

          <div>

            <h1 className="text-[25px] font-bold tracking-[-0.03em] text-[#112250]">
              Edit Kategori Event
            </h1>

            <p className="mt-1 text-[13px] text-[#697F93]">
              Perbarui informasi kategori event #{params?.id}.
            </p>

          </div>

        </div>

      </div>

      {/* FORM */}

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_330px]">

          {/* INFORMATION */}

          <div className="rounded-2xl border border-[#E2E6EC] bg-white shadow-[0_8px_30px_rgba(17,34,80,0.035)]">

            <div className="border-b border-[#EEF1F5] px-6 py-5">

              <h2 className="text-[13px] font-semibold text-[#112250]">
                Informasi Kategori
              </h2>

              <p className="mt-1 text-[10px] text-[#697F93]">
                Edit data kategori event.
              </p>

            </div>

            <div className="space-y-5 p-6">

              <div>

                <label className="mb-2 block text-[11px] font-semibold text-[#112250]">
                  Nama Kategori
                  <span className="ml-1 text-[#B45353]">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#DDE3EA]
                    bg-white
                    px-4
                    text-[12px]
                    text-[#112250]
                    outline-none
                    transition
                    focus:border-[#3B507D]
                    focus:ring-4
                    focus:ring-[#3B507D]/10
                  "
                />

              </div>

              <div>

                <label className="mb-2 block text-[11px] font-semibold text-[#112250]">
                  Slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#DDE3EA]
                    bg-[#FAFBFC]
                    px-4
                    font-mono
                    text-[11px]
                    text-[#697F93]
                    outline-none
                    transition
                    focus:border-[#3B507D]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#3B507D]/10
                  "
                />

              </div>

              <div>

                <label className="mb-2 block text-[11px] font-semibold text-[#112250]">
                  Deskripsi
                </label>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[#DDE3EA]
                    px-4
                    py-3
                    text-[12px]
                    text-[#112250]
                    outline-none
                    transition
                    focus:border-[#3B507D]
                    focus:ring-4
                    focus:ring-[#3B507D]/10
                  "
                />

              </div>

            </div>

          </div>

          {/* SIDE */}

          <div className="space-y-5">

            <div className="rounded-2xl border border-[#E2E6EC] bg-white p-5">

              <h3 className="text-[12px] font-semibold text-[#112250]">
                Status Kategori
              </h3>

              <div className="mt-4 space-y-2">

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E6EC] p-3">

                  <input
                    type="radio"
                    name="status"
                    value="Aktif"
                    checked={form.status === "Aktif"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="accent-[#112250]"
                  />

                  <div>

                    <p className="text-[11px] font-semibold text-[#112250]">
                      Aktif
                    </p>

                    <p className="text-[9px] text-[#697F93]">
                      Kategori tersedia.
                    </p>

                  </div>

                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E6EC] p-3">

                  <input
                    type="radio"
                    name="status"
                    value="Tidak Aktif"
                    checked={
                      form.status === "Tidak Aktif"
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="accent-[#112250]"
                  />

                  <div>

                    <p className="text-[11px] font-semibold text-[#112250]">
                      Tidak Aktif
                    </p>

                    <p className="text-[9px] text-[#697F93]">
                      Kategori dinonaktifkan.
                    </p>

                  </div>

                </label>

              </div>

            </div>

            <div className="rounded-2xl border border-[#DCE5F0] bg-[#EEF3F9] p-5">

              <div className="flex gap-3">

                <Info
                  size={17}
                  className="mt-0.5 text-[#3B507D]"
                />

                <p className="text-[10px] leading-5 text-[#697F93]">
                  Perubahan kategori akan digunakan pada
                  pengelolaan event TicketVerse.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* BUTTON */}

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              router.push("/superadmin/kategori-event")
            }
            className="
              h-11
              rounded-xl
              border
              border-[#DDE3EA]
              bg-white
              px-5
              text-[11px]
              font-semibold
              text-[#697F93]
              transition
              hover:bg-[#F8F9FB]
            "
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-[#112250]
              px-6
              text-[11px]
              font-semibold
              text-white
              transition
              hover:bg-[#1A315F]
              disabled:opacity-60
            "
          >
            <Save size={15} />

            {loading
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </div>

      </form>

    </div>
  );
}