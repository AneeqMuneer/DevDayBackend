const express = require("express");
const { Login , SignUp , GetAllAmbassador , GetAllBARegistration , GetAmbassadorById , GetAmbassadorByCode , Leaderboard , ChangeOldPassword , UpdatePassword , ApproveBA } = require("../Controller/ambassadorController");
const { VerifyAmbassador } = require("../Middleware/ambassadorAuth");
const upload = require("../Middleware/multer.js");
const router = express.Router();

router.route("/signup").post(upload.single('ProfilePhoto') , SignUp);
router.route("/login").post(Login);
router.route("/getallambassador").get(VerifyAmbassador , GetAllAmbassador);
router.route("/getambassadorbycode").get(VerifyAmbassador , GetAmbassadorByCode);
router.route("/GetAllBARegistration").get(VerifyAmbassador , GetAllBARegistration);
router.route("/leaderboard").get(VerifyAmbassador , Leaderboard);
router.route("/UpdatePassword").post(VerifyAmbassador , ChangeOldPassword , UpdatePassword);
router.route("/ApproveBA").post(VerifyAmbassador , ApproveBA);
router.route("/:id").get(VerifyAmbassador , GetAmbassadorById);

module.exports = router;