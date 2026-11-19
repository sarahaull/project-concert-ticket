const express = require("express");

const router = express.Router();

const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");

router.get("/", getVenues);

router.get("/:id", getVenueById);

router.post("/", createVenue);

router.put("/:id", updateVenue);

router.delete("/:id", deleteVenue);

module.exports = router;