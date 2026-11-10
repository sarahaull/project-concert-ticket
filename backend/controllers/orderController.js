
const db = require("../config/db");
const snap = require("../config/midtrans");

// ============================================================
// GET SEMUA ORDERS
// ============================================================




const getAllOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = String(req.user?.role || "")
      .trim()
      .toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

    // ========================================================
    // CUSTOMER: HANYA PESANAN MILIK SENDIRI
    // ========================================================

    if (role === "customer") {
      const [rows] = await db.query(
        `SELECT
          o.id,
          o.user_id,
          o.order_code,
          o.total_price,
          o.payment_status,
          o.order_date,

          od.id AS order_detail_id,
          od.quantity,
          od.subtotal,

          tc.id AS ticket_category_id,
          tc.category_name,
          tc.price AS ticket_price,

          e.id AS event_id,
          e.event_name,
          e.event_date,
          e.event_time,

          v.venue_name,
          v.city

        FROM orders o

        INNER JOIN order_details od
          ON od.order_id = o.id

        INNER JOIN ticket_categories tc
          ON tc.id = od.ticket_category_id

        INNER JOIN events e
          ON e.id = tc.event_id

        LEFT JOIN venues v
          ON v.id = e.venue_id

        WHERE o.user_id = ?

        ORDER BY o.order_date DESC, o.id DESC`,
        [userId]
      );

      // Gabungkan detail agar satu order hanya menjadi
      // satu pesanan pada halaman Customer.

      const orderMap = new Map();

      for (const row of rows) {
        if (!orderMap.has(row.id)) {
          orderMap.set(row.id, {
            id: row.id,
            user_id: row.user_id,
            order_code: row.order_code,
            total_price: Number(row.total_price) || 0,
            payment_status: row.payment_status,
            order_date: row.order_date,

            event_id: row.event_id,
            event_name: row.event_name,
            event_date: row.event_date,
            event_time: row.event_time,

            venue_name: row.venue_name,
            city: row.city,

            quantity: 0,
            category_name: "",
            order_details: [],
          });
        }

        const order = orderMap.get(row.id);

        order.quantity += Number(row.quantity) || 0;

        order.order_details.push({
          id: row.order_detail_id,
          ticket_category_id: row.ticket_category_id,
          category_name: row.category_name,
          price: Number(row.ticket_price) || 0,
          quantity: Number(row.quantity) || 0,
          subtotal: Number(row.subtotal) || 0,
        });
      }

      const orders = Array.from(orderMap.values()).map((order) => ({
        ...order,
        category_name: [
          ...new Set(
            order.order_details.map((detail) => detail.category_name)
          ),
        ].join(", "),
      }));

      return res.status(200).json({
        success: true,
        message: "Riwayat pesanan berhasil diambil.",
        orders,
      });
    }

    // ========================================================
    // EVENT ORGANIZER: PENJUALAN EVENT MILIK SENDIRI
    // ========================================================

    if (role === "event_organizer") {
      const [orders] = await db.query(
        `SELECT
          o.id,
          o.user_id,
          o.order_code,
          o.total_price,
          o.payment_status,
          o.order_date,

          buyer.fullname,
          buyer.email,

          od.id AS order_detail_id,
          od.quantity,
          od.subtotal,

          tc.id AS ticket_category_id,
          tc.category_name,
          tc.price AS ticket_price,

          e.id AS event_id,
          e.event_name,
          e.organizer_id,
          e.event_date,
          e.event_time

        FROM orders o

        INNER JOIN order_details od
          ON od.order_id = o.id

        INNER JOIN ticket_categories tc
          ON tc.id = od.ticket_category_id

        INNER JOIN events e
          ON e.id = tc.event_id

        LEFT JOIN users buyer
          ON buyer.id = o.user_id

        WHERE e.organizer_id = ?

        ORDER BY o.order_date DESC, o.id DESC`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        message: "Data penjualan berhasil diambil.",
        orders,
      });
    }

    // ========================================================
    // ROLE TIDAK DIIZINKAN
    // ========================================================

    return res.status(403).json({
      success: false,
      message: "Anda tidak memiliki akses ke data pesanan.",
    });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pesanan.",
    });
  }
};




