const express = require("express");

const router = express.Router();

const uploadEventPoster = require(
    "../middleware/uploadEventPoster"
);

const {
    uploadPoster,
} = require("../controllers/uploadController");

router.post(
    "/event-poster",
    (req, res, next) => {
        uploadEventPoster.single("poster")(
            req,
            res,
            (error) => {
                if (error) {
                    console.error(
                        "MULTER ERROR:",
                        error
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            error.message ||
                            "Gagal upload file.",
                    });
                }

                next();
            }
        );
    },
    uploadPoster
);

module.exports = router;