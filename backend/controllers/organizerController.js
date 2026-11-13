
const db = require("../config/db");

// ============================================================
// HELPER
// ============================================================

const getOrganizerId = (req) => {
  return req.user?.id || req.user?.userId || req.user?.user_id;
};

const sendServerError = (res, error, message) => {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
  });
};

// ============================================================
// FIND ORGANIZER
// ============================================================

const findOrganizer = async (organizerId) => {
  const [rows] = await db.query(
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
      created_at,
      updated_at
    FROM users
    WHERE id = ?
      AND role = 'event_organizer'
    LIMIT 1
    `,
    [organizerId]
  );

  return rows[0] || null;
};

// ============================================================
// GET PROFILE
// GET /api/organizer/profile
// ============================================================

const getProfile = async (req, res) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi.",
      });
    }

    const organizer = await findOrganizer(organizerId);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Data event organizer tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil profil organizer.",
      data: {
        ...organizer,
        avatar: organizer.photo,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil profil organizer."
    );
  }
};

// ============================================================
// UPDATE PROFILE
// PUT /api/organizer/profile
// ============================================================

const updateProfile = async (req, res) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi.",
      });
    }

    const organizer = await findOrganizer(organizerId);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Data event organizer tidak ditemukan.",
      });
    }

    const {
      fullname,
      phone,
      gender,
      birth_date,
      photo,
      avatar,
    } = req.body;

    const updatedFullname =
      fullname !== undefined
        ? String(fullname).trim()
        : organizer.fullname;

    const updatedPhone =
      phone !== undefined
        ? String(phone).trim()
        : organizer.phone;

    const updatedGender =
      gender !== undefined
        ? gender
        : organizer.gender;

    const updatedBirthDate =
      birth_date !== undefined
        ? birth_date || null
        : organizer.birth_date;

    const updatedPhoto =
      photo !== undefined
        ? photo
        : avatar !== undefined
          ? avatar
          : organizer.photo;

    if (!updatedFullname) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap wajib diisi.",
      });
    }

    if (
      updatedGender &&
      !["Laki-laki", "Perempuan"].includes(updatedGender)
    ) {
      return res.status(400).json({
        success: false,
        message: "Jenis kelamin tidak valid.",
      });
    }

    await db.query(
      `
      UPDATE users
      SET
        fullname = ?,
        phone = ?,
        gender = ?,
        birth_date = ?,
        photo = ?
      WHERE id = ?
        AND role = 'event_organizer'
      `,
      [
        updatedFullname,
        updatedPhone || null,
        updatedGender || null,
        updatedBirthDate,
        updatedPhoto || null,
        organizerId,
      ]
    );

    const updatedOrganizer = await findOrganizer(organizerId);

    return res.status(200).json({
      success: true,
      message: "Profil organizer berhasil diperbarui.",
      data: {
        ...updatedOrganizer,
        avatar: updatedOrganizer.photo,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal memperbarui profil organizer."
    );
  }
};

// ============================================================
// GET EVENT STATS
// GET /api/organizer/stats
// ============================================================

const getEventStats = async (req, res) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi.",
      });
    }

    const [columns] = await db.query(
      "SHOW COLUMNS FROM events LIKE 'organizer_id'"
    );

    if (columns.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Kolom organizer_id belum tersedia pada tabel events.",
      });
    }

    const [eventStats] = await db.query(
      `
      SELECT
        COUNT(DISTINCT e.id) AS total_events,
        COUNT(DISTINCT CASE
          WHEN e.event_date >= CURDATE()
          THEN e.id
        END) AS upcoming_events,
        COUNT(DISTINCT CASE
          WHEN e.event_date < CURDATE()
          THEN e.id
        END) AS past_events
      FROM events e
      WHERE e.organizer_id = ?
      `,
      [organizerId]
    );

    const [ticketStats] = await db.query(
      `
      SELECT
        COALESCE(SUM(od.quantity), 0) AS total_tickets,
        COALESCE(SUM(
          CASE
            WHEN o.payment_status = 'Paid'
            THEN od.quantity
            ELSE 0
          END
        ), 0) AS sold_tickets,
        COALESCE(SUM(
          CASE
            WHEN o.payment_status = 'Paid'
            THEN od.subtotal
            ELSE 0
          END
        ), 0) AS total_revenue
      FROM events e
      INNER JOIN ticket_categories tc
        ON tc.event_id = e.id
      INNER JOIN order_details od
        ON od.ticket_category_id = tc.id
      INNER JOIN orders o
        ON o.id = od.order_id
      WHERE e.organizer_id = ?
      `,
      [organizerId]
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil statistik organizer.",
      data: {
        total_events: Number(eventStats[0]?.total_events || 0),
        upcoming_events: Number(
          eventStats[0]?.upcoming_events || 0
        ),
        past_events: Number(eventStats[0]?.past_events || 0),
        total_tickets: Number(
          ticketStats[0]?.total_tickets || 0
        ),
        sold_tickets: Number(
          ticketStats[0]?.sold_tickets || 0
        ),
        total_revenue: Number(
          ticketStats[0]?.total_revenue || 0
        ),
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil statistik organizer."
    );
  }
};

// ============================================================
// GET MY EVENTS
// GET /api/organizer/events
// ============================================================


// ============================================================
// GET MY EVENTS
// GET /api/organizer/events
// ============================================================

const getMyEvents = async (req, res) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi.",
      });
    }

    const [events] = await db.query(
      `
      SELECT
        e.id,
        e.organizer_id,
        e.event_name,
        e.description,
        e.poster,
        e.event_date,
        e.event_time,
        e.ticket_sale_start,
        e.ticket_sale_end,
        e.status,
        e.created_at,

        c.category_name,
        a.artist_name,
        v.venue_name,
        v.city,

        COALESCE(ticket.total_quota, 0) AS total_quota,
        COALESCE(ticket.remaining_ticket, 0) AS remaining_ticket,
        COALESCE(sales.sold_tickets, 0) AS sold_tickets

      FROM events e

      LEFT JOIN categories c
        ON c.id = e.category_id

      LEFT JOIN artists a
        ON a.id = e.artist_id

      LEFT JOIN venues v
        ON v.id = e.venue_id

      LEFT JOIN (
        SELECT
          event_id,
          SUM(quota) AS total_quota,
          SUM(remaining_ticket) AS remaining_ticket
        FROM ticket_categories
        GROUP BY event_id
      ) ticket
        ON ticket.event_id = e.id

      LEFT JOIN (
        SELECT
          tc.event_id,
          SUM(od.quantity) AS sold_tickets
        FROM ticket_categories tc

        INNER JOIN order_details od
          ON od.ticket_category_id = tc.id

        INNER JOIN orders o
          ON o.id = od.order_id
          AND o.payment_status = 'Paid'

        GROUP BY tc.event_id
      ) sales
        ON sales.event_id = e.id

      WHERE e.organizer_id = ?

      ORDER BY e.created_at DESC
      `,
      [organizerId]
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil event organizer.",
      data: events,
    });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil daftar event organizer."
    );
  }
};


// ============================================================
// GET EVENT BOOKINGS
// GET /api/organizer/bookings
// ============================================================

const getEventBookings = async (req, res) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi.",
      });
    }

    const [columns] = await db.query(
      "SHOW COLUMNS FROM events LIKE 'organizer_id'"
    );

    if (columns.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Kolom organizer_id belum tersedia pada tabel events.",
      });
    }

    const [bookings] = await db.query(
      `
      SELECT
        o.id AS order_id,
        o.order_code,
        o.payment_status,
        o.order_date,
        o.total_price,

        u.id AS customer_id,
        u.fullname AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,

        e.id AS event_id,
        e.event_name,
        e.event_date,

        tc.category_name AS ticket_category,
        SUM(od.quantity) AS quantity,
        SUM(od.subtotal) AS subtotal

      FROM orders o

      INNER JOIN users u
        ON u.id = o.user_id

      INNER JOIN order_details od
        ON od.order_id = o.id

      INNER JOIN ticket_categories tc
        ON tc.id = od.ticket_category_id

      INNER JOIN events e
        ON e.id = tc.event_id

      WHERE e.organizer_id = ?

      GROUP BY
        o.id,
        o.order_code,
        o.payment_status,
        o.order_date,
        o.total_price,
        u.id,
        u.fullname,
        u.email,
        u.phone,
        e.id,
        e.event_name,
        e.event_date,
        tc.id,
        tc.category_name

      ORDER BY o.order_date DESC
      `,
      [organizerId]
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pemesanan event.",
      data: bookings,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Gagal mengambil data pemesanan event."
    );
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getProfile,
  updateProfile,
  getEventStats,
  getMyEvents,
  getEventBookings,
};
