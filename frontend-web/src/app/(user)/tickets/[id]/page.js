'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Hash,
  Users,
  Music,
  Building2,
  ChevronRight,
} from 'lucide-react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const formatRupiah = (amount) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '-';

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(date));
  } catch {
    return '-';
  }
};

const formatTime = (time) => {
  if (!time) return '-';

  const value = String(time);

  return value.length >= 5 ? value.substring(0, 5) : value;
};

const getPaymentStatus = (status) => {
  switch (status) {
    case 'Paid':
      return {
        label: 'Pembayaran Berhasil',
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };

    case 'Pending':
      return {
        label: 'Menunggu Pembayaran',
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertCircle,
      };

    case 'Cancelled':
      return {
        label: 'Pesanan Dibatalkan',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertCircle,
      };

    case 'Expired':
      return {
        label: 'Pesanan Kedaluwarsa',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: AlertCircle,
      };

    default:
      return {
        label: status || 'Tidak diketahui',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: AlertCircle,
      };
  }
};

const getCheckInStatus = (status) => {
  if (status === 'Sudah') {
    return {
      label: 'Sudah Check-in',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }

  return {
    label: 'Belum Check-in',
    className: 'bg-blue-50 text-[#3B507D] border-blue-200',
    icon: Ticket,
  };
};

const QRCodeBox = ({ value }) => {
  const qrValue = value || 'TICKETVERSE';

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=300x300&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-3xl border border-[#D8D0C4]/50 bg-white p-4 shadow-xl">
        <div className="rounded-2xl bg-white p-2">
          <img
            src={qrUrl}
            alt="QR Code Tiket"
            className="h-52 w-52 object-contain sm:h-60 sm:w-60"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[#D8D0C4]/40 bg-[#F7F8FA] px-4 py-2">
        <QrCode className="h-4 w-4 text-[#3B507D]" />

        <span className="font-mono text-xs font-semibold text-[#112250]">
          {qrValue}
        </span>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
  mono = false,
}) => {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#D8D0C4]/30 bg-[#F7F8FA] p-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className="h-4 w-4 text-[#3B507D]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#9B907F]">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-sm font-semibold text-[#112250] ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value || '-'}
        </p>
      </div>
    </div>
  );
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ticketId = params?.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchTicket = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      if (!ticketId) {
        setError('ID tiket tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE}/api/tickets/${ticketId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          router.replace('/login');
          return;
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              'Data tiket tidak dapat ditemukan.'
          );
        }

        if (!mounted) return;

        setTicket(data.ticket || null);
      } catch (err) {
        console.error(
          'Gagal mengambil detail tiket:',
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              'Terjadi kesalahan saat mengambil detail tiket.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTicket();

    return () => {
      mounted = false;
    };
  }, [ticketId, router]);

  const paymentStatus = useMemo(
    () => getPaymentStatus(ticket?.payment_status),
    [ticket?.payment_status]
  );

  const checkInStatus = useMemo(
    () => getCheckInStatus(ticket?.check_in),
    [ticket?.check_in]
  );

  const PaymentIcon = paymentStatus.icon;
  const CheckInIcon = checkInStatus.icon;

  const eventDate = ticket?.event_date
    ? formatDate(ticket.event_date)
    : '-';

  const eventTime = formatTime(ticket?.event_time);
  const ticketPrice = Number(ticket?.price || 0);

  const handleCopy = async () => {
    if (!ticket?.ticket_code) return;

    try {
      await navigator.clipboard.writeText(
        ticket.ticket_code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        'Gagal menyalin kode tiket:',
        error
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = async () => {
    if (!ticket?.qr_code) return;

    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/` +
      `?size=600x600&data=${encodeURIComponent(
        ticket.qr_code
      )}`;

    try {
      const response = await fetch(qrUrl);

      if (!response.ok) {
        throw new Error('QR tidak dapat diunduh');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download =
        `${ticket.ticket_code || 'ticket'}-qr.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        'Gagal download QR:',
        error
      );

      window.open(qrUrl, '_blank');
    }
  };

  /* ===================================================
     LOADING (disesuaikan dengan layout utama)
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#3B507D]/10 border-t-[#3B507D]" />

            <Ticket className="h-6 w-6 text-[#3B507D]" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#112250]">
            Memuat detail tiket...
          </p>

          <p className="mt-1 text-xs text-[#9B907F]">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error || !ticket) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full rounded-3xl border border-[#D8D0C4]/40 bg-white p-6 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#112250]">
            Tiket Tidak Ditemukan
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            {error ||
              'Data tiket yang kamu cari tidak tersedia atau sudah tidak dapat diakses.'}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/50 bg-white px-5 py-2.5 text-sm font-semibold text-[#112250] transition hover:bg-[#F7F8FA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>

            <Link
              href="/tickets"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Ticket className="h-4 w-4" />
              Lihat Tiket Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     MAIN RENDER (disesuaikan agar mengikuti layout)
  =================================================== */

  return (
    <div className="w-full min-w-0">

      {/* HEADER NAVIGATION */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-xl border border-[#D8D0C4]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#112250] shadow-sm transition-all hover:-translate-x-0.5 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali
        </button>

        <div className="flex items-center gap-2 text-xs text-[#9B907F] sm:text-sm">
          <Link
            href="/tickets"
            className="transition hover:text-[#3B507D]"
          >
            Tiket Saya
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="font-medium text-[#112250]">
            Detail Tiket
          </span>
        </div>
      </div>

      {/* EVENT HEADER */}

      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#112250] via-[#243B68] to-[#3B507D] shadow-2xl">
        <div className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#E5C27A]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Ticket className="h-3.5 w-3.5" />
                  E-Ticket
                </span>

                <span
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
                    ticket.check_in === 'Sudah'
                      ? 'border-emerald-300/30 bg-emerald-400/20 text-emerald-100'
                      : 'border-amber-300/30 bg-amber-400/20 text-amber-100'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />

                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                  </span>

                  {ticket.check_in === 'Sudah'
                    ? 'Sudah Check-in'
                    : 'Belum Check-in'}
                </span>
              </div>

              <h1 className="max-w-4xl text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {ticket.event_name || 'Event'}
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
                {ticket.category_name || 'Tiket Event'}
                <span className="mx-1 text-white/30">
                  •
                </span>
                {ticket.venue_name ||
                  ticket.venue ||
                  'Venue'}
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5C27A]/20">
                <Music className="h-5 w-5 text-[#E5C27A]" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50">
                  TicketVerse
                </p>

                <p className="text-sm font-bold text-white">
                  Official Ticket
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-4 shadow-lg sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <PaymentIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#9B907F]">
                Status Pembayaran
              </p>

              <p className="mt-0.5 truncate text-sm font-bold text-[#112250]">
                {paymentStatus.label}
              </p>
            </div>

            <div className="ml-auto flex-shrink-0">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${paymentStatus.className}`}
              >
                {ticket.payment_status || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8D0C4]/30 bg-white p-4 shadow-lg sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <CheckInIcon className="h-5 w-5 text-[#3B507D]" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#9B907F]">
                Status Check-in
              </p>

              <p className="mt-0.5 truncate text-sm font-bold text-[#112250]">
                {checkInStatus.label}
              </p>
            </div>

            <div className="ml-auto flex-shrink-0">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${checkInStatus.className}`}
              >
                {ticket.check_in || 'Belum'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">

        {/* LEFT */}

        <div className="min-w-0 space-y-6 xl:col-span-2">

          {/* EVENT INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
            <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#112250]">
                  <Calendar className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#112250] sm:text-lg">
                    Informasi Event
                  </h2>

                  <p className="text-xs text-[#9B907F]">
                    Detail acara yang terdapat pada tiket kamu
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#112250] to-[#3B507D] p-5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Nama Event
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                  {ticket.event_name || '-'}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80">
                    {ticket.category_name || 'Umum'}
                  </span>

                  {ticket.artist_name && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80">
                      <Music className="h-3 w-3" />
                      {ticket.artist_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Calendar}
                  label="Tanggal Event"
                  value={eventDate}
                />

                <InfoItem
                  icon={Clock}
                  label="Waktu"
                  value={`${eventTime} WIB`}
                />

                <InfoItem
                  icon={MapPin}
                  label="Lokasi"
                  value={
                    ticket.venue_name ||
                    ticket.venue ||
                    'Lokasi belum tersedia'
                  }
                />

                <InfoItem
                  icon={Building2}
                  label="Kota"
                  value={ticket.city || '-'}
                />

                <InfoItem
                  icon={Ticket}
                  label="Kategori Tiket"
                  value={ticket.category_name || '-'}
                />

                <InfoItem
                  icon={CreditCard}
                  label="Harga per Tiket"
                  value={formatRupiah(ticketPrice)}
                />
              </div>
            </div>
          </section>

          {/* ORDER INFORMATION */}

          <section className="rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-xl">
            <div className="border-b border-[#D8D0C4]/30 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5C27A]/30">
                  <Hash className="h-5 w-5 text-[#112250]" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#112250] sm:text-lg">
                    Informasi Pesanan
                  </h2>

                  <p className="text-xs text-[#9B907F]">
                    Detail transaksi dan tiket
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Hash}
                  label="Kode Pesanan"
                  value={ticket.order_code || '-'}
                  mono
                />

                <InfoItem
                  icon={Hash}
                  label="ID Tiket"
                  value={`#${ticket.id}`}
                  mono
                />

                <InfoItem
                  icon={Users}
                  label="Jumlah Tiket"
                  value={`${ticket.quantity || 1} Tiket`}
                />

                <InfoItem
                  icon={CreditCard}
                  label="Total Pesanan"
                  value={formatRupiah(
                    ticket.subtotal || ticket.price
                  )}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-[#E5C27A]/40 bg-[#E5C27A]/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#9B907F]">
                      Kode Tiket
                    </p>

                    <p className="mt-1 break-all font-mono text-base font-extrabold tracking-wide text-[#112250] sm:text-lg">
                      {ticket.ticket_code || '-'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#112250] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Salin Kode
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* IMPORTANT INFORMATION */}

          <section className="rounded-3xl border border-[#D8D0C4]/30 bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-[#3B507D]" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#112250] sm:text-base">
                  Informasi Penting
                </h3>

                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B507D]" />
                    <span>
                      Tunjukkan QR Code tiket saat memasuki area event.
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B507D]" />
                    <span>
                      Pastikan data tiket sesuai dengan pesanan kamu.
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B507D]" />
                    <span>
                      Satu QR Code hanya dapat digunakan sesuai ketentuan event.
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B507D]" />
                    <span>
                      Simpan kode tiket sampai proses check-in selesai.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT / QR */}

        <div className="min-w-0 xl:col-span-1">
          <div className="xl:sticky xl:top-24">
            <section className="overflow-hidden rounded-3xl border border-[#D8D0C4]/30 bg-white shadow-2xl">

              <div className="relative overflow-hidden bg-gradient-to-br from-[#112250] to-[#3B507D] px-5 py-6 text-center">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-[#E5C27A]/10 blur-2xl" />

                <div className="relative z-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-white">
                    QR Code Tiket
                  </h2>

                  <p className="mt-1 text-xs text-white/60">
                    Tunjukkan QR ini saat check-in
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <QRCodeBox value={ticket.qr_code} />

                <div
                  className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 ${checkInStatus.className}`}
                >
                  <CheckInIcon className="h-5 w-5 flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold">
                      {checkInStatus.label}
                    </p>

                    <p className="mt-0.5 text-[10px] opacity-70">
                      Status tiket saat ini
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#112250] to-[#3B507D] px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <Download className="h-4 w-4" />
                    Download QR
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#D8D0C4]/50 bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#112250] transition-all hover:bg-white hover:shadow-md"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Tiket
                  </button>
                </div>

                <div className="mt-5 border-t border-dashed border-[#D8D0C4]/50 pt-5 text-center">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#9B907F]">
                    Ticket Code
                  </p>

                  <p className="mt-1 break-all font-mono text-xs font-bold text-[#112250]">
                    {ticket.ticket_code || '-'}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#D8D0C4]/30 bg-[#F7F8FA] px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#9B907F]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Tiket resmi TicketVerse
                </div>
              </div>
            </section>

            <Link
              href="/tickets"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#D8D0C4]/40 bg-white px-4 py-3 text-sm font-semibold text-[#112250] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Ticket className="h-4 w-4 text-[#3B507D]" />
              Lihat Semua Tiket
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          nav,
          header,
          aside,
          footer {
            display: none !important;
          }

          button,
          a {
            display: none !important;
          }

          .xl\\:sticky {
            position: static !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}