const express = require("express");
const { RegisterTeam , ProcessPayment , ApprovePayment } = require("../Controller/teamController");
const upload = require("../Middleware/multer.js");
const ErrorHandler = require("../Utils/errorHandler");
const router = express.Router();

console.log("Team routes loaded");

// Handle multer errors for the team registration route
const handleMulterErrors = (req, res, next) => {
    console.log("Team registration - handleMulterErrors middleware called");
    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers['content-type']);
    
    // Use multer's single file upload
    upload.single('Payment_Photo')(req, res, (err) => {
        console.log("Multer processing complete for team registration");
        if (err) {
            console.log("Multer error in team registration:", err);
            return next(new ErrorHandler(err.message || "Error processing form data", 400));
        }
        
        console.log("File processed successfully for team registration:", req.file ? "File exists" : "No file");
        next();
    });
};

router.route("/register").post(handleMulterErrors, RegisterTeam);

module.exports = router;