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
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
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

// Middleware to handle cover_photo and additional_photos
export const uploadFields = upload.fields([
    { name: "cover_photo", maxCount: 1 },
    { name: "additional_photos", maxCount: 10 },
]);

// Middleware to handle updated_cover_photo and updated_additional_photos
export const uploadUpdatedPhotos = upload.fields([
    { name: "updated_cover_photo", maxCount: 1 },
    { name: "updated_additional_photos", maxCount: 10 },
]);

// Middleware to validate images
export const imageValidator = (req, res, next) => {
    uploadFields(req, res, (err) => {
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
        // Next middleware
        next();
    });
};

// Middleware to validate updated photos
export const updatedImageValidator = (req, res, next) => {
    uploadUpdatedPhotos(req, res, (err) => {
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
        // Next middleware
        next();
    });
};
