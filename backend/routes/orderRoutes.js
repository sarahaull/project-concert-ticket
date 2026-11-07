
const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const verifyToken = require("../middleware/auth");

// Semua route yang membutuhkan identitas pengguna
router.get("/", verifyToken, getAllOrders);
router.get("/:id", verifyToken, getOrderById);

router.post("/", verifyToken, createOrder);

router.put("/:id", verifyToken, updateOrder);
router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