// ============================================================
// GET ORDER BERDASARKAN ID
// ============================================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        o.id,
        o.user_id,
        o.order_code,
        o.total_price,
        o.payment_status,
        o.order_date,
        u.fullname,
        u.email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      order: rows[0],
    });
  } catch (error) {
    console.error("Get order by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail order.",
    });
  }
};




const createOrder = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    // =========================================================
    // 1. VALIDASI LOGIN DAN INPUT
    // =========================================================
    const userId = req.user?.id;
    const { order_code, ticket_category_id, quantity, seat_ids } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (
      order_code === undefined ||
      order_code === null ||
      ticket_category_id === undefined ||
      ticket_category_id === null ||
      quantity === undefined ||
      quantity === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Kode pesanan, kategori tiket, dan jumlah tiket wajib diisi.",
      });
    }

    const orderCode = String(order_code).trim();
    const categoryId = Number(ticket_category_id);
    const qty = Number(quantity);

    if (
      !orderCode ||
      orderCode.length > 100 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Kode pesanan, kategori tiket, atau jumlah tiket tidak valid.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // =========================================================
    // 2. AMBIL DATA PENGGUNA
    // =========================================================
    const [users] = await connection.query(
      `SELECT id, fullname, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    const user = users[0];

    if (!user) {
      throw new Error("Data pengguna tidak ditemukan.");
    }

    if (
      String(user.role || "").trim().toLowerCase() !== "customer"
    ) {
      throw new Error(
        "Hanya akun customer yang dapat membeli tiket."
      );
    }

    if (
      !String(user.fullname || "").trim() ||
      !String(user.email || "").trim()
    ) {
      throw new Error(
        "Nama dan email pengguna wajib tersedia."
      );
    }

    // =========================================================
    // 3. CEK KODE PESANAN DUPLIKAT
    // =========================================================
    const [existingOrders] = await connection.query(
      `SELECT id
       FROM orders
       WHERE order_code = ?
       LIMIT 1`,
      [orderCode]
    );

    if (existingOrders.length > 0) {
      throw new Error(
        "Kode pesanan sudah digunakan. Silakan coba kembali."
      );
    }

  
const [categories] = await connection.query(
  `SELECT
     tc.id,
     tc.event_id,
     tc.category_name,
     tc.price,
     tc.remaining_ticket,
     e.event_name,
     e.status AS event_status,
     e.event_date,
     e.ticket_sale_start,
     e.ticket_sale_end
   FROM ticket_categories tc
   INNER JOIN events e ON e.id = tc.event_id
   WHERE tc.id = ?
   FOR UPDATE`,
  [categoryId]
);


    const category = categories[0];

    if (!category) {
      throw new Error("Kategori tiket tidak ditemukan.");
    }


    // Seat selection is optional: when omitted, the existing GENERAL flow remains unchanged.
    const selectedSeatIds = seat_ids === undefined || seat_ids === null
      ? []
      : [...new Set((Array.isArray(seat_ids) ? seat_ids : []).map(Number))];

    if (seat_ids !== undefined && seat_ids !== null) {
      if (!Array.isArray(seat_ids) || selectedSeatIds.length !== qty ||
          selectedSeatIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new Error("Jumlah kursi yang dipilih harus sama dengan jumlah tiket.");
      }
    }

    let lockedSeats = [];
    let seatMode = "GENERAL";

    const [numberedSections] = await connection.query(
      `SELECT id FROM event_sections
       WHERE event_id = ? AND ticket_category_id = ? AND seat_mode = 'NUMBERED'
       LIMIT 1`,
      [category.event_id, categoryId]
    );

    if (numberedSections.length && selectedSeatIds.length === 0) {
      throw new Error("Silakan pilih kursi terlebih dahulu untuk kategori ini.");
    }

    if (selectedSeatIds.length > 0) {
      const placeholders = selectedSeatIds.map(() => "?").join(",");
      const [seatRows] = await connection.query(
        `SELECT s.id, s.status, s.reserved_until, s.reserved_order_id,
                es.ticket_category_id, es.seat_mode
         FROM event_seats s
         INNER JOIN event_sections es ON es.id = s.section_id
         WHERE s.id IN (${placeholders})
           AND es.event_id = ?
           AND es.ticket_category_id = ?
         FOR UPDATE`,
        [...selectedSeatIds, category.event_id, categoryId]
      );

      if (seatRows.length !== qty) {
        throw new Error("Sebagian kursi tidak ditemukan atau bukan bagian dari kategori tiket ini.");
      }

      seatMode = String(seatRows[0].seat_mode || "GENERAL").toUpperCase();
      if (seatMode !== "NUMBERED") {
        throw new Error("Kategori ini tidak menggunakan pemilihan kursi bernomor.");
      }

      if (seatRows.some((seat) => String(seat.seat_mode || "GENERAL").toUpperCase() !== "NUMBERED")) {
        throw new Error("Kursi yang dipilih tidak berasal dari mode denah yang sama.");
      }

      const unavailable = seatRows.filter((seat) => {
        const status = String(seat.status || "Available");
        if (status === "Available") return false;
        if (status === "Reserved" && seat.reserved_until && new Date(seat.reserved_until) <= new Date()) return false;
        return true;
      });
      if (unavailable.length) {
        throw new Error("Ada kursi yang sudah dipesan. Silakan pilih kursi lain.");
      }
      lockedSeats = seatRows;
    }

  
const eventStatus = String(category.event_status || "")
  .trim()
  .toLowerCase()
  .replace(/[_-]+/g, " ")
  .replace(/\s+/g, " ");

console.log("========== DEBUG CREATE ORDER ==========");
console.log("User ID:", userId);
console.log("Order Code:", orderCode);
console.log("Category ID:", categoryId);
console.log("Category Data:", category);
console.log("Event Status:", eventStatus);
console.log("=========================================");

const allowedPurchaseStatuses = [
  "available",
  "limited",
  "active",
  "aktif",
  "published",
  "dipublikasikan",
  "tersedia",
];

if (!allowedPurchaseStatuses.includes(eventStatus)) {
  throw new Error(
    `Acara belum tersedia untuk pembelian. Status event saat ini: ${eventStatus || "kosong"}.`
  );
}

// Validasi periode penjualan tiket.
// Menggunakan waktu MySQL agar konsisten dengan database.

const [salePeriod] = await connection.query(
  `SELECT
     NOW() AS server_now,
     ticket_sale_start,
     ticket_sale_end,
     event_date
   FROM events
   WHERE id = ?`,
  [category.event_id]
);

const period = salePeriod[0];

if (!period) {
  throw new Error("Data periode penjualan acara tidak ditemukan.");
}

console.log("========== DEBUG SALE PERIOD ==========");
console.log("Waktu Server:", period.server_now);
console.log("Penjualan Mulai:", period.ticket_sale_start);
console.log("Penjualan Berakhir:", period.ticket_sale_end);
console.log("Tanggal Acara:", period.event_date);
console.log("========================================");

// Validasi periode penjualan tiket.
if (
  period.ticket_sale_start &&
  new Date(period.server_now) < new Date(period.ticket_sale_start)
) {
  throw new Error("Penjualan tiket belum dimulai.");
}

if (
  period.ticket_sale_end &&
  new Date(period.server_now) > new Date(period.ticket_sale_end)
) {
  throw new Error("Penjualan tiket sudah berakhir.");
}


if (
  period.ticket_sale_start &&
  new Date(period.current_time) < new Date(period.ticket_sale_start)
) {
  throw new Error("Penjualan tiket belum dimulai.");
}

if (
  period.ticket_sale_end &&
  new Date(period.current_time) > new Date(period.ticket_sale_end)
) {
  throw new Error("Penjualan tiket sudah berakhir.");
}

    // =========================================================
    // 6. VALIDASI HARGA DAN STOK
    // =========================================================
    const ticketPrice = Number(category.price);
    const remainingTicket = Number(category.remaining_ticket);

    if (
      !Number.isSafeInteger(ticketPrice) ||
      ticketPrice <= 0
    ) {
      throw new Error("Harga tiket tidak valid.");
    }

    if (
      !Number.isInteger(remainingTicket) ||
      remainingTicket < 0
    ) {
      throw new Error("Data stok tiket tidak valid.");
    }

    if (remainingTicket < qty) {
      throw new Error(
        `Stok tiket tidak mencukupi. Sisa tiket: ${remainingTicket}.`
      );
    }

    // =========================================================
    // 7. HITUNG TOTAL
    // =========================================================
    const subtotal = ticketPrice * qty;
    const serviceFee = 5000;
    const totalPrice = subtotal + serviceFee;

    if (
      !Number.isSafeInteger(subtotal) ||
      !Number.isSafeInteger(totalPrice) ||
      totalPrice <= 0
    ) {
      throw new Error("Total pembayaran tidak valid.");
    }

    // =========================================================
    // 8. BUAT ORDER
    // =========================================================
    const [orderResult] = await connection.query(
      `INSERT INTO orders
         (user_id, order_code, total_price, payment_status)
       VALUES (?, ?, ?, 'Pending')`,
      [userId, orderCode, totalPrice]
    );

    const orderId = orderResult.insertId;

    // =========================================================
    // 9. BUAT DETAIL ORDER
    // =========================================================
    const [detailResult] = await connection.query(
      `INSERT INTO order_details
         (order_id, ticket_category_id, quantity, subtotal)
       VALUES (?, ?, ?, ?)`,
      [orderId, categoryId, qty, subtotal]
    );


    // Lock numbered seats for 10 minutes. The reservation is tied to this order.
    if (selectedSeatIds.length) {
      const seatPlaceholders = selectedSeatIds.map(() => "?").join(",");
      const [reserveResult] = await connection.query(
        `UPDATE event_seats
         SET status = 'Reserved', reserved_order_id = ?,
             reserved_until = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
         WHERE id IN (${seatPlaceholders})
           AND (status IS NULL OR status = 'Available'
                OR (status = 'Reserved' AND reserved_until IS NOT NULL AND reserved_until <= NOW()))`,
        [orderId, ...selectedSeatIds]
      );
      if (reserveResult.affectedRows !== selectedSeatIds.length) {
        throw new Error("Kursi baru saja dipesan pengguna lain. Silakan pilih ulang.");
      }
    }

    // =========================================================
    // 10. KURANGI STOK SECARA AMAN
    // =========================================================
    const [stockResult] = await connection.query(
      `UPDATE ticket_categories
       SET remaining_ticket = remaining_ticket - ?
       WHERE id = ?
         AND remaining_ticket >= ?`,
      [qty, categoryId, qty]
    );

    if (stockResult.affectedRows !== 1) {
      throw new Error(
        "Stok tiket berubah atau tidak mencukupi. Silakan coba kembali."
      );
    }

    // =========================================================
    // 11. BUAT TRANSAKSI MIDTRANS
    // =========================================================
    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderCode,
        gross_amount: totalPrice,
      },
      expiry: {
        start_time: `${new Date().toISOString().replace("T", " ").slice(0, 19)} +0000`,
        unit: "minutes",
        duration: 10,
      },
      item_details: [
        {
          id: String(categoryId),
          price: ticketPrice,
          quantity: qty,
          name: String(category.category_name).substring(0, 50),
        },
        {
          id: "SERVICE-FEE",
          price: serviceFee,
          quantity: 1,
          name: "Biaya Layanan",
        },
      ],
      customer_details: {
        first_name: String(user.fullname).trim(),
        email: String(user.email).trim(),
      },
      callbacks: {
        finish: `${frontendUrl}/cari-acara/${category.event_id}/pembayaran`,
      },
    });

    if (!transaction?.token) {
      throw new Error(
        "Midtrans tidak mengembalikan Snap Token."
      );
    }

    // =========================================================
    // 12. SIMPAN PEMBAYARAN
    // =========================================================
    await connection.query(
      `INSERT INTO payments
         (order_id, payment_method, payment_date, amount, payment_status)
       VALUES (?, 'Transfer', NULL, ?, 'Pending')`,
      [orderId, totalPrice]
    );

    // =========================================================
    // 13. COMMIT TRANSAKSI DATABASE
    // =========================================================
    await connection.commit();
    transactionStarted = false;

    // =========================================================
    // 14. RESPONS KE FRONTEND
    // =========================================================
    return res.status(201).json({
      success: true,
      message: "Order berhasil dibuat dan siap dibayar.",
      order: {
        id: orderId,
        order_code: orderCode,
        user_id: userId,
        buyer: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
        },
        ticket_category_id: categoryId,
        ticket_category_name: category.category_name,
        event_id: category.event_id,
        event_name: category.event_name,
        quantity: qty,
        seat_mode: selectedSeatIds.length ? "NUMBERED" : "GENERAL",
        seat_ids: selectedSeatIds,
        ticket_price: ticketPrice,
        subtotal,
        service_fee: serviceFee,
        total_price: totalPrice,
        payment_status: "Pending",
      },
      order_detail_id: detailResult.insertId,
      payment: {
        provider: "Midtrans",
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
      },
    });
  } catch (error) {
    // =========================================================
    // 15. ROLLBACK
    // =========================================================
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ORDER ERROR:",
          rollbackError.message
        );
      }
    }

    // =========================================================
    // 16. LOG ERROR
    // =========================================================
    console.error("========== CREATE ORDER ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error(
      "Midtrans API Response:",
      error.ApiResponse || error.response?.data || null
    );
    console.error("Stack:", error.stack);
    console.error("=========================================");

    const clientErrorMessages = [
      "Data pengguna tidak ditemukan.",
      "Hanya akun customer yang dapat membeli tiket.",
      "Nama dan email pengguna wajib tersedia.",
      "Kode pesanan sudah digunakan. Silakan coba kembali.",
      "Kategori tiket tidak ditemukan.",
      "Tiket acara belum tersedia untuk dibeli.",
      "Harga tiket tidak valid.",
      "Data stok tiket tidak valid.",
      "Stok tiket berubah atau tidak mencukupi. Silakan coba kembali.",
      "Total pembayaran tidak valid.",
    ];

    const isClientError =
      clientErrorMessages.includes(error.message) ||
      error.message.startsWith("Stok tiket tidak mencukupi.") ||
      error.message.startsWith("Acara belum tersedia untuk pembelian.") ||
      error.message.startsWith("Sebagian kursi") ||
      error.message.startsWith("Kursi") ||
      error.message.startsWith("Ada kursi") ||
      error.message.startsWith("Jumlah kursi") ||
      error.message.startsWith("Kategori ini tidak menggunakan") ||
      error.message.startsWith("Masa reservasi kursi");

    const midtransErrors =
      error.ApiResponse?.error_messages ||
      error.response?.data?.error_messages;

    return res.status(isClientError ? 400 : 500).json({
      success: false,
      message: error.message || "Gagal membuat pesanan.",
      error: midtransErrors || error.message || "Kesalahan server.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};




// ============================================================
// UPDATE ORDER
// ============================================================

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      user_id,
      order_code,
      total_price,
      payment_status,
    } = req.body;

    const [orders] = await db.query(
      `SELECT id, payment_status FROM orders WHERE id = ?`,
      [id]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan.",
      });
    }

    // Status pembayaran tidak boleh diubah lewat endpoint umum.
    if (
      payment_status &&
      payment_status !== orders[0].payment_status
    ) {
      return res.status(403).json({
        success: false,
        message: "Status pembayaran hanya dapat diperbarui melalui Midtrans.",
      });
    }

    if (!user_id || !order_code || total_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "user_id, order_code, dan total_price wajib diisi.",
      });
    }

    const parsedTotal = Number(total_price);

    if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Total harga tidak valid.",
      });
    }

    await db.query(
      `UPDATE orders
       SET user_id = ?, order_code = ?, total_price = ?
       WHERE id = ?`,
      [user_id, order_code, parsedTotal, id]
    );

    return res.json({
      success: true,
      message: "Data order berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Update order error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui order.",
    });
  }
};

// ============================================================
// DELETE ORDER
// ============================================================

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT id, payment_status FROM orders WHERE id = ?`,
      [id]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan.",
      });
    }

    if (orders[0].payment_status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order yang sudah dibayar tidak dapat dihapus.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Penghapusan order harus melalui proses pembatalan pesanan.",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus order.",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
