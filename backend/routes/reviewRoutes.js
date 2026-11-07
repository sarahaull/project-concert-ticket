const express = require("express");

const {
    getAllReviews,
    getReviewById,
    getReviewsByEvent,
    getReviewsByUser,
    createReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

// GET semua review
router.get("/", getAllReviews);

// GET review berdasarkan event
router.get("/event/:eventId", getReviewsByEvent);

// GET review berdasarkan user
router.get("/user/:userId", getReviewsByUser);

// GET review berdasarkan ID
router.get("/:id", getReviewById);

// POST review
router.post("/", createReview);

// PUT review
router.put("/:id", updateReview);

// DELETE review
router.delete("/:id", deleteReview);

module.exports = router;