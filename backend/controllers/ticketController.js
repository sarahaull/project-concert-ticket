
const crypto = require("crypto");
const db = require("../config/db");

// ============================================================
// HELPER
// ============================================================

const getUserId = (req) => Number(req.user?.id);

const sendServerError = (res, error, message) => {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
  });
};

const getQrFingerprint = (qrCode) => {
  return crypto
    .createHash("sha256")
    .update(qrCode)
    .digest("hex");
};

// ============================================================
// GET SEMUA TIKET MILIK USER
// ============================================================

const getAllTickets = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        t.id,
        t.order_detail_id,
        t.qr_code,
        t.ticket_code,
        t.check_in,
        t.created_at,
        t.seat_id,

        es.section_id,
        es.row_label AS seat_row,
        es.seat_number,

        sec.section_code,
        sec.section_name,

        od.order_id,
        od.ticket_category_id,
        od.quantity,
        od.subtotal,

        o.order_code,
        o.payment_status,

        tc.category_name,
        tc.price,

        e.id AS event_id,
        e.event_name,
        e.poster,
        e.event_date,
        e.event_time,

        a.artist_name,

        v.venue_name,
        v.city

      FROM tickets t

      JOIN order_details od
        ON t.order_detail_id = od.id

      JOIN orders o
        ON od.order_id = o.id

      JOIN ticket_categories tc
        ON od.ticket_category_id = tc.id

      JOIN events e
        ON tc.event_id = e.id

      LEFT JOIN event_seats es
        ON es.id = t.seat_id

      LEFT JOIN event_sections sec
        ON sec.id = es.section_id

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      WHERE o.user_id = ?

      ORDER BY t.id DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      tickets: rows,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil data tiket."
    );
  }
};

// ============================================================
// GET TIKET BERDASARKAN ID
// ============================================================

