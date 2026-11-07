const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");


// GET profile
router.get("/:userId", getProfile);

// UPDATE profile
router.put("/:userId", updateProfile);


module.exports = router;