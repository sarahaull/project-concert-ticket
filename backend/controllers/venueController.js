const db = require("../config/db");

// ===== Ambil Semua Venue =====
const getVenues = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        venue_name,
        city,
        address,
        capacity,
        image,
        created_at
       FROM venues
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      venues: rows,
    });
  } catch (error) {
    console.error("GET VENUES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data venue",
    });
  }
};

// ===== Ambil Venue Berdasarkan ID =====
const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        id,
        venue_name,
        city,
        address,
        capacity,
        image,
        created_at
       FROM venues
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      venue: rows[0],
    });
  } catch (error) {
    console.error("GET VENUE BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail venue",
    });
  }
};

// ===== Tambah Venue =====
const createVenue = async (req, res) => {
  try {
    const {
      venue_name,
      city,
      address,
      capacity,
      image,
    } = req.body;

    if (!venue_name) {
      return res.status(400).json({
        success: false,
        message: "Nama venue wajib diisi",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Kota venue wajib diisi",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Alamat venue wajib diisi",
      });
    }

    if (capacity === undefined || capacity === null || capacity === "") {
      return res.status(400).json({
        success: false,
        message: "Kapasitas venue wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM venues
       WHERE venue_name = ?`,
      [venue_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Venue sudah tersedia",
      });
    }

    const [result] = await db.query(
      `INSERT INTO venues
       (venue_name, city, address, capacity, image)
       VALUES (?, ?, ?, ?, ?)`,
      [
        venue_name,
        city,
        address,
        capacity,
        image || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Venue berhasil ditambahkan",
      venue: {
        id: result.insertId,
        venue_name,
        city,
        address,
        capacity,
        image: image || null,
      },
    });
  } catch (error) {
    console.error("CREATE VENUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan venue",
    });
  }
};

// ===== Update Venue =====
const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      venue_name,
      city,
      address,
      capacity,
      image,
    } = req.body;

    if (!venue_name) {
      return res.status(400).json({
        success: false,
        message: "Nama venue wajib diisi",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Kota venue wajib diisi",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Alamat venue wajib diisi",
      });
    }

    if (capacity === undefined || capacity === null || capacity === "") {
      return res.status(400).json({
        success: false,
        message: "Kapasitas venue wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM venues
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    const [duplicate] = await db.query(
      `SELECT id
       FROM venues
       WHERE venue_name = ?
       AND id != ?`,
      [venue_name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama venue sudah digunakan",
      });
    }

    await db.query(
      `UPDATE venues
       SET venue_name = ?,
           city = ?,
           address = ?,
           capacity = ?,
           image = ?
       WHERE id = ?`,
      [
        venue_name,
        city,
        address,
        capacity,
        image || null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Venue berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE VENUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui venue",
    });
  }
};

// ===== Hapus Venue =====
const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT id
       FROM venues
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    await db.query(
      `DELETE FROM venues
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Venue berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE VENUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus venue",
    });
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};