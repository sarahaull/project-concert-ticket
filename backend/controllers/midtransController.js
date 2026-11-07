const crypto = require("crypto");
const db = require("../config/db");

// =====================================================
// GENERATE TICKET
// =====================================================

const generateTicketsForOrder = async (orderId) => {
  // Ambil semua order detail
  const [orderDetails] = await db.query(
    `
    SELECT
      od.id,
      od.quantity,
      od.ticket_category_id
    FROM order_details od
    WHERE od.order_id = ?
    `,
    [orderId]
  );

  if (orderDetails.length === 0) {
    throw new Error("Order detail tidak ditemukan");
  }

  let totalCreated = 0;

  for (const detail of orderDetails) {
    // Cek tiket yang sudah dibuat
    const [existingTickets] = await db.query(
      `
      SELECT id
      FROM tickets
      WHERE order_detail_id = ?
      `,
      [detail.id]
    );

    const existingCount = existingTickets.length;
    const requiredQuantity = Number(detail.quantity || 0);

    // Kalau semua tiket sudah dibuat, skip
    if (existingCount >= requiredQuantity) {
      continue;
    }

    const remainingQuantity =
      requiredQuantity - existingCount;

    for (let i = 0; i < remainingQuantity; i++) {
      const uniquePart =
        Date.now().toString(36).toUpperCase() +
        crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase();

      const ticketCode =
        `TV-${uniquePart}`;

      // QR berisi ticket code.
      // Nanti scanner bisa menggunakan nilai ini.
      const qrCode = ticketCode;

      await db.query(
        `
        INSERT INTO tickets
        (
          order_detail_id,
          qr_code,
          ticket_code,
          check_in
        )
        VALUES (?, ?, ?, 'Belum')
        `,
        [
          detail.id,
          qrCode,
          ticketCode,
        ]
      );

      totalCreated++;
    }
  }

  return totalCreated;
};

// =====================================================
// MIDTRANS NOTIFICATION
// =====================================================

const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;

    console.log(
      "========================================"
    );
    console.log("📩 MIDTRANS NOTIFICATION");
    console.log(notification);
    console.log(
      "========================================"
    );

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = notification;

    // =================================================
    // VALIDASI DATA
    // =================================================

    if (
      !order_id ||
      !transaction_status ||
      !status_code ||
      !gross_amount ||
      !signature_key
    ) {
      return res.status(400).json({
        success: false,
        message: "Data notification Midtrans tidak lengkap",
      });
    }

    // =================================================
    // VERIFY SIGNATURE
    // =================================================

    const serverKey =
      process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error(
        "❌ MIDTRANS_SERVER_KEY belum tersedia"
      );

      return res.status(500).json({
        success: false,
        message:
          "MIDTRANS_SERVER_KEY belum dikonfigurasi",
      });
    }

    const signatureInput =
      order_id +
      status_code +
      gross_amount +
      serverKey;

    const expectedSignature =
      crypto
        .createHash("sha512")
        .update(signatureInput)
        .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error(
        "❌ Signature Midtrans tidak valid"
      );

      return res.status(401).json({
        success: false,
        message: "Signature Midtrans tidak valid",
      });
    }

    // =================================================
    // CARI ORDER
    // =================================================

    const [orders] = await db.query(
      `
      SELECT
        id,
        order_code,
        user_id,
        total_price,
        payment_status
      FROM orders
      WHERE order_code = ?
      LIMIT 1
      `,
      [order_id]
    );

    if (orders.length === 0) {
      console.error(
        "❌ Order tidak ditemukan:",
        order_id
      );

      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    const order = orders[0];

    // =================================================
    // VALIDASI NOMINAL
    // =================================================

    const databaseAmount =
      Number(order.total_price);

    const midtransAmount =
      Number(gross_amount);

    if (
      !Number.isFinite(databaseAmount) ||
      !Number.isFinite(midtransAmount) ||
      databaseAmount !== midtransAmount
    ) {
      console.error(
        "❌ Nominal pembayaran tidak cocok",
        {
          databaseAmount,
          midtransAmount,
        }
      );

      return res.status(400).json({
        success: false,
        message:
          "Nominal pembayaran tidak sesuai dengan order",
      });
    }

    // =================================================
    // TENTUKAN STATUS
    // =================================================

    const isSuccess =
      transaction_status === "settlement" ||
      (
        transaction_status === "capture" &&
        (
          !fraud_status ||
          fraud_status.toLowerCase() === "accept"
        )
      );

    const isPending =
      transaction_status === "pending";

    const isCancelled =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "failure";

    const isExpired =
      transaction_status === "expire";

    // =================================================
    // SUCCESS
    // =================================================

    if (isSuccess) {
      // Update order menjadi Paid
      await db.query(
        `
        UPDATE orders
        SET payment_status = 'Paid'
        WHERE id = ?
        `,
        [order.id]
      );

      // Generate tiket otomatis
      const createdCount =
        await generateTicketsForOrder(order.id);

      console.log(
        `✅ Order ${order.order_code} PAID`
      );

      console.log(
        `🎫 ${createdCount} tiket baru dibuat`
      );

      return res.status(200).json({
        success: true,
        message: "Pembayaran berhasil diproses",
        order_id: order.order_code,
        payment_status: "Paid",
        tickets_created: createdCount,
      });
    }

    // =================================================
    // PENDING
    // =================================================

    if (isPending) {
      await db.query(
        `
        UPDATE orders
        SET payment_status = 'Pending'
        WHERE id = ?
        `,
        [order.id]
      );

      console.log(
        `⏳ Order ${order.order_code} masih Pending`
      );

      return res.status(200).json({
        success: true,
        message: "Pembayaran masih pending",
        order_id: order.order_code,
        payment_status: "Pending",
      });
    }

    // =================================================
    // EXPIRED
    // =================================================

    if (isExpired) {
      await db.query(
        `
        UPDATE orders
        SET payment_status = 'Expired'
        WHERE id = ?
        `,
        [order.id]
      );

      console.log(
        `⌛ Order ${order.order_code} Expired`
      );

      return res.status(200).json({
        success: true,
        message: "Pembayaran expired",
        order_id: order.order_code,
        payment_status: "Expired",
      });
    }

    // =================================================
    // CANCEL / DENY / FAILURE
    // =================================================

    if (isCancelled) {
      await db.query(
        `
        UPDATE orders
        SET payment_status = 'Cancelled'
        WHERE id = ?
        `,
        [order.id]
      );

      console.log(
        `❌ Order ${order.order_code} Cancelled`
      );

      return res.status(200).json({
        success: true,
        message: "Pembayaran gagal atau dibatalkan",
        order_id: order.order_code,
        payment_status: "Cancelled",
      });
    }

    // =================================================
    // STATUS LAIN
    // =================================================

    console.log(
      `ℹ️ Status Midtrans belum diproses: ${transaction_status}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Notification diterima tetapi status belum diproses",
      transaction_status,
    });
  } catch (error) {
    console.error(
      "❌ MIDTRANS NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal memproses notification Midtrans",
      error: error.message,
    });
  }
};

module.exports = {
  handleMidtransNotification,
  generateTicketsForOrder,
};