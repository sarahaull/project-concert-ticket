const db = require("../config/db");

// GET semua review
const getAllReviews = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                u.fullname,
                u.email,
                e.event_name,
                e.poster,
                a.artist_name,
                v.venue_name,
                v.city,
                c.category_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN events e ON r.event_id = e.id
            LEFT JOIN artists a ON e.artist_id = a.id
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN categories c ON e.category_id = c.id
            ORDER BY r.created_at DESC
        `);

        res.json({
            success: true,
            reviews: rows,
        });
    } catch (error) {
        console.error("GET REVIEWS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data review",
            error: error.message,
        });
    }
};

// GET review berdasarkan ID
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                u.fullname,
                u.email,
                e.event_name,
                e.poster,
                a.artist_name,
                v.venue_name,
                v.city,
                c.category_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN events e ON r.event_id = e.id
            LEFT JOIN artists a ON e.artist_id = a.id
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE r.id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        res.json({
            success: true,
            review: rows[0],
        });
    } catch (error) {
        console.error("GET REVIEW BY ID ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil review",
            error: error.message,
        });
    }
};

// GET review berdasarkan event
const getReviewsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                u.fullname,
                u.email
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.created_at DESC
            `,
            [eventId]
        );

        res.json({
            success: true,
            reviews: rows,
        });
    } catch (error) {
        console.error("GET REVIEWS BY EVENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil review event",
            error: error.message,
        });
    }
};

// GET review berdasarkan user
const getReviewsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                e.event_name,
                e.poster
            FROM reviews r
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            `,
            [userId]
        );

        res.json({
            success: true,
            reviews: rows,
        });
    } catch (error) {
        console.error("GET REVIEWS BY USER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil review user",
            error: error.message,
        });
    }
};

// POST review
const createReview = async (req, res) => {
    try {
        const {
            user_id,
            event_id,
            rating,
            review,
        } = req.body;

        // Validasi data wajib
        if (!user_id || !event_id || rating === undefined || !review) {
            return res.status(400).json({
                success: false,
                message: "user_id, event_id, rating, dan review wajib diisi",
            });
        }

        // Validasi rating
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating harus antara 1 sampai 5",
            });
        }

        // Cek user
        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        // Cek event
        const [events] = await db.query(
            "SELECT id FROM events WHERE id = ?",
            [event_id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Event tidak ditemukan",
            });
        }

        // Cek apakah user sudah pernah review event tersebut
        const [existingReview] = await db.query(
            `
            SELECT id
            FROM reviews
            WHERE user_id = ? AND event_id = ?
            `,
            [user_id, event_id]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User sudah memberikan review untuk event ini",
            });
        }

        // Insert review
        const [result] = await db.query(
            `
            INSERT INTO reviews
            (user_id, event_id, rating, review)
            VALUES (?, ?, ?, ?)
            `,
            [
                user_id,
                event_id,
                rating,
                review,
            ]
        );

        // Ambil data setelah insert
        const [rows] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                u.fullname,
                u.email,
                e.event_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Review berhasil ditambahkan",
            review: rows[0],
        });
    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menambahkan review",
            error: error.message,
        });
    }
};

// PUT review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            rating,
            review,
        } = req.body;

        // Validasi
        if (rating === undefined || !review) {
            return res.status(400).json({
                success: false,
                message: "rating dan review wajib diisi",
            });
        }

        // Validasi rating
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating harus antara 1 sampai 5",
            });
        }

        // Cek review
        const [existingReview] = await db.query(
            `
            SELECT id
            FROM reviews
            WHERE id = ?
            `,
            [id]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        await db.query(
            `
            UPDATE reviews
            SET rating = ?, review = ?
            WHERE id = ?
            `,
            [
                rating,
                review,
                id,
            ]
        );

        const [rows] = await db.query(
            `
            SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.rating,
                r.review,
                r.created_at,
                u.fullname,
                u.email,
                e.event_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Review berhasil diperbarui",
            review: rows[0],
        });
    } catch (error) {
        console.error("UPDATE REVIEW ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui review",
            error: error.message,
        });
    }
};

// DELETE review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const [existingReview] = await db.query(
            `
            SELECT id
            FROM reviews
            WHERE id = ?
            `,
            [id]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        await db.query(
            `
            DELETE FROM reviews
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Review berhasil dihapus",
        });
    } catch (error) {
        console.error("DELETE REVIEW ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menghapus review",
            error: error.message,
        });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    getReviewsByEvent,
    getReviewsByUser,
    createReview,
    updateReview,
    deleteReview,
};