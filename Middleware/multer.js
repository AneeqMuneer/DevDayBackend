const multer = require("multer");
const ErrorHandler = require("../Utils/errorHandler");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ErrorHandler("Only image files are allowed", 400), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: fileFilter,
    onError: function(err, next) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ErrorHandler("File size too large. Maximum size is 5MB", 400));
        } else {
            next(new ErrorHandler(err.message || "Error processing form data", 500));
        }
    }
});

module.exports = upload;