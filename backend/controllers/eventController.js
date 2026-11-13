
const db = require("../config/db");

// ============================================================
// HELPER
// ============================================================

const getUser = (req) => ({
  id: req.user?.id,
  role: String(req.user?.role || "").toLowerCase(),
});

const isOrganizer = (role) =>
  ["organizer", "event_organizer"].includes(role);

const isSuperAdmin = (role) => role === "super_admin";

const eventSelect = `
  SELECT
    e.id,
    e.organizer_id,
    e.category_id,
    e.artist_id,
    e.venue_id,
    e.event_name,
    e.description,
    e.poster,
    e.seat_map_image,
    e.event_date,
    e.event_time,
    e.end_time,
    e.ticket_sale_start,
    e.ticket_sale_end,
    e.status,
    e.approval_status,
    e.rejection_reason,
    e.approved_by,
    e.approved_at,
    e.created_at,
    c.category_name,
    a.artist_name,
    v.venue_name,
    v.city,
    u.fullname AS organizer_name
  FROM events e
  LEFT JOIN categories c ON e.category_id = c.id
  LEFT JOIN artists a ON e.artist_id = a.id
  LEFT JOIN venues v ON e.venue_id = v.id
  LEFT JOIN users u ON e.organizer_id = u.id
`;

// ============================================================
// 1. EVENT PUBLIK
// Hanya event Approved yang boleh dilihat.
// ============================================================

const getEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `${eventSelect}
       WHERE e.approval_status = 'Approved'
       ORDER BY e.id DESC`
    );

    return res.status(200).json({
      success: true,
      events: rows,
    });
  } catch (error) {
    console.error("GET PUBLIC EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data event.",
    });
  }
};


// ============================================================
// 2. DETAIL EVENT PUBLIK
// ============================================================

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID event
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID event tidak valid.",
      });
    }

    // Ambil detail event
    const [rows] = await db.query(
      `SELECT
        e.id,
        e.event_name,
        e.description,
        e.poster,
        e.seat_map_image,
        e.event_date,
        e.event_time,
        e.ticket_sale_start,
        e.ticket_sale_end,
        e.status,
        e.created_at,

        c.id AS category_id,
        c.category_name,
        c.icon AS category_icon,

        a.id AS artist_id,
        a.artist_name,
        a.photo AS artist_photo,
        a.description AS artist_description,
        a.instagram,

        v.id AS venue_id,
        v.venue_name,
        v.city,
        v.address AS venue_address,
        v.capacity AS venue_capacity,
        v.image AS venue_image

      FROM events e

      LEFT JOIN categories c
        ON e.category_id = c.id

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      WHERE e.id = ?
      LIMIT 1`,
      [Number(id)]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    const event = rows[0];

    // Ambil kategori tiket
    const [ticketCategories] = await db.query(
      `SELECT
        id,
        event_id,
        category_name,
        price,
        quota,
        remaining_ticket
      FROM ticket_categories
      WHERE event_id = ?
      ORDER BY price ASC, id ASC`,
      [Number(id)]
    );

    // Ambil section / area konser
    const [sections] = await db.query(
      `SELECT
        es.id,
        es.event_id,
        es.ticket_category_id,
        es.section_code,
        es.section_name,
        es.seat_mode,
        es.map_position,

        tc.category_name AS ticket_category_name,
        tc.price AS ticket_price

      FROM event_sections es

      LEFT JOIN ticket_categories tc
        ON es.ticket_category_id = tc.id

      WHERE es.event_id = ?
      ORDER BY es.id ASC`,
      [Number(id)]
    );

    // Ambil data kursi
    const [seats] = await db.query(
      `SELECT
        s.id,
        es.id AS section_id,
        es.section_code,
        es.section_name,
        s.row_label,
        s.seat_number,
        s.position_x,
        s.position_y,
        s.status

      FROM event_seats s

      INNER JOIN event_sections es
        ON s.section_id = es.id

      WHERE es.event_id = ?
      ORDER BY
        es.id ASC,
        s.row_label ASC,
        s.seat_number ASC`,
      [Number(id)]
    );

    // Format kategori tiket
    const formattedCategories = ticketCategories.map((ticket) => ({
      ...ticket,
      price: Number(ticket.price) || 0,
      quota: Number(ticket.quota) || 0,
      remaining_ticket: Number(ticket.remaining_ticket) || 0,
    }));

    // Format section
    const formattedSections = sections.map((section) => ({
      ...section,
      ticket_price: Number(section.ticket_price) || 0,
      map_position:
        typeof section.map_position === "string"
          ? JSON.parse(section.map_position)
          : section.map_position,
    }));

    // Format kursi
    const formattedSeats = seats.map((seat) => ({
      ...seat,
      position_x: Number(seat.position_x),
      position_y: Number(seat.position_y),
    }));

    return res.status(200).json({
      success: true,
      message: "Detail event berhasil diambil.",

      event: {
        ...event,

        ticket_categories: formattedCategories,

        sections: formattedSections,

        seats: formattedSeats,
      },
    });

  } catch (error) {
    console.error("GET EVENT DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail event.",
      error: process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
    });
  }
};



