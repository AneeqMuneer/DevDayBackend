const express = require("express");
const { RegisterProject } = require("../Controller/projectController");
const upload = require("../Middleware/multer.js");
const ErrorHandler = require("../Utils/errorHandler");
const router = express.Router();

console.log("Project routes loaded");

// Handle multer errors for the project registration route
const handleMulterErrors = (req, res, next) => {
    console.log("Project registration - handleMulterErrors middleware called");
    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers['content-type']);
    
    // Use multer's single file upload for project report
    upload.single('Project_Report')(req, res, (err) => {
        console.log("Multer processing complete for project registration");
        if (err) {
            console.log("Multer error in project registration:", err);
            return next(new ErrorHandler(err.message || "Error processing form data", 400));
        }
        
        console.log("File processed successfully for project registration:", req.file ? "File exists" : "No file");
        
        // Convert req.file to req.files array format expected by the controller
        if (req.file) {
            req.files = [req.file];
            req.files[0].fieldname = 'Project_Report'; // Ensure fieldname is set correctly
        }
        
        next();
    });
};

router.route("/register").post(handleMulterErrors, RegisterProject);

module.exports = router;