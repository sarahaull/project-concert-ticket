// controllers/sadminController.js
const db = require("../config/db");

// ===== Ringkasan Platform =====
const getPlatformSummary = async (req, res) => {
  try {
    const [totalUsers] = await db.query(`SELECT COUNT(*) as total FROM users`);
    const [totalEvents] = await db.query(`SELECT COUNT(*) as total FROM events`);
    const [totalTickets] = await db.query(`SELECT COUNT(*) as total FROM tickets`);
    const [totalRevenue] = await db.query(`SELECT SUM(total_price) as revenue FROM bookings WHERE status = 'confirmed'`);
    const [activeUsers] = await db.query(`SELECT COUNT(DISTINCT user_id) as active FROM sessions WHERE last_activity > NOW() - INTERVAL 1 DAY`);

    res.json({
      success: true,
      summary: {
        users: totalUsers[0].total || 0,
        events: totalEvents[0].total || 0,
        tickets: totalTickets[0].total || 0,
        revenue: totalRevenue[0].revenue || 0,
        activeUsers: activeUsers[0].active || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil ringkasan" });
  }
};

// ===== Daftar User Terbaru =====
const getRecentUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, fullname, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10`
    );
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil user" });
  }
};

// ===== Daftar Event Terbaru =====
const getRecentEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.fullname as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id ORDER BY e.created_at DESC LIMIT 10`
    );
    res.json({ success: true, events: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil event" });
  }
};

// ===== Daftar Transaksi Terbaru =====
const getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.fullname as user_name, e.name as event_name 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN events e ON b.event_id = e.id 
       ORDER BY b.created_at DESC LIMIT 10`
    );
    res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil transaksi" });
  }
};

module.exports = {
  getPlatformSummary,
  getRecentUsers,
  getRecentEvents,
  getRecentTransactions,
};