// ============================================================
// 3. EVENT MILIK ORGANIZER
// ============================================================

const getOrganizerEvents = async (req, res) => {
  try {
    const { id, role } = getUser(req);

    if (!id || !isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk event organizer.",
      });
    }

    const [rows] = await db.query(
      `${eventSelect}
       WHERE e.organizer_id = ?
       ORDER BY e.id DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      events: rows,
    });
  } catch (error) {
    console.error("GET ORGANIZER EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil event organizer.",
    });
  }
};

// ============================================================
// 4. DETAIL EVENT MILIK ORGANIZER
// ============================================================

const getOrganizerEventById = async (req, res) => {
  try {
    const { id: organizerId, role } = getUser(req);
    const { id } = req.params;

    if (!organizerId || !isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk event organizer.",
      });
    }

    const [rows] = await db.query(
      `${eventSelect}
       WHERE e.id = ?
       AND e.organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      event: rows[0],
    });
  } catch (error) {
    console.error("GET ORGANIZER EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail event.",
    });
  }
};

// ============================================================
// 5. TAMBAH EVENT
// Event baru selalu Draft.
// ============================================================

const createEvent = async (req, res) => {
  try {
    const { id: organizerId, role } = getUser(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Token login tidak valid.",
      });
    }

    if (!isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat membuat event.",
      });
    }

    const {
      category_id,
      artist_id,
      venue_id,
      event_name,
      description,
      poster,
      seat_map_image,
      event_date,
      event_time,
      ticket_sale_start,
      ticket_sale_end,
      status,
    } = req.body;

    if (
      !category_id ||
      !artist_id ||
      !venue_id ||
      !event_name ||
      !event_date ||
      !event_time ||
      !ticket_sale_start ||
      !ticket_sale_end
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua data wajib event harus diisi.",
      });
    }

    const name = String(event_name).trim();

    if (!name || name.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Nama event tidak valid.",
      });
    }

    const allowedStatuses = [
      "Coming Soon",
      "Available",
      "Limited",
      "Sold Out",
    ];

    const eventStatus = status || "Coming Soon";

    if (!allowedStatuses.includes(eventStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status event tidak valid.",
      });
    }

    const [category] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    const [artist] = await db.query(
      "SELECT id FROM artists WHERE id = ?",
      [artist_id]
    );

    const [venue] = await db.query(
      "SELECT id FROM venues WHERE id = ?",
      [venue_id]
    );

    if (!category.length || !artist.length || !venue.length) {
      return res.status(400).json({
        success: false,
        message: "Kategori, artis, atau venue tidak ditemukan.",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM events WHERE event_name = ? LIMIT 1",
      [name]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Nama event sudah digunakan.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO events (
        organizer_id,
        category_id,
        artist_id,
        venue_id,
        event_name,
        description,
        poster,
        seat_map_image,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        status,
        approval_status,
        rejection_reason,
        approved_by,
        approved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', NULL, NULL, NULL)`,
      [
        organizerId,
        category_id,
        artist_id,
        venue_id,
        name,
        description || null,
        poster || null,
        seat_map_image || null,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        eventStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Event berhasil disimpan sebagai Draft.",
      event: {
        id: result.insertId,
        organizer_id: organizerId,
        event_name: name,
        status: eventStatus,
        approval_status: "Draft",
      },
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan event.",
    });
  }
};

// ============================================================
// 6. UPDATE EVENT
// Hanya Draft atau Rejected yang dapat diedit.
// ============================================================

const updateEvent = async (req, res) => {
  try {
    const { id: organizerId, role } = getUser(req);
    const { id } = req.params;

    if (!organizerId || !isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk event organizer.",
      });
    }

    const [rows] = await db.query(
      `SELECT *
       FROM events
       WHERE id = ? AND organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    const current = rows[0];

    if (!["Draft", "Rejected"].includes(current.approval_status)) {
      return res.status(400).json({
        success: false,
        message: "Event yang sudah diajukan atau disetujui tidak dapat diedit.",
      });
    }

    const {
      category_id,
      artist_id,
      venue_id,
      event_name,
      description,
      poster,
      seat_map_image,
      event_date,
      event_time,
      ticket_sale_start,
      ticket_sale_end,
      status,
    } = req.body;

    if (
      !category_id ||
      !artist_id ||
      !venue_id ||
      !event_name ||
      !event_date ||
      !event_time ||
      !ticket_sale_start ||
      !ticket_sale_end
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua data wajib event harus diisi.",
      });
    }

    const name = String(event_name).trim();

    if (!name || name.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Nama event tidak valid.",
      });
    }

    const allowedStatuses = [
      "Coming Soon",
      "Available",
      "Limited",
      "Sold Out",
    ];

    const finalStatus = status || current.status;

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status event tidak valid.",
      });
    }

    const [category] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    const [artist] = await db.query(
      "SELECT id FROM artists WHERE id = ?",
      [artist_id]
    );

    const [venue] = await db.query(
      "SELECT id FROM venues WHERE id = ?",
      [venue_id]
    );

    if (!category.length || !artist.length || !venue.length) {
      return res.status(400).json({
        success: false,
        message: "Kategori, artis, atau venue tidak ditemukan.",
      });
    }

    const [duplicate] = await db.query(
      `SELECT id FROM events
       WHERE event_name = ? AND id != ?
       LIMIT 1`,
      [name, id]
    );

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        message: "Nama event sudah digunakan.",
      });
    }

    const finalPoster =
      poster !== undefined ? poster || null : current.poster;

    const finalSeatMap =
      seat_map_image !== undefined
        ? seat_map_image || null
        : current.seat_map_image;

    await db.query(
      `UPDATE events SET
        category_id = ?,
        artist_id = ?,
        venue_id = ?,
        event_name = ?,
        description = ?,
        poster = ?,
        seat_map_image = ?,
        event_date = ?,
        event_time = ?,
        ticket_sale_start = ?,
        ticket_sale_end = ?,
        status = ?,
        approval_status = 'Draft',
        rejection_reason = NULL,
        approved_by = NULL,
        approved_at = NULL
       WHERE id = ?
       AND organizer_id = ?`,
      [
        category_id,
        artist_id,
        venue_id,
        name,
        description || null,
        finalPoster,
        finalSeatMap,
        event_date,
        event_time,
        ticket_sale_start,
        ticket_sale_end,
        finalStatus,
        id,
        organizerId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Event berhasil diperbarui sebagai Draft.",
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui event.",
    });
  }
};

// ============================================================
// 7. AJUKAN EVENT KE SUPER ADMIN
// Draft / Rejected -> Pending
// ============================================================

const submitEvent = async (req, res) => {
  try {
    const { id: organizerId, role } = getUser(req);
    const { id } = req.params;

    if (!organizerId || !isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk event organizer.",
      });
    }

    const [rows] = await db.query(
      `SELECT id, approval_status
       FROM events
       WHERE id = ? AND organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    if (!["Draft", "Rejected"].includes(rows[0].approval_status)) {
      return res.status(400).json({
        success: false,
        message: "Event tidak dapat diajukan dengan status saat ini.",
      });
    }

    // Pastikan event sudah memiliki kategori tiket.
    const [tickets] = await db.query(
      `SELECT id
       FROM ticket_categories
       WHERE event_id = ?
       LIMIT 1`,
      [id]
    );

    if (!tickets.length) {
      return res.status(400).json({
        success: false,
        message: "Tambahkan minimal satu kategori tiket sebelum mengajukan event.",
      });
    }

    const [result] = await db.query(
      `UPDATE events
       SET approval_status = 'Pending',
           rejection_reason = NULL,
           approved_by = NULL,
           approved_at = NULL
       WHERE id = ?
       AND organizer_id = ?
       AND approval_status IN ('Draft', 'Rejected')`,
      [id, organizerId]
    );

    if (!result.affectedRows) {
      return res.status(409).json({
        success: false,
        message: "Status event berubah. Silakan muat ulang.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event berhasil diajukan dan menunggu persetujuan Super Admin.",
    });
  } catch (error) {
    console.error("SUBMIT EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengajukan event.",
    });
  }
};

