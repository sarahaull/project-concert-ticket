const db = require("../config/db");
const snap = require("../config/midtrans");
const crypto = require("crypto");

const normalizePaymentMethod = (paymentType) => {
  const type = String(paymentType || "").toLowerCase();

  if (type === "qris") return "QRIS";

  if (type === "credit_card") return "Credit Card";

  if (
    [
      "gopay",
      "shopeepay",
      "dana",
      "ovo",
      "linkaja",
      "akulaku",
    ].includes(type)
  ) {
    return "E-Wallet";
  }

  if (
    [
      "bank_transfer",
      "echannel",
      "permata",
      "bca_va",
      "bni_va",
      "bri_va",
      "other_va",
    ].includes(type)
  ) {
    return "Transfer";
  }

  return "Transfer";
};

const toMySQLDateTime = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
};

const generateTicketCode = () => {
  return `TV-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};

const createTicketsForOrder = async (connection, orderId) => {
  const [details] = await connection.query(
    `SELECT od.id, od.quantity, od.ticket_category_id,
            es.seat_mode
     FROM order_details od
     LEFT JOIN event_sections es
       ON es.ticket_category_id = od.ticket_category_id
     WHERE od.order_id = ?
     GROUP BY od.id, od.quantity, od.ticket_category_id, es.seat_mode`,
    [orderId]
  );

  for (const detail of details) {
    const quantity = Math.max(0, Number(detail.quantity) || 0);
    if (!quantity) continue;

    const [existingRows] = await connection.query(
      `SELECT COUNT(*) AS total FROM tickets WHERE order_detail_id = ?`,
      [detail.id]
    );
    const existingCount = Number(existingRows[0]?.total || 0);
    const remaining = Math.max(0, quantity - existingCount);
    if (!remaining) continue;

    const [orderSeats] = await connection.query(
      `SELECT s.id
       FROM event_seats s
       INNER JOIN event_sections es ON es.id = s.section_id
       WHERE s.reserved_order_id = ?
         AND es.ticket_category_id = ?
         AND s.status = 'Reserved'
         AND s.reserved_until > NOW()
       ORDER BY s.id ASC
       FOR UPDATE`,
      [orderId, detail.ticket_category_id]
    );

    const [sectionModes] = await connection.query(
      `SELECT DISTINCT seat_mode FROM event_sections WHERE ticket_category_id = ?`,
      [detail.ticket_category_id]
    );
    const usesNumberedSeats = sectionModes.some((row) => String(row.seat_mode || "GENERAL").toUpperCase() === "NUMBERED");

    if (usesNumberedSeats && orderSeats.length !== quantity) {
      throw new Error("Masa reservasi kursi telah berakhir. Pembayaran tidak dapat menerbitkan tiket bernomor.");
    }

    for (let i = 0; i < remaining; i++) {
      const ticketCode = generateTicketCode();
      const qrCode = crypto.randomBytes(32).toString("hex");
      const seatId = usesNumberedSeats ? orderSeats[i]?.id : null;
      if (usesNumberedSeats && !seatId) {
        throw new Error("Kursi pesanan tidak lengkap untuk penerbitan tiket.");
      }
      await connection.query(
        `INSERT INTO tickets (order_detail_id, qr_code, ticket_code, check_in, seat_id)
         VALUES (?, ?, ?, 'Belum', ?)`,
        [detail.id, qrCode, ticketCode, seatId]
      );
    }

    if (usesNumberedSeats) {
      await connection.query(
        `UPDATE event_seats
         SET status = 'Sold', reserved_until = NULL
         WHERE reserved_order_id = ?
           AND id IN (${orderSeats.map(() => '?').join(',')})`,
        [orderId, ...orderSeats.map((seat) => seat.id)]
      );
    }
  }
};

const syncPaymentStatus = async (orderCode, statusResponse) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT id, order_code, total_price, payment_status
       FROM orders
       WHERE order_code = ?
       LIMIT 1
       FOR UPDATE`,
      [orderCode]
    );

    if (!orders.length) {
      await connection.rollback();
      return null;
    }

    const order = orders[0];

    const grossAmount = Number(statusResponse.gross_amount);
    const orderAmount = Number(order.total_price);

    if (
      !Number.isFinite(grossAmount) ||
      !Number.isFinite(orderAmount) ||
      Math.round(grossAmount * 100) !== Math.round(orderAmount * 100)
    ) {
      throw new Error(
        "Nominal transaksi Midtrans tidak sesuai dengan pesanan."
      );
    }

    const transactionStatus = String(
      statusResponse.transaction_status || ""
    ).toLowerCase();

    const fraudStatus = String(
      statusResponse.fraud_status || ""
    ).toLowerCase();

    let paymentStatus = "Pending";
    let orderStatus = "Pending";

    if (
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept")
    ) {
      paymentStatus = "Success";
      orderStatus = "Paid";
    } else if (transactionStatus === "deny") {
      paymentStatus = "Failed";
      orderStatus = "Pending";
    } else if (transactionStatus === "cancel") {
      paymentStatus = "Failed";
      orderStatus = "Cancelled";
    } else if (transactionStatus === "expire") {
      paymentStatus = "Failed";
      orderStatus = "Expired";
    }

    if (order.payment_status === "Paid") {
      paymentStatus = "Success";
      orderStatus = "Paid";
    }

    const paymentMethod = normalizePaymentMethod(
      statusResponse.payment_type
    );

    const paymentDate =
      paymentStatus === "Success"
        ? toMySQLDateTime(
            statusResponse.settlement_time ||
              statusResponse.transaction_time ||
              new Date()
          )
        : null;

    const [existingPayments] = await connection.query(
      `SELECT id
       FROM payments
       WHERE order_id = ?
       LIMIT 1`,
      [order.id]
    );

    if (existingPayments.length > 0) {
      await connection.query(
        `UPDATE payments
         SET payment_method = ?,
             payment_date = ?,
             amount = ?,
             payment_status = ?
         WHERE order_id = ?`,
        [
          paymentMethod,
          paymentDate,
          order.total_price,
          paymentStatus,
          order.id,
        ]
      );
    } else {
      await connection.query(
        `INSERT INTO payments
         (order_id, payment_method, payment_date, amount, payment_status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          order.id,
          paymentMethod,
          paymentDate,
          order.total_price,
          paymentStatus,
        ]
      );
    }

    await connection.query(
      `UPDATE orders
       SET payment_status = ?
       WHERE id = ?`,
      [orderStatus, order.id]
    );

    if (orderStatus === "Paid") {
      await createTicketsForOrder(connection, order.id);
    }
 else if (["Cancelled", "Expired"].includes(orderStatus)) {
      await connection.query(
        `UPDATE event_seats
         SET status = 'Available', reserved_order_id = NULL, reserved_until = NULL
         WHERE reserved_order_id = ? AND status = 'Reserved'`,
        [order.id]
      );
    }

    await connection.commit();

    return {
      order_id: order.id,
      order_code: order.order_code,
      payment_status: orderStatus,
      payment_record_status: paymentStatus,
      transaction_status: transactionStatus,
      payment_method: paymentMethod,
      amount: Number(order.total_price),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         p.id,
         p.order_id,
         p.payment_method,
         p.payment_date,
         p.amount,
         p.payment_status,
         o.order_code,
         o.total_price,
         o.payment_status AS order_status,
         u.fullname,
         u.email
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY p.id DESC`
    );

    return res.json({
      success: true,
      payments: rows,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pembayaran.",
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
         p.id,
         p.order_id,
         p.payment_method,
         p.payment_date,
         p.amount,
         p.payment_status,
         o.order_code,
         o.total_price,
         o.payment_status AS order_status,
         u.fullname,
         u.email
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Pembayaran tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      payment: rows[0],
    });
  } catch (error) {
    console.error("Get payment by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pembayaran.",
    });
  }
};

