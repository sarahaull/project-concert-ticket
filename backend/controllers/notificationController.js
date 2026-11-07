const db = require("../config/db");

// ===============================
// GET ALL NOTIFICATIONS
// ===============================
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
      LEFT JOIN users u
        ON n.user_id = u.id

      ORDER BY n.id DESC
    `);

    res.json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data notifikasi",
      error: error.message,
    });
  }
};

// ===============================
// GET NOTIFICATION BY ID
// ===============================
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
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
      LEFT JOIN users u
        ON n.user_id = u.id

      WHERE n.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
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
    console.error("GET NOTIFICATION BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data notifikasi",
      error: error.message,
    });
  }
};

// ===============================
// GET NOTIFICATIONS BY USER
// ===============================
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error("GET USER NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi user",
      error: error.message,
    });
  }
};

// ===============================
// CREATE NOTIFICATION
// ===============================
const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      is_read,
    } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "user_id, title, dan message wajib diisi",
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

    const finalIsRead =
      is_read === true || is_read === 1 ? 1 : 0;

    const [result] = await db.query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        is_read
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        user_id,
        title,
        message,
        finalIsRead,
      ]
    );

    const [newNotification] = await db.query(
      `
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
      LEFT JOIN users u
        ON n.user_id = u.id
      WHERE n.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Notifikasi berhasil dibuat",
      notification: newNotification[0],
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal membuat notifikasi",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE NOTIFICATION
// ===============================
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      message,
      is_read,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title dan message wajib diisi",
      });
    }

    if (
      is_read !== true &&
      is_read !== false &&
      is_read !== 0 &&
      is_read !== 1
    ) {
      return res.status(400).json({
        success: false,
        message: "is_read harus true, false, 0, atau 1",
      });
    }

    const [notifications] = await db.query(
      `
      SELECT id
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    const finalIsRead =
      is_read === true || is_read === 1 ? 1 : 0;

    await db.query(
      `
      UPDATE notifications
      SET
        title = ?,
        message = ?,
        is_read = ?
      WHERE id = ?
      `,
      [
        title,
        message,
        finalIsRead,
        id,
      ]
    );

    const [updatedNotification] = await db.query(
      `
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
      LEFT JOIN users u
        ON n.user_id = u.id
      WHERE n.id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Notifikasi berhasil diperbarui",
      notification: updatedNotification[0],
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui notifikasi",
      error: error.message,
    });
  }
};

// ===============================
// MARK AS READ
// ===============================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [notifications] = await db.query(
      `
      SELECT id
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    await db.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
      `,
      [id]
    );

    const [updatedNotification] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Notifikasi ditandai sudah dibaca",
      notification: updatedNotification[0],
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menandai notifikasi",
      error: error.message,
    });
  }
};

// ===============================
// DELETE NOTIFICATION
// ===============================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [notifications] = await db.query(
      `
      SELECT id
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    await db.query(
      `
      DELETE FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  updateNotification,
  markAsRead,
  deleteNotification,
};