const db = require("../config/db");

// ===== Profil User =====
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("USER ID:", userId);

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
       WHERE id = ?`,
      [userId]
    );

    console.log("PROFILE:", rows);

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
      error: error.message,
    });
  }
};

// ===== Statistik Tiket =====
const getTicketStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total] = await db.query(
      `SELECT COUNT(*) as total FROM tickets WHERE user_id = ?`,
      [userId]
    );
    const [active] = await db.query(
      `SELECT COUNT(*) as active FROM tickets WHERE user_id = ? AND status = 'active' AND event_date >= CURDATE()`,
      [userId]
    );
    const [expired] = await db.query(
      `SELECT COUNT(*) as expired FROM tickets WHERE user_id = ? AND (status = 'expired' OR event_date < CURDATE())`,
      [userId]
    );
    const [spent] = await db.query(
      `SELECT SUM(price) as totalSpent FROM tickets WHERE user_id = ? AND status = 'confirmed'`,
      [userId]
    );
    res.json({
      success: true,
      stats: {
        total: total[0].total || 0,
        active: active[0].active || 0,
        expired: expired[0].expired || 0,
        totalSpent: spent[0].totalSpent || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil statistik" });
  }
};

// ===== Tiket Aktif =====
const getActiveTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT t.*, e.name as event_name, e.venue, e.category, e.organizer, e.image
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.user_id = ? AND t.status = 'active' AND e.event_date >= CURDATE()
       ORDER BY e.event_date ASC
       LIMIT 10`,
      [userId]
    );
    res.json({ success: true, tickets: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil tiket aktif" });
  }
};

// ===== Riwayat Pemesanan =====
const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT b.*, e.name as event_name, e.event_date
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT 10`,
      [userId]
    );
    res.json({ success: true, bookings: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil riwayat" });
  }
};

// ===== Rekomendasi Event =====
const getRecommendations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY rating DESC LIMIT 10`
    );
    res.json({ success: true, events: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil rekomendasi" });
  }
};

// ===== Promo (dengan fallback jika tabel tidak ada) =====
const getPromos = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM promos WHERE valid_until >= CURDATE() LIMIT 5`);
    res.json({ success: true, promos: rows });
  } catch (error) {
    // Jika tabel promos belum ada, kembalikan array kosong
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, promos: [] });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil promo" });
  }
};

module.exports = {
  getProfile,
  getTicketStats,
  getActiveTickets,
  getBookingHistory,
  getRecommendations,
  getPromos,
};