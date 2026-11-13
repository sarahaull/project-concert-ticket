
const db = require("../config/db");

// ======================================================
// GET PROFILE USER LOGIN
// ======================================================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        id,
        fullname,
        username,
        email,
        phone,
        gender,
        birth_date,
        photo,
        role,
        created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil",
    });
  }
};

// ======================================================
// UPDATE PROFILE USER LOGIN
// ======================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const fullname =
      typeof req.body.fullname === "string"
        ? req.body.fullname.trim()
        : "";

    const phone =
      typeof req.body.phone === "string"
        ? req.body.phone.trim()
        : "";

    const gender = req.body.gender || null;
    const birth_date = req.body.birth_date || null;

    if (!fullname) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap wajib diisi",
      });
    }

    if (fullname.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Nama maksimal 150 karakter",
      });
    }

    if (
      gender &&
      !["Laki-laki", "Perempuan"].includes(gender)
    ) {
      return res.status(400).json({
        success: false,
        message: "Jenis kelamin tidak valid",
      });
    }

    if (birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir tidak valid",
      });
    }

    const [existing] = await db.query(
      `SELECT id, photo
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Jika tidak upload foto baru, gunakan foto sebelumnya.
    const photo = req.file
      ? `/uploads/profiles/${req.file.filename}`
      : existing[0].photo;

    await db.query(
      `UPDATE users
       SET
         fullname = ?,
         phone = ?,
         gender = ?,
         birth_date = ?,
         photo = ?
       WHERE id = ?`,
      [
        fullname,
        phone || null,
        gender,
        birth_date || null,
        photo,
        userId,
      ]
    );

    // Ambil kembali data terbaru dari database.
    const [updatedRows] = await db.query(
      `SELECT
        id,
        fullname,
        username,
        email,
        phone,
        gender,
        birth_date,
        photo,
        role,
        created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: updatedRows[0],
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil",
    });
  }
};

// ======================================================
// STATISTIK TIKET
// ======================================================
const getTicketStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [total] = await db.query(
      `SELECT COUNT(*) AS total
       FROM tickets
       WHERE user_id = ?`,
      [userId]
    );

    const [active] = await db.query(
      `SELECT COUNT(*) AS active
       FROM tickets
       WHERE user_id = ?
       AND status = 'active'
       AND event_date >= CURDATE()`,
      [userId]
    );

    const [expired] = await db.query(
      `SELECT COUNT(*) AS expired
       FROM tickets
       WHERE user_id = ?
       AND (
         status = 'expired'
         OR event_date < CURDATE()
       )`,
      [userId]
    );

    const [spent] = await db.query(
      `SELECT SUM(price) AS totalSpent
       FROM tickets
       WHERE user_id = ?
       AND status = 'confirmed'`,
      [userId]
    );

    return res.json({
      success: true,
      stats: {
        total: total[0].total || 0,
        active: active[0].active || 0,
        expired: expired[0].expired || 0,
        totalSpent: spent[0].totalSpent || 0,
      },
    });
  } catch (error) {
    console.error("TICKET STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik",
    });
  }
};

// ======================================================
// TIKET AKTIF
// ======================================================
const getActiveTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        t.*,
        e.name AS event_name,
        e.venue,
        e.category,
        e.organizer,
        e.image
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.user_id = ?
       AND t.status = 'active'
       AND e.event_date >= CURDATE()
       ORDER BY e.event_date ASC
       LIMIT 10`,
      [userId]
    );

    return res.json({
      success: true,
      tickets: rows,
    });
  } catch (error) {
    console.error("ACTIVE TICKETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil tiket aktif",
    });
  }
};

// ======================================================
// RIWAYAT PEMESANAN
// ======================================================
const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        b.*,
        e.name AS event_name,
        e.event_date
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT 10`,
      [userId]
    );

    return res.json({
      success: true,
      bookings: rows,
    });
  } catch (error) {
    console.error("BOOKING HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat",
    });
  }
};

// ======================================================
// REKOMENDASI EVENT
// ======================================================
const getRecommendations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM events
       WHERE event_date >= CURDATE()
       ORDER BY rating DESC
       LIMIT 10`
    );

    return res.json({
      success: true,
      events: rows,
    });
  } catch (error) {
    console.error("RECOMMENDATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil rekomendasi",
    });
  }
};

// ======================================================
// PROMO
// ======================================================
const getPromos = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM promos
       WHERE valid_until >= CURDATE()
       LIMIT 5`
    );

    return res.json({
      success: true,
      promos: rows,
    });
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.json({
        success: true,
        promos: [],
      });
    }

    console.error("PROMOS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil promo",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================
module.exports = {
  getProfile,
  updateProfile,
  getTicketStats,
  getActiveTickets,
  getBookingHistory,
  getRecommendations,
  getPromos,
};
