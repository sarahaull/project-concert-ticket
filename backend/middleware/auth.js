
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Pastikan JWT_SECRET tersedia
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET belum dikonfigurasi di file .env");

      return res.status(500).json({
        success: false,
        message: "Konfigurasi autentikasi server belum tersedia.",
      });
    }

    // Ambil token dari Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Gunakan format Bearer Token.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak boleh kosong.",
      });
    }

    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validasi payload JWT
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Payload token tidak lengkap.",
      });
    }

    // Simpan informasi user untuk controller
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kedaluwarsa. Silakan login kembali.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memverifikasi token.",
    });
  }
};

module.exports = verifyToken;