// ============================================================
// 8. DAFTAR PENGAJUAN UNTUK SUPER ADMIN
// ============================================================

const getPendingEvents = async (req, res) => {
  try {
    const { id, role } = getUser(req);

    if (!id || !isSuperAdmin(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk Super Admin.",
      });
    }

    const [rows] = await db.query(
      `${eventSelect}
       WHERE e.approval_status = 'Pending'
       ORDER BY e.created_at ASC`
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      events: rows,
    });
  } catch (error) {
    console.error("GET PENDING EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pengajuan event.",
    });
  }
};

// ============================================================
// 9. APPROVE EVENT
// ============================================================

const approveEvent = async (req, res) => {
  try {
    const { id: adminId, role } = getUser(req);
    const { id } = req.params;

    if (!adminId || !isSuperAdmin(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya Super Admin yang dapat menyetujui event.",
      });
    }

    const [result] = await db.query(
      `UPDATE events
       SET approval_status = 'Approved',
           approved_by = ?,
           approved_at = NOW(),
           rejection_reason = NULL
       WHERE id = ?
       AND approval_status = 'Pending'`,
      [adminId, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan event tidak ditemukan atau sudah diproses.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event berhasil disetujui dan dapat ditampilkan kepada publik.",
    });
  } catch (error) {
    console.error("APPROVE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menyetujui event.",
    });
  }
};

