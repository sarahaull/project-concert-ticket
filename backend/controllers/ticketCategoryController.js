const db = require("../config/db");

// ===== Ambil Semua Kategori Tiket =====
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
       LEFT JOIN events e
         ON tc.event_id = e.id
       LEFT JOIN artists a
         ON e.artist_id = a.id
       LEFT JOIN venues v
         ON e.venue_id = v.id
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
      message: "Gagal mengambil data kategori tiket",
    });
  }
};

// ===== Ambil Kategori Tiket Berdasarkan ID =====
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
       LEFT JOIN events e
         ON tc.event_id = e.id
       LEFT JOIN artists a
         ON e.artist_id = a.id
       LEFT JOIN venues v
         ON e.venue_id = v.id
       WHERE tc.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tiket tidak ditemukan",
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
      message: "Gagal mengambil detail kategori tiket",
    });
  }
};

// ===== Tambah Kategori Tiket =====
const createTicketCategory = async (req, res) => {
  try {
    const {
      event_id,
      category_name,
      price,
      quota,
      remaining_ticket,
    } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: "Event wajib dipilih",
      });
    }

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori tiket wajib diisi",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Harga tiket wajib diisi",
      });
    }

    if (quota === undefined || quota === null || quota === "") {
      return res.status(400).json({
        success: false,
        message: "Kuota tiket wajib diisi",
      });
    }

    // Cek event
    const [event] = await db.query(
      `SELECT id
       FROM events
       WHERE id = ?`,
      [event_id]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    // Cek kategori tiket dalam event yang sama
    const [existing] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE event_id = ?
       AND category_name = ?`,
      [event_id, category_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tiket sudah tersedia untuk event ini",
      });
    }

    // Kalau remaining_ticket tidak dikirim,
    // otomatis mengikuti quota
    const remaining =
      remaining_ticket === undefined ||
      remaining_ticket === null ||
      remaining_ticket === ""
        ? quota
        : remaining_ticket;

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
        category_name,
        price,
        quota,
        remaining,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Kategori tiket berhasil ditambahkan",
      ticket_category: {
        id: result.insertId,
        event_id,
        category_name,
        price,
        quota,
        remaining_ticket: remaining,
      },
    });
  } catch (error) {
    console.error("CREATE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan kategori tiket",
    });
  }
};

// ===== Update Kategori Tiket =====
const updateTicketCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      event_id,
      category_name,
      price,
      quota,
      remaining_ticket,
    } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: "Event wajib dipilih",
      });
    }

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori tiket wajib diisi",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Harga tiket wajib diisi",
      });
    }

    if (quota === undefined || quota === null || quota === "") {
      return res.status(400).json({
        success: false,
        message: "Kuota tiket wajib diisi",
      });
    }

    // Cek kategori tiket
    const [existingCategory] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE id = ?`,
      [id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tiket tidak ditemukan",
      });
    }

    // Cek event
    const [event] = await db.query(
      `SELECT id
       FROM events
       WHERE id = ?`,
      [event_id]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    // Cek duplikat
    const [duplicate] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE event_id = ?
       AND category_name = ?
       AND id != ?`,
      [
        event_id,
        category_name,
        id,
      ]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tiket sudah digunakan untuk event ini",
      });
    }

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
        category_name,
        price,
        quota,
        remaining_ticket,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori tiket berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori tiket",
    });
  }
};

// ===== Hapus Kategori Tiket =====
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
        message: "Kategori tiket tidak ditemukan",
      });
    }

    await db.query(
      `DELETE FROM ticket_categories
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori tiket berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE TICKET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori tiket",
    });
  }
};

module.exports = {
  getTicketCategories,
  getTicketCategoryById,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
};