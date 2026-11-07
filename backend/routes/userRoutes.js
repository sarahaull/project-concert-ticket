const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getProfile,
  getTicketStats,
  getActiveTickets,
  getBookingHistory,
  getRecommendations,
  getPromos,
} = require("../controllers/userController");

// Semua endpoint di bawah membutuhkan token dan role 'customer' (opsional)
router.get("/profile", verifyToken, getProfile);
router.get("/stats", verifyToken, getTicketStats);
router.get("/tickets/active", verifyToken, getActiveTickets);
router.get("/bookings", verifyToken, getBookingHistory);
router.get("/recommendations", verifyToken, getRecommendations);
router.get("/promos", verifyToken, getPromos);

module.exports = router;