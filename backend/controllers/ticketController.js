const db = require("../config/db");

// ============================================================
// GET SEMUA TIKET MILIK USER
// ============================================================

const getAllTickets = async (req, res) => {
  try {
    const userId = req.user?.id;

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
        e.poster AS poster,
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

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      WHERE o.user_id = ?

      ORDER BY t.id DESC
      `,
      [userId]
    );

    return res.json({
      success: true,
      total: rows.length,
      tickets: rows,
    });
  } catch (error) {
    console.error("GET TICKETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data tiket.",
      error: error.message,
    });
  }
};

// ============================================================
// GET TIKET BERDASARKAN ID
// ============================================================

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
        e.poster AS poster,
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

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      WHERE t.id = ?
        AND o.user_id = ?

      LIMIT 1
      `,
      [id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      ticket: rows[0],
    });
  } catch (error) {
    console.error("GET TICKET BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data tiket.",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE TICKET MANUAL
// ============================================================

const createTicket = async (req, res) => {
  try {
    const {
      order_detail_id,
      qr_code,
      ticket_code,
      check_in,
    } = req.body;

    if (!order_detail_id || !qr_code || !ticket_code) {
      return res.status(400).json({
        success: false,
        message: "order_detail_id, qr_code, dan ticket_code wajib diisi.",
      });
    }

    const [orderDetails] = await db.query(
      `
      SELECT
        od.id,
        od.quantity,
        o.payment_status
      FROM order_details od
      JOIN orders o ON od.order_id = o.id
      WHERE od.id = ?
      `,
      [order_detail_id]
    );

    if (!orderDetails.length) {
      return res.status(404).json({
        success: false,
        message: "Order detail tidak ditemukan.",
      });
    }

    const orderDetail = orderDetails[0];

    if (orderDetail.payment_status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Tiket hanya dapat dibuat setelah pembayaran berhasil.",
      });
    }

    const [existingTicket] = await db.query(
      `
      SELECT id
      FROM tickets
      WHERE ticket_code = ? OR qr_code = ?
      LIMIT 1
      `,
      [ticket_code, qr_code]
    );

    if (existingTicket.length) {
      return res.status(400).json({
        success: false,
        message: "Kode tiket atau QR Code sudah digunakan.",
      });
    }

    const [ticketCount] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM tickets
      WHERE order_detail_id = ?
      `,
      [order_detail_id]
    );

    if (Number(ticketCount[0].total) >= Number(orderDetail.quantity)) {
      return res.status(400).json({
        success: false,
        message: "Jumlah tiket sudah mencapai quantity pesanan.",
      });
    }

    const finalCheckIn =
      check_in === "Sudah" ? "Sudah" : "Belum";

    const [result] = await db.query(
      `
      INSERT INTO tickets
      (order_detail_id, qr_code, ticket_code, check_in)
      VALUES (?, ?, ?, ?)
      `,
      [
        order_detail_id,
        qr_code,
        ticket_code,
        finalCheckIn,
      ]
    );

    const [newTicket] = await db.query(
      `
      SELECT *
      FROM tickets
      WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Tiket berhasil dibuat.",
      ticket: newTicket[0],
    });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat tiket.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE TICKET