// ============================================================
// 10. REJECT EVENT
// ============================================================

const rejectEvent = async (req, res) => {
  try {
    const { id: adminId, role } = getUser(req);
    const { id } = req.params;

    if (!adminId || !isSuperAdmin(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya Super Admin yang dapat menolak event.",
      });
    }

    const reason = String(req.body?.rejection_reason || "").trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan wajib diisi.",
      });
    }

    const [result] = await db.query(
      `UPDATE events
       SET approval_status = 'Rejected',
           rejection_reason = ?,
           approved_by = NULL,
           approved_at = NULL
       WHERE id = ?
       AND approval_status = 'Pending'`,
      [reason, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan event tidak ditemukan atau sudah diproses.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event berhasil ditolak.",
    });
  } catch (error) {
    console.error("REJECT EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menolak event.",
    });
  }
};

// ============================================================
// 11. HAPUS EVENT ORGANIZER
// ============================================================

const deleteEvent = async (req, res) => {
  try {
    const { id: organizerId, role } = getUser(req);
    const { id } = req.params;

    if (!organizerId || !isOrganizer(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk event organizer.",
      });
    }

    const [rows] = await db.query(
      `SELECT id, event_name, approval_status
       FROM events
       WHERE id = ? AND organizer_id = ?
       LIMIT 1`,
      [id, organizerId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    if (rows[0].approval_status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Event yang sudah disetujui tidak dapat dihapus melalui fitur Organizer.",
      });
    }

    await db.query(
      `DELETE FROM events
       WHERE id = ? AND organizer_id = ?`,
      [id, organizerId]
    );

    return res.status(200).json({
      success: true,
      message: "Event berhasil dihapus.",
      deleted_event: rows[0],
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        success: false,
        message: "Event tidak dapat dihapus karena masih memiliki transaksi atau tiket.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus event.",
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getOrganizerEvents,
  getOrganizerEventById,
  createEvent,
  updateEvent,
  submitEvent,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
};
