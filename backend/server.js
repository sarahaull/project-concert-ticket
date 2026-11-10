
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables sebelum memuat routes
dotenv.config();

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// IMPORT ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const sadminRoutes = require("./routes/sadminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const artistRoutes = require("./routes/artistRoutes");
const venueRoutes = require("./routes/venueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const ticketCategoryRoutes = require("./routes/ticketCategoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderDetailRoutes = require("./routes/orderDetailRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const midtransRoutes = require("./routes/midtransRoutes");
const seatRoutes = require("./routes/seatRoutes");

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/sadmin", sadminRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/venues", venueRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/ticket-categories", ticketCategoryRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/order-details", orderDetailRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact-messages", contactMessageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/seats", seatRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/midtrans", midtransRoutes);

// ======================================================
// STATIC FILES
// ======================================================

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// ======================================================
// ROOT & TEST ROUTES
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TicketVerse Backend Aktif",
  });
});

app.get("/api/auth/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route aktif",
  });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("       TICKETVERSE BACKEND");
  console.log("========================================");
  console.log(`Server : http://localhost:${PORT}`);
  console.log(`Auth   : http://localhost:${PORT}/api/auth`);
  console.log("========================================");
  console.log("AUTH ENDPOINTS:");
  console.log("POST /api/auth/register");
  console.log("POST /api/auth/login");
  console.log("POST /api/auth/verify-otp");
  console.log("POST /api/auth/resend-otp");
  console.log("POST /api/auth/forgot-password");
  console.log("POST /api/auth/verify-reset-otp");
  console.log("POST /api/auth/reset-password");
  console.log("========================================");
  console.log("");
});
