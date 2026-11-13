
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
  getCheckInHistory,
} = require("../controllers/ticketController");

router.get("/", verifyToken, getAllTickets);

// CHECK-IN
router.post("/check-in", verifyToken, checkInTicket);

// RIWAYAT CHECK-IN
router.get("/check-in/history", verifyToken, getCheckInHistory);

// DETAIL TIKET
router.get("/:id", verifyToken, getTicketById);

// ENDPOINT LAMA
router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

module.exports = router;
