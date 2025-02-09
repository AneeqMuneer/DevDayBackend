const express = require("express");
const { Login , SignUp , GetAllAmbassador , GetAllAmbassadorRegistration , GetAmbassadorById , Leaderboard } = require("../Controller/ambassadorController");
const router = express.Router();

router.route("/login").post(Login);
router.route("/signup").post(SignUp);
router.route("/getallambassador").get(GetAllAmbassador);
router.route("/getallambassadorregistration").get(GetAllAmbassadorRegistration);
router.route("/getambassadorbyid").post(GetAmbassadorById);
router.route("/leaderboard").get(Leaderboard);

module.exports = router;