// ============================================================

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      qr_code,
      ticket_code,
      check_in,
    } = req.body;

    const [tickets] = await db.query(
      `SELECT id FROM tickets WHERE id = ?`,
      [id]
    );

    if (!tickets.length) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    if (!qr_code || !ticket_code) {
      return res.status(400).json({
        success: false,
        message: "qr_code dan ticket_code wajib diisi.",
      });
    }

    if (!["Belum", "Sudah"].includes(check_in)) {
      return res.status(400).json({
        success: false,
        message: "check_in harus Belum atau Sudah.",
      });
    }

    const [existingTicket] = await db.query(
      `
      SELECT id
      FROM tickets
      WHERE (ticket_code = ? OR qr_code = ?)
        AND id != ?
      LIMIT 1
      `,
      [ticket_code, qr_code, id]
    );

    if (existingTicket.length) {
      return res.status(400).json({
        success: false,
        message: "Kode tiket atau QR Code sudah digunakan.",
      });
    }

    await db.query(
      `
      UPDATE tickets
      SET
        qr_code = ?,
        ticket_code = ?,
        check_in = ?
      WHERE id = ?
      `,
      [qr_code, ticket_code, check_in, id]
    );

    const [updatedTicket] = await db.query(
      `SELECT * FROM tickets WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Tiket berhasil diperbarui.",
      ticket: updatedTicket[0],
    });
  } catch (error) {
    console.error("UPDATE TICKET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui tiket.",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE TICKET
// ============================================================

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await db.query(
      `SELECT id FROM tickets WHERE id = ?`,
      [id]
    );

    if (!tickets.length) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan.",
      });
    }

    await db.query(
      `DELETE FROM tickets WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Tiket berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE TICKET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus tiket.",
      error: error.message,
    });
  }
};

// ============================================================
// CHECK-IN TICKET
// ============================================================

const checkInTicket = async (req, res) => {
  try {
    const { qr_code, ticket_code } = req.body;

    const identifier = qr_code || ticket_code;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "QR Code atau ticket code wajib diisi.",
      });
    }

    const [tickets] = await db.query(
      `
      SELECT
        t.id,
        t.order_detail_id,
        t.qr_code,
        t.ticket_code,
        t.check_in,
        t.created_at,

        od.order_id,
        od.ticket_category_id,
        od.quantity,
        od.subtotal,

        o.order_code,
        o.user_id,
        o.payment_status,

        u.fullname,
        u.email,

        tc.category_name,
        tc.price,

        e.id AS event_id,
        e.event_name,
        e.poster AS poster,
        e.event_date,
        e.event_time

      FROM tickets t

      JOIN order_details od ON t.order_detail_id = od.id
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN ticket_categories tc ON od.ticket_category_id = tc.id
      JOIN events e ON tc.event_id = e.id

      WHERE t.qr_code = ?
         OR t.ticket_code = ?

      LIMIT 1
      `,
      [identifier, identifier]
    );

    if (!tickets.length) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan atau QR Code tidak valid.",
      });
    }

    const ticket = tickets[0];

    if (ticket.payment_status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Pembayaran tiket belum berhasil.",
        ticket,
      });
    }

    if (ticket.check_in === "Sudah") {
      return res.status(400).json({
        success: false,
        message: "Tiket ini sudah digunakan untuk check-in.",
        ticket,
      });
    }

    const [updateResult] = await db.query(
      `
      UPDATE tickets
      SET check_in = 'Sudah'
      WHERE id = ?
        AND check_in = 'Belum'
      `,
      [ticket.id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Tiket sudah digunakan untuk check-in.",
      });
    }

    const [updatedTickets] = await db.query(
      `
      SELECT
        t.id,
        t.order_detail_id,
        t.qr_code,
        t.ticket_code,
        t.check_in,
        t.created_at,

        o.order_code,
        o.payment_status,

        u.fullname,
        u.email,

        tc.category_name,
        tc.price,

        e.id AS event_id,
        e.event_name,
        e.poster AS poster,
        e.event_date,
        e.event_time

      FROM tickets t

      JOIN order_details od ON t.order_detail_id = od.id
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN ticket_categories tc ON od.ticket_category_id = tc.id
      JOIN events e ON tc.event_id = e.id

      WHERE t.id = ?
      `,
      [ticket.id]
    );

    return res.json({
      success: true,
      message: "Check-in berhasil.",
      ticket: updatedTickets[0],
    });
  } catch (error) {
    console.error("CHECK-IN TICKET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan check-in tiket.",
      error: error.message,
    });
  }
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