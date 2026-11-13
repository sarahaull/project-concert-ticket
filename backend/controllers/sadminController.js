const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Semua endpoint manajemen akun hanya boleh dipanggil super_admin.
const getPlatformSummary = async (req, res) => {
  try {
    const [[users]] = await db.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(role = 'customer') AS totalCustomers,
        SUM(role = 'event_organizer') AS totalOrganizers,
        SUM(role = 'super_admin') AS totalSuperAdmins
      FROM users
    `);

    const [[events]] = await db.query(
      "SELECT COUNT(*) AS totalEvents FROM events"
    );

    const [[tickets]] = await db.query(
      "SELECT COUNT(*) AS totalTickets FROM tickets"
    );

    return res.json({
      success: true,
      summary: {
        users: Number(users.totalUsers || 0),
        customers: Number(users.totalCustomers || 0),
        organizers: Number(users.totalOrganizers || 0),
        superAdmins: Number(users.totalSuperAdmins || 0),
        events: Number(events.totalEvents || 0),
        tickets: Number(tickets.totalTickets || 0),
      },
    });
  } catch (error) {
    console.error("GET PLATFORM SUMMARY:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan platform.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id, fullname, username, email, phone, gender,
        birth_date, photo, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC, id DESC
    `);

    return res.json({ success: true, users: rows });
  } catch (error) {
    console.error("GET USERS:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pengguna.",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      fullname, username, email, password,
      phone, gender, birth_date, role,
    } = req.body;

    const name = String(fullname || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedUsername = username ? String(username).trim() : null;
    const selectedRole = String(role || "customer");

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap, email, dan password wajib diisi.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter.",
      });
    }

    // Super Admin tidak dibuat dari form manajemen akun.
    if (!["customer", "event_organizer"].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role yang dipilih tidak valid.",
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM users
       WHERE LOWER(email) = ? OR (? IS NOT NULL AND username = ?)
       LIMIT 1`,
      [normalizedEmail, normalizedUsername, normalizedUsername]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Email atau username sudah digunakan.",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const [result] = await db.query(
      `INSERT INTO users
        (fullname, username, email, password, phone, gender, birth_date, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        normalizedUsername || null,
        normalizedEmail,
        hashedPassword,
        phone ? String(phone).trim() : null,
        ["Laki-laki", "Perempuan"].includes(gender) ? gender : null,
        birth_date || null,
        selectedRole,
      ]
    );

    const [created] = await db.query(
      `SELECT id, fullname, username, email, phone, gender,
              birth_date, photo, role, created_at, updated_at
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Akun pengguna berhasil dibuat.",
      user: created[0],
    });
  } catch (error) {
    console.error("CREATE USER:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email atau username sudah digunakan.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Gagal membuat akun pengguna.",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const {
      fullname, username, email, phone,
      gender, birth_date, role, password,
    } = req.body;

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: "ID pengguna tidak valid." });
    }

    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    // Akun super_admin tidak dapat diubah melalui modul ini.
    if (rows[0].role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Akun Super Admin dilindungi dan tidak dapat diubah dari halaman ini.",
      });
    }

    const name = String(fullname || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedUsername = username ? String(username).trim() : null;
    const selectedRole = String(role || "");

    if (!name || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap dan email wajib diisi.",
      });
    }

    if (!["customer", "event_organizer"].includes(selectedRole)) {
      return res.status(400).json({ success: false, message: "Role tidak valid." });
    }

    const [duplicate] = await db.query(
      `SELECT id FROM users
       WHERE id <> ? AND
       (LOWER(email) = ? OR (? IS NOT NULL AND username = ?))
       LIMIT 1`,
      [userId, normalizedEmail, normalizedUsername, normalizedUsername]
    );

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        message: "Email atau username sudah digunakan akun lain.",
      });
    }

    if (password && String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 8 karakter.",
      });
    }

    const values = [
      name,
      normalizedUsername || null,
      normalizedEmail,
      phone ? String(phone).trim() : null,
      ["Laki-laki", "Perempuan"].includes(gender) ? gender : null,
      birth_date || null,
      selectedRole,
    ];

    let sql = `UPDATE users SET
      fullname = ?, username = ?, email = ?, phone = ?,
      gender = ?, birth_date = ?, role = ?`;

    if (password) {
      const hashedPassword = await bcrypt.hash(String(password), 10);
      sql += ", password = ?";
      values.push(hashedPassword);
    }

    sql += " WHERE id = ?";
    values.push(userId);

    await db.query(sql, values);

    const [updated] = await db.query(
      `SELECT id, fullname, username, email, phone, gender,
              birth_date, photo, role, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      message: "Data pengguna berhasil diperbarui.",
      user: updated[0],
    });
  } catch (error) {
    console.error("UPDATE USER:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email atau username sudah digunakan.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui data pengguna.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: "ID pengguna tidak valid." });
    }

    if (userId === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Kamu tidak dapat menghapus akun yang sedang digunakan.",
      });
    }

    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    if (rows[0].role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Akun Super Admin tidak dapat dihapus melalui halaman ini.",
      });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return res.json({ success: true, message: "Akun pengguna berhasil dihapus." });
  } catch (error) {
    console.error("DELETE USER:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus akun pengguna.",
    });
  }
};

