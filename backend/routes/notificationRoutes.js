
const express = require("express");

const {
  getAllNotifications,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  updateNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const {
  midtransNotification,
} = require("../controllers/paymentController");

const router = express.Router();

// ============================================================
// WEBHOOK MIDTRANS
// POST /api/notifications/midtrans
// ============================================================
// Tidak memakai middleware login karena request berasal dari
// server Midtrans. Validasi signature dilakukan di controller.
router.post("/midtrans", midtransNotification);

// ============================================================
// NOTIFIKASI APLIKASI
// ============================================================

router.get("/", getAllNotifications);
router.get("/user/:userId", getNotificationsByUser);

// Route spesifik diletakkan sebelum route dinamis /:id.
router.patch("/:id/read", markAsRead);

router.post("/", createNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

router.get("/:id", getNotificationById);

module.exports = router;
