
const express = require("express");
const router = express.Router();



const {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");



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



router.post("/register", register);



router.post("/login", login);



router.post("/verify-otp", verifyOTP);



router.post("/resend-otp", resendOTP);



router.post("/forgot-password", forgotPassword);



router.post("/verify-reset-otp", verifyResetOTP);



router.post("/reset-password", resetPassword);



module.exports = router;
