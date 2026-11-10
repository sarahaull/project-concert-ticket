const db = require("../config/db");

// ======================================================
// GET SEMUA KATEGORI TIKET
// ======================================================

const getTicketCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        tc.id,
        tc.event_id,
        tc.category_name,
        tc.price,
        tc.quota,
        tc.remaining_ticket,
        e.event_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM ticket_categories tc
      LEFT JOIN events e ON tc.event_id = e.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      ORDER BY tc.id DESC`
    );

    return res.status(200).json({
      success: true,
      ticket_categories: rows,
    });
  } catch (error) {
    console.error("GET TICKET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori tiket.",
    });
  }
};

// ======================================================
// GET KATEGORI TIKET BERDASARKAN EVENT
// ======================================================

const getTicketCategoriesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId || !Number.isInteger(Number(eventId)) || Number(eventId) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID event tidak valid.",
      });
    }

    // Pastikan event tersedia
    const [events] = await db.query(
      `SELECT id, event_name
       FROM events
       WHERE id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    // Ambil seluruh kategori tiket milik event
    const [rows] = await db.query(
      `SELECT
        tc.id,
        tc.event_id,
        tc.category_name,
        tc.price,
        tc.quota,
        tc.remaining_ticket,
        e.event_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM ticket_categories tc
      LEFT JOIN events e ON tc.event_id = e.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE tc.event_id = ?
      ORDER BY tc.id ASC`,
      [eventId]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori tiket berhasil diambil.",
      event: events[0],
      ticket_categories: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET TICKET CATEGORIES BY EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori tiket berdasarkan event.",
    });
  }
};

// ======================================================
// GET DETAIL KATEGORI TIKET
// ======================================================

const getTicketCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        tc.id,
        tc.event_id,
        tc.category_name,
        tc.price,
        tc.quota,
        tc.remaining_ticket,
        e.event_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM ticket_categories tc
      LEFT JOIN events e ON tc.event_id = e.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE tc.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tiket tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      ticket_category: rows[0],
    });
  } catch (error) {
    console.error("GET TICKET CATEGORY BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail kategori tiket.",
    });
  }
};

// ======================================================
// CREATE KATEGORI TIKET
// ======================================================

const createTicketCategory = async (req, res) => {
  try {
    const {
      event_id,
      category_name,
      price,
      quota,
    } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: "Event wajib dipilih.",
      });
    }

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori tiket wajib diisi.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Harga tiket tidak valid.",
      });
    }

    if (
      quota === undefined ||
      quota === null ||
      quota === "" ||
      !Number.isInteger(Number(quota)) ||
      Number(quota) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Kuota tiket harus berupa bilangan bulat lebih dari 0.",
      });
    }

    const [events] = await db.query(
      "SELECT id FROM events WHERE id = ?",
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    const cleanName = category_name.trim();

    const [duplicate] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE event_id = ?
       AND LOWER(category_name) = LOWER(?)`,
      [event_id, cleanName]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tiket sudah tersedia untuk event ini.",
      });
    }

    // Tiket yang tersedia pertama kali sama dengan kuota.
    const [result] = await db.query(
      `INSERT INTO ticket_categories
       (
         event_id,
         category_name,
         price,
         quota,
         remaining_ticket
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        event_id,
        cleanName,
        Number(price),
        Number(quota),
        Number(quota),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Kategori tiket berhasil ditambahkan.",
      ticket_category: {
        id: result.insertId,
        event_id: Number(event_id),
        category_name: cleanName,
        price: Number(price),
        quota: Number(quota),
        remaining_ticket: Number(quota),
      },
    });
  } catch (error) {
    console.error("CREATE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan kategori tiket.",
    });
  }
};

// ======================================================
// UPDATE KATEGORI TIKET
// ======================================================

const updateTicketCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      event_id,
      category_name,
      price,
      quota,
    } = req.body;

    if (!event_id || !category_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event dan nama kategori wajib diisi.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Harga tiket tidak valid.",
      });
    }

    if (
      quota === undefined ||
      quota === null ||
      !Number.isInteger(Number(quota)) ||
      Number(quota) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Kuota tiket tidak valid.",
      });
    }

    const [existing] = await db.query(
      `SELECT id, quota, remaining_ticket
       FROM ticket_categories
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tiket tidak ditemukan.",
      });
    }

    const [events] = await db.query(
      "SELECT id FROM events WHERE id = ?",
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    const cleanName = category_name.trim();

    const [duplicate] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE event_id = ?
       AND LOWER(category_name) = LOWER(?)
       AND id != ?`,
      [event_id, cleanName, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tiket sudah digunakan untuk event ini.",
      });
    }

    const oldQuota = Number(existing[0].quota);
    const oldRemaining = Number(existing[0].remaining_ticket);
    const newQuota = Number(quota);

    // Jumlah tiket terjual tidak boleh hilang saat kuota diedit.
    const sold = oldQuota - oldRemaining;

    if (newQuota < sold) {
      return res.status(400).json({
        success: false,
        message: `Kuota baru tidak boleh kurang dari jumlah tiket terjual (${sold}).`,
      });
    }

    const newRemaining = newQuota - sold;

    await db.query(
      `UPDATE ticket_categories
       SET event_id = ?,
           category_name = ?,
           price = ?,
           quota = ?,
           remaining_ticket = ?
       WHERE id = ?`,
      [
        event_id,
        cleanName,
        Number(price),
        newQuota,
        newRemaining,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori tiket berhasil diperbarui.",
    });
  } catch (error) {
    console.error("UPDATE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori tiket.",
    });
  }
};

// ======================================================
// DELETE KATEGORI TIKET
// ======================================================

const deleteTicketCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tiket tidak ditemukan.",
      });
    }

    await db.query(
      `DELETE FROM ticket_categories
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori tiket berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori tiket.",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getTicketCategories,
  getTicketCategoriesByEvent,
  getTicketCategoryById,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
};