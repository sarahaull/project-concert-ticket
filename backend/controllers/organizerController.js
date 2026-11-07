// controllers/organizerController.js
const db = require("../config/db");

// ===== Profil Organizer =====
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT id, fullname, username, email, phone, address, avatar, created_at, organization_name, verified
       FROM users WHERE id = ? AND role = 'organizer'`,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Organizer tidak ditemukan" });
    }
    res.json({ success: true, organizer: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil profil organizer" });
  }
};

// ===== Statistik Event =====
const getEventStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total] = await db.query(
      `SELECT COUNT(*) as total FROM events WHERE organizer_id = ?`,
      [userId]
    );
    const [upcoming] = await db.query(
      `SELECT COUNT(*) as upcoming FROM events WHERE organizer_id = ? AND event_date >= CURDATE()`,
      [userId]
    );
    const [past] = await db.query(
      `SELECT COUNT(*) as past FROM events WHERE organizer_id = ? AND event_date < CURDATE()`,
      [userId]
    );
    const [revenue] = await db.query(
      `SELECT SUM(total_price) as revenue FROM bookings b JOIN events e ON b.event_id = e.id WHERE e.organizer_id = ? AND b.status = 'confirmed'`,
      [userId]
    );
    res.json({
      success: true,
      stats: {
        totalEvents: total[0].total || 0,
        upcoming: upcoming[0].upcoming || 0,
        past: past[0].past || 0,
        totalRevenue: revenue[0].revenue || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil statistik event" });
  }
};

// ===== Daftar Event yang Dibuat =====
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );
    res.json({ success: true, events: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil event" });
  }
};

// ===== Daftar Pemesanan untuk Event Saya =====
const getEventBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT b.*, e.name as event_name, u.fullname as customer_name
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN users u ON b.user_id = u.id
       WHERE e.organizer_id = ?
       ORDER BY b.created_at DESC
       LIMIT 20`,
      [userId]
    );
    res.json({ success: true, bookings: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil pemesanan" });
  }
};

module.exports = {
  getProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
};