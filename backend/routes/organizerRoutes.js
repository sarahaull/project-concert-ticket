const express = require("express");
const router = express.Router();

// Import controller lama + controller pengajuan organizer
const {
  getProfile,
  updateProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
  getOrganizerApplication,
  submitOrganizerApplication,
  getOrganizerApplications,
  reviewOrganizerApplication,
} = require("../controllers/organizerController");

// Middleware autentikasi
const verifyToken = require("../middleware/auth");

if (typeof verifyToken !== "function") {
  throw new Error("Middleware verifyToken tidak valid.");
}

// Semua endpoint organizer memerlukan login
router.use(verifyToken);

// Role guard untuk endpoint khusus Super Admin
const onlySuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Akses hanya untuk Super Admin.",
    });
  }
  next();
};

// ============================================================
// ROUTE ORGANIZER LAMA - TETAP DIPERTAHANKAN
// ============================================================
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/stats", getEventStats);
router.get("/events", getMyEvents);
router.get("/bookings", getEventBookings);

// ============================================================
// ROUTE PENGAJUAN EVENT ORGANIZER
// ============================================================
// Customer: cek status dan mengirim/mengirim ulang pengajuan
router.get("/application/me", getOrganizerApplication);
router.post("/application", submitOrganizerApplication);

// Super Admin: melihat dan memutuskan pengajuan
router.get("/applications", onlySuperAdmin, getOrganizerApplications);
router.patch("/applications/:id/review", onlySuperAdmin, reviewOrganizerApplication);

module.exports = router;
