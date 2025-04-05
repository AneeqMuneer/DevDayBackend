const express = require("express");
const { RegisterProject } = require("../Controller/projectController");
const upload = require("../Middleware/multer.js");
const ErrorHandler = require("../Utils/errorHandler");
const router = express.Router();

// Handle multer errors for the project registration route
const handleMulterErrors = (req, res, next) => {
    console.log("Project registration - handleMulterErrors middleware called");
    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers['content-type']);
    
    // Use multer's fields method to accept both Project_Report and Payment_Photo
    upload.fields([
        { name: 'Project_Report', maxCount: 1 },
        { name: 'Payment_Photo', maxCount: 1 }
    ])(req, res, (err) => {
        console.log("Multer processing complete for project registration");
        if (err) {
            console.log("Multer error in project registration:", err);
            return next(new ErrorHandler(err.message || "Error processing form data", 400));
        }
        
        console.log("Files processed successfully for project registration:", 
            req.files ? `Files received: ${Object.keys(req.files).join(', ')}` : "No files");
        
        // Convert req.files object to array format expected by the controller
        if (req.files) {
            const filesArray = [];
            
            // Add Project_Report if exists
            if (req.files['Project_Report'] && req.files['Project_Report'].length > 0) {
                const reportFile = req.files['Project_Report'][0];
                reportFile.fieldname = 'Project_Report'; // Ensure fieldname is set correctly
                filesArray.push(reportFile);
            }
            
            // Add Payment_Photo if exists
            if (req.files['Payment_Photo'] && req.files['Payment_Photo'].length > 0) {
                const paymentFile = req.files['Payment_Photo'][0];
                paymentFile.fieldname = 'Payment_Photo'; // Ensure fieldname is set correctly
                filesArray.push(paymentFile);
            }
            
            req.files = filesArray;
        }
        
        next();
    });
};

router.route("/register").post(handleMulterErrors, RegisterProject);

module.exports = router;