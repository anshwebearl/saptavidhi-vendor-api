import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Images only!"), false);
    }
};

const limits = {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
});

export const uploadUpdatedPhotos = (req, res, next) => {
    if (req.files && (req.files["updated_cover_photo"] || req.files["updated_additional_photos"])) {
        const uploadFields = [
            { name: "updated_cover_photo", maxCount: 1 },
            { name: "updated_additional_photos", maxCount: 10 },
        ];
        upload.fields(uploadFields)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: err.message,
                });
            } else if (err) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: err.message,
                });
            }
            next();
        });
    } else {
        next();
    }
};
