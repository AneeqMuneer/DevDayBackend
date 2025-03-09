const multer = require("multer");
const ErrorHandler = require("../Utils/errorHandler");

console.log("Multer middleware loaded");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log("File filter called for file:", file.originalname, "mimetype:", file.mimetype);
    
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
        console.log("File accepted as image");
        cb(null, true);
        return;
    }
    
    // Accept PDF files
    if (file.mimetype === 'application/pdf') {
        console.log("File accepted as PDF");
        cb(null, true);
        return;
    }
    
    // Accept common document formats
    const documentTypes = [
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'text/plain' // .txt
    ];
    
    if (documentTypes.includes(file.mimetype)) {
        console.log("File accepted as document");
        cb(null, true);
        return;
    }
    
    console.log("File rejected - unsupported type");
    cb(new ErrorHandler("Only images, PDFs, and common document formats are allowed", 400), false);
};

const upload = multer({
    storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, // Increased to 10MB to accommodate larger documents
        files: 1 // Limit to 1 file per request
    },
    fileFilter: fileFilter,
    onError: function(err, next) {
        console.log("Multer error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ErrorHandler("File size too large. Maximum size is 10MB", 400));
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            next(new ErrorHandler("Unexpected file field. Please check your form field names.", 400));
        } else {
            next(new ErrorHandler(err.message || "Error processing form data", 500));
        }
    }
});

module.exports = upload;