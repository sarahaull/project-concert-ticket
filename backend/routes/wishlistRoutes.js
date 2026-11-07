
const express = require("express");

const {
  getAllWishlist,
  getWishlistById,
  getWishlistByUser,
  createWishlist,
  deleteWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

// GET semua wishlist
router.get("/", getAllWishlist);

// GET wishlist berdasarkan user ID
router.get("/user/:userId", getWishlistByUser);

// GET wishlist berdasarkan ID wishlist
router.get("/:id", getWishlistById);

// TAMBAH wishlist
router.post("/", createWishlist);

// HAPUS wishlist
router.delete("/:id", deleteWishlist);

module.exports = router;
