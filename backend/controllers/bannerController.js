const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const IMAGE_PREFIX = "/uploads/banners/";

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const parseSortOrder = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const removeUploadedImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith(IMAGE_PREFIX)) return;

  const filename = path.basename(imagePath);
  const absolutePath = path.join(process.cwd(), "uploads", "banners", filename);

  try {
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (error) {
    console.error("REMOVE BANNER IMAGE ERROR:", error.message);
  }
};

const removeRequestFile = (req) => {
  if (!req.file?.path) return;
  try {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error("REMOVE TEMP BANNER FILE ERROR:", error.message);
  }
};

const normalizeText = (value) => {
  if (value === undefined) return undefined;
  const text = String(value).trim();
  return text || null;
};

// Public endpoint: hanya banner aktif yang dikirim ke dashboard customer.
const getHomeBanners = async (req, res) => {
  try {
    const [banners] = await db.query(
      `SELECT
        id, title, subtitle, description, image,
        button_text, button_link,
        secondary_button_text, secondary_button_link,
        sort_order
       FROM homepage_banners
       WHERE is_active = 1
       ORDER BY sort_order ASC, id DESC`
    );

    return res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("GET HOME BANNERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil banner beranda.",
    });
  }
};

// Super Admin: semua banner, termasuk yang nonaktif.
const getAdminBanners = async (req, res) => {
  try {
    const [banners] = await db.query(
      `SELECT
        id, title, subtitle, description, image,
        button_text, button_link,
        secondary_button_text, secondary_button_link,
        is_active, sort_order, created_at, updated_at
       FROM homepage_banners
       ORDER BY sort_order ASC, id DESC`
    );

    return res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("GET ADMIN BANNERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar banner.",
    });
  }
};

const createBanner = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const subtitle = normalizeText(req.body.subtitle);
    const description = normalizeText(req.body.description);
    const buttonText = normalizeText(req.body.button_text);
    const buttonLink = normalizeText(req.body.button_link);
    const secondaryButtonText = normalizeText(req.body.secondary_button_text);
    const secondaryButtonLink = normalizeText(req.body.secondary_button_link);
    const sortOrder = parseSortOrder(req.body.sort_order, 0);
    const isActive = parseBoolean(req.body.is_active, true);

    if (!title) {
      removeRequestFile(req);
      return res.status(400).json({
        success: false,
        message: "Judul banner wajib diisi.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar banner wajib diupload.",
      });
    }

    if (sortOrder === null) {
      removeRequestFile(req);
      return res.status(400).json({
        success: false,
        message: "Urutan banner harus berupa angka bulat minimal 0.",
      });
    }

    const image = `${IMAGE_PREFIX}${req.file.filename}`;

    const [result] = await db.query(
      `INSERT INTO homepage_banners
        (title, subtitle, description, image,
         button_text, button_link,
         secondary_button_text, secondary_button_link,
         is_active, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, subtitle, description, image,
        buttonText, buttonLink,
        secondaryButtonText, secondaryButtonLink,
        isActive ? 1 : 0, sortOrder, req.user.id,
      ]
    );

    const [rows] = await db.query(
      "SELECT * FROM homepage_banners WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Banner berhasil ditambahkan.",
      banner: rows[0],
    });
  } catch (error) {
    console.error("CREATE BANNER ERROR:", error);
    removeRequestFile(req);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan banner.",
    });
  }
};

const updateBanner = async (req, res) => {
  let oldImage = null;

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      removeRequestFile(req);
      return res.status(400).json({ success: false, message: "ID banner tidak valid." });
    }

    const [existing] = await db.query(
      "SELECT * FROM homepage_banners WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existing.length) {
      removeRequestFile(req);
      return res.status(404).json({ success: false, message: "Banner tidak ditemukan." });
    }

    const current = existing[0];
    const title = req.body.title === undefined
      ? current.title
      : String(req.body.title || "").trim();

    if (!title) {
      removeRequestFile(req);
      return res.status(400).json({ success: false, message: "Judul banner wajib diisi." });
    }

    const sortOrder = parseSortOrder(req.body.sort_order, Number(current.sort_order));
    if (sortOrder === null) {
      removeRequestFile(req);
      return res.status(400).json({
        success: false,
        message: "Urutan banner harus berupa angka bulat minimal 0.",
      });
    }

    const image = req.file
      ? `${IMAGE_PREFIX}${req.file.filename}`
      : current.image;

    oldImage = req.file ? current.image : null;

    const valueOrCurrent = (key, currentValue) =>
      req.body[key] === undefined ? currentValue : normalizeText(req.body[key]);

    const isActive = req.body.is_active === undefined
      ? Number(current.is_active) === 1
      : parseBoolean(req.body.is_active);

    await db.query(
      `UPDATE homepage_banners SET
        title = ?, subtitle = ?, description = ?, image = ?,
        button_text = ?, button_link = ?,
        secondary_button_text = ?, secondary_button_link = ?,
        is_active = ?, sort_order = ?, updated_by = ?
       WHERE id = ?`,
      [
        title,
        valueOrCurrent("subtitle", current.subtitle),
        valueOrCurrent("description", current.description),
        image,
        valueOrCurrent("button_text", current.button_text),
        valueOrCurrent("button_link", current.button_link),
        valueOrCurrent("secondary_button_text", current.secondary_button_text),
        valueOrCurrent("secondary_button_link", current.secondary_button_link),
        isActive ? 1 : 0,
        sortOrder,
        req.user.id,
        id,
      ]
    );

    const [updated] = await db.query(
      "SELECT * FROM homepage_banners WHERE id = ? LIMIT 1",
      [id]
    );

    if (oldImage) removeUploadedImage(oldImage);

    return res.status(200).json({
      success: true,
      message: "Banner berhasil diperbarui.",
      banner: updated[0],
    });
  } catch (error) {
    console.error("UPDATE BANNER ERROR:", error);
    removeRequestFile(req);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui banner.",
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "ID banner tidak valid." });
    }

    const [rows] = await db.query(
      "SELECT id, image FROM homepage_banners WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Banner tidak ditemukan." });
    }

    await db.query("DELETE FROM homepage_banners WHERE id = ?", [id]);
    removeUploadedImage(rows[0].image);

    return res.status(200).json({
      success: true,
      message: "Banner berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE BANNER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus banner.",
    });
  }
};

module.exports = {
  getHomeBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
