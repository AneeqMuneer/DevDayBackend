const express = require("express");
const { CandidateLogin , CandidateSignup , RetrieveUserDetail , AddUserDetail } = require("../Controller/joController");
const { VerifyCandidate } = require("../Middleware/candidateAuth");
const router = express.Router();

router.route("/CandidateLogin").post(CandidateLogin);
router.route("/CandidateSignup").post(CandidateSignup);
router.route("/AddUserDetail").post(VerifyCandidate , AddUserDetail);
router.route("/RetrieveUserDetail").get(VerifyCandidate , RetrieveUserDetail);

module.exports = router;