const express = require("express");
const router = express.Router();

const uploadBanner = require("../middleware/uploadBanner");
const bannerController = require("../controllers/bannerController");

router.get("/home", bannerController.getHomeBanners);


module.exports = router;
