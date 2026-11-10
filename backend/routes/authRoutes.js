
const express = require("express");
const router = express.Router();

// ============================================================
// IMPORT AUTH CONTROLLER
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
// VALIDASI CONTROLLER
// ============================================================

const controllers = {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};

Object.entries(controllers).forEach(([name, controller]) => {
  if (typeof controller !== "function") {
    throw new Error(
      `Auth Controller "${name}" tidak ditemukan atau bukan function.`
    );
  }
});

console.log("========================================");
console.log("AUTH ROUTES LOADED SUCCESSFULLY");
console.log("========================================");

Object.keys(controllers).forEach((name) => {
  console.log(`${name}: OK`);
});

console.log("========================================");

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post("/register", register);

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post("/login", login);

// ============================================================
// VERIFY OTP LOGIN
// POST /api/auth/verify-otp
// ============================================================

router.post("/verify-otp", verifyOTP);

// ============================================================
// RESEND OTP LOGIN
// POST /api/auth/resend-otp
// ============================================================

router.post("/resend-otp", resendOTP);

// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

router.post("/forgot-password", forgotPassword);

// ============================================================
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// ============================================================

router.post("/verify-reset-otp", verifyResetOTP);

// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

router.post("/reset-password", resetPassword);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
