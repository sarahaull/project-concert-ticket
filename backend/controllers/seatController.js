
const db = require("../config/db");

const checkOrganizer = async (connection, eventId, user) => {
  const role = String(user?.role || "").toLowerCase();

  if (!user?.id || role !== "event_organizer") {
    throw new Error("Hanya event organizer yang dapat mengelola denah.");
  }

  const [events] = await connection.query(
    `SELECT id, organizer_id, seat_map_image
     FROM events
     WHERE id = ?`,
    [eventId]
  );

  if (!events.length) {
    throw new Error("Event tidak ditemukan.");
  }

  if (Number(events[0].organizer_id) !== Number(user.id)) {
    throw new Error("Anda tidak memiliki akses ke event ini.");
  }

  return events[0];
};

// GET DENAH DAN KURSI BERDASARKAN EVENT
const getEventSeatMap = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [events] = await db.query(
      `SELECT id, event_name, seat_map_image
       FROM events
       WHERE id = ?`,
      [eventId]
    );

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan."
      });
    }

    // Lepaskan reservasi yang sudah kedaluwarsa.
    await db.query(
      `UPDATE event_seats
       SET status = 'Available',
           reserved_order_id = NULL,
           reserved_until = NULL
       WHERE status = 'Reserved'
         AND reserved_until IS NOT NULL
         AND reserved_until <= NOW()
         AND section_id IN (
           SELECT id FROM event_sections WHERE event_id = ?
         )`,
      [eventId]
    );

    const [sections] = await db.query(
      `SELECT
         es.id,
         es.event_id,
         es.ticket_category_id,
         es.section_code,
         es.section_name,
         es.map_position,
         es.seat_mode,
         tc.category_name,
         tc.price
       FROM event_sections es
       INNER JOIN ticket_categories tc
         ON tc.id = es.ticket_category_id
       WHERE es.event_id = ?
       ORDER BY es.id ASC`,
      [eventId]
    );

    const [seats] = await db.query(
      `SELECT
         s.id,
         s.section_id,
         s.row_label,
         s.seat_number,
         s.position_x,
         s.position_y,
         s.status,
         CASE
           WHEN s.status IS NULL THEN 'Available'
           WHEN s.status = 'Reserved'
             AND s.reserved_until <= NOW()
           THEN 'Available'
           ELSE s.status
         END AS display_status
       FROM event_seats s
       INNER JOIN event_sections es
         ON es.id = s.section_id
       WHERE es.event_id = ?
       ORDER BY es.id, s.row_label, s.seat_number`,
      [eventId]
    );

    const result = sections.map((section) => ({
      ...section,
      map_position: (() => {
        if (!section.map_position) return null;
        if (typeof section.map_position !== "string") return section.map_position;
        try { return JSON.parse(section.map_position); } catch { return null; }
      })(),
      price: Number(section.price),
      seats: seats
        .filter((seat) => Number(seat.section_id) === Number(section.id))
        .map((seat) => ({
          ...seat,
          position_x: Number(seat.position_x),
          position_y: Number(seat.position_y),
          status: seat.display_status
        }))
    }));

    return res.status(200).json({
      success: true,
      event: events[0],
      sections: result
    });
  } catch (error) {
    console.error("GET SEAT MAP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil denah kursi."
    });
  }
};

