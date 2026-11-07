const db = require("../config/db");

// ===============================
// GET SEMUA ORDER DETAILS
// ===============================
const getAllOrderDetails = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        od.id,
        od.order_id,
        od.ticket_category_id,
        od.quantity,
        od.subtotal,

        o.order_code,
        o.payment_status,

        tc.category_name,
        tc.price,

        e.event_name

      FROM order_details od

      LEFT JOIN orders o
        ON od.order_id = o.id

      LEFT JOIN ticket_categories tc
        ON od.ticket_category_id = tc.id

      LEFT JOIN events e
        ON tc.event_id = e.id

      ORDER BY od.id DESC
    `);

    res.json({
      success: true,
      order_details: rows,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data order details",
    });
  }
};

// ===============================
// GET ORDER DETAIL BERDASARKAN ID
// ===============================
const getOrderDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
  od.id AS order_detail_id,
  od.order_id,
  od.ticket_category_id,
  od.quantity,
  od.subtotal,

  o.order_code,
  o.payment_status,
  o.payment_method,
  o.created_at AS order_date,
  o.updated_at,

  tc.category_name,
  tc.price AS category_price,

  e.id AS event_id,
  e.event_name,
  e.event_date,
  e.event_time

FROM order_details od

LEFT JOIN orders o
  ON od.order_id = o.id

LEFT JOIN ticket_categories tc
  ON od.ticket_category_id = tc.id

LEFT JOIN events e
  ON tc.event_id = e.id

WHERE od.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order detail tidak ditemukan",
      });
    }

    res.json({
      success: true,
      order_detail: rows[0],
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil order detail",
    });
  }
};

// ===============================
// POST ORDER DETAIL
// ===============================
const createOrderDetail = async (req, res) => {
  try {
    const {
      order_id,
      ticket_category_id,
      quantity,
    } = req.body;

    // Validasi
    if (
      !order_id ||
      !ticket_category_id ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "order_id, ticket_category_id, dan quantity wajib diisi",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity harus lebih dari 0",
      });
    }

    // Cek order
    const [orders] = await db.query(
      "SELECT id FROM orders WHERE id = ?",
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Cek ticket category
    const [ticketCategories] = await db.query(
      `
      SELECT
        id,
        price,
        remaining_ticket
      FROM ticket_categories
      WHERE id = ?
      `,
      [ticket_category_id]
    );

    if (ticketCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket category tidak ditemukan",
      });
    }

    const ticketCategory = ticketCategories[0];

    // Cek stok tiket
    if (ticketCategory.remaining_ticket < quantity) {
      return res.status(400).json({
        success: false,
        message: "Jumlah tiket yang tersedia tidak mencukupi",
      });
    }

    // Hitung subtotal
    const subtotal =
      Number(ticketCategory.price) * Number(quantity);

    // Insert order detail
    const [result] = await db.query(
      `
      INSERT INTO order_details
      (
        order_id,
        ticket_category_id,
        quantity,
        subtotal
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        order_id,
        ticket_category_id,
        quantity,
        subtotal,
      ]
    );

    // Kurangi tiket
    await db.query(
      `
      UPDATE ticket_categories
      SET remaining_ticket = remaining_ticket - ?
      WHERE id = ?
      `,
      [quantity, ticket_category_id]
    );

    res.status(201).json({
      success: true,
      message: "Order detail berhasil ditambahkan",
      order_detail_id: result.insertId,
      subtotal,
    });
  } catch (error) {
    console.error("Create order detail error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan order detail",
    });
  }
};

// ===============================
// UPDATE ORDER DETAIL
// ===============================
const updateOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      order_id,
      ticket_category_id,
      quantity,
    } = req.body;

    // Cek detail
    const [details] = await db.query(
      `
      SELECT *
      FROM order_details
      WHERE id = ?
      `,
      [id]
    );

    if (details.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order detail tidak ditemukan",
      });
    }

    if (
      !order_id ||
      !ticket_category_id ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "order_id, ticket_category_id, dan quantity wajib diisi",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity harus lebih dari 0",
      });
    }

    // Cek order
    const [orders] = await db.query(
      "SELECT id FROM orders WHERE id = ?",
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Cek ticket category
    const [ticketCategories] = await db.query(
      `
      SELECT
        id,
        price,
        remaining_ticket
      FROM ticket_categories
      WHERE id = ?
      `,
      [ticket_category_id]
    );

    if (ticketCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket category tidak ditemukan",
      });
    }

    const ticketCategory = ticketCategories[0];
    const oldDetail = details[0];

    // Kembalikan stok lama
    await db.query(
      `
      UPDATE ticket_categories
      SET remaining_ticket = remaining_ticket + ?
      WHERE id = ?
      `,
      [
        oldDetail.quantity,
        oldDetail.ticket_category_id,
      ]
    );

    // Cek stok baru
    const [updatedCategory] = await db.query(
      `
      SELECT remaining_ticket
      FROM ticket_categories
      WHERE id = ?
      `,
      [ticket_category_id]
    );

    if (
      updatedCategory[0].remaining_ticket < quantity
    ) {
      // rollback stok lama
      await db.query(
        `
        UPDATE ticket_categories
        SET remaining_ticket = remaining_ticket - ?
        WHERE id = ?
        `,
        [
          oldDetail.quantity,
          oldDetail.ticket_category_id,
        ]
      );

      return res.status(400).json({
        success: false,
        message:
          "Jumlah tiket yang tersedia tidak mencukupi",
      });
    }

    // Kurangi stok baru
    await db.query(
      `
      UPDATE ticket_categories
      SET remaining_ticket = remaining_ticket - ?
      WHERE id = ?
      `,
      [quantity, ticket_category_id]
    );

    const subtotal =
      Number(ticketCategory.price) *
      Number(quantity);

    await db.query(
      `
      UPDATE order_details
      SET
        order_id = ?,
        ticket_category_id = ?,
        quantity = ?,
        subtotal = ?
      WHERE id = ?
      `,
      [
        order_id,
        ticket_category_id,
        quantity,
        subtotal,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Order detail berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update order detail error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui order detail",
    });
  }
};

// ===============================
// DELETE ORDER DETAIL
// ===============================
const deleteOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [details] = await db.query(
      `
      SELECT *
      FROM order_details
      WHERE id = ?
      `,
      [id]
    );

    if (details.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order detail tidak ditemukan",
      });
    }

    const detail = details[0];

    // Kembalikan stok tiket
    await db.query(
      `
      UPDATE ticket_categories
      SET remaining_ticket = remaining_ticket + ?
      WHERE id = ?
      `,
      [
        detail.quantity,
        detail.ticket_category_id,
      ]
    );

    await db.query(
      "DELETE FROM order_details WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Order detail berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete order detail error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus order detail",
    });
  }
};

module.exports = {
  getAllOrderDetails,
  getOrderDetailById,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
};