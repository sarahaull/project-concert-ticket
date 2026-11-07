const uploadPoster = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File poster belum dipilih.",
            });
        }

        const posterPath =
            `/uploads/events/${req.file.filename}`;

        return res.status(201).json({
            success: true,
            message: "Poster berhasil diupload.",
            poster: posterPath,
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
        });
    } catch (error) {
        console.error(
            "UPLOAD POSTER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat upload poster.",
        });
    }
};

module.exports = {
    uploadPoster,
};