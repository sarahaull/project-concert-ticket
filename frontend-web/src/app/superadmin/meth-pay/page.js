"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Trash2,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

const paymentMethods = [
  {
    id: 1,
    name: "QRIS",
    code: "QRIS",
    type: "QR Payment",
    description: "Pembayaran menggunakan QRIS.",
    provider: "QRIS",
    transactions: 12842,
    fee: "0.7%",
    status: "Aktif",
    priority: 1,
    createdAt: "12 Agu 2026",
  },
  {
    id: 2,
    name: "GoPay",
    code: "GOPAY",
    type: "E-Wallet",
    description: "Pembayaran menggunakan GoPay.",
    provider: "GoPay",
    transactions: 9842,
    fee: "2%",
    status: "Aktif",
    priority: 2,
    createdAt: "10 Agu 2026",
  },
  {
    id: 3,
    name: "OVO",
    code: "OVO",
    type: "E-Wallet",
    description: "Pembayaran menggunakan OVO.",
    provider: "OVO",
    transactions: 7240,
    fee: "2%",
    status: "Aktif",
    priority: 3,
    createdAt: "08 Agu 2026",
  },
  {
    id: 4,
    name: "Virtual Account BCA",
    code: "BCA_VA",
    type: "Virtual Account",
    description: "Pembayaran melalui Virtual Account BCA.",
    provider: "BCA",
    transactions: 15320,
    fee: "Rp4.000",
    status: "Aktif",
    priority: 4,
    createdAt: "06 Agu 2026",
  },
  {
    id: 5,
    name: "Virtual Account BNI",
    code: "BNI_VA",
    type: "Virtual Account",
    description: "Pembayaran melalui Virtual Account BNI.",
    provider: "BNI",
    transactions: 6340,
    fee: "Rp4.000",
    status: "Aktif",
    priority: 5,
    createdAt: "05 Agu 2026",
  },
  {
    id: 6,
    name: "Virtual Account Mandiri",
    code: "MANDIRI_VA",
    type: "Virtual Account",
    description: "Pembayaran melalui Virtual Account Mandiri.",
    provider: "Mandiri",
    transactions: 8120,
    fee: "Rp4.000",
    status: "Aktif",
    priority: 6,
    createdAt: "03 Agu 2026",
  },
  {
    id: 7,
    name: "ShopeePay",
    code: "SHOPEEPAY",
    type: "E-Wallet",
    description: "Pembayaran menggunakan ShopeePay.",
    provider: "ShopeePay",
    transactions: 4210,
    fee: "2%",
    status: "Nonaktif",
    priority: 7,
    createdAt: "29 Jul 2026",
  },
];

