const express = require("express");

const {
  getAllOrderDetails,
  getOrderDetailById,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
} = require("../controllers/orderDetailController");

const router = express.Router();

router.get("/", getAllOrderDetails);
router.get("/:id", getOrderDetailById);
router.post("/", createOrderDetail);
router.put("/:id", updateOrderDetail);
router.delete("/:id", deleteOrderDetail);

module.exports = router;