
const db = require("../config/db");

// ============================================================
// AMBIL SEMUA EVENT
// ============================================================

const getEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        e.id,
        e.organizer_id,
        e.category_id,
        e.artist_id,
        e.venue_id,
        e.event_name,
        e.description,
        e.poster,
        e.seat_map_image,
        e.event_date,
        e.event_time,
        e.ticket_sale_start,
        e.ticket_sale_end,
        e.status,
        e.created_at,
        c.category_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      ORDER BY e.id DESC`
    );

    return res.status(200).json({
      success: true,
      events: rows,
    });
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data event",
    });
  }
};

// ============================================================
// AMBIL EVENT BERDASARKAN ID
// ============================================================

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        e.id,
        e.organizer_id,
        e.category_id,
        e.artist_id,
        e.venue_id,
        e.event_name,
        e.description,
        e.poster,
        e.seat_map_image,
        e.event_date,
        e.event_time,
        e.ticket_sale_start,
        e.ticket_sale_end,
        e.status,
        e.created_at,
        c.category_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      event: rows[0],
    });
  } catch (error) {
    console.error("GET EVENT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail event",
    });
  }
};

// ============================================================
// TAMBAH EVENT
// ============================================================

const createEvent = async (req, res) => {
  try {
    const organizerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

   if (!["organizer", "event_organizer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat membuat acara.",
      });
    }

    const {
      category_id,
      artist_id,
      venue_id,
      event_name,
      description,
      poster,
      seat_map_image,
      event_date,
      event_time,
      ticket_sale_start,
      ticket_sale_end,
      status,
    } = req.body;

    if (
      !category_id ||
      !artist_id ||
      !venue_id ||
      !event_name ||
      !event_date ||
      !event_time ||
      !ticket_sale_start ||
      !ticket_sale_end
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua data wajib acara harus diisi.",
      });
    }

    const [category] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (!category.length) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
      });
    }

    const [artist] = await db.query(
      "SELECT id FROM artists WHERE id = ?",
      [artist_id]
    );

    if (!artist.length) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan.",
      });
    }

    const [venue] = await db.query(
      "SELECT id FROM venues WHERE id = ?",
      [venue_id]
    );

    if (!venue.length) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan.",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM events WHERE event_name = ?",
      [event_name.trim()]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "Nama event sudah tersedia.",
      });
    }

    const eventStatus = status || "Coming Soon";

    const [result] = await db.query(
      `INSERT INTO events (
        organizer_id,
        category_id,
        artist_id,
        venue_id,
        event_name,
        description,
        poster,
        seat_map_image,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizerId,
        category_id,
        artist_id,
        venue_id,
        event_name.trim(),
        description || null,
        poster || null,
        seat_map_image || null,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        eventStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Event berhasil ditambahkan.",
      event: {
        id: result.insertId,
        organizer_id: organizerId,
        category_id,
        artist_id,
        venue_id,
        event_name: event_name.trim(),
        description: description || null,
        poster: poster || null,
        seat_map_image: seat_map_image || null,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status: eventStatus,
      },
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan event.",
    });
  }
};

// ============================================================
// UPDATE EVENT
// ============================================================

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID event tidak valid.",
      });
    }

    // Validasi autentikasi dan role
    const organizerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

    if (!["organizer", "event_organizer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat memperbarui event.",
      });
    }

    // Ambil event dan pastikan milik organizer yang login
    const [existingEvent] = await db.query(
      `SELECT *
       FROM events
       WHERE id = ? AND organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!existingEvent.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    const currentEvent = existingEvent[0];

    // Ambil data dari request
    const {
      category_id,
      artist_id,
      venue_id,
      event_name,
      description,
      poster,
      seat_map_image,
      event_date,
      event_time,
      ticket_sale_start,
      ticket_sale_end,
      status,
    } = req.body;

    // Validasi field wajib
    if (
      !category_id ||
      !artist_id ||
      !venue_id ||
      !event_name ||
      !event_date ||
      !event_time ||
      !ticket_sale_start ||
      !ticket_sale_end
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua data wajib event harus diisi.",
      });
    }

    if (!String(event_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama event tidak boleh kosong.",
      });
    }

    // Validasi kategori
    const [category] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (!category.length) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
      });
    }

    // Validasi artist
    const [artist] = await db.query(
      "SELECT id FROM artists WHERE id = ?",
      [artist_id]
    );

    if (!artist.length) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan.",
      });
    }

    // Validasi venue
    const [venue] = await db.query(
      "SELECT id FROM venues WHERE id = ?",
      [venue_id]
    );

    if (!venue.length) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan.",
      });
    }

    // Validasi nama event duplikat
    const [duplicate] = await db.query(
      `SELECT id
       FROM events
       WHERE event_name = ?
       AND id != ?
       LIMIT 1`,
      [String(event_name).trim(), id]
    );

    if (duplicate.length) {
      return res.status(400).json({
        success: false,
        message: "Nama event sudah digunakan.",
      });
    }

    // Pertahankan poster dan seat map lama jika tidak dikirim
    const finalPoster =
      poster !== undefined ? poster || null : currentEvent.poster;

    const finalSeatMap =
      seat_map_image !== undefined
        ? seat_map_image || null
        : currentEvent.seat_map_image;

    const finalStatus = status || currentEvent.status || "Coming Soon";

    // Update event dengan pengecekan kepemilikan
    const [result] = await db.query(
      `UPDATE events
       SET category_id = ?,
           artist_id = ?,
           venue_id = ?,
           event_name = ?,
           description = ?,
           poster = ?,
           seat_map_image = ?,
           event_date = ?,
           event_time = ?,
           ticket_sale_start = ?,
           ticket_sale_end = ?,
           status = ?
       WHERE id = ?
       AND organizer_id = ?`,
      [
        category_id,
        artist_id,
        venue_id,
        String(event_name).trim(),
        description || null,
        finalPoster,
        finalSeatMap,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        finalStatus,
        id,
        organizerId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Event gagal diperbarui atau tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event berhasil diperbarui.",
      event: {
        id: Number(id),
        organizer_id: organizerId,
        category_id,
        artist_id,
        venue_id,
        event_name: String(event_name).trim(),
        description: description || null,
        poster: finalPoster,
        seat_map_image: finalSeatMap,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status: finalStatus,
      },
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui event.",
    });
  }
};

// ============================================================
// HAPUS EVENT
// ============================================================

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID event tidak valid.",
      });
    }

    // Validasi autentikasi
    const organizerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

    // Validasi role
    if (!["organizer", "event_organizer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat menghapus event.",
      });
    }

    // Pastikan event benar-benar milik organizer
    const [existingEvent] = await db.query(
      `SELECT id, event_name
       FROM events
       WHERE id = ?
       AND organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!existingEvent.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    // Hapus event dengan pengecekan kepemilikan
    const [result] = await db.query(
      `DELETE FROM events
       WHERE id = ?
       AND organizer_id = ?`,
      [id, organizerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Event gagal dihapus atau tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event berhasil dihapus.",
      deleted_event: {
        id: Number(id),
        event_name: existingEvent[0].event_name,
      },
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    // Event mungkin masih terhubung dengan data transaksi/tiket
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Event tidak dapat dihapus karena masih memiliki data tiket atau transaksi yang terhubung.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus event.",
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