export default function PaymentMethodsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    let result = paymentMethods.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.provider.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "Semua" || item.type === typeFilter;

      const matchesStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    result.sort((a, b) =>
      sortAsc
        ? a.priority - b.priority
        : b.priority - a.priority
    );

    return result;
  }, [search, typeFilter, statusFilter, sortAsc]);

  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = paymentMethods.filter(
    (item) => item.status === "Aktif"
  ).length;

  const inactiveCount = paymentMethods.filter(
    (item) => item.status === "Nonaktif"
  ).length;

  const totalTransactions = paymentMethods.reduce(
    (total, item) => total + item.transactions,
    0
  );

  const formatNumber = (number) =>
    new Intl.NumberFormat("id-ID").format(number);

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#718096]">
            <span>Master Data</span>
            <span>/</span>
            <span className="font-medium text-[#3B507D]">
              Metode Pembayaran
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#112250]">
            Metode Pembayaran
          </h1>

          <p className="mt-1 text-sm text-[#718096]">
            Kelola metode pembayaran yang tersedia di TicketVerse.
          </p>
        </div>

        <Link
          href="/superadmin/meth-pay/tambah"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#112250] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(17,34,80,0.18)] transition hover:bg-[#1A326A]"
        >
          <Plus size={18} />
          Tambah Metode
        </Link>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<CreditCard size={20} />}
          label="Total Metode"
          value={paymentMethods.length}
          description="Metode pembayaran"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Metode Aktif"
          value={activeCount}
          description="Sedang digunakan"
        />

        <StatCard
          icon={<XCircle size={20} />}
          label="Nonaktif"
          value={inactiveCount}
          description="Tidak tersedia"
        />

        <StatCard
          icon={<TrendingUp size={20} />}
          label="Total Transaksi"
          value={formatNumber(totalTransactions)}
          description="Seluruh metode"
        />

      </div>

      {/* TABLE CARD */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_5px_25px_rgba(17,34,80,0.05)]">

        {/* TOOLBAR */}
        <div className="border-b border-[#E8ECF2] p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <h2 className="text-base font-bold text-[#112250]">
                Daftar Metode Pembayaran
              </h2>

              <p className="mt-1 text-xs text-[#8490A1]">
                {filteredData.length} metode ditemukan
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A8]"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari metode pembayaran..."
                  className="h-10 w-full rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-10 pr-4 text-sm text-[#112250] outline-none transition placeholder:text-[#9AA5B5] focus:border-[#5275A5] focus:bg-white sm:w-64"
                />
              </div>

              {/* TYPE */}
              <div className="relative">
                <SlidersHorizontal
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 appearance-none rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] pl-9 pr-8 text-sm font-medium text-[#44546A] outline-none focus:border-[#5275A5]"
                >
                  <option value="Semua">Semua Tipe</option>
                  <option value="QR Payment">
                    QR Payment
                  </option>
                  <option value="E-Wallet">
                    E-Wallet
                  </option>
                  <option value="Virtual Account">
                    Virtual Account
                  </option>
                </select>
              </div>

              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm font-medium text-[#44546A] outline-none focus:border-[#5275A5]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>

              {/* SORT */}
              <button
                onClick={() => setSortAsc((prev) => !prev)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE2EA] bg-[#FAFBFC] px-4 text-sm font-medium text-[#44546A] transition hover:bg-[#F4F7FB]"
              >
                <ArrowUpDown size={16} />
                Prioritas
              </button>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>
              <tr className="border-b border-[#E8ECF2] bg-[#F8FAFC] text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Metode
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Tipe
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Provider
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Transaksi
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Fee
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#7A8799]">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedData.map((item) => (

                <tr
                  key={item.id}
                  className="group border-b border-[#EEF1F5] transition hover:bg-[#F8FAFD]"
                >

                  {/* METHOD */}
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
                        {getPaymentIcon(item.type)}
                      </div>

                      <div>
                        <p className="font-semibold text-[#112250]">
                          {item.name}
                        </p>

                        <span className="mt-1 inline-block rounded-md bg-[#F1F4F8] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#64748B]">
                          {item.code}
                        </span>
                      </div>

                    </div>

                  </td>

                  {/* TYPE */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#53647A]">
                      {item.type}
                    </span>
                  </td>

                  {/* PROVIDER */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#344563]">
                      {item.provider}
                    </span>
                  </td>

                  {/* TRANSACTIONS */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-[#344563]">
                      {formatNumber(item.transactions)}
                    </span>
                  </td>

                  {/* FEE */}
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-lg bg-[#F4F7FB] px-2.5 py-1 text-xs font-semibold text-[#52657E]">
                      {item.fee}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">

                    {item.status === "Aktif" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F0] px-3 py-1.5 text-xs font-semibold text-[#25804B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#39A866]" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F5] px-3 py-1.5 text-xs font-semibold text-[#7A8494]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9AA3AF]" />
                        Nonaktif
                      </span>
                    )}

                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-1">

                      <Link
                        href={`/superadmin/meth-pay/${item.id}`}
                        title="Detail"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9] hover:text-[#3B507D]"
                      >
                        <Eye size={17} />
                      </Link>

                      <Link
                        href={`/superadmin/meth-pay/${item.id}/edit`}
                        title="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9] hover:text-[#3B507D]"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        title="Hapus"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A96A8] transition hover:bg-[#FFF1F1] hover:text-[#C04A4A]"
                      >
                        <Trash2 size={17} />
                      </button>

                      <button
                        title="Lainnya"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EEF3F9]"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F8] text-[#7C899C]">
                      <CreditCard size={24} />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#112250]">
                      Metode pembayaran tidak ditemukan
                    </h3>

                    <p className="mt-1 text-sm text-[#8490A1]">
                      Coba ubah kata kunci atau filter pencarian.
                    </p>

                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-[#E8ECF2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-[#7A8799]">
            Menampilkan{" "}
            <span className="font-semibold text-[#44546A]">
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-[#44546A]">
              {Math.min(
                currentPage * itemsPerPage,
                filteredData.length
              )}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-[#44546A]">
              {filteredData.length}
            </span>{" "}
            metode
          </p>

          <div className="flex items-center gap-1">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => p - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE2EA] text-[#64748B] transition hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  currentPage === page
                    ? "bg-[#112250] text-white shadow-sm"
                    : "text-[#64748B] hover:bg-[#F1F4F8]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage((p) => p + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE2EA] text-[#64748B] transition hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

function getPaymentIcon(type) {
  if (type === "E-Wallet") {
    return <Wallet size={20} />;
  }

  if (type === "Virtual Account") {
    return <Building2 size={20} />;
  }

  if (type === "QR Payment") {
    return <Smartphone size={20} />;
  }

  return <CreditCard size={20} />;
}

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-[#E2E7EF] bg-white p-5 shadow-[0_4px_20px_rgba(17,34,80,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(17,34,80,0.08)]">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#3B507D]">
          {icon}
        </div>

        <TrendingUp
          size={16}
          className="text-[#8DA0B8]"
        />

      </div>

      <p className="mt-4 text-xs font-medium text-[#7B8798]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#112250]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#98A3B2]">
        {description}
      </p>

    </div>
  );
}