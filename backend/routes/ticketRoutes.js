
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  checkInTicket,
} = require("../controllers/ticketController");

// Tiket milik pengguna yang login
router.get("/", verifyToken, getAllTickets);

// Detail tiket
router.get("/:id", verifyToken, getTicketById);

// Check-in tiket
router.post("/check-in", verifyToken, checkInTicket);

// Pengelolaan tiket
router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

module.exports = router;
