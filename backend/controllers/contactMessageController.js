const db = require("../config/db");

// GET semua pesan
const getAllContactMessages = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                fullname,
                email,
                subject,
                message,
                created_at
            FROM contact_messages
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            contact_messages: rows,
        });
    } catch (error) {
        console.error("GET CONTACT MESSAGES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil pesan kontak",
            error: error.message,
        });
    }
};

// GET pesan berdasarkan ID
const getContactMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                id,
                fullname,
                email,
                subject,
                message,
                created_at
            FROM contact_messages
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pesan kontak tidak ditemukan",
            });
        }

        res.json({
            success: true,
            contact_message: rows[0],
        });
    } catch (error) {
        console.error("GET CONTACT MESSAGE BY ID ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil pesan kontak",
            error: error.message,
        });
    }
};

// POST pesan baru
const createContactMessage = async (req, res) => {
    try {
        const {
            fullname,
            email,
            subject,
            message,
        } = req.body;

        // Validasi
        if (!fullname || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "fullname, email, subject, dan message wajib diisi",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO contact_messages
            (fullname, email, subject, message)
            VALUES (?, ?, ?, ?)
            `,
            [
                fullname,
                email,
                subject,
                message,
            ]
        );

        const [rows] = await db.query(
            `
            SELECT
                id,
                fullname,
                email,
                subject,
                message,
                created_at
            FROM contact_messages
            WHERE id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Pesan berhasil dikirim",
            contact_message: rows[0],
        });
    } catch (error) {
        console.error("CREATE CONTACT MESSAGE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengirim pesan",
            error: error.message,
        });
    }
};

// DELETE pesan
const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            `
            SELECT id
            FROM contact_messages
            WHERE id = ?
            `,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pesan kontak tidak ditemukan",
            });
        }

        await db.query(
            `
            DELETE FROM contact_messages
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Pesan berhasil dihapus",
        });
    } catch (error) {
        console.error("DELETE CONTACT MESSAGE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menghapus pesan",
            error: error.message,
        });
    }
};

module.exports = {
    getAllContactMessages,
    getContactMessageById,
    createContactMessage,
    deleteContactMessage,
};