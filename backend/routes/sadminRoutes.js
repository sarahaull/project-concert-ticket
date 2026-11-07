const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getPlatformSummary,
  getRecentUsers,
  getRecentEvents,
  getRecentTransactions,
} = require("../controllers/sadminController");

// Tambahkan middleware checkRole jika diperlukan
router.get("/summary", verifyToken, getPlatformSummary);
router.get("/users/recent", verifyToken, getRecentUsers);
router.get("/events/recent", verifyToken, getRecentEvents);
router.get("/transactions/recent", verifyToken, getRecentTransactions);

module.exports = router;