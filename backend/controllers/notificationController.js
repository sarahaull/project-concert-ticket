
const db = require("../config/db");

// GET SEMUA NOTIFIKASI UNTUK ADMIN
const getAllNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.is_read,
        n.created_at,
        u.fullname,
        u.email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
    `);

    res.json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
    });
  }
};

// GET DAFTAR CUSTOMER UNTUK PILIHAN PENERIMA
const getNotificationRecipients = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, fullname, email
      FROM users
      WHERE role = 'customer'
      ORDER BY fullname ASC
    `);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar customer",
    });
  }
};

// GET NOTIFIKASI BERDASARKAN ID
const getNotificationById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT n.*, u.fullname, u.email
       FROM notifications n
       LEFT JOIN users u ON u.id = n.user_id
       WHERE n.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      notification: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
    });
  }
};

// GET NOTIFIKASI CUSTOMER
const getNotificationsByUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (req.user.role !== "super_admin" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses",
      });
    }

    const [rows] = await db.query(
      `SELECT *
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi pengguna",
    });
  }
};

// BUAT NOTIFIKASI UNTUK SATU CUSTOMER
const createNotification = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;

    if (!user_id || !title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Penerima, judul, dan pesan wajib diisi",
      });
    }

    const [users] = await db.query(
      `SELECT id FROM users WHERE id = ? AND role = 'customer'`,
      [user_id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    const [result] = await db.query(
      `INSERT INTO notifications
       (user_id, title, message, is_read)
       VALUES (?, ?, ?, 0)`,
      [user_id, title.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Notifikasi berhasil dibuat",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat notifikasi",
    });
  }
};

// BROADCAST KE SELURUH CUSTOMER ATAU CUSTOMER PILIHAN
const broadcastNotification = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { title, message, recipient_type, user_ids } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Judul dan pesan wajib diisi",
      });
    }

    let users = [];

    if (recipient_type === "all") {
      const [rows] = await connection.query(
        `SELECT id FROM users WHERE role = 'customer'`
      );
      users = rows;
    } else if (recipient_type === "selected") {
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pilih minimal satu customer",
        });
      }

      const ids = [...new Set(
        user_ids.map(Number).filter(id => Number.isInteger(id) && id > 0)
      )];

      if (!ids.length) {
        return res.status(400).json({
          success: false,
          message: "Daftar customer tidak valid",
        });
      }

      const placeholders = ids.map(() => "?").join(",");

      const [rows] = await connection.query(
        `SELECT id FROM users
         WHERE role = 'customer'
         AND id IN (${placeholders})`,
        ids
      );

      if (rows.length !== ids.length) {
        return res.status(400).json({
          success: false,
          message: "Terdapat customer yang tidak valid",
        });
      }

      users = rows;
    } else {
      return res.status(400).json({
        success: false,
        message: "Jenis penerima tidak valid",
      });
    }

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada customer sebagai penerima",
      });
    }

    await connection.beginTransaction();

    const values = users.map(user => [
      user.id,
      title.trim(),
      message.trim(),
      0,
    ]);

    await connection.query(
      `INSERT INTO notifications
       (user_id, title, message, is_read)
       VALUES ?`,
      [values]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Notifikasi berhasil dikirim",
      total_recipients: users.length,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Gagal mengirim notifikasi",
    });
  } finally {
    connection.release();
  }
};

// UPDATE NOTIFIKASI
const updateNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Judul dan pesan wajib diisi",
      });
    }

    const [result] = await db.query(
      `UPDATE notifications
       SET title = ?, message = ?
       WHERE id = ?`,
      [title.trim(), message.trim(), req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Notifikasi berhasil diperbarui",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui notifikasi",
    });
  }
};

// MARK AS READ
const markAsRead = async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ?
       AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Notifikasi sudah dibaca",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui status",
    });
  }
};

// DELETE NOTIFIKASI
const deleteNotification = async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE FROM notifications WHERE id = ?`,
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
    });
  }
};

module.exports = {
  getAllNotifications,
  getNotificationRecipients,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  broadcastNotification,
  updateNotification,
  markAsRead,
  deleteNotification,
};
