const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Utility untuk membuat JWT Token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'concert_ticket_jwt_secret_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * POST /api/auth/register - Registrasi User Baru
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi semua field (nama, email, dan password).',
      });
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    // Hash password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user ke database MySQL
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const newUser = await User.findById(userId);
    const token = generateToken(userId);

    return res.status(201).json({
      success: true,
      message: 'Registrasi akun berhasil!',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login - Autentikasi User & Generate Token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi email dan password.',
      });
    }

    // Cari user berdasarkan email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah.',
      });
    }

    // Verifikasi password dengan bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah.',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Kirim response tanpa data password
    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me - Verifikasi JWT Token & Ambil Profil User
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user disuntikkan dari middleware protect
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
