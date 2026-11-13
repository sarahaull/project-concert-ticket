
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const uploadProfile = require("../middleware/uploadProfile");

const {
  getProfile,
  updateProfile,
  getTicketStats,
  getActiveTickets,
  getBookingHistory,
  getRecommendations,
  getPromos,
} = require("../controllers/userController");

// PROFILE
router.get("/profile", verifyToken, getProfile);

router.put(
  "/profile",
  verifyToken,
  uploadProfile.single("photo"),
  updateProfile
);

// USER DATA
router.get("/stats", verifyToken, getTicketStats);
router.get("/tickets/active", verifyToken, getActiveTickets);
router.get("/bookings", verifyToken, getBookingHistory);
router.get("/recommendations", verifyToken, getRecommendations);
router.get("/promos", verifyToken, getPromos);

module.exports = router;