const getTicketById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const ticketId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID tiket tidak valid.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        -- DATA TIKET
        t.id,
        t.order_detail_id,
        t.seat_id,
        t.qr_code,
        t.ticket_code,
        t.check_in,
        t.created_at AS ticket_created_at,

        -- DATA ORDER DETAIL
        od.order_id,
        od.ticket_category_id,
        od.quantity AS order_quantity,
        od.subtotal,

        -- DATA ORDER
        o.order_code,
        o.total_price AS order_total,
        o.payment_status,
        o.order_date,

        -- DATA CUSTOMER
        u.id AS customer_id,
        u.fullname AS customer_name,
        u.username AS customer_username,
        u.email AS customer_email,
        u.phone AS customer_phone,
        u.photo AS customer_photo,

        -- DATA KATEGORI
        tc.category_name,
        tc.price,

        -- DATA EVENT
        e.id AS event_id,
        e.event_name,
        e.poster,
        e.event_date,
        e.event_time,

        -- DATA ARTIS
        a.artist_name,

        -- DATA VENUE
        v.venue_name,
        v.city,

        -- DATA KURSI
        es.id AS seat_id,
        es.row_label,
        es.seat_number,

        sec.id AS section_id,
        sec.section_code,
        sec.section_name,
        sec.seat_mode

      FROM tickets t

      INNER JOIN order_details od
        ON t.order_detail_id = od.id

      INNER JOIN orders o
        ON od.order_id = o.id

      INNER JOIN users u
        ON o.user_id = u.id

      INNER JOIN ticket_categories tc
        ON od.ticket_category_id = tc.id

      INNER JOIN events e
        ON tc.event_id = e.id

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      LEFT JOIN event_seats es
        ON t.seat_id = es.id

      LEFT JOIN event_sections sec
        ON es.section_id = sec.id

      WHERE t.id = ?
        AND o.user_id = ?

      LIMIT 1
      `,
      [ticketId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan atau bukan milik akun Anda.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail tiket berhasil diambil.",
      ticket: rows[0],
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil detail tiket."
    );
  }
};

// ============================================================
// CHECK-IN TICKET
// ============================================================

const checkInTicket = async (req, res) => {
  const userId = getUserId(req);
  const role = req.user?.role;

  // ----------------------------------------------------------
  // VALIDASI ROLE
  // ----------------------------------------------------------

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu.",
    });
  }

  if (!["event_organizer", "super_admin"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Anda tidak memiliki akses untuk melakukan check-in.",
    });
  }

  // ----------------------------------------------------------
  // VALIDASI QR CODE
  // ----------------------------------------------------------

  const qrCode = String(req.body?.qr_code || "").trim();

  if (!qrCode || qrCode.length !== 64) {
    return res.status(400).json({
      success: false,
      message: "QR Code tidak valid.",
    });
  }

  const fingerprint = getQrFingerprint(qrCode);

  let connection;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    // --------------------------------------------------------
    // CARI TIKET DAN KUNCI ROW
    // --------------------------------------------------------

    const [tickets] = await connection.query(
      `
      SELECT
        t.id,
        t.order_detail_id,
        t.ticket_code,
        t.check_in,
        t.created_at,
        t.seat_id,

        od.order_id,
        od.ticket_category_id,

        o.order_code,
        o.user_id,
        o.payment_status,

        u.fullname,
        u.email,

        tc.category_name,
        tc.price,

        e.id AS event_id,
        e.event_name,
        e.poster,
        e.event_date,
        e.event_time,
        e.organizer_id,

        es.row_label AS seat_row,
        es.seat_number,

        sec.section_code,
        sec.section_name

      FROM tickets t

      INNER JOIN order_details od
        ON t.order_detail_id = od.id

      INNER JOIN orders o
        ON od.order_id = o.id

      INNER JOIN users u
        ON o.user_id = u.id

      INNER JOIN ticket_categories tc
        ON od.ticket_category_id = tc.id

      INNER JOIN events e
        ON tc.event_id = e.id

      LEFT JOIN event_seats es
        ON es.id = t.seat_id

      LEFT JOIN event_sections sec
        ON sec.id = es.section_id

      WHERE t.qr_code = ?

      LIMIT 1
      FOR UPDATE
      `,
      [qrCode]
    );

    // --------------------------------------------------------
    // QR TIDAK DITEMUKAN
    // --------------------------------------------------------

    if (!tickets.length) {
      await connection.query(
        `
        INSERT INTO ticket_checkins (
          ticket_id,
          event_id,
          scanned_by,
          qr_fingerprint,
          result
        )
        VALUES (NULL, NULL, ?, ?, 'INVALID')
        `,
        [userId, fingerprint]
      );

      await connection.commit();

      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan atau QR Code tidak valid.",
      });
    }

    const ticket = tickets[0];

    // --------------------------------------------------------
    // VALIDASI KEPEMILIKAN EVENT
    // --------------------------------------------------------

    if (
      role === "event_organizer" &&
      Number(ticket.organizer_id) !== userId
    ) {
      await connection.query(
        `
        INSERT INTO ticket_checkins (
          ticket_id,
          event_id,
          scanned_by,
          qr_fingerprint,
          result
        )
        VALUES (?, ?, ?, ?, 'FORBIDDEN')
        `,
        [
          ticket.id,
          ticket.event_id,
          userId,
          fingerprint,
        ]
      );

      await connection.commit();

      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke event ini.",
      });
    }

    // --------------------------------------------------------
    // VALIDASI PEMBAYARAN
    // --------------------------------------------------------

    if (ticket.payment_status !== "Paid") {
      await connection.query(
        `
        INSERT INTO ticket_checkins (
          ticket_id,
          event_id,
          scanned_by,
          qr_fingerprint,
          result
        )
        VALUES (?, ?, ?, ?, 'UNPAID')
        `,
        [
          ticket.id,
          ticket.event_id,
          userId,
          fingerprint,
        ]
      );

      await connection.commit();

      return res.status(400).json({
        success: false,
        message: "Pembayaran tiket belum berhasil.",
      });
    }

    // --------------------------------------------------------
    // VALIDASI CHECK-IN GANDA
    // --------------------------------------------------------

    if (ticket.check_in === "Sudah") {
      await connection.query(
        `
        INSERT INTO ticket_checkins (
          ticket_id,
          event_id,
          scanned_by,
          qr_fingerprint,
          result
        )
        VALUES (?, ?, ?, ?, 'ALREADY_USED')
        `,
        [
          ticket.id,
          ticket.event_id,
          userId,
          fingerprint,
        ]
      );

      await connection.commit();

      return res.status(409).json({
        success: false,
        message: "Tiket ini sudah digunakan untuk check-in.",
      });
    }

    // --------------------------------------------------------
    // UPDATE CHECK-IN
    // --------------------------------------------------------

    const [updateResult] = await connection.query(
      `
      UPDATE tickets
      SET check_in = 'Sudah'
      WHERE id = ?
        AND check_in = 'Belum'
      `,
      [ticket.id]
    );

    if (updateResult.affectedRows !== 1) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Tiket sudah digunakan untuk check-in.",
      });
    }

    // --------------------------------------------------------
    // SIMPAN RIWAYAT CHECK-IN
    // --------------------------------------------------------

    await connection.query(
      `
      INSERT INTO ticket_checkins (
        ticket_id,
        event_id,
        scanned_by,
        qr_fingerprint,
        result
      )
      VALUES (?, ?, ?, ?, 'SUCCESS')
      `,
      [
        ticket.id,
        ticket.event_id,
        userId,
        fingerprint,
      ]
    );

    await connection.commit();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Check-in berhasil.",
      ticket: {
        id: ticket.id,
        ticket_code: ticket.ticket_code,
        check_in: "Sudah",

        customer_name: ticket.fullname,
        customer_email: ticket.email,

        category_name: ticket.category_name,
        price: ticket.price,

        event_id: ticket.event_id,
        event_name: ticket.event_name,
        poster: ticket.poster,
        event_date: ticket.event_date,
        event_time: ticket.event_time,

        seat_row: ticket.seat_row,
        seat_number: ticket.seat_number,
        section_code: ticket.section_code,
        section_name: ticket.section_name,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("CHECK-IN ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("CHECK-IN TICKET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan check-in tiket.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ============================================================
// CREATE TICKET MANUAL - DINONAKTIFKAN
// Tiket dibuat otomatis melalui Midtrans setelah pembayaran.
// ============================================================

const createTicket = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Tiket diterbitkan otomatis setelah pembayaran berhasil.",
  });
};

// ============================================================
// UPDATE TICKET - DINONAKTIFKAN
// Status check-in hanya boleh diubah melalui proses scan.
// ============================================================

const updateTicket = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Tiket tidak dapat diubah secara manual.",
  });
};

// ============================================================
// DELETE TICKET - DINONAKTIFKAN
// ============================================================

const deleteTicket = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Tiket tidak dapat dihapus melalui endpoint ini.",
  });
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  checkInTicket,
};
