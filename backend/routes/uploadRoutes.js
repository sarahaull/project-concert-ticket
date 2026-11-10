
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const uploadEventPoster = require("../middleware/uploadEventPoster");

const {
  uploadPoster,
} = require("../controllers/uploadController");

router.post(
  "/event-poster",
  verifyToken,
  (req, res, next) => {
    uploadEventPoster.single("poster")(req, res, (error) => {
      if (error) {
        console.error("MULTER ERROR:", error);

        return res.status(400).json({
          success: false,
          message: error.message || "Gagal upload poster.",
        });
      }

      next();
    });
  },
  uploadPoster
);

module.exports = router;
