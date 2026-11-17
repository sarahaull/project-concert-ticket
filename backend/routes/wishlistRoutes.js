const express = require("express");

const {
  getAllWishlist,
  getWishlistById,
  getWishlistByUser,
  checkWishlistStatus,
  createWishlist,
  deleteWishlist,
  deleteWishlistByEvent,
} = require("../controllers/wishlistController");

const verifyToken = require("../middleware/auth");

const router = express.Router();


router.get("/", getAllWishlist);



router.get("/me/check/:eventId", verifyToken, checkWishlistStatus);

router.get("/user/:userId", getWishlistByUser);

router.post("/", verifyToken, createWishlist);

router.delete("/:id", verifyToken, deleteWishlist);

router.delete("/event/:eventId", verifyToken, deleteWishlistByEvent);


router.get("/:id", getWishlistById);

module.exports = router;