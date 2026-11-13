
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

const sadminController = require("../controllers/sadminController");
const bannerController = require("../controllers/bannerController");
const uploadBanner = require("../middleware/uploadBanner");

router.use(verifyToken, requireSuperAdmin);

// Ringkasan dashboard
router.get("/summary", sadminController.getPlatformSummary);

// Manajemen banner beranda customer
router.get("/banners", bannerController.getAdminBanners);
router.post("/banners", uploadBanner.single("banner"), bannerController.createBanner);
router.put("/banners/:id", uploadBanner.single("banner"), bannerController.updateBanner);
router.delete("/banners/:id", bannerController.deleteBanner);

// Manajemen pengguna
router.get("/users", sadminController.getUsers);
router.post("/users", sadminController.createUser);
router.put("/users/:id", sadminController.updateUser);
router.delete("/users/:id", sadminController.deleteUser);

// Data terbaru dashboard
router.get("/users/recent", sadminController.getRecentUsers);
router.get("/events/recent", sadminController.getRecentEvents);
router.get("/transactions/recent", sadminController.getRecentTransactions);
// Persetujuan event
router.get("/event-approvals", sadminController.getEventApprovals);
router.patch("/events/:id/approval", sadminController.reviewEvent);
router.get("/reports", sadminController.getReports);

module.exports = router;
