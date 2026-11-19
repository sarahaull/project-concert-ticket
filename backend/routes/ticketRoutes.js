
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

router.post("/check-in", verifyToken, checkInTicket);

router.get("/check-in/history", verifyToken, getCheckInHistory);

router.get("/:id", verifyToken, getTicketById);

router.post("/", verifyToken, createTicket);
router.put("/:id", verifyToken, updateTicket);
router.delete("/:id", verifyToken, deleteTicket);

module.exports = router;
