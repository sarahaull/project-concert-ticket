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

router.get("/", verifyToken, getAllTickets);

router.post("/check-in", verifyToken, checkInTicket);

router.get("/:id", verifyToken, getTicketById);

// Endpoint lama tetap tersedia,
// tetapi controller mengembalikan 403.
router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

module.exports = router;