const express = require("express");

const {
  handleMidtransNotification,
} = require("../controllers/midtransController");

const router = express.Router();

router.post(
  "/notification",
  handleMidtransNotification
);

module.exports = router;