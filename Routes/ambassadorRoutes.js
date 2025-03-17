const express = require("express");
const { Login , SignUp , GetAllAmbassador , GetAllBARegistration , GetAmbassadorById , GetAmbassadorByCode , Leaderboard , ChangePassword , ApproveBAs } = require("../Controller/ambassadorController");
const { VerifyAmbassador } = require("../Middleware/ambassadorAuth");
const upload = require("../Middleware/multer.js");
const ErrorHandler = require("../Utils/errorHandler");
const router = express.Router();

const handleMulterErrors = (req, res, next) => {
    console.log("handleMulterErrors middleware called");
    console.log("Request headers:", req.headers);
    
    upload.single('ProfilePhoto')(req, res, (err) => {
        console.log("Multer processing complete");
        if (err) {
            console.log("Multer error:", err);
            return next(new ErrorHandler(err.message || "Error processing form data", 400));
        }
        console.log("File processed successfully:", req.file ? "File exists" : "No file");
        next();
    });
};

router.route("/signup").post(handleMulterErrors, SignUp);
router.route("/login").post(Login);

router.route("/GetAllBARegistration").get(VerifyAmbassador , GetAllBARegistration);
router.route("/ChangePassword").post(VerifyAmbassador, ChangePassword);
router.route("/leaderboard").get(Leaderboard);

router.route("/ApproveBAs").post(ApproveBAs);
router.route("/getallambassador").get(GetAllAmbassador);
router.route("/getambassadorbycode").get(GetAmbassadorByCode);
router.route("/:id").get(GetAmbassadorById);

module.exports = router;