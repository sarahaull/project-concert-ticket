const express = require("express");
const router = express.Router();

const uploadBanner = require("../middleware/uploadBanner");
const bannerController = require("../controllers/bannerController");

// Endpoint publik untuk dashboard customer.
router.get("/home", bannerController.getHomeBanners);

// Endpoint pengelolaan banner berada di /api/sadmin/banners
// agar mengikuti proteksi verifyToken + requireSuperAdmin.
module.exports = router;
