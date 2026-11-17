const db = require("../config/db");



const getUserId = (req) =>
  req.user?.id || req.user?.userId || req.user?.user_id || null;


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


const getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
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
      `,
      [id]
    );

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


const checkWishlistStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (!eventId || !Number.isInteger(Number(eventId))) {
      return res.status(400).json({
        success: false,
        message: "Event ID tidak valid.",
      });
    }

    const [rows] = await db.query(
      `SELECT id FROM wishlist
       WHERE user_id = ? AND event_id = ?
       LIMIT 1`,
      [userId, Number(eventId)]
    );

    return res.status(200).json({
      success: true,
      in_wishlist: rows.length > 0,
      wishlist_id: rows[0]?.id || null,
    });
  } catch (error) {
    console.error("CHECK WISHLIST STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengecek status wishlist.",
    });
  }
};


const createWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { event_id } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (!event_id || !Number.isInteger(Number(event_id))) {
      return res.status(400).json({
        success: false,
        message: "event_id wajib diisi dan harus berupa angka.",
      });
    }

    const eventId = Number(event_id);

    // Cek event ada
    const [events] = await db.query(
      `SELECT id FROM events WHERE id = ? LIMIT 1`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    // Cek duplikat
    const [existing] = await db.query(
      `SELECT id FROM wishlist
       WHERE user_id = ? AND event_id = ?
       LIMIT 1`,
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Event sudah ada di wishlist.",
        wishlist_id: existing[0].id,
      });
    }

    const [result] = await db.query(
      `INSERT INTO wishlist (user_id, event_id)
       VALUES (?, ?)`,
      [userId, eventId]
    );

    const [newWishlist] = await db.query(
      `SELECT
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
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
      WHERE w.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Event berhasil ditambahkan ke wishlist.",
      wishlist: newWishlist[0],
    });
  } catch (error) {
    console.error("CREATE WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan event ke wishlist.",
      error: error.message,
    });
  }
};


const deleteWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const [rows] = await db.query(
      `SELECT id, user_id FROM wishlist WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wishlist tidak ditemukan.",
      });
    }

    if (Number(rows[0].user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak menghapus wishlist ini.",
      });
    }

    await db.query(`DELETE FROM wishlist WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: "Event berhasil dihapus dari wishlist.",
    });
  } catch (error) {
    console.error("DELETE WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus wishlist.",
      error: error.message,
    });
  }
};


const deleteWishlistByEvent = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (!eventId || !Number.isInteger(Number(eventId))) {
      return res.status(400).json({
        success: false,
        message: "Event ID tidak valid.",
      });
    }

    const [result] = await db.query(
      `DELETE FROM wishlist
       WHERE user_id = ? AND event_id = ?`,
      [userId, Number(eventId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ada di wishlist.",
      });
    }

    return res.json({
      success: true,
      message: "Event berhasil dihapus dari wishlist.",
    });
  } catch (error) {
    console.error("DELETE WISHLIST BY EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus wishlist.",
    });
  }
};

module.exports = {
  getAllWishlist,
  getWishlistById,
  getWishlistByUser,
  checkWishlistStatus,
  createWishlist,
  deleteWishlist,
  deleteWishlistByEvent,
};