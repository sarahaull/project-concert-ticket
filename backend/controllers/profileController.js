const db = require("../config/db");

// ===============================
// GET PROFILE USER
// ===============================
const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await db.query(
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
                role
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        return res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data profile",
            error: error.message
        });
    }
};


// ===============================
// UPDATE PROFILE USER
// ===============================
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            fullname,
            phone,
            gender,
            birth_date,
            photo
        } = req.body;

        // Cek user
        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        // Update profile
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
            `,
            [
                fullname || null,
                phone || null,
                gender || null,
                birth_date || null,
                photo || null,
                userId
            ]
        );

        // Ambil data terbaru
        const [updatedUsers] = await db.query(
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
                role
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        return res.json({
            success: true,
            message: "Profile berhasil diperbarui",
            user: updatedUsers[0]
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui profile",
            error: error.message
        });
    }
};


module.exports = {
    getProfile,
    updateProfile
};