
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const {
  getEvents,
  getEventById,
  getOrganizerEvents,
  getOrganizerEventById,
  createEvent,
  updateEvent,
  submitEvent,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
} = require("../controllers/eventController");

// ============================================================
// PUBLIK
// ============================================================

router.get("/", getEvents);

// ============================================================
// ORGANIZER
// ============================================================

router.get(
  "/organizer/my-events",
  verifyToken,
  getOrganizerEvents
);

router.get(
  "/organizer/my-events/:id",
  verifyToken,
  getOrganizerEventById
);

router.post("/", verifyToken, createEvent);

router.post(
  "/:id/submit",
  verifyToken,
  submitEvent
);

router.put("/:id", verifyToken, updateEvent);

router.delete("/:id", verifyToken, deleteEvent);

// ============================================================
// SUPER ADMIN
// ============================================================

router.get(
  "/admin/pending",
  verifyToken,
  getPendingEvents
);

router.patch(
  "/admin/:id/approve",
  verifyToken,
  approveEvent
);

router.patch(
  "/admin/:id/reject",
  verifyToken,
  rejectEvent
);

// ============================================================
// PUBLIK - DETAIL
// ============================================================

router.get("/:id", getEventById);

module.exports = router;
