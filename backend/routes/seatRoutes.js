
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getEventSeatMap,
  createSection,
  createSeats
} = require("../controllers/seatController");

router.get("/events/:eventId", getEventSeatMap);

router.post(
  "/events/:eventId/sections",
  verifyToken,
  createSection
);

router.post(
  "/sections/:sectionId/seats",
  verifyToken,
  createSeats
);

module.exports = router;
