const db = require("../config/db");

// ===== Ambil Semua Artist =====
const getArtists = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        artist_name,
        photo,
        description,
        instagram,
        created_at
       FROM artists
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      artists: rows,
    });
  } catch (error) {
    console.error("GET ARTISTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data artist",
    });
  }
};

// ===== Ambil Artist Berdasarkan ID =====
const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        id,
        artist_name,
        photo,
        description,
        instagram,
        created_at
       FROM artists
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      artist: rows[0],
    });
  } catch (error) {
    console.error("GET ARTIST BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail artist",
    });
  }
};

// ===== Tambah Artist =====
const createArtist = async (req, res) => {
  try {
    const {
      artist_name,
      photo,
      description,
      instagram,
    } = req.body;

    if (!artist_name) {
      return res.status(400).json({
        success: false,
        message: "Nama artist wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM artists
       WHERE artist_name = ?`,
      [artist_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Artist sudah tersedia",
      });
    }

    const [result] = await db.query(
      `INSERT INTO artists
       (artist_name, photo, description, instagram)
       VALUES (?, ?, ?, ?)`,
      [
        artist_name,
        photo || null,
        description || null,
        instagram || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Artist berhasil ditambahkan",
      artist: {
        id: result.insertId,
        artist_name,
        photo: photo || null,
        description: description || null,
        instagram: instagram || null,
      },
    });
  } catch (error) {
    console.error("CREATE ARTIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan artist",
    });
  }
};

// ===== Update Artist =====
const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      artist_name,
      photo,
      description,
      instagram,
    } = req.body;

    if (!artist_name) {
      return res.status(400).json({
        success: false,
        message: "Nama artist wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM artists
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    const [duplicate] = await db.query(
      `SELECT id
       FROM artists
       WHERE artist_name = ?
       AND id != ?`,
      [artist_name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama artist sudah digunakan",
      });
    }

    await db.query(
      `UPDATE artists
       SET artist_name = ?,
           photo = ?,
           description = ?,
           instagram = ?
       WHERE id = ?`,
      [
        artist_name,
        photo || null,
        description || null,
        instagram || null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Artist berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE ARTIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui artist",
    });
  }
};

// ===== Hapus Artist =====
const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT id
       FROM artists
       WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    await db.query(
      `DELETE FROM artists
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Artist berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE ARTIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus artist",
    });
  }
};

module.exports = {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
};