
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

router.post("/midtrans", midtransNotification);

router.use(verifyToken);

router.get("/user/:userId", getNotificationsByUser);
router.patch("/:id/read", markAsRead);

router.get("/", requireSuperAdmin, getAllNotifications);
router.get("/recipients", requireSuperAdmin, getNotificationRecipients);
router.get("/:id", requireSuperAdmin, getNotificationById);

router.post("/", requireSuperAdmin, createNotification);
router.post("/broadcast", requireSuperAdmin, broadcastNotification);

router.put("/:id", requireSuperAdmin, updateNotification);
router.delete("/:id", requireSuperAdmin, deleteNotification);

module.exports = router;
