const db = require("../config/db");

// ===== Ambil Semua Event =====
const getEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        e.id,
        e.category_id,
        e.artist_id,
        e.venue_id,
        e.event_name,
        e.description,
        e.poster,
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

       LEFT JOIN categories c
         ON e.category_id = c.id

       LEFT JOIN artists a
         ON e.artist_id = a.id

       LEFT JOIN venues v
         ON e.venue_id = v.id

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

// ===== Ambil Event Berdasarkan ID =====
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        e.id,
        e.category_id,
        e.artist_id,
        e.venue_id,
        e.event_name,
        e.description,
        e.poster,
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

       LEFT JOIN categories c
         ON e.category_id = c.id

       LEFT JOIN artists a
         ON e.artist_id = a.id

       LEFT JOIN venues v
         ON e.venue_id = v.id

       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
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

// ===== Tambah Event =====

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

    if (role !== "event_organizer") {
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
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizerId,
        category_id,
        artist_id,
        venue_id,
        event_name.trim(),
        description || null,
        poster || null,
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


// ===== Update Event =====
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      artist_id,
      venue_id,
      event_name,
      description,
      poster,
      event_date,
      event_time,
      ticket_sale_start,
      ticket_sale_end,
      status,
    } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Kategori event wajib dipilih",
      });
    }

    if (!artist_id) {
      return res.status(400).json({
        success: false,
        message: "Artist event wajib dipilih",
      });
    }

    if (!venue_id) {
      return res.status(400).json({
        success: false,
        message: "Venue event wajib dipilih",
      });
    }

    if (!event_name) {
      return res.status(400).json({
        success: false,
        message: "Nama event wajib diisi",
      });
    }

    if (!event_date) {
      return res.status(400).json({
        success: false,
        message: "Tanggal event wajib diisi",
      });
    }

    if (!event_time) {
      return res.status(400).json({
        success: false,
        message: "Waktu event wajib diisi",
      });
    }

    if (!ticket_sale_start) {
      return res.status(400).json({
        success: false,
        message: "Waktu mulai penjualan tiket wajib diisi",
      });
    }

    if (!ticket_sale_end) {
      return res.status(400).json({
        success: false,
        message: "Waktu selesai penjualan tiket wajib diisi",
      });
    }

    // Cek event
    const [existingEvent] = await db.query(
      `SELECT id
       FROM events
       WHERE id = ?`,
      [id]
    );

    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    // Cek kategori
    const [category] = await db.query(
      `SELECT id FROM categories WHERE id = ?`,
      [category_id]
    );

    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek artist
    const [artist] = await db.query(
      `SELECT id FROM artists WHERE id = ?`,
      [artist_id]
    );

    if (artist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    // Cek venue
    const [venue] = await db.query(
      `SELECT id FROM venues WHERE id = ?`,
      [venue_id]
    );

    if (venue.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    // Cek nama event duplikat
    const [duplicate] = await db.query(
      `SELECT id
       FROM events
       WHERE event_name = ?
       AND id != ?`,
      [event_name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama event sudah digunakan",
      });
    }

    await db.query(
      `UPDATE events
       SET category_id = ?,
           artist_id = ?,
           venue_id = ?,
           event_name = ?,
           description = ?,
           poster = ?,
           event_date = ?,
           event_time = ?,
           ticket_sale_start = ?,
           ticket_sale_end = ?,
           status = ?
       WHERE id = ?`,
      [
        category_id,
        artist_id,
        venue_id,
        event_name,
        description || null,
        poster || null,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status || "Coming Soon",
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Event berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui event",
    });
  }
};

// ===== Hapus Event =====
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT id
       FROM events
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    await db.query(
      `DELETE FROM events
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Event berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus event",
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