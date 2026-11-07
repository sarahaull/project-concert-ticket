const express = require("express");

const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Ambil semua kategori
router.get("/", getCategories);

// Ambil kategori berdasarkan ID
router.get("/:id", getCategoryById);

// Tambah kategori
router.post("/", createCategory);

// Update kategori
router.put("/:id", updateCategory);

// Hapus kategori
router.delete("/:id", deleteCategory);

module.exports = router;