const express = require("express");

const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Ambil semua event
router.get("/", getEvents);

// Ambil event berdasarkan ID
router.get("/:id", getEventById);

// Tambah event
router.post("/", createEvent);

// Update event
router.put("/:id", updateEvent);

// Hapus event
router.delete("/:id", deleteEvent);

module.exports = router;