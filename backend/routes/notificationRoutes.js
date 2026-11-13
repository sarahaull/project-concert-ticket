
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

const {
  getAllNotifications,
  getNotificationRecipients,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  broadcastNotification,
  updateNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const {
  midtransNotification,
} = require("../controllers/paymentController");

// WEBHOOK MIDTRANS: TETAP PUBLIC
router.post("/midtrans", midtransNotification);

// SEMUA ROUTE APLIKASI WAJIB LOGIN
router.use(verifyToken);

// NOTIFIKASI CUSTOMER
router.get("/user/:userId", getNotificationsByUser);
router.patch("/:id/read", markAsRead);

// PENGELOLAAN KHUSUS SUPER ADMIN
router.get("/", requireSuperAdmin, getAllNotifications);
router.get("/recipients", requireSuperAdmin, getNotificationRecipients);
router.get("/:id", requireSuperAdmin, getNotificationById);

router.post("/", requireSuperAdmin, createNotification);
router.post("/broadcast", requireSuperAdmin, broadcastNotification);

router.put("/:id", requireSuperAdmin, updateNotification);
router.delete("/:id", requireSuperAdmin, deleteNotification);

module.exports = router;
