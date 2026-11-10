
const db = require("../config/db");

// ============================================================
// VALIDASI ORGANIZER
// ============================================================

const getOrganizerId = (req) => {
  const user = req.user;

  if (!user?.id) {
    return null;
  }

  const role = String(user.role || "").toLowerCase();

  if (!["organizer", "event_organizer"].includes(role)) {
    return null;
  }

  return user.id;
};

// ============================================================
// PROFIL ORGANIZER
// ============================================================

const getProfile = async (req, res) => {
  try {
    const userId = getOrganizerId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Akun bukan event organizer.",
      });
    }

    const [rows] = await db.query(
      `SELECT
        id,
        fullname,
        username,
        email,
        phone,
        address,
        avatar,
        created_at,
        organization_name,
        verified
      FROM users
      WHERE id = ?
      AND role IN ('organizer', 'event_organizer')
      LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Organizer tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      organizer: rows[0],
    });
  } catch (error) {
    console.error("GET ORGANIZER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil organizer.",
    });
  }
};

// ============================================================
// STATISTIK EVENT
// ============================================================

const getEventStats = async (req, res) => {
  try {
    const userId = getOrganizerId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Akun bukan event organizer.",
      });
    }

    const [stats] = await db.query(
      `SELECT
        COUNT(*) AS totalEvents,
        SUM(
          CASE
            WHEN event_date >= CURDATE() THEN 1
            ELSE 0
          END
        ) AS upcoming,
        SUM(
          CASE
            WHEN event_date < CURDATE() THEN 1
            ELSE 0
          END
        ) AS past
      FROM events
      WHERE organizer_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents: Number(stats[0].totalEvents || 0),
        upcoming: Number(stats[0].upcoming || 0),
        past: Number(stats[0].past || 0),
        totalRevenue: 0,
      },
    });
  } catch (error) {
    console.error("GET EVENT STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik event.",
    });
  }
};

// ============================================================
// DAFTAR EVENT MILIK ORGANIZER
// ============================================================

const getMyEvents = async (req, res) => {
  try {
    const userId = getOrganizerId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Akun bukan event organizer.",
      });
    }

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
      WHERE e.organizer_id = ?
      ORDER BY e.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      events: rows,
    });
  } catch (error) {
    console.error("GET MY EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil event organizer.",
    });
  }
};

// ============================================================
// DAFTAR PEMESANAN EVENT ORGANIZER
// ============================================================

const getEventBookings = async (req, res) => {
  try {
    const userId = getOrganizerId(req);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Akun bukan event organizer.",
      });
    }

    const [rows] = await db.query(
      `SELECT
        b.*,
        e.event_name,
        u.fullname AS customer_name
      FROM bookings b
      INNER JOIN events e ON b.event_id = e.id
      INNER JOIN users u ON b.user_id = u.id
      WHERE e.organizer_id = ?
      ORDER BY b.created_at DESC
      LIMIT 20`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      bookings: rows,
    });
  } catch (error) {
    console.error("GET EVENT BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pemesanan event. Periksa struktur tabel bookings.",
    });
  }
};

module.exports = {
  getProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
};
