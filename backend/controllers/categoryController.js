const db = require("../config/db");

// ===== Ambil Semua Kategori =====
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        category_name,
        icon,
        created_at
       FROM categories
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori",
    });
  }
};

// ===== Ambil Kategori Berdasarkan ID =====
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        id,
        category_name,
        icon,
        created_at
       FROM categories
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      category: rows[0],
    });
  } catch (error) {
    console.error("GET CATEGORY BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail kategori",
    });
  }
};

// ===== Tambah Kategori =====
const createCategory = async (req, res) => {
  try {
    const { category_name, icon } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM categories WHERE category_name = ?`,
      [category_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori sudah tersedia",
      });
    }

    const [result] = await db.query(
      `INSERT INTO categories 
       (category_name, icon)
       VALUES (?, ?)`,
      [category_name, icon || null]
    );

    return res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      category: {
        id: result.insertId,
        category_name,
        icon: icon || null,
      },
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan kategori",
    });
  }
};

// ===== Update Kategori =====
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, icon } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM categories WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    const [duplicate] = await db.query(
      `SELECT id 
       FROM categories 
       WHERE category_name = ? AND id != ?`,
      [category_name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori sudah digunakan",
      });
    }

    await db.query(
      `UPDATE categories
       SET category_name = ?,
           icon = ?
       WHERE id = ?`,
      [category_name, icon || null, id]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori",
    });
  }
};

// ===== Hapus Kategori =====
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT id FROM categories WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    await db.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};