// Dashboard lain yang sudah ada pada project.
const getRecentUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, fullname, email, role, created_at
       FROM users ORDER BY created_at DESC LIMIT 10`
    );
    return res.json({ success: true, users: rows });
  } catch (error) {
    console.error("GET RECENT USERS:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil user." });
  }
};

const getRecentEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.fullname AS organizer_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       ORDER BY e.created_at DESC LIMIT 10`
    );
    return res.json({ success: true, events: rows });
  } catch (error) {
    console.error("GET RECENT EVENTS:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil event." });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, u.fullname AS user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.order_date DESC LIMIT 10`
    );
    return res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error("GET RECENT TRANSACTIONS:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil transaksi." });
  }
};

// ============================================================
// DAFTAR EVENT UNTUK REVIEW SUPER ADMIN
// ============================================================

const getEventApprovals = async (req, res) => {
  try {
    const status = String(req.query.status || "Pending");

    const allowedStatuses = ["Draft", "Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status) && status !== "All") {
      return res.status(400).json({
        success: false,
        message: "Status approval tidak valid.",
      });
    }

    const params = [];
    let whereClause = "";

    if (status !== "All") {
      whereClause = "WHERE e.approval_status = ?";
      params.push(status);
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
        e.approval_status,
        e.rejection_reason,
        e.approved_at,
        e.approved_by,
        e.created_at,
        u.fullname AS organizer_name,
        u.email AS organizer_email,
        c.category_name,
        a.artist_name,
        v.venue_name,
        v.city
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN artists a ON e.artist_id = a.id
      LEFT JOIN venues v ON e.venue_id = v.id
      ${whereClause}
      ORDER BY e.created_at DESC, e.id DESC`,
      params
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      events: rows,
    });
  } catch (error) {
    console.error("GET EVENT APPROVALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar persetujuan event.",
    });
  }
};

// ============================================================
// APPROVE / REJECT EVENT
// ============================================================

const reviewEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const action = String(req.body.action || "").toLowerCase();
    const rejectionReason = String(
      req.body.rejection_reason || ""
    ).trim();

    if (!Number.isInteger(eventId) || eventId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID event tidak valid.",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Aksi harus berupa approve atau reject.",
      });
    }

    if (action === "reject" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan wajib diisi.",
      });
    }

    const [events] = await db.query(
      `SELECT id, event_name, approval_status
       FROM events
       WHERE id = ?
       LIMIT 1`,
      [eventId]
    );

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    if (events[0].approval_status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "Event ini tidak sedang menunggu persetujuan.",
      });
    }

    if (action === "approve") {
      await db.query(
        `UPDATE events
         SET approval_status = 'Approved',
             rejection_reason = NULL,
             approved_at = NOW(),
             approved_by = ?
         WHERE id = ?
         AND approval_status = 'Pending'`,
        [req.user.id, eventId]
      );
    } else {
      await db.query(
        `UPDATE events
         SET approval_status = 'Rejected',
             rejection_reason = ?,
             approved_at = NULL,
             approved_by = NULL
         WHERE id = ?
         AND approval_status = 'Pending'`,
        [rejectionReason, eventId]
      );
    }

    const [updated] = await db.query(
      `SELECT id, event_name, approval_status,
              rejection_reason, approved_at, approved_by
       FROM events
       WHERE id = ?`,
      [eventId]
    );

    return res.status(200).json({
      success: true,
      message:
        action === "approve"
          ? "Event berhasil disetujui dan dapat ditampilkan kepada customer."
          : "Event berhasil ditolak.",
      event: updated[0],
    });
  } catch (error) {
    console.error("REVIEW EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memproses persetujuan event.",
    });
  }
};

// ============================================================
// LAPORAN TRANSAKSI SUPER ADMIN
// ============================================================

const getReports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const conditions = [];
    const params = [];

    if (startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return res.status(400).json({
          success: false,
          message: "Format tanggal awal tidak valid.",
        });
      }

      conditions.push("DATE(o.order_date) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Format tanggal akhir tidak valid.",
        });
      }

      conditions.push("DATE(o.order_date) <= ?");
      params.push(endDate);
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal awal tidak boleh melebihi tanggal akhir.",
      });
    }

    if (status && status !== "All") {
      conditions.push("o.payment_status = ?");
      params.push(status);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Ringkasan transaksi sesuai filter.
    const [[summary]] = await db.query(
      `
      SELECT
        COUNT(*) AS totalTransactions,

        SUM(
          CASE WHEN o.payment_status = 'Paid'
          THEN 1 ELSE 0 END
        ) AS paidTransactions,

        SUM(
          CASE WHEN o.payment_status = 'Pending'
          THEN 1 ELSE 0 END
        ) AS pendingTransactions,

        SUM(
          CASE WHEN o.payment_status NOT IN ('Paid', 'Pending')
          THEN 1 ELSE 0 END
        ) AS otherTransactions,

        SUM(
          CASE WHEN o.payment_status = 'Paid'
          THEN o.total_price ELSE 0 END
        ) AS revenue

      FROM orders o
      ${whereClause}
      `,
      params
    );

    // Daftar transaksi beserta pembeli, event, dan jumlah tiket.
    const [transactions] = await db.query(
      `
      SELECT
        o.id,
        o.user_id,
        o.order_code,
        o.total_price,
        o.payment_status,
        o.order_date,
        u.fullname AS buyer_name,
        u.email AS buyer_email,

        (
          SELECT GROUP_CONCAT(
            DISTINCT e.event_name
            SEPARATOR ', '
          )
          FROM order_details od
          INNER JOIN ticket_categories tc
            ON tc.id = od.ticket_category_id
          INNER JOIN events e
            ON e.id = tc.event_id
          WHERE od.order_id = o.id
        ) AS event_names,

        (
          SELECT COALESCE(SUM(od.quantity), 0)
          FROM order_details od
          WHERE od.order_id = o.id
        ) AS ticket_quantity

      FROM orders o

      LEFT JOIN users u
        ON u.id = o.user_id

      ${whereClause}

      ORDER BY o.order_date DESC, o.id DESC
      `,
      params
    );

    return res.json({
      success: true,
      summary: {
        totalTransactions: Number(summary.totalTransactions || 0),
        paidTransactions: Number(summary.paidTransactions || 0),
        pendingTransactions: Number(summary.pendingTransactions || 0),
        otherTransactions: Number(summary.otherTransactions || 0),
        revenue: Number(summary.revenue || 0),
      },
      transactions,
    });
  } catch (error) {
    console.error("GET SUPER ADMIN REPORTS:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan transaksi.",
    });
  }
};
module.exports = {
  getPlatformSummary,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRecentUsers,
  getRecentEvents,
  getRecentTransactions,
  getEventApprovals,
  reviewEvent,
  getReports,
};