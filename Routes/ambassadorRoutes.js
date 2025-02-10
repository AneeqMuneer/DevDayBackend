const express = require("express");
const { Login , SignUp , GetAllAmbassador , GetAllBARegistration , GetAmbassadorById , GetAmbassadorByCode , Leaderboard } = require("../Controller/ambassadorController");
const { VerifyAmbassador } = require("../Middleware/ambassadorAuth");
const router = express.Router();

router.route("/signup").post(SignUp);
router.route("/login").post(Login);
router.route("/getallambassador").get(VerifyAmbassador , GetAllAmbassador);
router.route("/getambassadorbycode").get(VerifyAmbassador , GetAmbassadorByCode);
router.route("/GetAllBARegistration").get(VerifyAmbassador , GetAllBARegistration);
router.route("/leaderboard").get(VerifyAmbassador , Leaderboard);
router.route("/:id").get(VerifyAmbassador , GetAmbassadorById);

module.exports = router;