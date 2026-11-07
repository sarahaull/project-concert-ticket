const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

const {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

// ============================================================
// CEK CONTROLLER
// ============================================================

console.log("========================================");
console.log("🔐 AUTH ROUTES LOADED");
console.log("register       :", typeof register);
console.log("login          :", typeof login);
console.log("verifyOTP      :", typeof verifyOTP);
console.log("resendOTP      :", typeof resendOTP);
console.log("forgotPassword :", typeof forgotPassword);
console.log("verifyResetOTP :", typeof verifyResetOTP);
console.log("resetPassword  :", typeof resetPassword);
console.log("========================================");

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  register
);

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post(
  "/login",
  login
);

// ============================================================
// VERIFY OTP LOGIN
// POST /api/auth/verify-otp
// ============================================================

router.post(
  "/verify-otp",
  verifyOTP
);

// ============================================================
// RESEND OTP LOGIN
// POST /api/auth/resend-otp
// ============================================================

router.post(
  "/resend-otp",
  resendOTP
);

// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

router.post(
  "/forgot-password",
  forgotPassword
);

// ============================================================
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// ============================================================

router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

router.post(
  "/reset-password",
  resetPassword
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;