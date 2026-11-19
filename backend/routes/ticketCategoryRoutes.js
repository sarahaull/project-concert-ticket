const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getTicketCategories,
  getTicketCategoryById,
  getTicketCategoriesByEvent,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
} = require("../controllers/ticketCategoryController");

router.get("/", getTicketCategories);
router.get("/event/:eventId", getTicketCategoriesByEvent);
router.get("/:id", getTicketCategoryById);

router.post("/", verifyToken, createTicketCategory);
router.put("/:id", verifyToken, updateTicketCategory);
router.delete("/:id", verifyToken, deleteTicketCategory);

module.exports = router;