const express = require("express");

const router = express.Router();

const {
  getTicketCategories,
  getTicketCategoryById,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
} = require("../controllers/ticketCategoryController");

// Ambil semua kategori tiket
router.get("/", getTicketCategories);

// Ambil kategori tiket berdasarkan ID
router.get("/:id", getTicketCategoryById);

// Tambah kategori tiket
router.post("/", createTicketCategory);

// Update kategori tiket
router.put("/:id", updateTicketCategory);

// Hapus kategori tiket
router.delete("/:id", deleteTicketCategory);

module.exports = router;