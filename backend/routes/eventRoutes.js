
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Event publik
router.get("/", getEvents);
router.get("/:id", getEventById);

// Event yang membutuhkan autentikasi
router.post("/", verifyToken, createEvent);
router.put("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
