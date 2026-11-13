
const express = require("express");
const router = express.Router();

// Import controller
const {
  getProfile,
  updateProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
} = require("../controllers/organizerController");

// Import middleware (sesuai module.exports di auth.js)
const verifyToken = require("../middleware/auth");

// Validasi middleware
if (typeof verifyToken !== "function") {
  throw new Error("Middleware verifyToken tidak valid.");
}

// Autentikasi seluruh route organizer
router.use(verifyToken);

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard
router.get("/stats", getEventStats);

// Events
router.get("/events", getMyEvents);

// Bookings
router.get("/bookings", getEventBookings);

module.exports = router;
