const express = require("express");

const {
    getAllContactMessages,
    getContactMessageById,
    createContactMessage,
    deleteContactMessage,
} = require("../controllers/contactMessageController");

const router = express.Router();

// GET semua pesan
router.get("/", getAllContactMessages);

// GET pesan berdasarkan ID
router.get("/:id", getContactMessageById);

// POST pesan baru
router.post("/", createContactMessage);

// DELETE pesan
router.delete("/:id", deleteContactMessage);

module.exports = router;