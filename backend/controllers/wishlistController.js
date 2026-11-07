const db = require("../config/db");

// ===============================
// GET ALL WISHLIST
// ===============================
const getAllWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        w.id,
        w.user_id,
        w.event_id,
        w.created_at,

        u.fullname,
        u.email,

        e.event_name,
        e.description,
        e.poster,
        e.event_date,
        e.event_time,
        e.status,

        a.artist_name,
        v.venue_name,
        v.city,
        c.category_name

      FROM wishlist w
      JOIN users u
        ON w.user_id = u.id
      JOIN events e
        ON w.event_id = e.id
      LEFT JOIN artists a
        ON e.artist_id = a.id
      LEFT JOIN venues v
        ON e.venue_id = v.id
      LEFT JOIN categories c
        ON e.category_id = c.id

      ORDER BY w.id DESC
    `);

    res.json({
      success: true,
      wishlist: rows,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data wishlist",
      error: error.message,
    });
  }
};

// ===============================
// GET WISHLIST BY ID
// ===============================
const getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT
        w.id,
        w.user_id,
        w.event_id,
        w.created_at,

        u.fullname,
        u.email,

        e.event_name,
        e.description,
        e.poster,
        e.event_date,
        e.event_time,
        e.status,

        a.artist_name,
        v.venue_name,
        v.city,
        c.category_name

      FROM wishlist w
      JOIN users u
        ON w.user_id = u.id
      JOIN events e
        ON w.event_id = e.id
      LEFT JOIN artists a
        ON e.artist_id = a.id
      LEFT JOIN venues v
        ON e.venue_id = v.id
      LEFT JOIN categories c
        ON e.category_id = c.id

      WHERE w.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wishlist tidak ditemukan",
      });
    }

    res.json({
      success: true,
      wishlist: rows[0],
    });
  } catch (error) {
    console.error("GET WISHLIST BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data wishlist",
      error: error.message,
    });
  }
};

// ===============================
// CREATE WISHLIST
// ===============================
const createWishlist = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    // Validasi
    if (!user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "user_id dan event_id wajib diisi",
      });
    }

    // Cek user
    const [users] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      `,
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek event
    const [events] = await db.query(
      `
      SELECT id
      FROM events
      WHERE id = ?
      `,
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    // Cek apakah sudah ada
    const [existingWishlist] = await db.query(
      `
      SELECT id
      FROM wishlist
      WHERE user_id = ?
      AND event_id = ?
      `,
      [user_id, event_id]
    );

    if (existingWishlist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Event sudah ada di wishlist",
      });
    }

    // Insert
    const [result] = await db.query(
      `
      INSERT INTO wishlist
      (user_id, event_id)
      VALUES (?, ?)
      `,
      [user_id, event_id]
    );

    // Ambil data yang baru dibuat
    const [newWishlist] = await db.query(`
      SELECT
        w.id,
        w.user_id,
        w.event_id,
        w.created_at,
        u.fullname,
        u.email,
        e.event_name,
        e.poster,
        e.event_date,
        e.event_time,
        e.status
      FROM wishlist w
      JOIN users u
        ON w.user_id = u.id
      JOIN events e
        ON w.event_id = e.id
      WHERE w.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: "Event berhasil ditambahkan ke wishlist",
      wishlist: newWishlist[0],
    });
  } catch (error) {
    console.error("CREATE WISHLIST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan event ke wishlist",
      error: error.message,
    });
  }
};

// ===============================
// DELETE WISHLIST
// ===============================
const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT id
      FROM wishlist
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wishlist tidak ditemukan",
      });
    }

    await db.query(
      `
      DELETE FROM wishlist
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Event berhasil dihapus dari wishlist",
    });
  } catch (error) {
    console.error("DELETE WISHLIST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus wishlist",
      error: error.message,
    });
  }
};


// GET WISHLIST BERDASARKAN USER ID
const getWishlistByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !Number.isInteger(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: "User ID tidak valid.",
      });
    }

    const [rows] = await db.query(
      `SELECT
        w.id,
        w.user_id,
        w.event_id,
        w.created_at,
        u.fullname,
        u.email,
        e.event_name,
        e.description,
        e.poster,
        e.event_date,
        e.event_time,
        e.status,
        a.artist_name,
        v.venue_name,
        v.city,
        c.category_name
      FROM wishlist w
      INNER JOIN users u ON w.user_id = u.id
      INNER JOIN events e ON w.event_id = e.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`,
      [Number(userId)]
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist pengguna berhasil diambil.",
      wishlist: rows,
    });
  } catch (error) {
    console.error("GET WISHLIST BY USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil wishlist pengguna.",
      error: error.message,
    });
  }
};


module.exports = {
  getAllWishlist,
  getWishlistById,
  getWishlistByUser,
  createWishlist,
  deleteWishlist,
};