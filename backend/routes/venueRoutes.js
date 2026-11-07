const express = require("express");

const router = express.Router();

const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");

// Ambil semua venue
router.get("/", getVenues);

// Ambil venue berdasarkan ID
router.get("/:id", getVenueById);

// Tambah venue
router.post("/", createVenue);

// Update venue
router.put("/:id", updateVenue);

// Hapus venue
router.delete("/:id", deleteVenue);

module.exports = router;