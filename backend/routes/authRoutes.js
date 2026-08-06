const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes (Butuh Header Authorization: Bearer <token>)
router.get('/me', protect, authController.getProfile);

module.exports = router;
