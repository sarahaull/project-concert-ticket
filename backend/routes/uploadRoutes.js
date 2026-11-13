const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const uploadEventPoster = require("../middleware/uploadEventPoster");

const {
  uploadPoster,
  uploadSeatMap,
} = require("../controllers/uploadController");

const handleUpload = (fieldName, controller) => [
  verifyToken,
  (req, res, next) => {
    uploadEventPoster.single(fieldName)(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Gagal upload gambar.",
        });
      }

      next();
    });
  },
  controller,
];

router.post(
  "/event-poster",
  ...handleUpload("poster", uploadPoster)
);

router.post(
  "/seat-map",
  ...handleUpload("seat_map", uploadSeatMap)
);

module.exports = router;