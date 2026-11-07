const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// GENERATE OTP
// ============================================================

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// ============================================================
// SEND OTP EMAIL
// ============================================================

const sendOTPEmail = async ({
  fullname,
  email,
  otp,
  type = "login",
}) => {
  const isReset = type === "reset";

  const subject = isReset
    ? "OTP Reset Password - TicketVerse"
    : "OTP Login - TicketVerse";

  const title = isReset
    ? "Reset Password TicketVerse"
    : "Verifikasi Login TicketVerse";

  await transporter.sendMail({
    from: `"TicketVerse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${title}</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f4f6f8;
          font-family: Arial, Helvetica, sans-serif;
        ">

          <div style="
            max-width: 520px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            padding: 35px;
            box-sizing: border-box;
          ">

            <div style="
              text-align: center;
              margin-bottom: 30px;
            ">

              <h1 style="
                margin: 0;
                color: #111827;
                font-size: 24px;
              ">
                TicketVerse
              </h1>

              <p style="
                margin-top: 8px;
                color: #6b7280;
                font-size: 14px;
              ">
                ${title}
              </p>

            </div>

            <p style="
              color: #374151;
              font-size: 15px;
            ">
              Halo <strong>${fullname}</strong>,
            </p>

            <p style="
              color: #4b5563;
              font-size: 14px;
              line-height: 1.6;
            ">
              Gunakan kode OTP berikut untuk
              ${
                isReset
                  ? "mengatur ulang password akun TicketVerse"
                  : "melanjutkan proses login ke TicketVerse"
              }.
            </p>

            <div style="
              margin: 30px 0;
              padding: 22px;
              background: #f3f4f6;
              border-radius: 12px;
              text-align: center;
            ">

              <div style="
                font-size: 34px;
                font-weight: bold;
                letter-spacing: 10px;
                color: #111827;
              ">
                ${otp}
              </div>

            </div>

            <p style="
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
            ">
              Kode OTP berlaku selama
              <strong>10 menit</strong>.
            </p>

            <p style="
              color: #9ca3af;
              font-size: 13px;
              line-height: 1.6;
            ">
              Jika kamu tidak melakukan permintaan ini,
              abaikan email ini.
            </p>

            <hr style="
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 30px 0;
            " />

            <p style="
              margin: 0;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
            ">
              TicketVerse
            </p>

          </div>

        </body>
      </html>
    `,
  });
};

// ============================================================
// REGISTER
// ============================================================

