
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const uploadPoster = async (req, res) => {
  let uploadedFile = null;

  try {
    const organizerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!organizerId || !["organizer", "event_organizer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat mengupload poster.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File poster belum dipilih.",
      });
    }

    uploadedFile = req.file;

    const { event_id } = req.body;

    if (!event_id) {
      fs.unlinkSync(uploadedFile.path);

      return res.status(400).json({
        success: false,
        message: "ID event wajib dikirim.",
      });
    }

    const [events] = await db.query(
      `SELECT id, poster
       FROM events
       WHERE id = ?
       AND organizer_id = ?
       LIMIT 1`,
      [event_id, organizerId]
    );

    if (!events.length) {
      fs.unlinkSync(uploadedFile.path);

      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    const posterPath = `/uploads/events/${uploadedFile.filename}`;

    await db.query(
      `UPDATE events
       SET poster = ?
       WHERE id = ?
       AND organizer_id = ?`,
      [posterPath, event_id, organizerId]
    );

    // Hapus poster sebelumnya jika berasal dari upload lokal.
    const oldPoster = events[0].poster;

    if (oldPoster && oldPoster.startsWith("/uploads/events/")) {
      const oldFilePath = path.join(
        process.cwd(),
        oldPoster.replace(/^\/+/, "")
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Poster berhasil diupload dan disimpan.",
      poster: posterPath,
      event_id: Number(event_id),
    });
  } catch (error) {
    console.error("UPLOAD POSTER ERROR:", error);

    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat upload poster.",
    });
  }
};

const uploadSeatMap = async (req, res) => {
  let uploadedFile = null;

  try {
    const organizerId = req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    if (
      !organizerId ||
      !["organizer", "event_organizer"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Hanya event organizer yang dapat mengupload denah.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File denah belum dipilih.",
      });
    }

    uploadedFile = req.file;

    const { event_id } = req.body;

    if (!event_id) {
      fs.unlinkSync(uploadedFile.path);

      return res.status(400).json({
        success: false,
        message: "ID event wajib dikirim.",
      });
    }

    const [events] = await db.query(
      `SELECT id, seat_map_image
       FROM events
       WHERE id = ? AND organizer_id = ?
       LIMIT 1`,
      [event_id, organizerId]
    );

    if (!events.length) {
      fs.unlinkSync(uploadedFile.path);

      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan atau bukan milik Anda.",
      });
    }

    const imagePath = `/uploads/events/${uploadedFile.filename}`;

    await db.query(
      `UPDATE events
       SET seat_map_image = ?
       WHERE id = ? AND organizer_id = ?`,
      [imagePath, event_id, organizerId]
    );

    const oldImage = events[0].seat_map_image;

    if (oldImage && oldImage.startsWith("/uploads/events/")) {
      const oldPath = path.join(
        process.cwd(),
        oldImage.replace(/^\/+/, "")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Denah kursi berhasil diupload.",
      seat_map_image: imagePath,
      event_id: Number(event_id),
    });
  } catch (error) {
    console.error("UPLOAD SEAT MAP ERROR:", error);

    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    return res.status(500).json({
      success: false,
      message: "Gagal mengupload denah kursi.",
    });
  }
};

module.exports = {
  uploadPoster,
  uploadSeatMap,
};
