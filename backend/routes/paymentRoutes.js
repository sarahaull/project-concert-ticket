
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getAllPayments,
  getPaymentById,
  midtransNotification,
  checkMidtransStatus,
  testMidtrans,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

// Webhook Midtrans
router.post("/notification", midtransNotification);

// Status transaksi milik pengguna yang login
router.get(
  "/midtrans-status/:orderId",
  verifyToken,
  checkMidtransStatus
);

// Test koneksi Midtrans
router.get("/test", testMidtrans);

// Payment
router.get("/", verifyToken, getAllPayments);
router.get("/:id", verifyToken, getPaymentById);

router.post("/", verifyToken, createPayment);
router.put("/:id", verifyToken, updatePayment);
router.delete("/:id", verifyToken, deletePayment);

module.exports = router;
  