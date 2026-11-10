
"use client";

export default function SeatMapCanvas({
  image,
  sections = [],
  selectedSection,
  onSelectPosition,
  editable = true,
}) {
  const handleCanvasClick = (e) => {
    if (!editable || !selectedSection) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onSelectPosition({
      position_x: Number(x.toFixed(2)),
      position_y: Number(y.toFixed(2)),
    });
  };

  const getSeatColor = (status) => {
    switch (status) {
      case "Sold":
        return "bg-red-500";
      case "Reserved":
        return "bg-amber-400";
      default:
        return "bg-emerald-500";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h3 className="font-bold text-slate-800">
            Denah Kursi
          </h3>
          <p className="text-xs text-slate-500">
            {editable
              ? "Pilih section kemudian klik gambar untuk menambahkan posisi kursi."
              : "Denah kursi event."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Reserved
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Sold
          </span>
        </div>
      </div>

      <div className="relative min-h-72 bg-slate-100">
        {image ? (
          <div
            className="relative w-full cursor-crosshair"
            onClick={handleCanvasClick}
          >
            <img
              src={image}
              alt="Denah event"
              className="block h-auto max-h-[650px] w-full object-contain"
              draggable={false}
            />

            {sections.map((section) =>
              (section.seats || []).map((seat) => (
                <div
                  key={seat.id}
                  title={`${section.section_name} - ${seat.row_label}${seat.seat_number} (${seat.status})`}
                  className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white shadow ${getSeatColor(
                    seat.status
                  )}`}
                  style={{
                    left: `${seat.position_x}%`,
                    top: `${seat.position_y}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {seat.seat_number}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <p className="font-semibold text-slate-600">
              Gambar denah belum tersedia
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tambahkan gambar denah event terlebih dahulu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
