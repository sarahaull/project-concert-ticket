const express = require("express");

const router = express.Router();

const {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
} = require("../controllers/artistController");

// Ambil semua artist
router.get("/", getArtists);

// Ambil artist berdasarkan ID
router.get("/:id", getArtistById);

// Tambah artist
router.post("/", createArtist);

// Update artist
router.put("/:id", updateArtist);

// Hapus artist
router.delete("/:id", deleteArtist);

module.exports = router;