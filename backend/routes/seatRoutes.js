
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getEventSeatMap,
  createSection,
  createSeats
} = require("../controllers/seatController");

// Customer dan pengunjung dapat melihat denah
router.get("/events/:eventId", getEventSeatMap);

// Organizer mengelola section
router.post(
  "/events/:eventId/sections",
  verifyToken,
  createSection
);

// Organizer menambahkan kursi ke section
router.post(
  "/sections/:sectionId/seats",
  verifyToken,
  createSeats
);

module.exports = router;
