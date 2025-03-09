const express = require("express");
const { CreatePRMember , PRLogin , GetAllRegisteredTeams , RegisterTeam , AdminAmountCollect } = require("../Controller/prController.js");
const { VerifyPRMember } = require("../Middleware/prAuth.js");
const router = express.Router();

router.route("/register").post(CreatePRMember);
router.route("/login").post(PRLogin);
router.route("/registerTeam").post(VerifyPRMember , RegisterTeam);
router.route("/getAllRegisteredTeams").get(VerifyPRMember , GetAllRegisteredTeams);
router.route("/adminAmountCollected").get(VerifyPRMember , AdminAmountCollect);

module.exports = router;