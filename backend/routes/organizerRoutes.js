
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
} = require("../controllers/organizerController");

// Semua route organizer wajib login
router.get("/profile", verifyToken, getProfile);
router.get("/stats", verifyToken, getEventStats);
router.get("/events", verifyToken, getMyEvents);
router.get("/bookings", verifyToken, getEventBookings);

module.exports = router;