const midtransNotification = async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
    } = req.body;

    if (
      !order_id ||
      !status_code ||
      gross_amount === undefined ||
      !signature_key
    ) {
      return res.status(400).json({
        success: false,
        message: "Data notifikasi Midtrans tidak lengkap.",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        `${order_id}${status_code}${gross_amount}${serverKey}`
      )
      .digest("hex");

    const received = Buffer.from(signature_key, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(401).json({
        success: false,
        message: "Signature notifikasi Midtrans tidak valid.",
      });
    }

    const statusResponse = await snap.transaction.status(order_id);

    const result = await syncPaymentStatus(order_id, statusResponse);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan.",
      });
    }

    console.log("MIDTRANS NOTIFICATION:", {
      orderCode: order_id,
      transactionStatus: result.transaction_status,
      paymentStatus: result.payment_record_status,
      orderStatus: result.payment_status,
    });

    return res.status(200).json({
      success: true,
      message: "Notifikasi pembayaran berhasil diproses.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Midtrans notification error:",
      error.ApiResponse || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal memproses notifikasi pembayaran.",
    });
  }
};

const checkMidtransStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Data transaksi tidak lengkap.",
      });
    }

    const [orders] = await db.query(
      `SELECT
        o.id,
        o.order_code,
        o.total_price,
        o.payment_status,
        p.payment_method,
        p.payment_status AS payment_record_status,
        p.payment_date
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.order_code = ?
         AND o.user_id = ?
       LIMIT 1`,
      [orderId, userId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan atau bukan milik akun ini.",
      });
    }

    const order = orders[0];

    if (order.payment_status === "Paid") {
      return res.json({
        success: true,
        message: "Pembayaran sudah berhasil dikonfirmasi.",
        data: {
          order_id: order.id,
          order_code: order.order_code,
          payment_status: order.payment_status,
          payment_record_status: order.payment_record_status,
          payment_method: order.payment_method,
          payment_date: order.payment_date,
          amount: Number(order.total_price),
        },
      });
    }

    let statusResponse;

    try {
      statusResponse = await snap.transaction.status(order.order_code);
    } catch (midtransError) {
      const statusCode = String(
        midtransError.ApiResponse?.status_code || ""
      );

      if (statusCode === "404") {
        return res.status(409).json({
          success: false,
          code: "MIDTRANS_TRANSACTION_NOT_FOUND",
          message:
            "Transaksi belum ditemukan di Midtrans. Silakan periksa kembali pembayaran atau tunggu notifikasi pembayaran.",
          order_code: order.order_code,
          payment_status: order.payment_status,
        });
      }

      throw midtransError;
    }

    const result = await syncPaymentStatus(
      order.order_code,
      statusResponse
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Status transaksi berhasil diperiksa.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Check Midtrans status error:",
      error.ApiResponse || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal memeriksa transaksi Midtrans.",
    });
  }
};

const testMidtrans = async (req, res) => {
  try {
    const orderCode = `TV-TEST-${Date.now()}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderCode,
        gross_amount: 10000,
      },
      item_details: [
        {
          id: "TEST-001",
          price: 10000,
          quantity: 1,
          name: "Test TicketVerse",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Midtrans berhasil terhubung.",
      order_code: orderCode,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error(
      "Midtrans test error:",
      error.ApiResponse || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal terhubung ke Midtrans.",
      error: error.ApiResponse || error.message,
    });
  }
};

const blockedPaymentMutation = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Pembayaran harus diverifikasi melalui Midtrans.",
  });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  midtransNotification,
  checkMidtransStatus,
  testMidtrans,
  createPayment: blockedPaymentMutation,
  updatePayment: blockedPaymentMutation,
  deletePayment: blockedPaymentMutation,
};