const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "events"
);

// Buat folder otomatis kalau belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${ext}`;

        cb(null, uniqueName);
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
];

const fileFilter = (req, file, cb) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const mimeType = file.mimetype;

    if (
        allowedMimeTypes.includes(mimeType) &&
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format poster harus JPG, JPEG, PNG, atau WEBP."
            )
        );
    }
};

const uploadEventPoster = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadEventPoster;