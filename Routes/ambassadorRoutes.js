const express = require("express");
const { Login , SignUp , GetAllAmbassador , GetAllBARegistration , GetAmbassadorById , Leaderboard } = require("../Controller/ambassadorController");
const { VerifyAmbassador } = require("../Middleware/ambassadorAuth");
const router = express.Router();

router.route("/signup").post(SignUp);
router.route("/login").post(Login);
router.route("/getallambassador").get(VerifyAmbassador , GetAllAmbassador);
router.route("/GetAllBARegistration").get(VerifyAmbassador , GetAllBARegistration);
router.route("/getambassadorbyid").post(VerifyAmbassador , GetAmbassadorById);
router.route("/leaderboard").get(VerifyAmbassador , Leaderboard);

module.exports = router;