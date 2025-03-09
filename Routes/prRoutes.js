const express = require("express");
const { CreatePRMember , PRLogin , GetAllRegisteredTeams , RegisterTeam , AdminAmountCollect , PRMemberAmountReport } = require("../Controller/prController.js");
const { VerifyPRMember } = require("../Middleware/prAuth.js");
const router = express.Router();

router.route("/register").post(CreatePRMember);
router.route("/login").post(PRLogin);
router.route("/registerTeam").post(VerifyPRMember , RegisterTeam);
router.route("/getAllRegisteredTeams").get(VerifyPRMember , GetAllRegisteredTeams);
router.route("/adminAmountCollected").get(AdminAmountCollect);
router.route("/prMemberAmountReport").get(PRMemberAmountReport);

module.exports = router;