// TAMBAH SECTION
const createSection = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      ticket_category_id,
      section_code,
      section_name,
      map_position,
      seat_mode = "GENERAL"
    } = req.body;

    if (
      !ticket_category_id ||
      !section_code ||
      !section_name ||
      !["GENERAL", "NUMBERED"].includes(String(seat_mode).toUpperCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Kategori, kode, dan nama section wajib diisi."
      });
    }

    const connection = await db.getConnection();

    try {
      const event = await checkOrganizer(
        connection,
        eventId,
        req.user
      );

      const [categories] = await connection.query(
        `SELECT id
         FROM ticket_categories
         WHERE id = ? AND event_id = ?`,
        [ticket_category_id, event.id]
      );

      if (!categories.length) {
        return res.status(400).json({
          success: false,
          message: "Kategori tiket tidak sesuai dengan event."
        });
      }

      const [existingModes] = await connection.query(
        `SELECT DISTINCT seat_mode FROM event_sections
         WHERE event_id = ? AND ticket_category_id = ?`,
        [eventId, ticket_category_id]
      );
      if (existingModes.length && existingModes.some((row) =>
        String(row.seat_mode || "GENERAL").toUpperCase() !== String(seat_mode).toUpperCase()
      )) {
        return res.status(400).json({
          success: false,
          message: "Mode kursi pada satu kategori harus konsisten."
        });
      }

      const [result] = await connection.query(
        `INSERT INTO event_sections (
          event_id,
          ticket_category_id,
          section_code,
          section_name,
          map_position,
          seat_mode
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          ticket_category_id,
          String(section_code).trim(),
          String(section_name).trim(),
          map_position ? JSON.stringify(map_position) : null,
          String(seat_mode).toUpperCase()
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Section berhasil ditambahkan.",
        section: {
          id: result.insertId,
          event_id: Number(eventId),
          ticket_category_id: Number(ticket_category_id),
          section_code,
          section_name,
          map_position: map_position || null,
          seat_mode: String(seat_mode).toUpperCase()
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("CREATE SECTION ERROR:", error);

    return res.status(
      error.message === "Event tidak ditemukan." ? 404 :
      error.message.includes("tidak memiliki akses") ||
      error.message.includes("Hanya event organizer") ? 403 :
      error.code === "ER_DUP_ENTRY" ? 409 : 500
    ).json({
      success: false,
      message: error.code === "ER_DUP_ENTRY"
        ? "Kode section sudah digunakan pada event ini."
        : error.message || "Gagal menambahkan section."
    });
  }
};

// TAMBAH BANYAK KURSI
const createSeats = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { sectionId } = req.params;
    const { seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data kursi wajib berupa array dan tidak boleh kosong."
      });
    }

    if (seats.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Maksimal 1000 kursi dalam satu permintaan."
      });
    }

    await connection.beginTransaction();

    const [sections] = await connection.query(
      `SELECT id, event_id
       FROM event_sections
       WHERE id = ?
       FOR UPDATE`,
      [sectionId]
    );

    if (!sections.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Section tidak ditemukan."
      });
    }

    await checkOrganizer(
      connection,
      sections[0].event_id,
      req.user
    );

    const values = [];

    for (const seat of seats) {
      const row = String(seat.row_label || "").trim();
      const number = String(seat.seat_number || "").trim();
      const x = Number(seat.position_x);
      const y = Number(seat.position_y);

      if (
        !row ||
        row.length > 10 ||
        !number ||
        number.length > 10 ||
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < 0 || x > 100 ||
        y < 0 || y > 100
      ) {
        throw new Error("Data kursi atau posisi koordinat tidak valid.");
      }

      values.push([
        sectionId,
        row,
        number,
        x,
        y,
        "Available"
      ]);
    }

    const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();

    const [result] = await connection.query(
      `INSERT INTO event_seats (
        section_id,
        row_label,
        seat_number,
        position_x,
        position_y,
        status
      ) VALUES ${placeholders}`,
      flatValues
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Kursi berhasil ditambahkan.",
      total_created: result.affectedRows
    });
  } catch (error) {
    await connection.rollback();

    console.error("CREATE SEATS ERROR:", error);

    const status =
      error.message.includes("tidak memiliki akses") ||
      error.message.includes("Hanya event organizer") ? 403 :
      error.message === "Section tidak ditemukan." ? 404 :
      error.code === "ER_DUP_ENTRY" ? 409 : 400;

    return res.status(status).json({
      success: false,
      message: error.code === "ER_DUP_ENTRY"
        ? "Ada nomor kursi yang sudah terdaftar pada section ini."
        : error.message || "Gagal menambahkan kursi."
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getEventSeatMap,
  createSection,
  createSeats
};