const register = async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      password,
      phone,
      gender,
      birth_date,
    } = req.body;

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Nama lengkap, email, dan password wajib diisi.",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // CEK EMAIL
    // --------------------------------------------------------

    const [existingEmail] = await db.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar.",
      });
    }

    // --------------------------------------------------------
    // CEK USERNAME
    // --------------------------------------------------------

    if (username) {
      const [existingUsername] =
        await db.query(
          `
          SELECT id
          FROM users
          WHERE username = ?
          LIMIT 1
          `,
          [username.trim()]
        );

      if (existingUsername.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username sudah digunakan.",
        });
      }
    }

    // --------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // --------------------------------------------------------
    // INSERT USER
    // --------------------------------------------------------

    const [result] = await db.query(
      `
      INSERT INTO users (
        fullname,
        username,
        email,
        password,
        phone,
        gender,
        birth_date,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')
      `,
      [
        fullname.trim(),
        username
          ? username.trim()
          : null,
        normalizedEmail,
        hashedPassword,
        phone || null,
        gender || null,
        birth_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",

      user: {
        id: result.insertId,
        fullname: fullname.trim(),
        username:
          username
            ? username.trim()
            : null,
        email: normalizedEmail,
        role: "customer",
      },
    });
  } catch (error) {
    console.error(
      "❌ REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

const login = async (req, res) => {
  try {
    const { email, password } =
      req.body;

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email dan password wajib diisi.",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        username,
        email,
        password,
        phone,
        gender,
        birth_date,
        photo,
        role
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Email atau password salah.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // CEK PASSWORD
    // --------------------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Email atau password salah.",
      });
    }

    // ========================================================
    // SUPER ADMIN
    // ========================================================

    if (user.role === "super_admin") {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Login berhasil.",
        requiresOtp: false,
        token,

        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          birth_date: user.birth_date,
          photo: user.photo,
          role: user.role,
        },
      });
    }

    // ========================================================
    // CUSTOMER / EVENT ORGANIZER
    // ========================================================

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000
    );

    // --------------------------------------------------------
    // SIMPAN OTP
    // --------------------------------------------------------

    await db.query(
      `
      UPDATE users
      SET
        reset_otp = ?,
        reset_otp_expires = ?
      WHERE id = ?
      `,
      [
        otp,
        expiresAt,
        user.id,
      ]
    );

    console.log(
      "========================================"
    );
    console.log("🔐 OTP LOGIN");
    console.log(
      "Email   :",
      user.email
    );
    console.log(
      "OTP     :",
      otp
    );
    console.log(
      "Expired :",
      expiresAt
    );
    console.log(
      "========================================"
    );

    // --------------------------------------------------------
    // KIRIM EMAIL
    // --------------------------------------------------------

    try {
      await sendOTPEmail({
        fullname: user.fullname,
        email: user.email,
        otp,
        type: "login",
      });
    } catch (emailError) {
      console.error(
        "❌ EMAIL OTP ERROR:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "OTP gagal dikirim ke email.",
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "OTP login berhasil dikirim ke email.",
      requiresOtp: true,

      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birth_date: user.birth_date,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "❌ LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// VERIFY OTP LOGIN
// ============================================================

const verifyOTP = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const otp = String(
      req.body.otp || ""
    ).trim();

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email dan OTP wajib diisi.",
      });
    }

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        username,
        email,
        phone,
        gender,
        birth_date,
        photo,
        role,
        reset_otp,
        reset_otp_expires
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User tidak ditemukan.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // CEK OTP
    // --------------------------------------------------------

    if (
      !user.reset_otp ||
      String(user.reset_otp).trim() !==
        otp
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP salah.",
      });
    }

    // --------------------------------------------------------
    // CEK EXPIRED
    // --------------------------------------------------------

    if (
      !user.reset_otp_expires ||
      new Date(
        user.reset_otp_expires
      ).getTime() <
        Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP sudah kedaluwarsa.",
      });
    }

    // --------------------------------------------------------
    // BUAT JWT
    // --------------------------------------------------------

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      }
    );

    // --------------------------------------------------------
    // HAPUS OTP
    // --------------------------------------------------------

    await db.query(
      `
      UPDATE users
      SET
        reset_otp = NULL,
        reset_otp_expires = NULL
      WHERE id = ?
      `,
      [user.id]
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",

      token,

      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birth_date: user.birth_date,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "❌ VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// RESEND OTP LOGIN
// ============================================================

const resendOTP = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email wajib diisi.",
      });
    }

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        email,
        role
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User tidak ditemukan.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // SUPER ADMIN
    // --------------------------------------------------------

    if (user.role === "super_admin") {
      return res.status(400).json({
        success: false,
        message:
          "Super admin tidak memerlukan OTP login.",
      });
    }

    // --------------------------------------------------------
    // GENERATE OTP BARU
    // --------------------------------------------------------

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000
    );

    // --------------------------------------------------------
    // UPDATE DATABASE
    // --------------------------------------------------------

    await db.query(
      `
      UPDATE users
      SET
        reset_otp = ?,
        reset_otp_expires = ?
      WHERE id = ?
      `,
      [
        otp,
        expiresAt,
        user.id,
      ]
    );

    console.log(
      "========================================"
    );
    console.log("🔄 RESEND OTP");
    console.log(
      "Email   :",
      user.email
    );
    console.log(
      "OTP     :",
      otp
    );
    console.log(
      "Expired :",
      expiresAt
    );
    console.log(
      "========================================"
    );

    // --------------------------------------------------------
    // KIRIM EMAIL
    // --------------------------------------------------------

    try {
      await sendOTPEmail({
        fullname: user.fullname,
        email: user.email,
        otp,
        type: "login",
      });
    } catch (emailError) {
      console.error(
        "❌ RESEND EMAIL ERROR:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "OTP gagal dikirim ke email.",
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "OTP baru berhasil dikirim ke email.",
    });
  } catch (error) {
    console.error(
      "❌ RESEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email wajib diisi.",
      });
    }

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        email,
        role
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Email tidak ditemukan.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // CEK ROLE
    // --------------------------------------------------------

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message:
          "Fitur reset password hanya tersedia untuk super admin.",
      });
    }

    // --------------------------------------------------------
    // GENERATE OTP
    // --------------------------------------------------------

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000
    );

    // --------------------------------------------------------
    // SIMPAN OTP
    // --------------------------------------------------------

    await db.query(
      `
      UPDATE users
      SET
        reset_otp = ?,
        reset_otp_expires = ?
      WHERE id = ?
      `,
      [
        otp,
        expiresAt,
        user.id,
      ]
    );

    console.log(
      "========================================"
    );
    console.log(
      "🔐 OTP RESET PASSWORD"
    );
    console.log(
      "Email   :",
      user.email
    );
    console.log(
      "OTP     :",
      otp
    );
    console.log(
      "Expired :",
      expiresAt
    );
    console.log(
      "========================================"
    );

    // --------------------------------------------------------
    // KIRIM EMAIL
    // --------------------------------------------------------

    try {
      await sendOTPEmail({
        fullname: user.fullname,
        email: user.email,
        otp,
        type: "reset",
      });
    } catch (emailError) {
      console.error(
        "❌ RESET EMAIL ERROR:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "OTP berhasil disimpan ke database, tetapi email gagal dikirim.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "OTP reset password berhasil dikirim.",
    });
  } catch (error) {
    console.error(
      "❌ FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// VERIFY RESET OTP
// ============================================================

const verifyResetOTP = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const otp = String(
      req.body.otp || ""
    ).trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email dan OTP wajib diisi.",
      });
    }

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        reset_otp,
        reset_otp_expires
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User tidak ditemukan.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // CEK ROLE
    // --------------------------------------------------------

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message:
          "Reset password hanya tersedia untuk super admin.",
      });
    }

    // --------------------------------------------------------
    // CEK OTP
    // --------------------------------------------------------

    if (
      !user.reset_otp ||
      String(user.reset_otp).trim() !==
        otp
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP salah.",
      });
    }

    // --------------------------------------------------------
    // CEK EXPIRED
    // --------------------------------------------------------

    if (
      !user.reset_otp_expires ||
      new Date(
        user.reset_otp_expires
      ).getTime() <
        Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP sudah kedaluwarsa.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP valid.",
    });
  } catch (error) {
    console.error(
      "❌ VERIFY RESET OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

const resetPassword = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body.email || ""
    )
      .trim()
      .toLowerCase();

    const otp = String(
      req.body.otp || ""
    ).trim();

    const {
      password,
      confirmPassword,
    } = req.body;

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (
      !email ||
      !otp ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP, password, dan konfirmasi password wajib diisi.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password minimal 6 karakter.",
      });
    }

    if (
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Konfirmasi password tidak cocok.",
      });
    }

    // --------------------------------------------------------
    // CARI USER
    // --------------------------------------------------------

    const [users] = await db.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        reset_otp,
        reset_otp_expires
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User tidak ditemukan.",
      });
    }

    const user = users[0];

    // --------------------------------------------------------
    // CEK ROLE
    // --------------------------------------------------------

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message:
          "Reset password hanya tersedia untuk super admin.",
      });
    }

    // --------------------------------------------------------
    // CEK OTP
    // --------------------------------------------------------

    if (
      !user.reset_otp ||
      String(user.reset_otp).trim() !==
        otp
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP salah.",
      });
    }

    // --------------------------------------------------------
    // CEK EXPIRED
    // --------------------------------------------------------

    if (
      !user.reset_otp_expires ||
      new Date(
        user.reset_otp_expires
      ).getTime() <
        Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP sudah kedaluwarsa.",
      });
    }

    // --------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // --------------------------------------------------------
    // UPDATE PASSWORD
    // --------------------------------------------------------

    await db.query(
      `
      UPDATE users
      SET
        password = ?,
        reset_otp = NULL,
        reset_otp_expires = NULL
      WHERE id = ?
      `,
      [
        hashedPassword,
        user.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Password berhasil diubah. Silakan login kembali.",
    });
  } catch (error) {
    console.error(
      "❌ RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};