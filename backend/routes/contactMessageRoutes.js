const express = require("express");

const {
    getAllContactMessages,
    getContactMessageById,
    createContactMessage,
    deleteContactMessage,
} = require("../controllers/contactMessageController");

const router = express.Router();

router.get("/", getAllContactMessages);

router.get("/:id", getContactMessageById);

router.post("/", createContactMessage);

router.delete("/:id", deleteContactMessage);

module.exports = router;