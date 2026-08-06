const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Middleware to protect routes – verifies JWT and attaches user */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'concert_ticket_jwt_secret_key_2026');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }
    // Attach minimal user info (including role) to request
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err.message);
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
}

module.exports = { protect };
