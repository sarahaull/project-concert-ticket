const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Database Connection (otomatis menguji koneksi saat di-require)
const db = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Configuration
// ==========================================

// 1. CORS Configuration (Mengizinkan permintaan dari Frontend Next.js)
app.use(
  cors({
    origin: '*', // Bisa disesuaikan dengan http://localhost:3000 jika ingin lebih spesifik
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Files Middleware (Akses file poster/media yang diupload via URL http://localhost:5000/uploads/...)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// Routes Configuration
// ==========================================

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Welcome to Concert Ticket Booking System API 🚀',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Modular
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// ==========================================
// Error Handling Middleware
// ==========================================

// 1. Handler 404 Not Found (Route tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' tidak ditemukan pada server ini.`,
  });
});

// 2. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);

  // Error spesifik dari Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar! Maksimal 5MB.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📂 Static upload path: http://localhost:${PORT}/uploads`);
  console.log(`===========================================`);
});
